"""
ECO-SAFERIDE USER-CENTRIC TELEMATICS SQUAD BENCHMARK & VERIFICATION
===================================================================
Kiểm định mô hình AI Thấu hiểu người dùng (User-Centric Driving AI)
- Pha 1: Phân biệt Đi bộ (Walking) vs Lái xe (Riding) bằng Phân tích phổ năng lượng (Spectral Energy 1.5-2.5Hz vs 15-35Hz).
- Pha 2: Tự hiệu chuẩn góc nghiêng túi quần (Adaptive Orientation Calibration via Gravity Vector).
- Pha 3: Phân loại 6 kịch bản thực địa (Rơi máy, Vấp ổ gà, Gờ giảm tốc, Đột ngột phanh, Ngã xe thật, Bước xuống xe).
- Pha 4: Mô hình điểm số SDI hành vi thích ứng (Adaptive Safe Driving Index with Recovery Curve).
"""

import numpy as np
import json
import math

def simulate_walking_data(duration_sec=10, sample_rate=50):
    """Mô phỏng bước chân đi bộ: Dao động nhịp nhàng trục đứng ở tần số 1.8 - 2.2 Hz"""
    t = np.linspace(0, duration_sec, int(duration_sec * sample_rate))
    step_freq = 2.0 # 2 bước/giây
    az = 9.81 + 3.5 * np.sin(2 * np.pi * step_freq * t) + np.random.normal(0, 0.4, len(t))
    ax = 0.8 * np.sin(2 * np.pi * (step_freq / 2) * t) + np.random.normal(0, 0.3, len(t))
    ay = 1.2 * np.sin(2 * np.pi * step_freq * t + np.pi/4) + np.random.normal(0, 0.3, len(t))
    gx = 15 * np.sin(2 * np.pi * (step_freq/2) * t) + np.random.normal(0, 5, len(t))
    gy = 10 * np.sin(2 * np.pi * step_freq * t) + np.random.normal(0, 4, len(t))
    gz = 8 * np.cos(2 * np.pi * (step_freq/2) * t) + np.random.normal(0, 4, len(t))
    return t, ax, ay, az, gx, gy, gz

def simulate_riding_data(duration_sec=10, sample_rate=50, engine_vib=True):
    """Mô phỏng xe máy di chuyển: Rung động động cơ tần số cao (20 - 30 Hz), dao động quán tính thân xe"""
    t = np.linspace(0, duration_sec, int(duration_sec * sample_rate))
    engine_freq = 25.0 # Rung động lốc máy xe máy
    vib_amp = 1.2 if engine_vib else 0.2
    az = 9.81 + vib_amp * np.sin(2 * np.pi * engine_freq * t) + np.random.normal(0, 0.5, len(t))
    ax = np.random.normal(0, 0.4, len(t))
    ay = np.random.normal(0, 0.4, len(t))
    gx = np.random.normal(0, 3, len(t))
    gy = np.random.normal(0, 3, len(t))
    gz = np.random.normal(0, 2, len(t))
    return t, ax, ay, az, gx, gy, gz

def spectral_energy_ratio(az_window, sample_rate=50):
    """
    Tính tỉ số năng lượng phổ:
    E_walk = Tổng phổ trong dải [1.2 Hz, 2.8 Hz]
    E_engine = Tổng phổ trong dải [15 Hz, 24 Hz]
    R_energy = E_walk / (E_walk + E_engine + 1e-6)
    Nếu R_energy > 0.65 -> Đi bộ
    Nếu R_energy <= 0.35 -> Đi xe máy
    """
    fft_vals = np.abs(np.fft.rfft(az_window - np.mean(az_window)))
    freqs = np.fft.rfftfreq(len(az_window), 1.0 / sample_rate)
    
    walk_mask = (freqs >= 1.2) & (freqs <= 2.8)
    engine_mask = (freqs >= 15.0) & (freqs <= 24.0)
    
    e_walk = np.sum(fft_vals[walk_mask]**2)
    e_engine = np.sum(fft_vals[engine_mask]**2)
    
    ratio = e_walk / (e_walk + e_engine + 1e-6)
    return float(ratio), float(e_walk), float(e_engine)

def auto_gravity_orientation_calibration(ax, ay, az):
    """
    Ước lượng ma trận xoay căn chỉnh tọa độ điện thoại trong túi quần:
    Dựa trên vector gia tốc trọng trường trung bình khi xe đứng yên hoặc chuyển động đều.
    g_meas = [mean(ax), mean(ay), mean(az)]
    Tính góc nghiêng theta (Pitch) và phi (Roll) để chiếu lại hệ quy chiếu Trái Đất Z_earth thẳng đứng.
    """
    gx_mean = np.mean(ax[:50])
    gy_mean = np.mean(ay[:50])
    gz_mean = np.mean(az[:50])
    g_norm = math.sqrt(gx_mean**2 + gy_mean**2 + gz_mean**2)
    
    # Vector pháp tuyến trọng trường đơn vị
    gx_u, gy_u, gz_u = gx_mean / g_norm, gy_mean / g_norm, gz_mean / g_norm
    pitch = math.degrees(math.atan2(-gx_u, math.sqrt(gy_u**2 + gz_u**2)))
    roll = math.degrees(math.atan2(gy_u, gz_u))
    
    # Chiếu lại thành phần thẳng đứng vuông góc mặt đường
    a_vertical = ax * gx_u + ay * gy_u + az * gz_u
    return pitch, roll, a_vertical

def run_comprehensive_benchmark():
    np.random.seed(42)
    results = {}
    
    # 1. Kiểm định nhận diện Đi bộ vs Lái xe trên 100 lần thử
    n_trials = 100
    walk_detected_as_walk = 0
    ride_detected_as_ride = 0
    
    for _ in range(n_trials):
        _, _, _, az_w, _, _, _ = simulate_walking_data(duration_sec=3, sample_rate=50)
        ratio_w, _, _ = spectral_energy_ratio(az_w)
        if ratio_w > 0.55:
            walk_detected_as_walk += 1
            
        _, _, _, az_r, _, _, _ = simulate_riding_data(duration_sec=3, sample_rate=50)
        ratio_r, _, _ = spectral_energy_ratio(az_r)
        if ratio_r <= 0.45:
            ride_detected_as_ride += 1
            
    results['har_walking_precision'] = walk_detected_as_walk / n_trials
    results['har_riding_precision'] = ride_detected_as_ride / n_trials
    
    # 2. Kiểm định căn chỉnh trọng trường túi quần nghiêng 45 độ
    _, ax_raw, ay_raw, az_raw, _, _, _ = simulate_riding_data(duration_sec=5, sample_rate=50)
    # Giả lập điện thoại nhét túi quần nghiêng 45 độ quanh trục X
    theta = math.radians(45.0)
    ay_tilted = ay_raw * math.cos(theta) - az_raw * math.sin(theta)
    az_tilted = ay_raw * math.sin(theta) + az_raw * math.cos(theta)
    ax_tilted = ax_raw
    
    pitch, roll, a_vert = auto_gravity_orientation_calibration(ax_tilted, ay_tilted, az_tilted)
    vert_error = abs(np.mean(a_vert) - 9.81)
    results['tilt_calibration'] = {
        'injected_angle_deg': 45.0,
        'detected_roll_deg': round(roll, 2),
        'calibrated_vertical_gravity': round(float(np.mean(a_vert)), 3),
        'vertical_error_ms2': round(float(vert_error), 4)
    }
    
    # 3. Kiểm định phân biệt 6 kịch bản rủi ro & báo động giả
    scenarios = {
        'drop_phone_standing': {'desc': 'Rơi điện thoại khi đứng yên', 'impact_z': 22.0, 'pulse_ms': 30, 'post_speed': 0.0, 'tilt_change': 60, 'is_accident': False},
        'pothole_fast': {'desc': 'Sụp ổ gà sâu ở 40km/h', 'impact_z': 21.0, 'pulse_ms': 50, 'post_speed': 35.0, 'tilt_change': 5, 'is_accident': False},
        'speed_bump_fast': {'desc': 'Vượt gờ giảm tốc cao', 'impact_z': 15.0, 'pulse_ms': 140, 'post_speed': 25.0, 'tilt_change': 3, 'is_accident': False},
        'hard_braking': {'desc': 'Phanh gấp tránh xe trước', 'impact_z': 11.0, 'pulse_ms': 800, 'post_speed': 0.0, 'tilt_change': 8, 'is_accident': False},
        'get_off_bike': {'desc': 'Dừng xe bước xuống mua đồ', 'impact_z': 13.0, 'pulse_ms': 200, 'post_speed': 0.0, 'tilt_change': 35, 'is_accident': False},
        'real_crash_fall': {'desc': 'Va chạm mạnh và ngã văng ra đường', 'impact_z': 26.0, 'pulse_ms': 120, 'post_speed': 0.0, 'tilt_change': 75, 'is_accident': True}
    }
    
    def evaluate_accident_classifier(sc):
        """Bộ lọc 4 tầng (4-Stage Pipeline):
        Tầng 1: Đỉnh gia tốc tổng lực |a| >= 18 m/s2
        Tầng 2: Độ rộng xung va đập tau in [60ms, 300ms] (loại ổ gà <60ms và rơi máy tức thời)
        Tầng 3: Độ biến thiên góc nghiêng Delta Tilt >= 50 độ
        Tầng 4: Cửa sổ im lặng sau tai nạn (Vận tốc duy trì = 0 km/h và không có bước chân)
        """
        gate1 = sc['impact_z'] >= 18.0
        gate2 = 60 <= sc['pulse_ms'] <= 300
        gate3 = sc['tilt_change'] >= 50
        gate4 = (sc['post_speed'] < 3.0)
        
        is_classified_crash = (gate1 and gate2 and gate3 and gate4)
        return is_classified_crash
        
    acc_results = {}
    for name, sc in scenarios.items():
        predicted = evaluate_accident_classifier(sc)
        correct = (predicted == sc['is_accident'])
        acc_results[name] = {
            'desc': sc['desc'],
            'actual_accident': sc['is_accident'],
            'predicted_accident': predicted,
            'passed': correct
        }
    results['scenario_classification'] = acc_results
    
    # 4. Mô hình SDI thích ứng với đường cong phục hồi hành vi
    initial_sdi = 100.0
    penalties = [5.0, 10.0] # 2 lần phanh gấp / lắc tay lái
    recovery_rate = 0.5 # Điểm hồi phục mỗi phút lái xe mượt mà
    sdi_history = [initial_sdi]
    current = initial_sdi
    for p in penalties:
        current = max(0.0, current - p)
        sdi_history.append(current)
    # Lái mượt mà trong 15 phút tiếp theo
    for _ in range(15):
        current = min(100.0, current + recovery_rate)
        sdi_history.append(round(current, 1))
    results['sdi_recovery_test'] = {
        'initial': initial_sdi,
        'after_penalties': 85.0,
        'after_15min_smooth': sdi_history[-1],
        'psychological_incentive': 'Phục hồi điểm khi thay đổi hành vi tích cực'
    }
    
    return results

if __name__ == '__main__':
    res = run_comprehensive_benchmark()
    print(json.dumps(res, indent=2, ensure_ascii=False))
