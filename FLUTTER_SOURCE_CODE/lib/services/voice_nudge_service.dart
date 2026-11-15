import 'package:flutter_tts/flutter_tts.dart';

/// Dịch vụ giọng nói tiếng Việt nhắc nhở hành vi an toàn (Audio Nudge Engine)
class VoiceNudgeService {
  final FlutterTts _flutterTts = FlutterTts();
  DateTime _lastSpokenTime = DateTime.now().subtract(const Duration(minutes: 1));
  final Duration _cooldownDuration = const Duration(seconds: 6);

  VoiceNudgeService() {
    _initTts();
  }

  Future<void> _initTts() async {
    await _flutterTts.setLanguage("vi-VN");
    await _flutterTts.setSpeechRate(0.95);
    await _flutterTts.setPitch(1.0);
    await _flutterTts.setVolume(1.0);
  }

  /// Phát âm thanh nhắc nhở tiếng Việt có bộ lọc tránh lặp tiếng (Cooldown filter)
  Future<void> speakNudge(String message, {bool forceNow = false}) async {
    final now = DateTime.now();
    if (!forceNow && now.difference(_lastSpokenTime) < _cooldownDuration) {
      return; // Đang trong thời gian nghỉ âm thanh, không làm phiền học sinh
    }

    _lastSpokenTime = now;
    await _flutterTts.stop();
    await _flutterTts.speak(message);
  }

  Future<void> stop() async {
    await _flutterTts.stop();
  }
}
