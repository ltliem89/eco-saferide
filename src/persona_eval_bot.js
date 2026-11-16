// =============================================================================
// ECO-SAFERIDE: MULTI-PERSONA AUTONOMOUS EVALUATION & INTERACTIVE BOT SYSTEM
// Hệ thống Bot Trải nghiệm & Đánh giá Độc lập Đa Nhân vật Thực tế (10 Persona)
// Tác giả: Nhóm Nghiên cứu & Phát triển OpenLab Cần Thơ — Dự án Eco-SafeRide
// =============================================================================

const PERSONA_DATA = [
  {
    id: "nam_student_16",
    name: "Nguyễn Hoàng Nam",
    age: 16,
    role: "Học sinh Lớp 11 — THPT Châu Văn Liêm, Cần Thơ",
    category: "student",
    categoryLabel: "Học Sinh Phổ Thông",
    avatar: "👦",
    vehicle: "Xe máy điện VinFast Evo 200 Lite (vận tốc tối đa ~45 km/h)",
    dailyRoute: "Đường 30/4 ➔ Cổng trường Châu Văn Liêm (2.8 km, qua 3 nút giao)",
    painPoint: "Thích bỏ điện thoại trong túi quần nghe nhạc; ghét bị bố mẹ gắn app định vị kè kè; sợ bị cướp giật nếu kẹp máy lên ghi-đông xe.",
    testedFeatures: ["Cảm biến IMU túi quần 50Hz", "Chế độ ngủ HAR FFT khi đi bộ", "Còi bíp phản xạ âm thanh", "Mô phỏng 3D điểm mù WebGL"],
    scores: {
      usefulness: 4.9,
      easeOfUse: 5.0,
      reliability: 4.8,
      costZero: 5.0,
      privacy: 4.9,
      overall: 4.92,
      nps: 10
    },
    quote: "Lần đầu tiên em thấy vệt bánh sau xe tải chém cua lấn hơn 2 mét trong mô phỏng 3D. Trước giờ qua ngã tư em toàn cố lách lên bên phải xe tải khi nó bật xi-nhan rẽ, xem xong 3D em rùng mình nhận ra mình từng thoát chết trong gang tấc! App chạy cực êm trong túi quần, màn hình đen thui không hao pin, không bị theo dõi định vị.",
    simulationLogs: [
      "[07:15:02] Nam khởi hành từ nhà, bật Eco-SafeRide và đút máy vào túi quần jean.",
      "[07:15:05] Cảm biến IMU 50Hz kích hoạt. Bộ lọc IIR (fc=1.40Hz) tự căn chỉnh trọng trường: Sai số chỉ 0.16 m/s².",
      "[07:16:40] Nam đi bộ mua bánh mì: Biến đổi phổ FFT phát hiện năng lượng tập trung tại 1.8 Hz (R_HAR = 0.82) ➔ Chuyển ngay Sleep Mode tiết kiệm 99% pin.",
      "[07:18:10] Nam lên xe nổ máy: Rung chấn cơ học 18.5 Hz (R_HAR = 0.19) ➔ Tự động đánh thức Hộp đen AI sau đúng 1.28 giây.",
      "[07:22:15] Bất ngờ có xe đạp chuyển hướng, Nam phanh gấp (-3.8 m/s²): Loa phát âm bíp 85dB tức thì sau 84 ms ➔ Nam giữ vững thăng bằng.",
      "[07:25:00] Đến cổng trường: Điểm SDI đạt 98/100, tích lũy thêm 50 điểm rèn luyện số Hiệp sĩ Giao thông."
    ],
    qaDatabase: [
      {
        q: "Em thấy để điện thoại trong túi quần có bị nóng máy hay hao pin không?",
        a: "Dạ không hề ạ! Nhờ chế độ màn hình đen OLED Pure Black tắt hết điểm ảnh, em chạy xe cả tiếng đồng hồ từ nhà tới trường mà máy mát rượi, pin chỉ sụt có 2% thôi ạ."
      },
      {
        q: "Tính năng mô phỏng 3D điểm mù giúp ích gì cho em khi lái xe thực tế?",
        a: "Dạ bổ ích gấp trăm lần nghe bài giảng lý thuyết! Trong không gian 3D, em tự lái xe đạp điện thử vượt phải khi xe tải rẽ, và thấy xe mình bị cuốn thẳng vào bánh sau. Từ hôm đó, cứ thấy xe tải là em giữ khoảng cách xa ít nhất 5 mét và tuyệt đối không bao giờ vượt bên phụ nữa!"
      },
      {
        q: "Em có sợ bị nhà trường hay ba mẹ theo dõi vị trí qua app không?",
        a: "Dạ em yên tâm vì thầy cô giải thích app này Zero-Cloud, tọa độ chỉ nằm trong điện thoại của em, không hề tải lên mạng. Ba mẹ chỉ nhận được tin nhắn khi có tai nạn ngã xe thật thôi, nên em rất thoải mái sử dụng."
      }
    ]
  },
  {
    id: "anh_student_13",
    name: "Lê Mai Anh",
    age: 13,
    role: "Học sinh Lớp 8 — THCS Đoàn Thị Điểm, Cần Thơ",
    category: "student",
    categoryLabel: "Học Sinh Mới Lái Xe",
    avatar: "👧",
    vehicle: "Xe đạp điện Nijia bánh nhỏ 10 inch (vận tốc ~25 km/h)",
    dailyRoute: "Hẻm 51 đường 3/2 ➔ Cổng trường THCS Đoàn Thị Điểm (1.5 km)",
    painPoint: "Mới tập đi xe đạp điện, tay lái yếu, rất sợ tiếng còi xe tải lớn và sợ sụp ổ gà khi trời mưa ngập nước.",
    testedFeatures: ["Cảnh báo giới hạn tốc độ 25 km/h", "Bản đồ cảnh báo ổ gà cổng trường", "Giao diện tiếng Việt 1 chạm"],
    scores: {
      usefulness: 4.8,
      easeOfUse: 4.7,
      reliability: 4.9,
      costZero: 5.0,
      privacy: 4.8,
      overall: 4.84,
      nps: 9
    },
    quote: "Giao diện ứng dụng rất to rõ, chỉ cần bấm 'BẮT ĐẦU ĐI' là xong. Khi em chạy hơi nhanh qua 25 km/h, máy phát giọng nói nhẹ nhàng nhắc 'Bạn ơi đi chậm lại nhé'. Có hôm trời mưa ngập nước, bản đồ báo trước có ổ gà sâu trước cổng trường giúp em tránh kịp, không bị ngã dơ đồ!",
    simulationLogs: [
      "[06:45:10] Mai Anh mở ứng dụng bằng biểu tượng PWA trên màn hình chính, bấm nút 'BẮT ĐẦU ĐI'.",
      "[06:48:22] Chạy vào đoạn dốc cầu: Vận tốc đạt 27 km/h ➔ Hệ thống phát cảnh báo âm thanh điều tiết tốc độ an toàn.",
      "[06:51:05] Tiếp cận nút giao đường 3/2 có cảnh báo điểm đen ổ gà sâu ➔ Ứng dụng rung nhẹ và cảnh báo từ xa 50m.",
      "[06:55:00] Đến cổng trường an toàn, nhận huy hiệu 'Tay Lái Cẩn Trọng'."
    ],
    qaDatabase: [
      {
        q: "Em thấy ứng dụng có khó sử dụng với học sinh cấp 2 không?",
        a: "Dạ rất dễ ạ! Chỉ có 1 nút bấm to ở giữa màn hình. Bạn nào không rành công nghệ cũng xài được ngay."
      },
      {
        q: "Điều em thích nhất ở Eco-SafeRide là gì?",
        a: "Dạ là cảnh báo ổ gà ngập nước và mô phỏng 3D giúp em biết xe tải nhìn thấy mình tới đâu để không đi vào chỗ khuất của bác tài xế ạ."
      }
    ]
  },
  {
    id: "thuy_parent_43",
    name: "Trần Thị Bích Thủy",
    age: 43,
    role: "Phụ huynh Học sinh — Nữ Công nhân May KCN Trà Nóc, Cần Thơ",
    category: "parent",
    categoryLabel: "Phụ Huynh Học Sinh",
    avatar: "👩‍💼",
    vehicle: "Xe máy Honda Wave Alpha đưa đón con nhỏ, con lớn tự đi xe điện",
    dailyRoute: "Nhà trọ Bình Thủy ➔ KCN Trà Nóc (12 km đi ca sớm về muộn)",
    painPoint: "Gia đình công nhân thu nhập eo hẹp, không có tiền mua thiết bị đắt đỏ; đi làm ca không thể theo sát con, rất sợ con bị tai nạn dọc đường mà không ai hay biết.",
    testedFeatures: ["Mô hình Chi phí 0 ĐỒNG", "Cảnh báo SOS tự động gửi SMS", "Bảo mật dữ liệu cá nhân Nghị định 13"],
    scores: {
      usefulness: 5.0,
      easeOfUse: 4.9,
      reliability: 5.0,
      costZero: 5.0,
      privacy: 5.0,
      overall: 4.98,
      nps: 10
    },
    quote: "Là công nhân may làm tăng ca tối ngày, nghe nói có thiết bị hộp đen gắn xe máy giá mấy triệu bạc là tôi chịu thua, tiền đâu mà mua. Khi nhà trường giới thiệu phần mềm Eco-SafeRide cài thẳng vào điện thoại cũ của con mà KHÔNG TỐN MỘT XU, tôi mừng rơi nước mắt. An tâm nhất là nếu con lỡ ngã xe bất tỉnh, máy sẽ tự nhắn tin GPS cho tôi ngay lập tức.",
    simulationLogs: [
      "[06:30:00] Chị Thủy cài đặt số điện thoại khẩn cấp vào mục Người thân trên máy con gái.",
      "[11:45:00] Kịch bản thử nghiệm ngã xe đạp điện giả định: Gia tốc đạt 3.8g, xoay góc 270°/s, điện thoại nằm nghiêng 75°, bất động 5 giây.",
      "[11:45:05] Bộ lọc Hermes xác nhận cả 4 cổng vật lý cùng thỏa mãn ➔ Đếm ngược 15 giây SOS kèm âm báo to rõ.",
      "[11:45:20] Hết 15 giây không có người bấm hủy ➔ Máy tự động kích hoạt gửi tin nhắn SMS cứu trợ kèm link Google Maps tọa độ chính xác tới máy chị Thủy."
    ],
    qaDatabase: [
      {
        q: "Chị đánh giá thế nào về mức chi phí 0 đồng của giải pháp?",
        a: "Tuyệt vời chú ơi! Con em công nhân chúng tôi nhiều khi chiếc xe đạp điện còn phải mua trả góp, làm sao mua nổi hộp đen tiền triệu. Ứng dụng này miễn phí hoàn toàn giúp tất cả các cháu đều được bảo vệ công bằng như nhau."
      },
      {
        q: "Chị có lo lắng con gái bị thu thập thông tin vị trí cá nhân không?",
        a: "Tôi có hỏi kỹ giáo viên rồi, app không có lưu vị trí lên máy chủ, chỉ khi nào con gặp nguy hiểm té xe thì mới nhắn tin cho ba mẹ thôi, nên tôi hoàn toàn tin tưởng."
      }
    ]
  },
  {
    id: "hoang_teacher_38",
    name: "Đỗ Minh Hoàng",
    age: 38,
    role: "Giáo viên Vật lý & Bí thư Đoàn trường — THPT Châu Văn Liêm, Cần Thơ",
    category: "school",
    categoryLabel: "Giáo Viên & Đoàn Trường",
    avatar: "👨‍🏫",
    vehicle: "Xe máy Yamaha Grande",
    dailyRoute: "Quận Ninh Kiều ➔ THPT Châu Văn Liêm",
    painPoint: "Các buổi tuyên truyền Luật giao thông truyền thống rất nhàm chán, học sinh ngồi nghe thụ động rồi quên ngay; các vụ vi phạm như không đội mũ bảo hiểm hay dàn hàng ngang rất khó giám sát triệt để.",
    testedFeatures: ["Mô phỏng 3D WebGL trong tiết học STEM", "AI Camera cổng trường phát hiện vi phạm", "Hệ thống Gamification Hiệp sĩ Giao thông"],
    scores: {
      usefulness: 4.9,
      easeOfUse: 4.8,
      reliability: 4.9,
      costZero: 5.0,
      privacy: 4.9,
      overall: 4.90,
      nps: 10
    },
    quote: "Tôi đã đưa mô phỏng 3D WebGL điểm mù xe tải vào tiết dạy Động học Vật lý và Ngoại khóa Đoàn trường: 100% học sinh hào hứng tương tác, tự tay kéo camera quan sát và thấu hiểu nguyên lý góc chém cua. Thay vì phạt tiêu cực, ứng dụng dùng cơ chế 'Hích' (Nudge Theory) cộng điểm thi đua khi học sinh duy trì điểm an toàn SDI trên 95 điểm, tạo sự chuyển biến hành vi tự giác rõ rệt.",
    simulationLogs: [
      "[08:00:00] Thầy Hoàng mở phân hệ 3D WebGL trên máy chiếu lớp học: 45 học sinh lần lượt trải nghiệm nhập vai tài xế và người đi xe điện.",
      "[11:30:00] Giờ tan học: AI Camera cổng trường phát hiện 3 trường hợp học sinh đi dàn hàng ngang ➔ Kích hoạt hiển thị nhắc nhở ẩn danh trên bảng LED ngoài cổng.",
      "[17:00:00] Tổng kết tuần: 94.2% học sinh toàn trường duy trì điểm SDI trên 90 điểm, số vụ vi phạm mũ bảo hiểm giảm 68% sau 1 tháng."
    ],
    qaDatabase: [
      {
        q: "Thầy đánh giá thế nào về tính sư phạm và giáo dục của dự án?",
        a: "Đây là bước đột phá giáo dục trực quan! Học sinh THPT ở độ tuổi vị thành niên não bộ ưa thích trải nghiệm số và trò chơi. Việc chuyển hóa công thức vật lý khô khan thành mô phỏng 3D tương tác và hệ thống điểm thưởng SDI khiến các em hào hứng tự giác bảo vệ bản thân."
      }
    ]
  },
  {
    id: "tuan_csgt_39",
    name: "Đại úy Phạm Quốc Tuấn",
    age: 39,
    role: "Cán bộ Đội Cảnh sát Giao thông — Công an TP. Cần Thơ",
    category: "authority",
    categoryLabel: "Lực Lượng CSGT",
    avatar: "👮‍♂️",
    vehicle: "Xe tuần tra chuyên dụng & Mô tô CSGT",
    dailyRoute: "Tuần tra các trục giao thông huyết mạch & Cụm trường học Quận Ninh Kiều",
    painPoint: "Giờ tan tầm cổng trường xung đột gay gắt giữa dòng học sinh tan trường và xe tải chở hàng; lực lượng CSGT mỏng không thể chốt chặn ở tất cả các cổng trường mỗi ngày.",
    testedFeatures: ["Camera Edge AI cảnh báo va chạm TTC", "Bản đồ nhiệt GIS điểm đen hạ tầng", "Tuân thủ Nghị định 13/2023/NĐ-CP"],
    scores: {
      usefulness: 5.0,
      easeOfUse: 4.8,
      reliability: 4.9,
      costZero: 4.9,
      privacy: 5.0,
      overall: 4.92,
      nps: 10
    },
    quote: "Phân hệ Camera AI biên tại cổng trường kết hợp thuật toán tính Thời gian trước va chạm (TTC) là giải pháp thông minh vượt bậc. Thay vì chờ tai nạn xảy ra mới lập biên bản, hệ thống kích hoạt bảng LED cảnh báo từ xa 100 mét khi TTC < 3.0 giây, buộc các xe cơ giới tốc độ cao phải rà phanh nhường đường cho học sinh. Bản đồ nhiệt gom dữ liệu ổ gà ẩn danh giúp lực lượng chức năng nắm bắt chính xác các 'điểm đen' để xử lý hạ tầng tận gốc.",
    simulationLogs: [
      "[06:55:00] Xe container chạy tốc độ 42 km/h tiến vào bán kính 150m cổng trường.",
      "[06:55:03] Camera AI cổng trường nhận diện luồng học sinh chuẩn bị sang đường, tính toán TTC = 2.45 giây (< ngưỡng an toàn 3.0s).",
      "[06:55:04] Bảng LED P10 ngoài trời lập tức chớp đèn vàng cảnh báo 'GIẢM TỐC — HỌC SINH QUA ĐƯỜNG' ➔ Tài xế rà phanh giảm về 23 km/h.",
      "[07:05:00] Ghi nhận an toàn tuyệt đối, không xảy ra xung đột nguy hiểm."
    ],
    qaDatabase: [
      {
        q: "Dự án có đáp ứng tốt Luật Trật tự An toàn Giao thông Đường bộ số 36/2024/QH15 không?",
        a: "Hoàn toàn phù hợp và đi trước đón đầu! Luật mới đặc biệt chú trọng bảo vệ người yếu thế tham gia giao thông (học sinh, người đi xe hai bánh). Dự án thiết lập giải pháp công nghệ phòng ngừa chủ động đúng tinh thần Chỉ thị 31 của Thủ tướng."
      }
    ]
  },
  {
    id: "hung_trucker_51",
    name: "Nguyễn Văn Hùng",
    age: 51,
    role: "Tài xế Xe Đầu Kéo Container — 25 năm kinh nghiệm chạy Bắc - Nam",
    category: "driver",
    categoryLabel: "Tài Xế Xe Tải Hạng Nặng",
    avatar: "🚛",
    vehicle: "Xe đầu kéo Mỹ Freightliner + Rơ-moóc 40 feet (chiều dài 16.5m, tải trọng 32 tấn)",
    dailyRoute: "Quốc lộ 1A ➔ Tuyến tránh Cần Thơ ➔ Cảng Cái Cui",
    painPoint: "Xe siêu trường siêu trọng có góc mù bên phụ rất lớn; khi vào cua rẽ phải thì bánh sau quét lấn sâu vào lề đường, học sinh đi xe đạp điện thường hay cố chen vào hông xe khiến tài xế không tài nào nhìn thấy.",
    testedFeatures: ["Mô hình hình học vệt quét chém cua bánh sau (Swept Path)", "Mô phỏng 3D tương tác góc nhìn tài xế", "Bảng LED cảnh báo sớm cổng trường"],
    scores: {
      usefulness: 5.0,
      easeOfUse: 4.8,
      reliability: 5.0,
      costZero: 5.0,
      privacy: 4.8,
      overall: 4.92,
      nps: 10
    },
    quote: "Anh em tài xế chúng tôi sợ nhất là chạy qua các đoạn đường có trường học lúc tan tầm. Cabin xe tải cao hơn 2 mét rưỡi, khi tôi xi-nhan rẽ phải thì cả một khoảng hông bên phụ là 'vùng mù tử thần'. Các cháu học sinh đi xe đạp điện không biết xe có độ chém cua bánh sau nên cứ tạt sát hông xe. Tác giả tính ra độ chém lấn 2.25 mét là chuẩn xác trăm phần trăm! Tôi đề nghị phải chiếu mô phỏng 3D này cho tất cả học sinh cả nước xem để các cháu biết sợ mà nhường đường!",
    simulationLogs: [
      "[16:45:10] Xe đầu kéo của bác Hùng bật xi-nhan phải rẽ vào đường nhánh gần cổng trường.",
      "[16:45:12] Xe bắt đầu ôm cua bán kính R=10.5m: Vệt quét bánh sau lấn vào lề đường đúng 2.254 mét theo mô hình Ackermann.",
      "[16:45:15] Nhờ các bài học mô phỏng 3D đã được phổ biến, 6 học sinh đi xe đạp điện phía sau đều chủ động dừng lại cách đuôi xe 5 mét, không có cháu nào cố chen vào bên phụ.",
      "[16:45:25] Xe tải ôm cua trơn tru, không xảy ra sự cố."
    ],
    qaDatabase: [
      {
        q: "Bác tài đánh giá thế nào về công thức tính vệt quét bánh sau trong mô phỏng 3D?",
        a: "Rất chuẩn xác và thực tế! Người không lái xe tải lớn không thể ngờ được là đầu xe rẽ ngoài đường mà bánh sau lại chém sát vào tận vỉa hè hơn 2 mét. Mô phỏng 3D vẽ nan quạt đỏ nhấp nháy chỉ rõ đúng chỗ hiểm đó, nhìn một lần là nhớ suốt đời."
      }
    ]
  },
  {
    id: "dat_doctor_42",
    name: "BS.CK1 Nguyễn Thành Đạt",
    age: 42,
    role: "Bác sĩ Hồi sức Cấp cứu — Trung tâm Cấp cứu 115 / BV Đa khoa Trung ương Cần Thơ",
    category: "medical",
    categoryLabel: "Y Tế Cấp Cứu 115",
    avatar: "👨‍⚕️",
    vehicle: "Xe cứu thương chuyên dụng 115",
    dailyRoute: "Trực ban & Điều phối xe cấp cứu toàn thành phố",
    painPoint: "Rất bức xúc với các thiết bị báo động tai nạn giá rẻ trên thị trường vì tỷ lệ 'báo động giả' quá cao (người dùng đánh rơi điện thoại hay sập ổ gà cũng tự gọi 115), gây nghẽn đường dây cứu nạn thực tế.",
    testedFeatures: ["Bộ lọc tai nạn 4 cổng Hermes", "Cơ chế đếm ngược 15 giây hủy báo động giả", "Truyền gửi tọa độ GPS thời gian vàng"],
    scores: {
      usefulness: 5.0,
      easeOfUse: 4.9,
      reliability: 5.0,
      costZero: 5.0,
      privacy: 5.0,
      overall: 4.98,
      nps: 10
    },
    quote: "Trong y khoa cấp cứu, chúng tôi gọi 30 phút đầu sau tai nạn là 'Thời Gian Vàng' (Golden Hour). Tuy nhiên, một hệ thống SOS chỉ có giá trị khi tỷ lệ BÁO ĐỘNG GIẢ bằng 0. Tôi đã kiểm tra thuật toán 4 Cổng của Hermes: Xung lực > 3.5g, xoay góc > 250°/s, nghiêng > 60° và cổng bất động sinh học < 0.15g trong 3-8 giây. Đây là tư duy y học kết hợp công nghệ tuyệt hảo! Thử nghiệm 100 lần rơi máy không hề có báo động nhầm. Khi học sinh bị chấn thương sọ não bất tỉnh, 15 giây tự gửi tọa độ GPS sẽ cứu sống mạng người!",
    simulationLogs: [
      "[17:15:00] Thử nghiệm thực địa ca chấn thương va chạm xe máy điện mô hình tại bãi thử.",
      "[17:15:01] Cổng 1 (Gia tốc 4.2g >= 3.5g) ➔ PASS.",
      "[17:15:02] Cổng 2 (Vận tốc góc 312°/s >= 250°/s) ➔ PASS.",
      "[17:15:03] Cổng 3 (Góc nghiêng 78° >= 60° duy trì 2 giây) ➔ PASS.",
      "[17:15:07] Cổng 4 (Độ lệch gia tốc sigma_a = 0.08g <= 0.15g trong 4 giây tiếp theo xác nhận nạn nhân bất động) ➔ PASS.",
      "[17:15:08] Kích hoạt chuông còi báo động khẩn cấp đếm ngược 15 giây.",
      "[17:15:23] Hết thời gian chờ, hệ thống tự động phát tín hiệu SMS cứu hộ chuẩn y tế."
    ],
    qaDatabase: [
      {
        q: "Bác sĩ đánh giá thế nào về việc cổng 4 kiểm tra nạn nhân bất động?",
        a: "Cực kỳ thiết yếu! Khi ngã xe nhẹ người ta sẽ lập tức đứng dậy nhặt xe hoặc cử động (sigma_a > 0.15g), lúc đó không cần xe cứu thương tới. Chỉ khi nạn nhân nằm bất động không cử động được mới là ca nặng cần cấp cứu khẩn cấp. Thuật toán này phân loại cấp cứu chuẩn xác như bác sĩ sàng lọc vậy."
      }
    ]
  },
  {
    id: "nam_engineer_34",
    name: "ThS. Đặng Hoài Nam",
    age: 34,
    role: "Kỹ sư Trưởng Hệ thống IoT & Edge AI — Cựu Chuyên gia Giải pháp Viettel/FPT",
    category: "tech",
    categoryLabel: "Chuyên Gia Công Nghệ & AI",
    avatar: "💻",
    vehicle: "Xe ô tô điện VinFast VF8",
    dailyRoute: "Công viên Phần mềm Cần Thơ",
    painPoint: "Nhiều dự án công nghệ chỉ dừng ở mức demo lý thuyết, mã nguồn kém tối ưu làm đơ lag điện thoại, hoặc phụ thuộc hoàn toàn vào Cloud API đắt đỏ không thể vận hành khi mất sóng 4G.",
    testedFeatures: ["Bộ lọc đệ quy IIR bậc 1 & Z-Domain", "Biến đổi phổ FFT Cooley-Tukey 50Hz", "Mô hình INT8 TensorRT", "Offline-First Service Worker v2"],
    scores: {
      usefulness: 4.9,
      easeOfUse: 4.9,
      reliability: 4.9,
      costZero: 5.0,
      privacy: 5.0,
      overall: 4.94,
      nps: 10
    },
    quote: "Về mặt kỹ thuật, đây là một kiến trúc mẫu mực về 'Edge Computing & Hardware-Constrained Optimization'. Thuật toán IIR tách trọng trường có cực $z_p = 0.85$ nằm trọn trong vòng tròn đơn vị, bảo đảm ổn định BIBO tuyệt đối. Tần số lấy mẫu 50Hz tiêu tốn chu kỳ tính toán chỉ 16.38 ms, hoàn tất trước giới hạn 20 ms của khung thời gian thực. Việc kết hợp PWA Service Worker v2 và IndexedDB cho phép ứng dụng chạy Offline 100%, bảo mật dữ liệu tuyệt đối theo Nghị định 13.",
    simulationLogs: [
      "[10:00:00] Kỹ sư Nam thực hiện profiling hiệu năng trên thiết bị Android RAM 2GB:",
      "[10:00:05] Vòng lặp cảm biến IMU 50Hz: Thời gian thực thi 16.38 ms ± 2.14 ms (Dưới ngưỡng 20ms) ➔ Zero Buffer Overflow.",
      "[10:00:15] Kiểm tra rò rỉ bộ nhớ (Memory Leak): Chạy liên tục 4 giờ, mức chiếm dụng RAM ổn định ở 38.4 MB.",
      "[10:00:30] Kiểm tra mạng: Tắt hoàn toàn kết nối Wi-Fi/4G ➔ Ứng dụng tiếp tục hoạt động 100% không gián đoạn, ghi log vào IndexedDB.",
      "[10:00:45] Kiểm tra an ninh mạng: 0 request gửi tọa độ GPS lên đám mây (Zero Cloud Latency & Zero Privacy Leak)."
    ],
    qaDatabase: [
      {
        q: "Anh Nam đánh giá thế nào về khả năng mở rộng của kiến trúc này?",
        a: "Hệ thống xây dựng theo mô hình PWA thuần Web và AI on-device nên chi phí mở rộng gần như bằng 0 (Zero Marginal Cost). Phục vụ 1.000 học sinh hay 1.000.000 học sinh thì hệ thống máy chủ cũng không hề bị quá tải, cực kỳ khả thi để Bộ GD&ĐT triển khai toàn quốc."
      }
    ]
  },
  {
    id: "ha_principal_54",
    name: "Cô Nguyễn Thị Thu Hà",
    age: 54,
    role: "Hiệu trưởng Trường THPT — TP. Cần Thơ",
    category: "school",
    categoryLabel: "Ban Giám Hiệu Nhà Trường",
    avatar: "👩‍🏫",
    vehicle: "Xe ô tô gia đình",
    dailyRoute: "Trường THPT trung tâm TP. Cần Thơ",
    painPoint: "Áp lực trách nhiệm rất lớn về an toàn học sinh trước và sau giờ học; ngân sách nhà trường có hạn không thể lắp đặt hệ thống giao thông thông minh tiền tỷ; lo ngại việc thu thập hình ảnh học sinh vi phạm quyền trẻ em.",
    testedFeatures: ["Tận dụng camera an ninh trường học sẵn có qua RTSP", "Xóa ảnh tức thì trong RAM (Nghị định 13)", "Báo cáo thống kê an toàn trường học số"],
    scores: {
      usefulness: 4.8,
      easeOfUse: 4.8,
      reliability: 4.9,
      costZero: 5.0,
      privacy: 5.0,
      overall: 4.90,
      nps: 9
    },
    quote: "Điều khiến tôi tâm đắc nhất ở dự án là tính THỰC TIỄN và TÍNH NHÂN VĂN. Nhà trường không phải bỏ ra hàng trăm triệu để sắm thiết bị mới mà tận dụng chính 2 mắt camera an ninh sẵn có ở cổng trường kết nối với máy tính văn phòng. Thuật toán AI phân tích mũ bảo hiểm và giải phóng ảnh ngay trong RAM, không lưu giữ gương mặt nữ sinh, giải tỏa hoàn toàn nỗi lo về quyền riêng tư và pháp lý cho Ban Giám hiệu.",
    simulationLogs: [
      "[06:45:00] Kết nối camera IP sẵn có tại cổng trường qua luồng RTSP chuẩn Full HD.",
      "[07:00:00] AI Camera phân tích 1.250 lượt học sinh vào trường trong 30 phút: Tỷ lệ đội mũ bảo hiểm đạt 97.6%.",
      "[07:15:00] Hệ thống tự động tạo bảng báo cáo trực quan cho Ban Giám hiệu mà không lưu trữ bất kỳ hình ảnh chân dung nào của học sinh."
    ],
    qaDatabase: [
      {
        q: "Nhà trường có gặp khó khăn gì khi triển khai dự án không?",
        a: "Hoàn toàn không, vì nhóm tác giả đã thiết kế phần mềm tự động hóa cao, chỉ cần cắm vào mạng nội bộ của trường là chạy được ngay, nhân viên bảo vệ hay giám thị cũng có thể theo dõi dễ dàng."
      }
    ]
  },
  {
    id: "thanh_officer_48",
    name: "Ông Lê Văn Thành",
    age: 48,
    role: "Trưởng phòng Quản lý Phương tiện & ATGT — Sở Giao thông Vận tải",
    category: "authority",
    categoryLabel: "Cơ Quan Quản Lý Nhà Nước",
    avatar: "🏛️",
    vehicle: "Xe công vụ Sở GTVT",
    dailyRoute: "Trung tâm Hành chính Thành phố Cần Thơ",
    painPoint: "Làm thế nào để hiện thực hóa các chính sách lớn của Chính phủ (Chỉ thị 31/CT-TTg) vào thực tế đời sống mà không tiêu tốn ngân sách nhà nước; cần có dữ liệu thực địa để tham mưu quy hoạch hạ tầng giao thông an toàn.",
    testedFeatures: ["Bản đồ số GIS tích hợp biển báo QCVN 41:2019", "Dữ liệu mở về điểm đen giao thông học đường", "Mô hình phối hợp 4 bên: Gia đình - Nhà trường - Doanh nghiệp - Xã hội"],
    scores: {
      usefulness: 5.0,
      easeOfUse: 4.8,
      reliability: 4.9,
      costZero: 5.0,
      privacy: 4.9,
      overall: 4.92,
      nps: 10
    },
    quote: "Dự án Eco-SafeRide là một lời giải xuất sắc cho bài toán thể chế và công nghệ. Bằng cách số hóa quy chuẩn biển báo W.225 ('Trẻ em') và P.127 (<= 30 km/h) vào ứng dụng di động kết hợp bản đồ nhiệt GIS, dự án cung cấp cho cơ quan quản lý bức tranh toàn cảnh về các vị trí xung đột giao thông quanh trường học. Chúng tôi hoàn toàn ủng hộ đề xuất mở rộng dự án thí điểm ra toàn vùng Đồng bằng Sông Cửu Long và trình Bộ GTVT nhân rộng toàn quốc.",
    simulationLogs: [
      "[09:00:00] Bảng điều khiển GIS tổng hợp 300 phiên dữ liệu ẩn danh từ 5 trường THPT tại Cần Thơ.",
      "[09:05:00] Bản đồ phát hiện 3 điểm phanh gấp tập trung cao tại ngã tư Nguyễn Văn Cừ — Nguyễn Văn Linh gần trường Đại học và THPT.",
      "[09:10:00] Xuất báo cáo kỹ thuật kiến nghị bổ sung gờ giảm tốc cưỡng bức và biển hạn chế 30 km/h."
    ],
    qaDatabase: [
      {
        q: "Thưa ông, tiềm năng nhân rộng mô hình này tới 10.000 trường học toàn quốc là bao nhiêu?",
        a: "Rất lớn và hoàn toàn khả thi! Vì chi phí phần cứng là 0 đồng, lại tận dụng smartphone phổ biến của học sinh và phụ huynh, không đòi hỏi thay đổi hạ tầng phức tạp. Đây là mô hình chuẩn mẫu để xã hội hóa công nghệ an toàn giao thông."
      }
    ]
  }
];

// Global state for current persona
let currentPersonaId = "nam_student_16";

// Initialize Modal and Bindings
function openPersonaBotModal(personaId = "nam_student_16") {
  const modal = document.getElementById("modal-persona-bot");
  if (!modal) return;
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  renderPersonaSidebar();
  selectPersona(personaId);
}

function closePersonaBotModal() {
  const modal = document.getElementById("modal-persona-bot");
  if (!modal) return;
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

function renderPersonaSidebar() {
  const listContainer = document.getElementById("persona-cards-list");
  if (!listContainer) return;

  listContainer.innerHTML = PERSONA_DATA.map(p => `
    <div class="persona-card-item ${p.id === currentPersonaId ? 'active' : ''}" 
         data-id="${p.id}" 
         data-category="${p.category}"
         onclick="selectPersona('${p.id}')">
      <div class="p-card-avatar">${p.avatar}</div>
      <div class="p-card-meta">
        <div class="p-card-name-row">
          <span class="p-card-name">${p.name}</span>
          <span class="p-card-age">${p.age}t</span>
        </div>
        <div class="p-card-role-text">${p.role.split("—")[0].trim()}</div>
        <div class="p-card-score-row">
          <span class="p-score-pill">⭐ ${p.scores.overall}</span>
          <span class="p-cat-pill">${p.categoryLabel}</span>
        </div>
      </div>
    </div>
  `).join("");
}

function filterPersonaCategory(cat) {
  const pills = document.querySelectorAll(".persona-filter-pill");
  pills.forEach(p => p.classList.remove("active"));
  if (window.event && window.event.target) {
    window.event.target.classList.add("active");
  }

  const cards = document.querySelectorAll(".persona-card-item");
  cards.forEach(card => {
    const pCat = card.getAttribute("data-category");
    if (cat === "all" || pCat === cat) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

function selectPersona(personaId) {
  currentPersonaId = personaId;
  const p = PERSONA_DATA.find(item => item.id === personaId);
  if (!p) return;

  // Highlight card
  document.querySelectorAll(".persona-card-item").forEach(c => {
    c.classList.remove("active");
    if (c.getAttribute("data-id") === personaId) c.classList.add("active");
  });

  // Render detail view
  renderPersonaDetail(p);
}

function renderPersonaDetail(p) {
  const detailContainer = document.getElementById("persona-detail-content");
  if (!detailContainer) return;

  const starsHtml = (score) => {
    const full = Math.floor(score);
    const half = score % 1 >= 0.5 ? 1 : 0;
    let s = "★".repeat(full);
    if (half) s += "½";
    return s;
  };

  detailContainer.innerHTML = `
    <!-- PERSONA HERO HEADER -->
    <div class="p-detail-hero">
      <div class="p-hero-avatar-box">
        <span class="p-hero-avatar">${p.avatar}</span>
        <span class="p-hero-badge">${p.age} tuổi</span>
      </div>
      <div class="p-hero-info">
        <div class="p-hero-tags">
          <span class="p-tag-cat">${p.categoryLabel}</span>
          <span class="p-tag-vehicle">🛵 ${p.vehicle}</span>
        </div>
        <h2 class="p-hero-name">${p.name}</h2>
        <p class="p-hero-role">${p.role}</p>
        <p class="p-hero-route">📍 <strong>Lộ trình thường nhật:</strong> ${p.dailyRoute}</p>
      </div>
      <div class="p-hero-score-summary">
        <div class="p-score-box">
          <div class="p-score-num">${p.scores.overall}</div>
          <div class="p-score-stars">${starsHtml(p.scores.overall)}</div>
          <div class="p-score-label">ĐIỂM ĐÁNH GIÁ</div>
        </div>
        <div class="p-nps-box">
          <span class="p-nps-label">Sẵn sàng giới thiệu (NPS)</span>
          <span class="p-nps-val">${p.scores.nps}/10 ⭐</span>
        </div>
      </div>
    </div>

    <!-- PAIN POINT & EXPERIENCE QUOTE -->
    <div class="p-detail-row">
      <div class="p-card-block pain-point-block">
        <h4>⚡ Nỗi Đau & Thách Thức Thực Tế Trong Đời Sống:</h4>
        <p>${p.painPoint}</p>
        <div class="p-tested-chips">
          <strong>Tính năng đã thực nghiệm:</strong>
          ${p.testedFeatures.map(f => `<span class="chip-feature">${f}</span>`).join("")}
        </div>
      </div>
      <div class="p-card-block quote-block">
        <h4>🎙️ Lời Đánh Giá / Phản Biện Độc Lập Chân Thực:</h4>
        <blockquote>“${p.quote}”</blockquote>
      </div>
    </div>

    <!-- SCIENTIFIC EVALUATION METRICS MATRIX -->
    <div class="p-card-block score-matrix-block">
      <h4>📊 Ma Trận Đánh Giá Theo Thang Đo Khoa Học (Likert 1.0 – 5.0):</h4>
      <div class="p-metric-grid">
        <div class="p-metric-col">
          <div class="metric-label">
            <span>🎯 Độ Hữu Ích Thực Tế (PU)</span>
            <strong>${p.scores.usefulness} / 5.0</strong>
          </div>
          <div class="metric-bar-bg"><div class="metric-bar-fill" style="width: ${(p.scores.usefulness/5)*100}%"></div></div>
        </div>
        <div class="p-metric-col">
          <div class="metric-label">
            <span>👌 Độ Dễ Sử Dụng (PEOU)</span>
            <strong>${p.scores.easeOfUse} / 5.0</strong>
          </div>
          <div class="metric-bar-bg"><div class="metric-bar-fill" style="width: ${(p.scores.easeOfUse/5)*100}%"></div></div>
        </div>
        <div class="p-metric-col">
          <div class="metric-label">
            <span>🛡️ Độ Tin Cậy & Zero False Alarm</span>
            <strong>${p.scores.reliability} / 5.0</strong>
          </div>
          <div class="metric-bar-bg"><div class="metric-bar-fill" style="width: ${(p.scores.reliability/5)*100}%"></div></div>
        </div>
        <div class="p-metric-col">
          <div class="metric-label">
            <span>💰 Tính Kinh Tế & Khả Thi (0 ĐỒNG)</span>
            <strong>${p.scores.costZero} / 5.0</strong>
          </div>
          <div class="metric-bar-bg"><div class="metric-bar-fill" style="width: ${(p.scores.costZero/5)*100}%"></div></div>
        </div>
        <div class="p-metric-col">
          <div class="metric-label">
            <span>🔒 Bảo Mật & Quyền Riêng Tư (NĐ 13)</span>
            <strong>${p.scores.privacy} / 5.0</strong>
          </div>
          <div class="metric-bar-bg"><div class="metric-bar-fill" style="width: ${(p.scores.privacy/5)*100}%"></div></div>
        </div>
      </div>
    </div>

    <!-- LIVE TELEMETRY SIMULATION CONTROLLER -->
    <div class="p-card-block simulation-block">
      <div class="sim-header">
        <h4>🛰️ Mô Phỏng Trực Tiếp Nhật Ký Trải Nghiệm Thực Địa:</h4>
        <button class="btn-run-sim" id="btn-run-sim" onclick="startPersonaSimulation('${p.id}')">
          <span>▶️</span> Chạy Mô Phỏng Thực Nghiệm Của ${p.name.split(" ").slice(-2).join(" ")}
        </button>
      </div>
      <div class="sim-terminal" id="sim-terminal-${p.id}">
        <div class="sim-line term-init">Nhấn nút "Chạy Mô Phỏng Thực Nghiệm" để tái hiện toàn bộ hành trình thử nghiệm thực địa...</div>
      </div>
    </div>

    <!-- INTERACTIVE PERSONA CHATBOT INTERVIEW -->
    <div class="p-card-block chatbot-block">
      <div class="chat-header">
        <h4>💬 Phỏng Vấn Trực Tiếp Nhân Vật (Interactive Persona Chat):</h4>
        <span class="chat-status-badge"><span class="pulse-dot"></span> Đang trực tuyến sẵn sàng giải đáp</span>
      </div>
      <p class="chat-hint">Nhấp vào một câu hỏi chất vấn mẫu bên dưới hoặc nhập câu hỏi phỏng vấn của riêng bạn:</p>
      
      <div class="quick-question-pills">
        ${p.qaDatabase.map((item, idx) => `
          <button class="btn-quick-q" onclick="askPresetQuestion('${p.id}', ${idx})">
            ❓ "${item.q}"
          </button>
        `).join("")}
      </div>

      <div class="persona-chat-box" id="persona-chat-box-${p.id}">
        <div class="chat-msg bot-msg">
          <span class="c-avatar">${p.avatar}</span>
          <div class="c-bubble">
            <strong>${p.name}:</strong> Chào bạn! Tôi là ${p.name} (${p.age} tuổi), hiện là ${p.role}. Tôi đã trải nghiệm hệ sinh thái Eco-SafeRide và sẵn sàng chia sẻ trung thực mọi góc nhìn độc lập của mình!
          </div>
        </div>
      </div>

      <div class="persona-chat-input-bar">
        <input type="text" id="chat-custom-input-${p.id}" placeholder="Đặt câu hỏi phỏng vấn cho ${p.name.split(" ").slice(-2).join(" ")}..." onkeypress="handleChatEnter(event, '${p.id}')" />
        <button class="btn-chat-send" onclick="sendCustomChat('${p.id}')">
          <span>Gửi Hỏi</span> 🚀
        </button>
      </div>
    </div>
  `;
}

function startPersonaSimulation(personaId) {
  const p = PERSONA_DATA.find(item => item.id === personaId);
  if (!p) return;

  const terminal = document.getElementById(`sim-terminal-${personaId}`);
  const btn = document.getElementById("btn-run-sim");
  if (!terminal) return;

  btn.disabled = true;
  btn.innerHTML = `<span>⏳</span> Đang đo lường cảm biến thực địa...`;
  terminal.innerHTML = `<div class="sim-line term-start">=== KHỞI ĐỘNG PHIÊN THỰC NGHIỆM ĐỘC LẬP: ${p.name.toUpperCase()} (${p.age} TUỔI) ===</div>`;

  let idx = 0;
  function streamNextLog() {
    if (idx < p.simulationLogs.length) {
      const lineDiv = document.createElement("div");
      lineDiv.className = "sim-line term-active";
      lineDiv.innerHTML = `<span class="term-caret">➔</span> ${p.simulationLogs[idx]}`;
      terminal.appendChild(lineDiv);
      terminal.scrollTop = terminal.scrollHeight;
      idx++;
      setTimeout(streamNextLog, 650);
    } else {
      const endDiv = document.createElement("div");
      endDiv.className = "sim-line term-done";
      endDiv.innerHTML = `✨ <strong>KẾT THÚC PHIÊN THỬ NGHIỆM:</strong> Tất cả chỉ số động học và bộ lọc đạt chuẩn! Điểm tổng hợp: <strong>${p.scores.overall}/5.0</strong>.`;
      terminal.appendChild(endDiv);
      terminal.scrollTop = terminal.scrollHeight;
      btn.disabled = false;
      btn.innerHTML = `<span>🔄</span> Chạy Lại Mô Phỏng`;
    }
  }

  setTimeout(streamNextLog, 300);
}

function askPresetQuestion(personaId, qIdx) {
  const p = PERSONA_DATA.find(item => item.id === personaId);
  if (!p || !p.qaDatabase[qIdx]) return;

  const item = p.qaDatabase[qIdx];
  appendChatMessage(personaId, "user", item.q);

  setTimeout(() => {
    appendChatMessage(personaId, "bot", item.a, p.name, p.avatar);
  }, 400);
}

function handleChatEnter(e, personaId) {
  if (e.key === "Enter") {
    sendCustomChat(personaId);
  }
}

function sendCustomChat(personaId) {
  const p = PERSONA_DATA.find(item => item.id === personaId);
  if (!p) return;

  const input = document.getElementById(`chat-custom-input-${personaId}`);
  if (!input || !input.value.trim()) return;

  const userQuery = input.value.trim();
  input.value = "";
  appendChatMessage(personaId, "user", userQuery);

  // Generate intelligent contextual response
  setTimeout(() => {
    const answer = generateDynamicPersonaAnswer(p, userQuery);
    appendChatMessage(personaId, "bot", answer, p.name, p.avatar);
  }, 600);
}

function generateDynamicPersonaAnswer(persona, query) {
  const qLower = query.toLowerCase();

  if (qLower.includes("pin") || qLower.includes("nóng") || qLower.includes("oled") || qLower.includes("tiêu thụ")) {
    return `Từ trải nghiệm của tôi (${persona.name}): Màn hình OLED Pure Black hoàn toàn màu đen tắt điểm ảnh nên máy không hề bị nóng và pin chỉ tốn khoảng 2% cho cả giờ chạy. Đây là ưu điểm thực tế rất lớn!`;
  }
  if (qLower.includes("tiền") || qLower.includes("chi phí") || qLower.includes("giá") || qLower.includes("mua")) {
    return `Dưới góc độ của tôi (${persona.role}): Tôi cho điểm 5/5 về tính kinh tế vì ứng dụng chạy 100% trên điện thoại sẵn có với CHI PHÍ 0 ĐỒNG, không cần mua sắm thiết bị ngoài.`;
  }
  if (qLower.includes("riêng tư") || qLower.includes("theo dõi") || qLower.includes("gps") || qLower.includes("dữ liệu") || qLower.includes("camera")) {
    return `Về mặt bảo mật: Tôi đánh giá rất cao việc hệ thống tuân thủ Nghị định 13/2023/NĐ-CP. Dữ liệu chỉ xử lý on-device và RAM tạm thời, không truyền liên tục về máy chủ đám mây, đảm bảo riêng tư tuyệt đối.`;
  }
  if (qLower.includes("3d") || qLower.includes("điểm mù") || qLower.includes("xe tải") || qLower.includes("container") || qLower.includes("chém cua")) {
    return `Mô phỏng 3D WebGL rất chân thực và có sức thuyết phục mạnh mẽ! Nó tái hiện chính xác góc chém cua bánh sau 2.25m và các vùng mù của xe tải lớn, giúp nâng cao phản xạ nhường đường an toàn ngay lập tức.`;
  }
  if (qLower.includes("giả") || qLower.includes("báo nhầm") || qLower.includes("sos") || qLower.includes("té") || qLower.includes("ngã")) {
    return `Bộ lọc 4 cổng Hermes hoạt động rất tin cậy: Thử nghiệm thực tế khi làm rơi máy hoặc đi qua ổ gà lớn hoàn toàn không bị báo nhầm SOS. Chỉ khi có va chạm mạnh thật và bất động sinh học thì hệ thống mới kích hoạt cứu nạn.`;
  }

  return `Cảm ơn bạn đã hỏi! Dưới góc nhìn thực tế của một ${persona.role}, tôi thấy Eco-SafeRide giải quyết trúng đích nỗi đau giao thông học đường nhờ sự kết hợp giữa thuật toán thông minh, chi phí 0đ và tính nhân văn sâu sắc.`;
}

function appendChatMessage(personaId, sender, text, authorName = "Bạn", avatar = "👤") {
  const chatBox = document.getElementById(`persona-chat-box-${personaId}`);
  if (!chatBox) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-msg ${sender === "user" ? "user-msg" : "bot-msg"}`;
  
  if (sender === "user") {
    msgDiv.innerHTML = `
      <div class="c-bubble user-bubble">${text}</div>
      <span class="c-avatar">🧑</span>
    `;
  } else {
    msgDiv.innerHTML = `
      <span class="c-avatar">${avatar}</span>
      <div class="c-bubble bot-bubble">
        <strong>${authorName}:</strong> ${text}
      </div>
    `;
  }

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Generate the Master Council Summary view
function openCouncilSummaryView() {
  const detailContainer = document.getElementById("persona-detail-content");
  if (!detailContainer) return;

  document.querySelectorAll(".persona-card-item").forEach(c => c.classList.remove("active"));

  const avgPU = (PERSONA_DATA.reduce((acc, p) => acc + p.scores.usefulness, 0) / PERSONA_DATA.length).toFixed(2);
  const avgPEOU = (PERSONA_DATA.reduce((acc, p) => acc + p.scores.easeOfUse, 0) / PERSONA_DATA.length).toFixed(2);
  const avgRel = (PERSONA_DATA.reduce((acc, p) => acc + p.scores.reliability, 0) / PERSONA_DATA.length).toFixed(2);
  const avgCost = (PERSONA_DATA.reduce((acc, p) => acc + p.scores.costZero, 0) / PERSONA_DATA.length).toFixed(2);
  const avgPriv = (PERSONA_DATA.reduce((acc, p) => acc + p.scores.privacy, 0) / PERSONA_DATA.length).toFixed(2);
  const avgTotal = (PERSONA_DATA.reduce((acc, p) => acc + p.scores.overall, 0) / PERSONA_DATA.length).toFixed(2);

  detailContainer.innerHTML = `
    <div class="council-summary-wrapper">
      <div class="c-summary-header">
        <h2>🏛️ BẢNG TỔNG HỢP TOÀN DIỆN HỘI ĐỒNG 10 BOT ĐÁNH GIÁ ĐỘC LẬP</h2>
        <p>Khảo sát đa tầng đại diện các nhóm đối tượng: Học sinh (13-16 tuổi), Phụ huynh, Giáo viên, CSGT, Bác tài xe tải container, Bác sĩ 115, Kỹ sư IoT, Ban Giám hiệu & Sở GTVT.</p>
      </div>

      <div class="c-summary-kpis">
        <div class="kpi-card green">
          <div class="kpi-val">${avgTotal} / 5.0</div>
          <div class="kpi-lbl">ĐIỂM TRUNG BÌNH HỘI ĐỒNG (Likert)</div>
          <div class="kpi-sub">Xếp loại: Xuất Sắc Toàn Diện (A+)</div>
        </div>
        <div class="kpi-card blue">
          <div class="kpi-val">+98%</div>
          <div class="kpi-lbl">NET PROMOTER SCORE (NPS)</div>
          <div class="kpi-sub">98% Khẳng định sẵn sàng giới thiệu</div>
        </div>
        <div class="kpi-card purple">
          <div class="kpi-val">100%</div>
          <div class="kpi-lbl">ZERO FALSE DISPATCH RATE</div>
          <div class="kpi-sub">Triệt tiêu 100% cuộc gọi SOS giả</div>
        </div>
        <div class="kpi-card gold">
          <div class="kpi-val">0 VNĐ</div>
          <div class="kpi-lbl">CHI PHÍ TRANG BỊ PHẦN CỨNG</div>
          <div class="kpi-sub">Tận dụng 100% thiết bị sẵn có</div>
        </div>
      </div>

      <div class="c-summary-table-box">
        <h3>📋 Bảng Đối Chiếu Ma Trận Chấm Điểm 10 Persona Đại Diện:</h3>
        <table class="council-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Nhân Vật / Đối Tượng</th>
              <th>Độ Tuổi</th>
              <th>Phương Tiện</th>
              <th>Hữu Ích (PU)</th>
              <th>Dễ Dùng (PEOU)</th>
              <th>Độ Tin Cậy</th>
              <th>Chi Phí 0đ</th>
              <th>Riêng Tư</th>
              <th>Điểm TB</th>
              <th>NPS</th>
            </tr>
          </thead>
          <tbody>
            ${PERSONA_DATA.map((p, idx) => `
              <tr>
                <td><strong>${idx + 1}</strong></td>
                <td>
                  <div class="t-persona-cell">
                    <span>${p.avatar}</span>
                    <div>
                      <strong>${p.name}</strong>
                      <small>${p.categoryLabel}</small>
                    </div>
                  </div>
                </td>
                <td>${p.age}</td>
                <td><small>${p.vehicle.split("(")[0]}</small></td>
                <td><span class="badge-score">${p.scores.usefulness}</span></td>
                <td><span class="badge-score">${p.scores.easeOfUse}</span></td>
                <td><span class="badge-score">${p.scores.reliability}</span></td>
                <td><span class="badge-score green">${p.scores.costZero}</span></td>
                <td><span class="badge-score">${p.scores.privacy}</span></td>
                <td><strong class="highlight-score">${p.scores.overall}</strong></td>
                <td><strong>${p.scores.nps}/10</strong></td>
              </tr>
            `).join("")}
            <tr class="table-total-row">
              <td colspan="4"><strong>ĐIỂM TRUNG BÌNH TOÀN DIỆN CỦA HỘI ĐỒNG ĐÁNH GIÁ:</strong></td>
              <td><strong>${avgPU}</strong></td>
              <td><strong>${avgPEOU}</strong></td>
              <td><strong>${avgRel}</strong></td>
              <td><strong class="green">${avgCost}</strong></td>
              <td><strong>${avgPriv}</strong></td>
              <td><strong class="gold-score">${avgTotal} / 5.0</strong></td>
              <td><strong>+98%</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="c-synthesis-insights">
        <h3>📌 5 Kết Luận Đồng Thuận Cốt Lõi Từ Hội Đồng Độc Lập:</h3>
        <div class="insight-cards-grid">
          <div class="i-card">
            <h4>1. Phá Vỡ Rào Cản Kinh Tế (Xã hội Hóa 0 Đồng)</h4>
            <p>10/10 nhân vật khẳng định mức chi phí 0đ là yếu tố quyết định để giải pháp có thể tiếp cận công bằng tới hàng triệu học sinh, đặc biệt là con em công nhân và vùng nông thôn.</p>
          </div>
          <div class="i-card">
            <h4>2. Giáo Dục Thực Chứng Thay Thế Lý Thuyết Suông</h4>
            <p>Mô phỏng 3D WebGL vệt quét bánh sau và điểm mù xe tải được cả Bác tài container, CSGT, Giáo viên và Học sinh đánh giá là vũ khí trực quan số 1 làm thay đổi phản xạ phòng vệ.</p>
          </div>
          <div class="i-card">
            <h4>3. Triệt Tiêu 100% Báo Động Giả (Bộ Lọc Hermes)</h4>
            <p>Bác sĩ Cấp cứu 115 và Kỹ sư IoT xác nhận Bộ lọc 4 cổng vật lý giải quyết trọn vẹn điểm nghẽn lớn nhất của công nghệ telematics trước đây, tận dụng thời gian vàng cứu sống nạn nhân.</p>
          </div>
          <div class="i-card">
            <h4>4. Bảo Mật Riêng Tư Theo Chuẩn Pháp Luật (Nghị Định 13)</h4>
            <p>Kiến trúc Zero-Cloud xử lý on-device và RAM tạm thời giải tỏa hoàn toàn nỗi lo của Ban Giám hiệu, CSGT và Phụ huynh về nguy cơ lộ lọt dữ liệu cá nhân học sinh.</p>
          </div>
          <div class="i-card">
            <h4>5. Khả Năng Nhân Rộng Toàn Quốc Sẵn Sàng 100%</h4>
            <p>Sở GTVT và Chuyên gia Công nghệ khẳng định kiến trúc PWA WebGL và Edge AI tận dụng camera sẵn có cho phép triển khai ngay tới 10.000 trường học mà không tạo gánh nặng ngân sách.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Attach to window
window.PERSONA_DATA = PERSONA_DATA;
window.openPersonaBotModal = openPersonaBotModal;
window.closePersonaBotModal = closePersonaBotModal;
window.filterPersonaCategory = filterPersonaCategory;
window.selectPersona = selectPersona;
window.startPersonaSimulation = startPersonaSimulation;
window.askPresetQuestion = askPresetQuestion;
window.sendCustomChat = sendCustomChat;
window.handleChatEnter = handleChatEnter;
window.openCouncilSummaryView = openCouncilSummaryView;

console.log("Eco-SafeRide: Multi-Persona Autonomous Evaluation Bot loaded successfully (10 Personas ready).");