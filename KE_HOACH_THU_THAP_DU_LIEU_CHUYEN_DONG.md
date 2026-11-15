# KẾ HOẠCH TỔ CHỨC ĐỘI NGŨ THU THẬP DỮ LIỆU CHUYỂN ĐỘNG & BỘ TIÊU CHUẨN ĐỊNH VỊ
> **Dự án:** Eco-SafeRide — Trợ Lý An Toàn Giao Thông Số Học Đường  
> **Mục tiêu:** Xây dựng tập dữ liệu thực nghiệm (Dataset) đa chiều xoay điện thoại và phân loại chính xác $100\%$ Đi bộ vs Đi xe đạp điện.

---

## 👥 1. CƠ CẤU ĐỘI NGŨ THU THẬP DỮ LIỆU THỰC ĐỊA (DATA SQUAD)

Để tập dữ liệu khách quan, đa dạng và không bị thiên lệch (bias), đội ngũ được chia thành **4 nhóm chuyên trách**:

| Nhóm Chuyên Trách | Số Lượng | Nhiệm Vụ Trọng Tâm | Thiết Bị & Công Cụ |
|---|:---:|---|---|
| **1. Trưởng Nhóm Điều Phối (Data Lead)** | 01 người | Lập lịch trình tuyến đường thực địa quanh cổng trường, quản lý chất lượng dữ liệu | Laptop, Checklist chuẩn |
| **2. Đội Tình Nguyện Viên Thực Địa (Field Riders & Walkers)** | 20 học sinh | Thực hiện di chuyển theo kịch bản: Đi bộ, chạy bộ, đi xe đạp điện, lạng lách, chở ba | Đa dạng máy: iPhone (iOS), Samsung, Xiaomi, Oppo (Android) |
| **3. Kỹ Sư Làm Sạch & Gắn Nhãn (Data Annotation Engineer)** | 02 người | Đối chiếu video hành trình thực tế với log CSV, loại bỏ mẫu nhiễu (noise) | Python Pandas, Jupyter Notebook |
| **4. Kỹ Sư Thuật Toán TinyML (Feature & ML Specialist)** | 01 người | Trích xuất đặc trưng phổ FFT, kiểm định ma trận xoay tọa độ và huấn luyện model | Scipy, Scikit-learn, C/C++ |

---

## 🧭 2. MA TRẬN HƯỚNG ĐẶT ĐIỆN THOẠI (PHONE ORIENTATION MATRIX)

Điện thoại của học sinh không bao giờ được đặt cố định. Đội ngũ thu thập dữ liệu bắt buộc phải phủ đủ **5 hướng xoay thực tế**:

```
        ┌────────────────────────────────────────────────────────┐
        │        5 VỊ TRÍ & CHIỀU ĐẶT ĐIỆN THOẠI THỰC TẾ         │
        └──────────────────────────┬─────────────────────────────┘
                                   │
      ┌──────────────┬─────────────┼──────────────┬──────────────┐
      ▼              ▼             ▼              ▼              ▼
【Túi Quần Đứng】 【Túi Quần Ngược】 【Túi Áo Khoác】 【Ba Lô Sau Lưng】 【Cầm Trên Tay】
Đầu máy hướng lên  Đầu máy cắm xuống Rung lắc tự do   Ổn định góc,   Dao động cổ tay,
Màn hình áp đùi   Màn hình hướng ra   Biên độ góc lớn   Rung tần số cao Dễ bấm nhầm
```

| Mã Hướng | Tên Vị Trí & Chiều Đặt | Đặc Tính Động Học | Thách Thức Toán Học |
|---|---|---|---|
| **P1** | Túi quần đứng (Upright) | Đỉnh máy hướng lên trời | Góc pitch ban đầu $\approx 70^\circ - 85^\circ$ |
| **P2** | Túi quần cắm ngược (Inverted) | Đỉnh máy cắm xuống đất | Trục Z đảo chiều, vector trọng lực bị âm |
| **P3** | Túi áo khoác gió (Jacket Pocket) | Rộng thùng thình, lắc lư theo gió | Xuất hiện dao động con lắc tần số $0.8 - 1.2\text{ Hz}$ |
| **P4** | Ba lô sau lưng (Backpack) | Áp vào lưng học sinh | Góc nghiêng cơ thể ổn định, rung động giảm xóc nhỏ |
| **P5** | Cầm trên tay (Handheld) | Học sinh cầm tay lái / xem máy | Rung tay lái truyền trực tiếp, cử động ngón tay |

---

## 🚶 vs 🛵 3. BẢNG PHÂN LOẠI TOÁN HỌC: ĐI BỘ VS ĐI XE ĐẠP ĐIỆN

Để hệ thống không kích hoạt nhầm khi học sinh chỉ đang đi bộ hoặc chạy trong sân trường:

```
      Tín Hiệu                   Đi Bộ / Chạy Bộ                        Đi Xe Đạp Điện / Xe Máy Điện
 ────────────────────────────────────────────────────────────────────────────────────────────────────────
  Vận tốc GPS ($v$)       Thường $< 7\text{ km/h}$ (Chạy $< 12\text{ km/h}$)     Thường $15 - 35\text{ km/h}$
  Nhịp bước chân ($f$)    Đỉnh phổ FFT rõ nét tại $1.8 - 2.2\text{ Hz}$           Không có nhịp bước chân ($0\text{ Hz}$)
  Phương sai trục Z       Chu kỳ hình sin đều đặn theo từng bước chân             Dao động ngẫu nhiên theo độ nhám mặt đường
  Gia tốc dọc thân xe     Gần như triệt tiêu khi đi đều                          Có các pha vặn ga tăng tốc / bóp phanh rõ rệt
```

### Công thức Phân Loại Cốt Lõi:
Hệ thống tính năng lượng phổ bước chân bằng Biến đổi Fourier Nhanh (FFT) trên cửa sổ trượt $128\text{ mẫu}$ ($2.56\text{ s}$):

$$E_{\text{step}} = \int_{1.5\text{ Hz}}^{2.5\text{ Hz}} |X(f)|^2 \, df$$

* **Nếu $E_{\text{step}} > \text{Threshold}$ VÀ $v_{\text{GPS}} < 10\text{ km/h}$:** $\implies$ Xác định là **ĐI BỘ / CHẠY BỘ** $\to$ Giữ trạng thái **NGỦ SÂU (DORMANT)** để tiết kiệm pin.
* **Nếu $E_{\text{step}} \approx 0$ VÀ $v_{\text{GPS}} \ge 12\text{ km/h}$:** $\implies$ Xác định là **ĐANG ĐI XE** $\to$ Kích hoạt **GIÁM SÁT AN TOÀN (ACTIVE TRIP)**.

---

## 📋 4. QUY TRÌNH THỰC HIỆN THU THẬP DỮ LIỆU 4 BƯỚC

1. **Bước 1 (Chuẩn bị):** Tình nguyện viên mở ứng dụng tại [https://eco-saferide.vercel.app](https://eco-saferide.vercel.app) trên điện thoại cá nhân.
2. **Bước 2 (Gắn nhãn trước khi đi):**
   * Chọn chiều đặt máy (ví dụ: *Túi quần cắm ngược*).
   * Chọn hành vi di chuyển (ví dụ: *Xe đạp điện bình thường*).
3. **Bước 3 (Ghi dữ liệu):** Bấm nút **"BẮT ĐẦU GHI"** $\to$ Đút điện thoại vào túi $\to$ Thực hiện hành trình $500\text{m} - 1\text{km}$ quanh trường.
4. **Bước 4 (Xuất file):** Đến nơi, rút máy bấm **"DỪNG & TẢI FILE CSV"** $\to$ File CSV chứa toàn bộ mẫu cảm biến $50\text{ Hz}$ được lưu ngay vào bộ nhớ máy để chuyển cho nhóm kỹ thuật tổng hợp.
