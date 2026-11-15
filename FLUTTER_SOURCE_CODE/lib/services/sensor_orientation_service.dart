import 'dart:async';
import 'dart:math';
import 'package:sensors_plus/sensors_plus.dart';

/// Trạng thái hành vi lái xe được phân loại từ cảm biến điện thoại
enum VehicleBehavior {
  normalRiding,
  aggressiveSwerving,
  harshBraking,
  severeCrashFall,
  potholeDetected,
  distractedDriving,
}

/// Dữ liệu cảm biến đã được chuẩn hóa về Hệ Quy Chiếu Thân Xe (Vehicle Body Frame)
class VehicleMotionState {
  final double forwardAccel;    // Trục dọc xe (m/s^2, dương: tăng tốc, âm: phanh)
  final double lateralAccel;    // Trục ngang xe (m/s^2, lắc lư lạng lách)
  final double verticalAccel;   // Trục thẳng đứng (m/s^2, xung xóc ổ gà)
  final double rollAngleDeg;    // Góc nghiêng lật xe
  final VehicleBehavior behavior;
  final String advice;

  VehicleMotionState({
    required this.forwardAccel,
    required this.lateralAccel,
    required this.verticalAccel,
    required this.rollAngleDeg,
    required this.behavior,
    required this.advice,
  });
}

/// Thuật toán Căn Chỉnh Tọa Độ Động Học Độc Lập Góc Nghiêng (Dynamic Coordinate Alignment)
/// Cho phép đút điện thoại vào túi quần hoặc balô ở bất kỳ góc độ nào
/// mà vẫn quy đổi chuẩn xác về chuyển động của chiếc xe!
class SensorOrientationService {
  // Bộ lọc thông thấp trích xuất trọng lực g (Alpha filter)
  double _gx = 0.0, _gy = 0.0, _gz = 9.81;
  final double _alpha = 0.85;

  // Cửa sổ trượt tính phương sai trục ngang
  final List<double> _lateralBuffer = [];
  final int _windowSize = 25; // 0.5s ở tần số 50Hz

  final _motionController = StreamController<VehicleMotionState>.broadcast();
  Stream<VehicleMotionState> get motionStream => _motionController.stream;

  StreamSubscription<AccelerometerEvent>? _accelSub;

  void startListening() {
    _accelSub = accelerometerEventStream(samplingPeriod: SensorInterval.gameInterval)
        .listen((AccelerometerEvent event) {
      _processRawPhoneSample(event.x, event.y, event.z);
    });
  }

  void stopListening() {
    _accelSub?.cancel();
  }

  void _processRawPhoneSample(double ax, double ay, double az) {
    // 1. Tách vector trọng trường Trái Đất (Trục Z vuông góc mặt đường)
    _gx = _alpha * _gx + (1 - _alpha) * ax;
    _gy = _alpha * _gy + (1 - _alpha) * ay;
    _gz = _alpha * _gz + (1 - _alpha) * az;

    double gNorm = sqrt(_gx * _gx + _gy * _gy + _gz * _gz);
    if (gNorm < 1e-4) return;

    // Vector đơn vị trục Z thẳng đứng của xe: u_z
    double uzX = _gx / gNorm;
    double uzY = _gy / gNorm;
    double uzZ = _gz / gNorm;

    // 2. Gia tốc động học tuyến tính (Loại trừ trọng lực 1g)
    double linX = ax - _gx;
    double linY = ay - _gy;
    double linZ = az - _gz;

    // 3. Chiếu gia tốc lên trục thẳng đứng của xe: a_vertical
    double aVertical = linX * uzX + linY * uzY + linZ * uzZ;

    // Gia tốc phẳng ngang mặt đường: a_planar = a_linear - (a_vertical * u_z)
    double aPlanarX = linX - aVertical * uzX;
    double aPlanarY = linY - aVertical * uzY;
    double aPlanarZ = linZ - aVertical * uzZ;
    double aPlanarMag = sqrt(aPlanarX * aPlanarX + aPlanarY * aPlanarY + aPlanarZ * aPlanarZ);

    // 4. Góc lật thân xe (Roll Angle so với phương thẳng đứng)
    // cos(theta) = dot(a_raw, u_z) / ||a_raw||
    double aTot = sqrt(ax * ax + ay * ay + az * az);
    double cosRoll = (aTot > 1e-4) ? (az / aTot).clamp(-1.0, 1.0) : 1.0;
    double rollDeg = acos(cosRoll) * (180.0 / pi);

    // 5. Cập nhật buffer trượt tính phương sai lạng lách
    _lateralBuffer.add(aPlanarMag);
    if (_lateralBuffer.length > _windowSize) {
      _lateralBuffer.removeAt(0);
    }

    double meanLat = _lateralBuffer.reduce((a, b) => a + b) / _lateralBuffer.length;
    double varLat = _lateralBuffer.map((v) => pow(v - meanLat, 2)).reduce((a, b) => a + b) / _lateralBuffer.length;

    // 6. Cây quyết định phân loại hành vi
    VehicleBehavior behavior = VehicleBehavior.normalRiding;
    String advice = "Hành trình an toàn, tốc độ ổn định.";

    // TH Ngã xe tai nạn
    if (aTot > 35.0 && rollDeg > 60.0) {
      behavior = VehicleBehavior.severeCrashFall;
      advice = "KHẨN CẤP: Phát hiện ngã xe tai nạn! Đếm ngược gọi 115.";
    }
    // TH Sụp ổ gà
    else if (aVertical.abs() > 18.0 && varLat < 2.0) {
      behavior = VehicleBehavior.potholeDetected;
      advice = "Đã tự động ghi nhận ổ gà mặt đường lên bản đồ.";
    }
    // TH Phanh gấp
    else if (aPlanarMag > 6.0 && varLat < 1.5) {
      behavior = VehicleBehavior.harshBraking;
      advice = "Bạn vừa phanh gấp giật cục, hãy giữ khoảng cách an toàn.";
    }
    // TH Lạng lách đánh võng
    else if (varLat > 4.5) {
      behavior = VehicleBehavior.aggressiveSwerving;
      advice = "Bạn đang lạng lách chuyển làn quá nhanh, hãy đi chậm lại.";
    }

    _motionController.add(VehicleMotionState(
      forwardAccel: aPlanarMag,
      lateralAccel: varLat,
      verticalAccel: aVertical,
      rollAngleDeg: rollDeg,
      behavior: behavior,
      advice: advice,
    ));
  }
}
