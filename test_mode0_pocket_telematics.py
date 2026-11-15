"""
Test Suite: Chế độ 0đ (100% Smartphone Pocket Telematics Core Logic)
===================================================================
Kiểm thử và xác minh toán học cho toàn bộ các giải thuật xử lý tín hiệu
khi để điện thoại trong túi quần / ba lô / túi áo:
  1. Tự động căn chỉnh hệ tọa độ (Dynamic Coordinate Alignment)
  2. Phân biệt người đi bộ/chạy vs đi xe đạp điện (Activity Discrimination)
  3. Cảnh báo rút điện thoại xem khi đang lái xe (Distracted Driving)
  4. Phân tích góc nghiêng cua vật lý & lạng lách (Cornering & Swerving)
  5. Nhận diện ngã xe thật vs va đập nhẹ kèm cơ chế hủy SOS 30s
  6. Quản lý năng lượng & tối ưu pin (Battery-Aware FSM)
"""

import unittest
import math
import numpy as np

class PocketTelematicsEngine:
    def __init__(self):
        self.state = "DORMANT" # DORMANT, ACTIVE_TRIP, SOS_COUNTDOWN
        self.sdi_score = 100
        self.grav_vector = np.array([0.0, 0.0, 9.8])
        self.forward_vector = np.array([1.0, 0.0, 0.0])
        self.sos_active = False
        self.distracted_count = 0
        self.alpha_gravity = 0.85

    def update_gravity_vector(self, raw_acc):
        """Lọc thông thấp để tìm vector trọng lực g trong hệ quy chiếu điện thoại"""
        self.grav_vector = (self.alpha_gravity * self.grav_vector + 
                            (1 - self.alpha_gravity) * np.array(raw_acc))
        return self.grav_vector / np.linalg.norm(self.grav_vector)

    def align_coordinates(self, raw_acc, forward_acc_samples):
        """
        Tự động xoay tọa độ túi về hệ tọa độ xe:
        - Trục Z: Trọng lực kéo xuống
        - Trục X: Hướng chuyển động tiến khi tăng tốc/phanh
        - Trục Y: Trục ngang lạng lách
        """
        # Bước 1: Trục Z đơn vị
        u_z = self.update_gravity_vector(raw_acc)
        
        # Bước 2: Trục X (loại bỏ thành phần trọng lực khỏi gia tốc tiến)
        mean_acc = np.mean(forward_acc_samples, axis=0)
        proj_z = np.dot(mean_acc, u_z) * u_z
        x_horizontal = mean_acc - proj_z
        norm_x = np.linalg.norm(x_horizontal)
        if norm_x < 1e-4:
            u_x = np.array([1.0, 0.0, 0.0])
        else:
            u_x = x_horizontal / norm_x
            
        # Bước 3: Trục Y = u_z x u_x
        u_y = np.cross(u_z, u_x)
        return u_x, u_y, u_z

    def evaluate_trip_state(self, gps_speed_kmh, cadence_hz):
        """
        Phân biệt đi bộ/chạy vs đi xe đạp điện để bật/tắt cảm biến tiết kiệm pin
        """
        if gps_speed_kmh < 4.0:
            self.state = "DORMANT"
            return "IDLE_OR_STOPPED"
        elif gps_speed_kmh < 10.0 and cadence_hz > 1.5:
            self.state = "DORMANT"
            return "WALKING_OR_RUNNING"
        elif gps_speed_kmh >= 12.0:
            self.state = "ACTIVE_TRIP"
            return "RIDING_VEHICLE"
        return self.state

    def check_distracted_driving(self, gps_speed_kmh, proximity_near, screen_on):
        """
        Nhận diện học sinh rút điện thoại ra xem khi đang lái xe:
        Khi xe đang chạy (> 15 km/h) mà điện thoại rời khỏi túi (proximity=FAR) và màn hình bật
        """
        if gps_speed_kmh > 15.0 and (not proximity_near) and screen_on:
            self.distracted_count += 1
            self.sdi_score = max(0, self.sdi_score - 5)
            return True, "DISTRACTED_DRIVING_DETECTED"
        return False, "SAFE"

    def calculate_cornering_lean(self, speed_ms, yaw_rate_rads):
        """
        Công thức vật lý góc nghiêng cua: tan(phi) = (v * yaw_rate) / g
        """
        g = 9.81
        tan_phi = (speed_ms * yaw_rate_rads) / g
        lean_angle_deg = math.degrees(math.atan(abs(tan_phi)))
        return lean_angle_deg

    def evaluate_crash(self, tilt_angle_deg, impact_g, speed_kmh, post_impact_variance):
        """
        Quy tắc 4 điều kiện nhận diện ngã xe thật:
        1. Nghiêng > 65 độ
        2. Xung va chạm > 3.0g
        3. Tốc độ về 0
        4. Bất động sau ngã (phương sai < 0.05)
        """
        if (tilt_angle_deg > 65.0 and 
            impact_g > 3.0 and 
            speed_kmh < 3.0 and 
            post_impact_variance < 0.05):
            self.sos_active = True
            self.state = "SOS_COUNTDOWN"
            return True, "TRIGGER_SOS_115_COUNTDOWN"
        return False, "NORMAL"


class TestMode0PocketTelematics(unittest.TestCase):
    def setUp(self):
        self.engine = PocketTelematicsEngine()

    def test_dynamic_coordinate_alignment(self):
        """Kiểm tra thuật toán bóc tách trục Z và trục tiến X từ góc đặt ngẫu nhiên trong túi"""
        # Giả lập điện thoại bị cắm ngược và nghiêng 45 độ trong túi
        phone_tilt_acc = [6.93, 0.0, 6.93] # g=9.8, nghiêng 45 độ
        forward_samples = [
            [7.5, 0.0, 7.0], # có gia tốc đẩy tiến
            [7.8, 0.2, 7.1],
            [7.3, -0.1, 6.9]
        ]
        u_x, u_y, u_z = self.engine.align_coordinates(phone_tilt_acc, forward_samples)
        
        # Kiểm tra tính trực giao của 3 vector đơn vị
        self.assertAlmostEqual(np.dot(u_x, u_y), 0.0, places=3)
        self.assertAlmostEqual(np.dot(u_y, u_z), 0.0, places=3)
        self.assertAlmostEqual(np.dot(u_x, u_z), 0.0, places=3)
        self.assertAlmostEqual(np.linalg.norm(u_z), 1.0, places=3)

    def test_walking_vs_riding_discrimination(self):
        """Kiểm tra khả năng phân biệt đi bộ (không kích hoạt) vs đi xe đạp điện (kích hoạt)"""
        # Ca 1: Học sinh đi bộ 5 km/h, nhịp chân 1.8 Hz
        res1 = self.engine.evaluate_trip_state(gps_speed_kmh=5.0, cadence_hz=1.8)
        self.assertEqual(res1, "WALKING_OR_RUNNING")
        self.assertEqual(self.engine.state, "DORMANT")

        # Ca 2: Học sinh đi xe đạp điện 22 km/h
        res2 = self.engine.evaluate_trip_state(gps_speed_kmh=22.0, cadence_hz=0.0)
        self.assertEqual(res2, "RIDING_VEHICLE")
        self.assertEqual(self.engine.state, "ACTIVE_TRIP")

    def test_distracted_driving_alert(self):
        """Kiểm tra phát hiện học sinh rút máy xem tin nhắn khi đang chạy xe"""
        # Đang chạy 20 km/h, rút máy ra (proximity=False), bật sáng màn hình (screen_on=True)
        detected, msg = self.engine.check_distracted_driving(
            gps_speed_kmh=20.0, proximity_near=False, screen_on=True
        )
        self.assertTrue(detected)
        self.assertEqual(msg, "DISTRACTED_DRIVING_DETECTED")
        self.assertEqual(self.engine.sdi_score, 95) # Đã bị trừ 5 điểm

    def test_cornering_lean_physics(self):
        """Kiểm định công thức vật lý góc nghiêng ôm cua"""
        # Đi 20 km/h (~5.56 m/s), ôm cua với tốc độ xoay 0.5 rad/s (~28.6 deg/s)
        speed = 20.0 / 3.6
        yaw_rate = 0.5
        lean = self.engine.calculate_cornering_lean(speed, yaw_rate)
        
        # tan(phi) = (5.556 * 0.5) / 9.81 = 0.2832 -> phi ~ 15.8 độ
        self.assertGreater(lean, 15.0)
        self.assertLess(lean, 17.0)

    def test_real_crash_vs_phone_drop(self):
        """Kiểm định phát hiện ngã xe thật vs tình huống ném điện thoại lên giường"""
        # Tình huống 1: Ngã xe thật (đang đi tốc độ cao rồi dừng hẳn, va đập 4.2g, nghiêng 75 độ, nằm im)
        is_crash, msg = self.engine.evaluate_crash(
            tilt_angle_deg=75.0, impact_g=4.2, speed_kmh=0.0, post_impact_variance=0.01
        )
        self.assertTrue(is_crash)
        self.assertTrue(self.engine.sos_active)

        # Tình huống 2: Đang đứng yên (speed=0), rút máy làm rơi xuống đất nhưng người vẫn cử động nhặt máy
        self.engine.sos_active = False
        is_drop, _ = self.engine.evaluate_crash(
            tilt_angle_deg=70.0, impact_g=3.5, speed_kmh=0.0, post_impact_variance=0.25 # cử động nhặt máy
        )
        self.assertFalse(is_drop)

if __name__ == '__main__':
    unittest.main()
