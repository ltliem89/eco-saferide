# HỒ SƠ BÀN GIAO SẢN PHẨM: ỨNG DỤNG DI ĐỘNG ECO-SAFERIDE (CHẾ ĐỘ 0Đ)
> **Vai trò điều phối:** Lead Developer & System Architect  
> **Dự án:** Eco-SafeRide — Trợ Lý An Toàn Giao Thông Số Học Đường  
> **Cuộc thi:** Sáng kiến An toàn Giao thông Việt Nam 2026 (Báo Dân trí - Cục CSGT - Toyota Việt Nam)

---

## 📱 1. TỔNG QUAN BÀN GIAO SẢN PHẨM

Với tư cách là **Nhà phát triển trưởng (Lead Developer)**, tôi đã điều phối đội ngũ kỹ thuật hoàn thiện trọn vẹn gói sản phẩm phần mềm di động **Eco-SafeRide Companion** tối ưu hóa $100\%$ cho **Chế độ 0đ (Thuần phần mềm bỏ túi)**:

```
                                ┌───────────────────────────────────────┐
                                │   ECO-SAFERIDE MOBILE PRODUCT STACK   │
                                └───────────────────┬───────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 ▼                                                                     ▼
    【1. BẢN THỰC THI PWA ĐA NỀN TẢNG】                                  【2. MÃ NGUỒN NATIVE FLUTTER APP】
    • Cài đặt trực tiếp lên màn hình điện thoại                         • Sẵn sàng build file APK/AAB cho Android
    • Đọc trực tiếp Gyroscope & Accelerometer thật                      • Hỗ trợ iOS qua Xcode / CocoaPods
    • Phát giọng nói tiếng Việt chuẩn qua Web Speech API                • Kiến trúc Clean Architecture tách biệt Services/Models
    • Chạy Offline 100% nhờ Service Worker (sw.js)                      • Đã tích hợp Dynamic Pocket Coordinate Alignment
```

---

## 🛠️ 2. CHI TIẾT CÁC THÀNH PHẦN KỸ THUẬT ĐÃ XÂY DỰNG

### Thành phần A: Bản Ứng Dụng PWA Trải Nghiệm Trực Tiếp (`MOBILE_APP_SIMULATOR/`)
*   [index.html](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/MOBILE_APP_SIMULATOR/index.html): Giao diện di động chuẩn Material 3, Dark-Mode tiết kiệm pin AMOLED, tích hợp:
    1. **Tab Hành trình (Live Telemetry):** Đồng hồ điểm SDI, vận tốc, góc nghiêng thời gian thực, huy hiệu hành vi.
    2. **Bộ kịch bản thực địa 5 tình huống:** Lạng lách, Phanh gấp, Sụp ổ gà, Rút điện thoại xem khi lái xe, Ngã xe cấp cứu 115.
    3. **Nút "Bật Cảm Biến Thật":** Kết nối trực tiếp phần cứng con quay hồi chuyển & gia tốc kế của iPhone/Android khi mở trên điện thoại.
    4. **Tab Hộ chiếu ATGT:** Đổi điểm Eco-Points nhận mũ bảo hiểm Toyota.
    5. **Tab Bản đồ:** Hiển thị điểm đen ổ gà cộng đồng đóng góp.
*   [manifest.json](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/MOBILE_APP_SIMULATOR/manifest.json): Đầy đủ cấu hình PWA Standalone.
*   [sw.js](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/MOBILE_APP_SIMULATOR/sw.js): Service Worker đệm offline hoàn toàn.
*   **Bộ Icon Ứng dụng:** [icon-192.png](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/MOBILE_APP_SIMULATOR/icon-192.png) và [icon-512.png](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/MOBILE_APP_SIMULATOR/icon-512.png).

### Thành phần B: Mã Nguồn Ứng Dụng Flutter Đóng Gói Native (`FLUTTER_SOURCE_CODE/`)
*   [main.dart](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/FLUTTER_SOURCE_CODE/lib/main.dart): Khung ứng dụng chính tích hợp luồng sự kiện cảm biến.
*   [sensor_orientation_service.dart](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/FLUTTER_SOURCE_CODE/lib/services/sensor_orientation_service.dart): Thuật toán trích xuất vector trọng lực tĩnh $\vec{g}$, bóc tách gia tốc chuyển động thực $\vec{a}_{\text{dyn}}$ và tính phương sai lạng lách.
*   [voice_nudge_service.dart](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/FLUTTER_SOURCE_CODE/lib/services/voice_nudge_service.dart): Máy phát âm thanh nhắc nhở tiếng Việt rảnh tay kèm bộ đệm chống mệt mỏi thính giác ($6\text{ giây}$).
*   [emergency_sos_service.dart](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/FLUTTER_SOURCE_CODE/lib/services/emergency_sos_service.dart): Quy trình đếm ngược 30 giây cứu nạn, lấy vị trí GPS và kích hoạt `tel:115`.
*   [safe_driving_passport.dart](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/FLUTTER_SOURCE_CODE/lib/models/safe_driving_passport.dart): Logic tính điểm SDI ($0 - 100$), trừ điểm vi phạm và tích điểm thưởng Eco-Points.

### Thành phần C: Bộ Công Cụ Vận Hành 1-Click
*   [run_demo.bat](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/run_demo.bat): Tệp chạy tự động trên Windows chỉ bằng một cú nhấp đúp chuột.
*   [serve_mobile.py](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/serve_mobile.py): Máy chủ HTTP tự dò IP mạng LAN và in **Mã QR Code** trực tiếp trên màn hình terminal để quét bằng camera điện thoại.

### Thành phần D: Bộ Kiểm Thử Toán Học Xác Minh (Automated Verification)
*   [test_mode0_pocket_telematics.py](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/test_mode0_pocket_telematics.py): Đã kiểm tra $5/5$ test cases đạt PASS $100\%$ trong $0.001\text{ giây}$.

---

## 🚀 3. HƯỚNG DẪN 3 BƯỚC SỬ DỤNG VÀ THỰC NGHIỆM

1. **Khởi động:** Nhấp đúp chuột vào tệp [run_demo.bat](file:///g:/My%20Drive/DATA-LIEM/NH%202026-2027/11.ThiNhaGiaoAI/sangkienatgt.dantri/11_APP_DI_DONG_ECO_SAFERIDE/run_demo.bat) (hoặc chạy `python serve_mobile.py`).
2. **Trải nghiệm trên máy tính:** Trình duyệt sẽ tự động mở trang web ứng dụng di động. Bạn bấm thử 5 nút kịch bản để nghe loa máy tính phát tiếng Việt.
3. **Cài đặt lên điện thoại:** Lấy camera điện thoại quét mã QR hiển thị trong cửa sổ màu đen:
   * Trên Safari (iPhone): Bấm nút **Chia sẻ (Share)** $\to$ chọn **"Thêm vào Màn hình chính (Add to Home Screen)"**.
   * Trên Chrome (Android): Bấm nút **Menu (3 chấm)** $\to$ chọn **"Cài đặt ứng dụng (Install App)"**.
   * Ứng dụng sẽ xuất hiện như một App Native độc lập với icon lá chắn xanh Eco-SafeRide!
