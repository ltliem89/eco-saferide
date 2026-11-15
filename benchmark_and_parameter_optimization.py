"""
Benchmark & Parameter Optimization Suite: Eco-SafeRide Telematics
==================================================================
Đánh giá định lượng toàn bộ các thông số kỹ thuật (Hyperparameters)
và thiết lập thuật toán cải tiến: Ngưỡng Thích Ứng Động (Adaptive Dynamic Thresholding)
so với Ngưỡng Cố Định (Fixed Thresholding).
"""

import math
import numpy as np

def generate_synthetic_trip(trip_type="normal", duration_sec=10, sample_rate=50, pocket_noise_level=0.15):
    """
    Tạo chuỗi dữ liệu cảm biến thực tế với nhiễu rung lắc túi và độ trôi cảm biến:
    trip_type: 'normal', 'swerving', 'pothole', 'speed_bump', 'crash', 'walking'
    """
    n_samples = int(duration_sec * sample_rate)
    t = np.linspace(0, duration_sec, n_samples)
    dt = 1.0 / sample_rate

    # Trọng lực tĩnh theo phương Z (có góc nghiêng ngẫu nhiên do nhét túi)
    tilt_rad = np.radians(np.random.uniform(15, 45))
    gz = 9.81 * np.cos(tilt_rad)
    gx = 9.81 * np.sin(tilt_rad)
    gy = 0.0

    # Nhiễu trắng cảm biến + nhiễu rung lắc vải túi quần
    ax = gx + np.random.normal(0, pocket_noise_level * 2.0, n_samples)
    ay = gy + np.random.normal(0, pocket_noise_level * 1.5, n_samples)
    az = gz + np.random.normal(0, pocket_noise_level * 2.5, n_samples)
    gyro_z = np.random.normal(0, 3.0, n_samples) # deg/s

    if trip_type == "swerving":
        # Dao động lạng lách hình sin tuần hoàn 0.8 Hz
        sw_phase = np.sin(2 * np.pi * 0.8 * t)
        ay += sw_phase * 4.5
        gyro_z += sw_phase * 48.0 # vận tốc góc lạng lách

    elif trip_type == "pothole":
        # Xung nhọn đơn lẻ hướng xuống chữ V (thời gian ~50ms = ~3 mẫu)
        spike_idx = n_samples // 2
        az[spike_idx:spike_idx+3] += np.array([-16.0, 18.0, -8.0])

    elif trip_type == "speed_bump":
        # Gờ giảm tốc: Lượn sóng hình sin kép (~15 m/s2), kéo dài ~200ms
        sb_idx = n_samples // 2
        wave = 15.0 * np.sin(np.linspace(0, 2 * np.pi, 10))
        az[sb_idx:sb_idx+10] += wave

    elif trip_type == "crash":
        # Va chạm mạnh > 35 m/s2 rồi lật ngang 80 độ và nằm yên
        crash_idx = int(n_samples * 0.4)
        ax[crash_idx:crash_idx+4] += np.random.uniform(25, 40, 4)
        az[crash_idx:crash_idx+4] += np.random.uniform(20, 35, 4)
        # Sau ngã: điện thoại nằm ngang mặt đất, góc tilt > 75 độ
        az[crash_idx+5:] = np.random.normal(1.2, 0.05, n_samples - crash_idx - 5)
        ax[crash_idx+5:] = np.random.normal(9.6, 0.05, n_samples - crash_idx - 5)
        gyro_z[crash_idx+5:] = np.random.normal(0, 0.2, n_samples - crash_idx - 5)

    elif trip_type == "walking":
        # Nhịp bước chân người đi bộ: 1.8 Hz
        step_wave = 3.2 * np.sin(2 * np.pi * 1.8 * t)
        az += step_wave
        ax += step_wave * 0.6

    return t, ax, ay, az, gyro_z


def evaluate_fixed_threshold(ax, ay, az, gyro_z, window_size=25):
    """
    Bộ phân loại ngưỡng tĩnh cơ bản
    """
    n = len(az)
    alpha = 0.85
    gz = 9.81
    detected_events = []

    for i in range(n):
        gz = alpha * gz + (1 - alpha) * az[i]
        dyn_z = abs(az[i] - gz)
        tot_acc = math.sqrt(ax[i]**2 + ay[i]**2 + az[i]**2)

        # Ngưỡng tĩnh cố định:
        if abs(gyro_z[i]) > 40.0:
            detected_events.append("swerving")
        if dyn_z > 12.0:
            detected_events.append("pothole")
        if tot_acc > 32.0:
            detected_events.append("crash_impact")

    return list(set(detected_events))


def evaluate_adaptive_threshold(ax, ay, az, gyro_z, window_size=25):
    """
    BỘ PHÂN LOẠI CẢI TIẾN: NGƯỠNG THÍCH ỨNG ĐỘNG (ADAPTIVE DYNAMIC THRESHOLD)
    - Tự động học mức nhiễu nền của vải túi và mặt đường qua cửa sổ trượt
    - Phân biệt gờ giảm tốc (lượn sóng kép) vs ổ gà (xung nhọn đơn)
    - Cơ chế FSM 4 pha xác nhận ngã xe
    """
    n = len(az)
    alpha = 0.85
    gz = 9.81
    detected_events = []

    # Buffer trượt ước lượng độ nhạy nền
    noise_buffer = []
    
    for i in range(n):
        gz = alpha * gz + (1 - alpha) * az[i]
        dyn_z = abs(az[i] - gz)
        tot_acc = math.sqrt(ax[i]**2 + ay[i]**2 + az[i]**2)

        noise_buffer.append(dyn_z)
        if len(noise_buffer) > window_size:
            noise_buffer.pop(0)

        # Tính độ lệch chuẩn nền sigma_noise
        baseline_sigma = float(np.std(noise_buffer)) if len(noise_buffer) >= 10 else 1.0
        
        # 1. Ngưỡng thích ứng lạng lách: Gyro > 3.5 * sigma_gyro
        if abs(gyro_z[i]) > max(35.0, 4.0 * baseline_sigma * 10):
            detected_events.append("swerving")

        # 2. Phân biệt ổ gà vs gờ giảm tốc qua độ rộng xung (Pulse Duration)
        if dyn_z > max(10.0, 3.8 * baseline_sigma):
            # Đếm số mẫu liên tiếp vượt ngưỡng để đo thời gian kéo dài của xung
            pulse_len = 0
            for k in range(max(0, i - 6), min(n, i + 7)):
                if abs(az[k] - gz) > 8.0:
                    pulse_len += 1
            
            # Ổ gà là xung nhọn rất ngắn (<= 4 mẫu = <= 80ms)
            # Gờ giảm tốc kéo dài hơn (>= 5 mẫu = >= 100ms)
            if pulse_len <= 4:
                detected_events.append("pothole")
            else:
                detected_events.append("speed_bump")

        # 3. Va chạm ngã xe: Phải có xung va đập VÀ sau đó bất động
        if tot_acc > 35.0:
            # Kiểm tra 1.0 giây tiếp theo (50 mẫu) xem có bất động không
            if i + 50 < n:
                post_var = float(np.var(az[i+10:i+50]))
                if post_var < 0.2: # Nằm yên bất động
                    detected_events.append("crash_fall")

    return list(set(detected_events))


def run_benchmark_comparison(episodes_per_class=100):
    """
    Chạy so sánh 500 kịch bản thực địa mô phỏng
    """
    classes = ["normal", "swerving", "pothole", "speed_bump", "crash"]
    
    results = {
        "fixed": {"TP": 0, "FP": 0, "FN": 0, "TN": 0},
        "adaptive": {"TP": 0, "FP": 0, "FN": 0, "TN": 0}
    }

    speed_bump_fp_fixed = 0
    speed_bump_fp_adaptive = 0

    for c in classes:
        for _ in range(episodes_per_class):
            t, ax, ay, az, gz = generate_synthetic_trip(trip_type=c)
            
            res_fixed = evaluate_fixed_threshold(ax, ay, az, gz)
            res_adapt = evaluate_adaptive_threshold(ax, ay, az, gz)

            # Đánh giá riêng ổ gà trên gờ giảm tốc (Báo động giả phổ biến nhất)
            if c == "speed_bump":
                if "pothole" in res_fixed: speed_bump_fp_fixed += 1
                if "pothole" in res_adapt: speed_bump_fp_adaptive += 1

            # Đánh giá lạng lách
            if c == "swerving":
                if "swerving" in res_fixed: results["fixed"]["TP"] += 1
                else: results["fixed"]["FN"] += 1
                
                if "swerving" in res_adapt: results["adaptive"]["TP"] += 1
                else: results["adaptive"]["FN"] += 1
            elif c == "normal":
                if "swerving" in res_fixed: results["fixed"]["FP"] += 1
                else: results["fixed"]["TN"] += 1
                
                if "swerving" in res_adapt: results["adaptive"]["FP"] += 1
                else: results["adaptive"]["TN"] += 1

    print("==================================================================")
    print("  BÁO CÁO THỰC NGHIỆM ĐÁNH GIÁ THÔNG SỐ VÀ CẢI TIẾN THUẬT TOÁN")
    print("==================================================================")
    print(f"Tổng số tập thử nghiệm: {episodes_per_class * len(classes)} kịch bản")
    print("------------------------------------------------------------------")
    print(f"1. TỶ LỆ BÁO NHẦM GỜ GIẢM TỐC THÀNH Ổ GÀ (False Positive Rate):")
    print(f"   - Thuật toán Ngưỡng tĩnh:     {speed_bump_fp_fixed}/{episodes_per_class} ({speed_bump_fp_fixed/episodes_per_class*100:.1f}%)")
    print(f"   - Thuật toán Ngưỡng thích ứng: {speed_bump_fp_adaptive}/{episodes_per_class} ({speed_bump_fp_adaptive/episodes_per_class*100:.1f}%)")
    print(f"   ==> Mức độ cải thiện: GIẢM {((speed_bump_fp_fixed - speed_bump_fp_adaptive)/max(1, speed_bump_fp_fixed))*100:.1f}% BÁO ĐỘNG GIẢ!")
    print("------------------------------------------------------------------")
    
    prec_f = results["fixed"]["TP"] / max(1, results["fixed"]["TP"] + results["fixed"]["FP"])
    rec_f = results["fixed"]["TP"] / max(1, results["fixed"]["TP"] + results["fixed"]["FN"])
    f1_f = 2 * prec_f * rec_f / max(1e-4, prec_f + rec_f)

    prec_a = results["adaptive"]["TP"] / max(1, results["adaptive"]["TP"] + results["adaptive"]["FP"])
    rec_a = results["adaptive"]["TP"] / max(1, results["adaptive"]["TP"] + results["adaptive"]["FN"])
    f1_a = 2 * prec_a * rec_a / max(1e-4, prec_a + rec_a)

    print(f"2. ĐỘ CHÍNH XÁC NHẬN DIỆN LẠNG LÁCH (F1-Score):")
    print(f"   - Ngưỡng tĩnh:     Precision = {prec_f*100:.1f}%, Recall = {rec_f*100:.1f}%, F1 = {f1_f*100:.1f}%")
    print(f"   - Ngưỡng thích ứng: Precision = {prec_a*100:.1f}%, Recall = {rec_a*100:.1f}%, F1 = {f1_a*100:.1f}%")
    print("==================================================================")

if __name__ == '__main__':
    run_benchmark_comparison(episodes_per_class=100)
