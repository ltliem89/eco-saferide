import './style.css';

// State management
    let currentMode = 'phone'; // 'phone' (0d) or 'hybrid' (150k)
    let sdiScore = 96;
    let ecoPoints = 425;
    let sosTimer = null;
    let sosSecondsLeft = 30;

    // Speech Synthesis Engine (Giọng nói tiếng Việt)
    function speakVietnamese(text) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop prior
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }

    // ==========================================
    // Real Device Sensors Integration (Gyroscope & Accelerometer)
    // ==========================================
    let isRealSensorActive = false;
    let lastSensorSpeechTime = 0;
    let gravX = 0, gravY = 0, gravZ = 9.8;
    const ALPHA = 0.8; // Low-pass filter weight for gravity decoupling
    let pulseZCount = 0; // Bộ đếm độ rộng xung trục Z phân biệt ổ gà vs gờ giảm tốc

    // Background Keep-Alive & WakeLock for Mobile Screen Locking
    let wakeLock = null;
    let bgAudio = null;

    // Field Motion Data Collection Buffer
    let isRecordingData = false;
    let recordedBuffer = [];

    async function enableWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
        } catch (e) {
          console.log('WakeLock error:', e);
        }
      }
    }

    function releaseWakeLock() {
      if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
      }
    }

    function startBgAudioKeepAlive() {
      try {
        if (!bgAudio) {
          bgAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
          bgAudio.loop = true;
        }
        bgAudio.play().catch(e => console.log('Audio keep-alive silent:', e));
      } catch (e) {}
    }

    function stopBgAudioKeepAlive() {
      if (bgAudio) {
        bgAudio.pause();
      }
    }

    function toggleRealSensors() {
      if (!isRealSensorActive) {
        startRealSensors();
      } else {
        stopRealSensors();
      }
    }

    async function startRealSensors() {
      // iOS 13+ permission request
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceMotionEvent.requestPermission();
          if (permission !== 'granted') {
            alert('Cần cấp quyền truy cập cảm biến chuyển động trên iPhone để trải nghiệm!');
            return;
          }
        } catch (e) {
          console.error(e);
          alert('Không thể kích hoạt quyền cảm biến: ' + e);
          return;
        }
      }

      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleMotion);
        isRealSensorActive = true;
        enableWakeLock();
        startBgAudioKeepAlive();
        document.getElementById('btn-toggle-sensor').innerText = 'Tắt Cảm Biến';
        document.getElementById('btn-toggle-sensor').style.background = '#ef4444';
        document.getElementById('sensor-status-label').innerText = '🟢 Đang đọc trực tiếp Gyroscope & Accelerometer thật';
        document.getElementById('sensor-status-label').style.color = '#10b981';
        document.getElementById('sensor-raw-debug').style.display = 'block';
        updateVoice("Đã kết nối cảm biến con quay hồi chuyển và gia tốc thật của điện thoại. Hãy thử nghiêng hoặc lắc máy!");
      } else {
        alert('Trình duyệt hoặc thiết bị này không hỗ trợ DeviceMotionEvent!');
      }
    }

    function stopRealSensors() {
      window.removeEventListener('devicemotion', handleMotion);
      isRealSensorActive = false;
      releaseWakeLock();
      stopBgAudioKeepAlive();
      document.getElementById('btn-toggle-sensor').innerText = 'Bật Cảm Biến Thật';
      document.getElementById('btn-toggle-sensor').style.background = '#2563eb';
      document.getElementById('sensor-status-label').innerText = 'Chế độ giả lập (Bấm nút để kích hoạt Gyro/Acc thật)';
      document.getElementById('sensor-status-label').style.color = '#94a3b8';
      document.getElementById('sensor-raw-debug').style.display = 'none';
      resetStatus();
    }

    function handleMotion(event) {
      if (!isRealSensorActive) return;

      const acc = event.accelerationIncludingGravity || { x: 0, y: 0, z: 9.8 };
      const rot = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };

      const ax = acc.x || 0;
      const ay = acc.y || 0;
      const az = acc.z || 9.8;
      const gz = rot.gamma || rot.alpha || rot.beta || 0; // Rotational rate

      // Low-pass filter to decouple gravity vector
      gravX = ALPHA * gravX + (1 - ALPHA) * ax;
      gravY = ALPHA * gravY + (1 - ALPHA) * ay;
      gravZ = ALPHA * gravZ + (1 - ALPHA) * az;

      const totalAcc = Math.sqrt(ax * ax + ay * ay + az * az);
      
      // Calculate tilt angle relative to gravity plane
      let tiltDeg = 0;
      if (totalAcc > 0.1) {
        const cosTilt = Math.min(1.0, Math.max(-1.0, Math.abs(az) / totalAcc));
        tiltDeg = Math.acos(cosTilt) * (180 / Math.PI);
      }

      // Update UI Telemetry
      document.getElementById('val-tilt').innerText = tiltDeg.toFixed(1) + '°';
      document.getElementById('sensor-raw-debug').innerText = 
        `Ax: ${ax.toFixed(1)} | Ay: ${ay.toFixed(1)} | Az: ${az.toFixed(1)} | Gyro: ${gz.toFixed(1)}°/s`;

      const now = Date.now();

      // Record sample if data recorder is active
      if (isRecordingData) {
        const orient = document.getElementById('sel-phone-orient') ? document.getElementById('sel-phone-orient').value : 'unknown';
        const activity = document.getElementById('sel-motion-activity') ? document.getElementById('sel-motion-activity').value : 'unknown';
        recordedBuffer.push({
          timestamp: now,
          ax: ax.toFixed(3),
          ay: ay.toFixed(3),
          az: az.toFixed(3),
          total_acc: totalAcc.toFixed(3),
          gyro_a: (rot.alpha || 0).toFixed(2),
          gyro_b: (rot.beta || 0).toFixed(2),
          gyro_g: (rot.gamma || 0).toFixed(2),
          tilt: tiltDeg.toFixed(2),
          orientation: orient,
          activity: activity
        });
        const badge = document.getElementById('rec-sample-badge');
        if (badge && recordedBuffer.length % 5 === 0) {
          badge.innerText = `${recordedBuffer.length} mẫu`;
        }
      }

      const pill = document.getElementById('behavior-pill');
      const text = document.getElementById('behavior-text');

      // 1. Crash Detection (Tilt > 65 deg or extreme sideways flip)
      if (tiltDeg > 65) {
        pill.className = 'status-pill danger';
        text.innerText = 'Ngã Xe!';
        triggerSOS();
        return;
      }

      // 2. Swerving Detection (High rotational rate or lateral jerk)
      if (Math.abs(gz) > 40 || (Math.abs(ax) > 4.5 && tiltDeg > 18)) {
        pill.className = 'status-pill warning';
        text.innerText = 'Lạng Lách!';
        sdiScore = Math.max(70, sdiScore - 1);
        document.getElementById('sdi-score').innerText = sdiScore;
        if (now - lastSensorSpeechTime > 6000) {
          updateVoice("Cảnh báo: Phát hiện rung lắc lạng lách bất thường! Hãy giữ vững tay lái.");
          lastSensorSpeechTime = now;
        }
        return;
      }

      // 3. Pothole vs Speed Bump Discrimination (Phân biệt Ổ gà vs Gờ giảm tốc)
      const dynZ = Math.abs(az - gravZ);
      if (dynZ > 6.5) {
        pulseZCount++;
      } else {
        if (pulseZCount >= 1 && pulseZCount <= 3) {
          // Xung nhọn đơn lẻ rất ngắn (<= 60ms) -> Sụp Ổ Gà thực tế!
          pill.className = 'status-pill';
          text.innerText = 'Sụp Ổ Gà!';
          if (now - lastSensorSpeechTime > 6000) {
            updateVoice("Đã tự động ghi nhận ổ gà mặt đường và đánh dấu lên bản đồ cộng đồng.");
            lastSensorSpeechTime = now;
          }
          pulseZCount = 0;
          return;
        } else if (pulseZCount >= 4) {
          // Xung kéo dài (> 80ms) -> Gờ giảm tốc (Speed Bump) -> Không đánh dấu ổ gà
          pill.className = 'status-pill';
          text.innerText = 'Gờ Giảm Tốc';
          pulseZCount = 0;
          return;
        }
        pulseZCount = 0;
      }

      // Return to normal
      if (pill.className !== 'status-pill') {
        pill.className = 'status-pill';
        text.innerText = 'Bình Thường';
      }
    }

    // Toggle Mode
    function toggleMode() {
      if (currentMode === 'phone') {
        currentMode = 'hybrid';
        document.getElementById('mode-text').innerText = 'Chế độ: Kèm Cảm biến ESP32 (150k)';
        document.getElementById('mode-badge-btn').innerText = 'Chế Độ 150k';
        document.getElementById('mode-badge-btn').style.background = '#3b82f6';
        updateVoice("Đã kết nối Bluetooth với cảm biến ghi-đông xe đạp điện.");
      } else {
        currentMode = 'phone';
        document.getElementById('mode-text').innerText = 'Chế độ: 100% Điện thoại (0đ)';
        document.getElementById('mode-badge-btn').innerText = 'Chế Độ 0đ';
        document.getElementById('mode-badge-btn').style.background = '#10b981';
        updateVoice("Chuyển sang cảm biến con quay hồi chuyển của điện thoại.");
      }
    }

    // Switch Navigation Tabs
    function switchNav(tabName, btnElem) {
      document.querySelectorAll('.screen-content').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      
      document.getElementById('tab-' + tabName).style.display = 'flex';
      btnElem.classList.add('active');
    }

    // Update Voice Banner & Speak
    function updateVoice(message) {
      document.getElementById('voice-text').innerText = `"${message}"`;
      speakVietnamese(message);
    }

    // Simulate Scenarios
    function simulateScenario(type) {
      const pill = document.getElementById('behavior-pill');
      const text = document.getElementById('behavior-text');

      if (type === 'swerving') {
        pill.className = 'status-pill warning';
        text.innerText = 'Lạng Lách';
        document.getElementById('val-tilt').innerText = '24.5°';
        document.getElementById('val-speed').innerText = '26.0';
        sdiScore = Math.max(70, sdiScore - 4);
        document.getElementById('sdi-score').innerText = sdiScore;
        updateVoice("Bạn đang lạng lách chuyển làn quá nhanh! Hãy đi chậm lại và giữ thẳng tay lái.");
        
        setTimeout(() => resetStatus(), 4500);
      }
      else if (type === 'braking') {
        pill.className = 'status-pill warning';
        text.innerText = 'Phanh Gấp';
        document.getElementById('val-speed').innerText = '4.0';
        sdiScore = Math.max(70, sdiScore - 2);
        document.getElementById('sdi-score').innerText = sdiScore;
        updateVoice("Chú ý: Bạn vừa phanh gấp giật cục. Hãy giữ khoảng cách an toàn với xe phía trước.");
        
        setTimeout(() => resetStatus(), 4500);
      }
      else if (type === 'pothole') {
        pill.className = 'status-pill';
        text.innerText = 'Sụp Ổ Gà';
        updateVoice("Đã tự động ghi nhận ổ gà mặt đường và đánh dấu lên bản đồ cộng đồng.");
        setTimeout(() => resetStatus(), 3500);
      }
      else if (type === 'crash') {
        pill.className = 'status-pill danger';
        text.innerText = 'Ngã Xe!';
        document.getElementById('val-tilt').innerText = '82.0°';
        document.getElementById('val-speed').innerText = '0.0';
        triggerSOS();
      }
      else if (type === 'distracted') {
        pill.className = 'status-pill warning';
        text.innerText = 'Mất Tập Trung!';
        sdiScore = Math.max(70, sdiScore - 5);
        document.getElementById('sdi-score').innerText = sdiScore;
        updateVoice("Cảnh báo: Phát hiện bạn vừa rút điện thoại xem khi xe đang chạy! Hãy cất máy vào túi.");
        setTimeout(() => resetStatus(), 4500);
      }
    }

    function resetStatus() {
      const pill = document.getElementById('behavior-pill');
      const text = document.getElementById('behavior-text');
      pill.className = 'status-pill';
      text.innerText = 'Bình Thường';
      document.getElementById('val-tilt').innerText = '3.5°';
      document.getElementById('val-speed').innerText = '18.0';
    }

    // ==========================================
    // Emergency Contact Management (Lưu số người thân, KHÔNG gọi 115)
    // ==========================================
    let emergencyContactPhone = localStorage.getItem('eco_emergency_phone') || '0912.345.678';

    function initEmergencyContactUI() {
      const saved = localStorage.getItem('eco_emergency_phone');
      if (saved) emergencyContactPhone = saved;
      
      const cleanPhone = (emergencyContactPhone || '0912.345.678').replace(/[^0-9+]/g, '');

      const input = document.getElementById('input-emergency-phone');
      const disp1 = document.getElementById('display-saved-phone');
      const disp2 = document.getElementById('list-target-phone');
      const disp3 = document.getElementById('modal-target-phone');
      const btnTest = document.getElementById('btn-test-call');
      const btnModal = document.getElementById('btn-modal-call-now');
      
      if (input && saved) input.value = saved;
      if (disp1) disp1.innerText = emergencyContactPhone;
      if (disp2) disp2.innerText = emergencyContactPhone;
      if (disp3) disp3.innerText = emergencyContactPhone;
      if (btnTest) btnTest.href = 'tel:' + cleanPhone;
      if (btnModal) btnModal.href = 'tel:' + cleanPhone;
    }

    function saveEmergencyPhone() {
      const input = document.getElementById('input-emergency-phone');
      if (!input || !input.value.trim()) {
        alert('Vui lòng nhập số điện thoại người thân!');
        return;
      }
      const raw = input.value.trim();
      emergencyContactPhone = raw;
      localStorage.setItem('eco_emergency_phone', raw);
      initEmergencyContactUI();
      
      const feedback = document.getElementById('phone-saved-feedback');
      if (feedback) {
        feedback.innerText = '✅ Đã lưu thành công: ' + raw;
        feedback.style.color = '#10b981';
      }
      speakVietnamese('Đã lưu số điện thoại người thân để sẵn sàng kết nối khi có sự cố.');
      alert('✅ ĐÃ LƯU SỐ ĐIỆN THOẠI NGƯỜI THÂN THÀNH CÔNG!\nSố: ' + raw + '\n(Quy tắc bản thử nghiệm: Khi phát hiện ngã xe, hệ thống sẽ kết nối số này, tuyệt đối không gọi 115)');
    }

    // Trigger SOS 30s Countdown (Chỉ liên hệ người thân đã lưu, tuyệt đối không gọi 115)
    function triggerSOS() {
      const modal = document.getElementById('sos-modal');
      modal.style.display = 'flex';
      sosSecondsLeft = 30;
      document.getElementById('sos-seconds').innerText = sosSecondsLeft;
      
      initEmergencyContactUI();
      const targetPhone = emergencyContactPhone || '0912.345.678';
      speakVietnamese("Khẩn cấp! Phát hiện ngã xe! Đang đếm ngược 30 giây để tự động kết nối cuộc gọi tới người thân.");

      if (sosTimer) clearInterval(sosTimer);
      sosTimer = setInterval(() => {
        sosSecondsLeft--;
        document.getElementById('sos-seconds').innerText = sosSecondsLeft;
        if (sosSecondsLeft <= 0) {
          clearInterval(sosTimer);
          modal.style.display = 'none';
          const targetPhone = emergencyContactPhone || '0912.345.678';
          const clean = targetPhone.replace(/[^0-9+]/g, '');
          alert("🚨 ĐÃ TỰ ĐỘNG THỰC HIỆN CUỘC GỌI CỨU HỘ TỚI NGƯỜI THÂN!\nSố điện thoại: " + targetPhone + "\nĐang mở ứng dụng điện thoại để gọi ngay...");
          window.location.href = 'tel:' + clean;
          resetStatus();
        }
      }, 1000);
    }

    function cancelSOS() {
      if (sosTimer) clearInterval(sosTimer);
      document.getElementById('sos-modal').style.display = 'none';
      updateVoice("Đã hủy báo động khẩn cấp. Mừng vì bạn vẫn an toàn!");
      resetStatus();
    }

    function claimReward(itemName) {
      if (ecoPoints >= 200) {
        ecoPoints -= 200;
        document.getElementById('eco-points').innerText = ecoPoints;
        alert(`🎉 Chúc mừng bạn đã đổi thành công phần quà: ${itemName} do Toyota đồng hành!`);
      }
    }

    // Register PWA Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(() => {
          console.log('Eco-SafeRide ServiceWorker Registered');
        }).catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }

    // ==========================================
    // Field Motion Data Collection Engine
    // ==========================================
    function toggleDataRecording() {
      if (!isRecordingData) {
        startDataRecording();
      } else {
        stopDataRecording();
      }
    }

    function startDataRecording() {
      if (!isRealSensorActive) {
        startRealSensors();
      }
      isRecordingData = true;
      recordedBuffer = [];
      
      const orient = document.getElementById('sel-phone-orient') ? document.getElementById('sel-phone-orient').value : 'tui_quan_dung';
      const activity = document.getElementById('sel-motion-activity') ? document.getElementById('sel-motion-activity').value : 'xe_dap_dien';
      
      const btn = document.getElementById('btn-record-toggle');
      if (btn) {
        btn.innerText = '⏹️ Dừng Ghi Dữ Liệu';
        btn.style.background = '#ef4444';
      }
      const exp = document.getElementById('btn-export-csv');
      if (exp) exp.disabled = true;
      
      const desc = document.getElementById('rec-status-desc');
      if (desc) {
        desc.innerText = `🔴 Đang thu thập mẫu: ${activity} (${orient})...`;
        desc.style.color = '#ef4444';
      }
      
      updateVoice("Bắt đầu thu thập dữ liệu cảm biến. Hãy đút máy vào vị trí đã chọn!");
    }

    function stopDataRecording() {
      isRecordingData = false;
      const btn = document.getElementById('btn-record-toggle');
      if (btn) {
        btn.innerText = '🔴 Bắt Đầu Ghi Dữ Liệu';
        btn.style.background = '#8b5cf6';
      }
      
      const exp = document.getElementById('btn-export-csv');
      const desc = document.getElementById('rec-status-desc');
      
      if (recordedBuffer.length > 0) {
        if (exp) exp.disabled = false;
        if (desc) {
          desc.innerText = `✅ Đã ghi được ${recordedBuffer.length} mẫu. Bấm "Xuất CSV" để tải về!`;
          desc.style.color = '#10b981';
        }
        updateVoice(`Đã hoàn tất thu thập ${recordedBuffer.length} mẫu dữ liệu.`);
      } else {
        if (desc) desc.innerText = 'Chưa ghi nhận được mẫu nào. Hãy bật cảm biến và thử lại.';
      }
    }

    function exportRecordedCSV() {
      if (recordedBuffer.length === 0) {
        alert('Chưa có mẫu nào để xuất!');
        return;
      }
      
      const orient = document.getElementById('sel-phone-orient') ? document.getElementById('sel-phone-orient').value : 'unknown';
      const activity = document.getElementById('sel-motion-activity') ? document.getElementById('sel-motion-activity').value : 'unknown';
      
      let csvContent = 'timestamp_ms,ax,ay,az,total_acc,gyro_alpha,gyro_beta,gyro_gamma,tilt_deg,phone_orientation,activity_label\n';
      recordedBuffer.forEach(row => {
        csvContent += `${row.timestamp},${row.ax},${row.ay},${row.az},${row.total_acc},${row.gyro_a},${row.gyro_b},${row.gyro_g},${row.tilt},${row.orientation},${row.activity}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const nowStr = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      a.href = url;
      a.download = `eco_motion_${activity}_${orient}_${nowStr}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(`✅ ĐÃ XUẤT THÀNH CÔNG TỆP CSV!\nSố lượng: ${recordedBuffer.length} mẫu cảm biến\nTên file: eco_motion_${activity}_${orient}_${nowStr}.csv`);
    }

    // ==========================================
    // Pocket Mode Engine (Màn hình đen OLED chống chạm nhầm)
    // ==========================================
    async function enterPocketMode() {
      if (!isRealSensorActive) {
        await startRealSensors();
      }
      await enableWakeLock();
      startBgAudioKeepAlive();
      const overlay = document.getElementById('pocket-mode-overlay');
      if (overlay) overlay.style.display = 'flex';
      updateVoice("Đã kích hoạt chế độ bỏ túi màn hình đen. Cảm biến và âm thanh đang chạy.");
    }

    function exitPocketMode() {
      const overlay = document.getElementById('pocket-mode-overlay');
      if (overlay) overlay.style.display = 'none';
      updateVoice("Đã mở lại màn hình bình thường.");
    }

// Expose functions to window for HTML onclick attributes
window.toggleMode = toggleMode;
window.switchNav = switchNav;
window.updateVoice = updateVoice;
window.simulateScenario = simulateScenario;
window.resetStatus = resetStatus;
window.triggerSOS = triggerSOS;
window.cancelSOS = cancelSOS;
window.claimReward = claimReward;
window.toggleRealSensors = toggleRealSensors;
window.startRealSensors = startRealSensors;
window.stopRealSensors = stopRealSensors;
window.saveEmergencyPhone = saveEmergencyPhone;
window.initEmergencyContactUI = initEmergencyContactUI;
window.toggleDataRecording = toggleDataRecording;
window.startDataRecording = startDataRecording;
window.stopDataRecording = stopDataRecording;
window.exportRecordedCSV = exportRecordedCSV;
window.enterPocketMode = enterPocketMode;
window.exitPocketMode = exitPocketMode;

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  initEmergencyContactUI();
});

