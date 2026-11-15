# ECO-SAFERIDE — HỆ THỐNG ỨNG DỤNG DI ĐỘNG & BẢNG MÔ PHỎNG TƯƠNG TÁC
> **Giải pháp Trợ lý Lái xe An toàn Số — Chế độ kép Độc bản (0đ Ứng dụng độc lập & 150k Cảm biến Ghi-đông ESP32)**  
> *Dự án tham dự cuộc thi: "Sáng kiến An toàn Giao thông Việt Nam 2026" (Báo Dân trí - Cục CSGT - Toyota Việt Nam)*

---

## 📌 1. TỔNG QUAN ĐỊNH HƯỚNG "APP-FIRST" (PHẦN MỀM LÀM TRỌNG TÂM)
Để giải quyết bài toán tiếp cận đại trà đến **hàng triệu học sinh THCS, THPT và sinh viên**, dự án ưu tiên phát triển ứng dụng di động thông minh trước:

```
               ┌────────────────────────────────────────────────────────┐
               │        ECO-SAFERIDE DUAL-MODE ARCHITECTURE             │
               └──────────────────────────┬─────────────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     【CHẾ ĐỘ 1: THUẦN PHẦN MỀM (0đ)】              【CHẾ ĐỘ 2: LAI GHÉP (150.000đ)】
     • 100% Smartphone trong túi áo/quần            • Smartphone + Cảm biến ESP32 ghi-đông
     • Thuật toán Tách tọa độ túi (Pocket)          • Dữ liệu rung động cơ học khung xe tối ưu
     • Phù hợp triển khai đại trà 0 đồng            • Đo góc nghiêng cua thực chuẩn xác 100%
```

---

## 📐 2. CỐT LÕI TOÁN HỌC: BẢO TOÀN TỌA ĐỘ KHI ĐIỆN THOẠI TRONG TÚI
Khi học sinh để điện thoại trong túi quần hoặc ba lô, cảm biến điện thoại bị xoay theo góc bất kỳ. Thuật toán của Eco-SafeRide tự động cô lập trọng lực:

$$\vec{g} = \text{LPF}_{0.5\text{Hz}}(\vec{a}_{\text{raw}})$$

Trục dọc thẳng đứng được chuẩn hóa:
$$\vec{u}_z = \frac{\vec{g}}{\|\vec{g}\|}$$

Gia tốc thực động học của xe được bóc tách:
$$\vec{a}_{\text{dynamic}} = \vec{a}_{\text{raw}} - \vec{g}$$

Góc nghiêng thực tế của xe đối với phương thẳng đứng:
$$\theta = \arccos\left(\frac{|\vec{a}_{\text{raw}} \cdot \vec{u}_z|}{\|\vec{a}_{\text{raw}}\|}\right) \times \frac{180}{\pi}$$

Nếu $\theta > 65^\circ$ kết hợp vận tốc giảm đột ngột và trạng thái bất động kéo dài quá $1.5\text{ s}$, hệ thống kích hoạt **Chuỗi cứu nạn SOS 115 đếm ngược 30 giây**.

---

## 📂 3. CẤU TRÚC MÃ NGUỒN VÀ BÀN GIAO

| Thư mục / Tệp tin | Vai trò & Chức năng | Trạng thái |
|---|---|---|
| [serve_mobile.py](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/serve_mobile.py) | Máy chủ HTTP nội bộ, in mã QR ASCII quét bằng camera điện thoại | ✅ Hoàn thiện |
| [MOBILE_APP_SIMULATOR/index.html](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/MOBILE_APP_SIMULATOR/index.html) | Mô phỏng Web App Responsive, phát giọng nói tiếng Việt, đọc IMU thật | ✅ Hoàn thiện |
| [FLUTTER_SOURCE_CODE/pubspec.yaml](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/FLUTTER_SOURCE_CODE/pubspec.yaml) | Cấu hình dependencies Flutter (sensors_plus, flutter_tts, geolocator) | ✅ Đã kiểm tra |
| [FLUTTER_SOURCE_CODE/lib/main.dart](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/FLUTTER_SOURCE_CODE/lib/main.dart) | Giao diện Material 3 hoàn chỉnh (4 Tab: Hành trình, Hộ chiếu, Bản đồ, SOS) | ✅ Đã kiểm tra |
| [sensor_orientation_service.dart](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/FLUTTER_SOURCE_CODE/lib/services/sensor_orientation_service.dart) | Dịch vụ tách tọa độ Quaternion & phân tích gia tốc động học | ✅ Đã kiểm tra |
| [voice_nudge_service.dart](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/FLUTTER_SOURCE_CODE/lib/services/voice_nudge_service.dart) | Dịch vụ nhắc nhở âm thanh tiếng Việt với bộ đệm chống mệt mỏi thính giác | ✅ Đã kiểm tra |
| [emergency_sos_service.dart](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/FLUTTER_SOURCE_CODE/lib/services/emergency_sos_service.dart) | Cơ chế đếm ngược 30 giây, tự động phát tín hiệu cấp cứu 115 & SMS GPS | ✅ Đã kiểm tra |
| [safe_driving_passport.dart](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/FLUTTER_SOURCE_CODE/lib/models/safe_driving_passport.dart) | Mô hình Hộ chiếu An toàn Giao thông Số, tích điểm Eco-Points, đổi quà Toyota | ✅ Đã kiểm tra |

---

## 🚀 4. HƯỚNG DẪN TRẢI NGHIỆM TRỰC TIẾP

### Cách 1: Chạy mô phỏng trên trình duyệt máy tính (Dành cho Giám khảo & Thuyết trình)
1. Mở trực tiếp tệp tin [index.html](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/MOBILE_APP_SIMULATOR/index.html) bằng trình duyệt Chrome/Edge/Firefox.
2. Bấm vào các nút: **"⚡ Lạng lách"**, **"🛑 Phanh gấp"**, **"🕳️ Sụp ổ gà"**, **"💥 Ngã xe"** để nghe trực tiếp hệ thống phản hồi bằng giọng nói tiếng Việt chuẩn.
3. Chuyển qua Tab **"Hộ Chiếu"** để xem cơ chế tích điểm Eco-Points và đổi quà (Mũ bảo hiểm Toyota, Học bổng).
4. Nhấn nút **"Đổi Chế Độ"** trên cùng để chuyển đổi linh hoạt giữa **Chế độ 0đ** và **Chế độ 150k**.

### Cách 2: Trải nghiệm cảm biến hồi chuyển thực trên điện thoại thật (Live Gyroscope)
1. Mở PowerShell trong thư mục này và gõ:
   ```bash
   python serve_mobile.py
   ```
2. Màn hình console sẽ tự động mở trang web trên máy tính và hiển thị **mã QR**.
3. Bật camera điện thoại (cùng kết nối mạng Wi-Fi với máy tính), quét mã QR để mở ứng dụng web trên điện thoại.
4. Bấm nút **"Bật Cảm Biến Thật"**: Điện thoại sẽ trực tiếp đọc dữ liệu con quay hồi chuyển & gia tốc kế thời gian thực! Thử nghiêng hoặc lắc điện thoại để trải nghiệm thuật toán cảnh báo tự động!

---

## 📱 5. BIÊN DỊCH ỨNG DỤNG FLUTTER RA FILE APK CHO ANDROID / IOS
Để đóng gói thành app di động chính thức cài vào máy:
```bash
cd FLUTTER_SOURCE_CODE
flutter pub get
flutter build apk --release
```
File APK xuất ra tại: `build/app/outputs/flutter-apk/app-release.apk`.
