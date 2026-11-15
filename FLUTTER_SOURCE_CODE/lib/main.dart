import 'package:flutter/material.dart';
import 'services/sensor_orientation_service.dart';
import 'services/voice_nudge_service.dart';
import 'services/emergency_sos_service.dart';
import 'models/safe_driving_passport.dart';

void main() {
  runApp(const EcoSafeRideApp());
}

class EcoSafeRideApp extends StatelessWidget {
  const EcoSafeRideApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Eco-SafeRide',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF090D16),
        primaryColor: const Color(0xFF10B981),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          secondary: Color(0xFF3B82F6),
          error: Color(0xFFEF4444),
          surface: Color(0xFF131D2E),
        ),
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  bool _isHybridMode = false; // False: Phone-Only (0d), True: Hybrid ESP32 (150k)

  final SensorOrientationService _sensorService = SensorOrientationService();
  final VoiceNudgeService _voiceService = VoiceNudgeService();
  late final EmergencySosService _emergencyService;
  final SafeDrivingPassport _passport = SafeDrivingPassport(
    studentName: "Nguyễn Văn An",
    className: "10A2",
    schoolName: "THPT Chuyên Lý Tự Trọng",
  );

  VehicleMotionState? _currentState;
  int _sosCountdown = 30;
  bool _showSosModal = false;

  @override
  void initState() {
    super.initState();

    _emergencyService = EmergencySosService(
      onCountdownTick: (secondsLeft) {
        setState(() {
          _sosCountdown = secondsLeft;
          _showSosModal = true;
        });
      },
      onSosDispatched: () {
        setState(() {
          _showSosModal = false;
        });
        _voiceService.speakNudge("Đã tự động gửi cuộc gọi cấp cứu 115 và tọa độ GPS tới gia đình.");
      },
      onSosCancelled: () {
        setState(() {
          _showSosModal = false;
        });
        _voiceService.speakNudge("Đã hủy báo động khẩn cấp. Rất mừng vì bạn vẫn an toàn!");
      },
    );

    // Bắt đầu lắng nghe cảm biến gia tốc điện thoại
    _sensorService.startListening();
    _sensorService.motionStream.listen((state) {
      setState(() {
        _currentState = state;
      });

      // Kích hoạt giọng nói và trừ điểm theo hành vi
      if (state.behavior == VehicleBehavior.aggressiveSwerving) {
        _passport.deductPenaltyForSwerving();
        _voiceService.speakNudge(state.advice);
      } else if (state.behavior == VehicleBehavior.harshBraking) {
        _passport.deductPenaltyForHarshBraking();
        _voiceService.speakNudge(state.advice);
      } else if (state.behavior == VehicleBehavior.distractedDriving) {
        _passport.deductPenaltyForDistraction();
        _voiceService.speakNudge(state.advice);
      } else if (state.behavior == VehicleBehavior.severeCrashFall) {
        _emergencyService.triggerEmergencyCountdown();
      }
    });
  }

  @override
  void dispose() {
    _sensorService.stopListening();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B1120),
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Eco-SafeRide",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            Text(
              _isHybridMode ? "Chế độ: Cảm biến ESP32 (150k)" : "Chế độ: Cảm biến Điện thoại (0đ)",
              style: TextStyle(
                fontSize: 11,
                color: _isHybridMode ? Colors.blueAccent : const Color(0xFF10B981),
              ),
            ),
          ],
        ),
        actions: [
          TextButton.icon(
            onPressed: () {
              setState(() {
                _isHybridMode = !_isHybridMode;
              });
              _voiceService.speakNudge(
                _isHybridMode ? "Đã chuyển sang kết nối cảm biến xe" : "Đã chuyển sang cảm biến điện thoại",
              );
            },
            icon: Icon(
              _isHybridMode ? Icons.bluetooth_connected : Icons.phone_android,
              size: 16,
              color: Colors.white,
            ),
            label: Text(
              _isHybridMode ? "150k" : "0đ",
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          IndexedStack(
            index: _currentIndex,
            children: [
              _buildLiveRideTab(),
              _buildPassportTab(),
              _buildMapTab(),
              _buildSosTab(),
            ],
          ),
          if (_showSosModal) _buildSosModalOverlay(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        backgroundColor: const Color(0xFF0B1120),
        selectedItemColor: const Color(0xFF10B981),
        unselectedItemColor: const Color(0xFF64748B),
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.two_wheeler), label: "Hành Trình"),
          BottomNavigationBarItem(icon: Icon(Icons.military_tech), label: "Hộ Chiếu"),
          BottomNavigationBarItem(icon: Icon(Icons.map), label: "Bản Đồ"),
          BottomNavigationBarItem(icon: Icon(Icons.emergency), label: "Cứu Hộ"),
        ],
      ),
    );
  }

  Widget _buildLiveRideTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Hero Score Circle
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF131D2E),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
            ),
            child: Column(
              children: [
                Container(
                  width: 110,
                  height: 110,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF10B981), width: 5),
                    color: const Color(0xFF10B981).withOpacity(0.1),
                  ),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "${_passport.safeDrivingScore}",
                          style: const TextStyle(fontSize: 38, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const Text("ĐIỂM SDI", style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                const Text("Đại Sứ Lái Xe Văn Minh 🌟", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Text("+${_passport.ecoPoints} Eco-Points tích lũy", style: const TextStyle(color: Color(0xFF10B981), fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Telemetry Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF131D2E),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("TRẠNG THÁI ĐỘNG HỌC", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    Chip(
                      backgroundColor: const Color(0xFF10B981).withOpacity(0.15),
                      label: Text(
                        _currentState?.behavior.name ?? "Bình Thường",
                        style: const TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatItem("${(_currentState?.forwardAccel ?? 0).toStringAsFixed(1)} m/s²", "Gia Tốc Dọc"),
                    _buildStatItem("${(_currentState?.rollAngleDeg ?? 0).toStringAsFixed(1)}°", "Góc Nghiêng"),
                    _buildStatItem("32°C", "Nhiệt Độ"),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Voice Nudge Banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.blue.withOpacity(0.15), const Color(0xFF10B981).withOpacity(0.1)],
              ),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.blue.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.volume_up, color: Colors.blueAccent),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _currentState?.advice ?? "Hành trình an toàn, tốc độ ổn định.",
                    style: const TextStyle(fontSize: 12, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String val, String label) {
    return Column(
      children: [
        Text(val, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
      ],
    );
  }

  Widget _buildPassportTab() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF1E1B4B), Color(0xFF172554)]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("HỘ CHIẾU VĂN HÓA GIAO THÔNG", style: TextStyle(color: Colors.blueAccent, fontSize: 11)),
                const SizedBox(height: 4),
                Text(_passport.studentName, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                Text("${_passport.className} • ${_passport.schoolName}", style: const TextStyle(color: Colors.white70, fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text("QUÀ TẶNG TOYOTA ĐỒNG HÀNH", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _buildRewardTile("Mũ Bảo Hiểm Toyota Chuẩn", "Đổi với 350 Eco-Points", 350),
          _buildRewardTile("Voucher Sửa Xe Điện Miễn Phí", "Đổi với 200 Eco-Points", 200),
        ],
      ),
    );
  }

  Widget _buildRewardTile(String title, String subtitle, int points) {
    return Card(
      color: const Color(0xFF131D2E),
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        title: Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        trailing: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF10B981),
            foregroundColor: Colors.black,
            shape: const StadiumBorder(),
          ),
          onPressed: () {
            if (_passport.claimReward(points)) {
              setState(() {});
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("🎉 Đã đổi thành công $title!")));
            }
          },
          child: const Text("Đổi"),
        ),
      ),
    );
  }

  Widget _buildMapTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: const [
          Icon(Icons.map_outlined, size: 64, color: Colors.blueAccent),
          SizedBox(height: 12),
          Text("Bản Đồ Ổ Gà Đô Thị (DBSCAN)", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          SizedBox(height: 6),
          Text("14 Ổ gà đã được 120 học sinh đánh dấu tự động", style: TextStyle(color: Colors.grey, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildSosTab() {
    return Center(
      child: ElevatedButton.icon(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.redAccent,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        ),
        onPressed: () => _emergencyService.triggerEmergencyCountdown(),
        icon: const Icon(Icons.warning, color: Colors.white),
        label: const Text("Mô Phỏng Ngã Xe Khẩn Cấp", style: TextStyle(color: Colors.white)),
      ),
    );
  }

  Widget _buildSosModalOverlay() {
    return Container(
      color: Colors.black.withOpacity(0.92),
      width: double.infinity,
      height: double.infinity,
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.warning_amber_rounded, size: 72, color: Colors.redAccent),
          const SizedBox(height: 12),
          const Text("PHÁT HIỆN TAI NẠN NGÃ XE!", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.redAccent)),
          const SizedBox(height: 8),
          const Text("Tự động gọi cứu hộ 115 và gia đình sau:", style: TextStyle(color: Colors.white70)),
          const SizedBox(height: 16),
          Text("$_sosCountdown", style: const TextStyle(fontSize: 84, fontWeight: FontWeight.bold, color: Colors.redAccent, fontFamily: 'monospace')),
          const SizedBox(height: 24),
          OutlinedButton(
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.white, width: 2),
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: const StadiumBorder(),
            ),
            onPressed: () => _emergencyService.cancelEmergency(),
            child: const Text("TÔI VẪN ỔN (HỦY BÁO ĐỘNG)", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
