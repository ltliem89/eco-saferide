import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';

class EmergencySosService {
  Timer? _countdownTimer;
  int _secondsRemaining = 30;
  bool _isSosActive = false;

  final Function(int secondsLeft) onCountdownTick;
  final Function() onSosDispatched;
  final Function() onSosCancelled;

  EmergencySosService({
    required this.onCountdownTick,
    required this.onSosDispatched,
    required this.onSosCancelled,
  });

  bool get isSosActive => _isSosActive;

  /// Kích hoạt đếm ngược 30 giây khi phát hiện tai nạn ngã xe
  void triggerEmergencyCountdown() {
    if (_isSosActive) return;
    _isSosActive = true;
    _secondsRemaining = 30;
    onCountdownTick(_secondsRemaining);

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _secondsRemaining--;
      onCountdownTick(_secondsRemaining);

      if (_secondsRemaining <= 0) {
        _countdownTimer?.cancel();
        _dispatchSosCallsAndSms();
      }
    });
  }

  /// Học sinh nhấn nút hủy báo động khi vẫn tỉnh táo
  void cancelEmergency() {
    if (!_isSosActive) return;
    _countdownTimer?.cancel();
    _isSosActive = false;
    onSosCancelled();
  }

  /// Tự động gọi điện cấp cứu 115 và gửi SMS tọa độ Google Maps
  Future<void> _dispatchSosCallsAndSms() async {
    _isSosActive = false;
    onSosDispatched();

    try {
      // 1. Lấy vị trí GPS điện thoại tức thời
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      String mapsUrl = "https://maps.google.com/?q=${position.latitude},${position.longitude}";

      // 2. Tự động thực hiện cuộc gọi thoại tới 115 hoặc người thân
      final Uri callUri = Uri(scheme: 'tel', path: '115');
      if (await canLaunchUrl(callUri)) {
        await launchUrl(callUri);
      }

      // 3. Tự động soạn tin nhắn SMS gửi link bản đồ
      String smsBody = "CANH BAO TAI NAN: Hoc sinh gap tai nan nga xe tai toa do: $mapsUrl";
      final Uri smsUri = Uri(
        scheme: 'sms',
        path: '0912345678', // Số phụ huynh mặc định
        queryParameters: {'body': smsBody},
      );
      if (await canLaunchUrl(smsUri)) {
        await launchUrl(smsUri);
      }
    } catch (e) {
      // Xử lý lỗi nếu không lấy được GPS
    }
  }
}
