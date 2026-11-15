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
// User-Centric Adaptive Telematics State
// ==========================================
let isRealSensorActive = false;
let lastSensorSpeechTime = 0;
let gravX = 0, gravY = 0, gravZ = 9.8;
const ALPHA = 0.8; // Low-pass filter weight for gravity decoupling
let pulseZCount = 0; // Bộ đếm độ rộng xung trục Z phân biệt ổ gà vs gờ giảm tốc

// Auto-Gravity Pocket Orientation Calibration
let isCalibrating = false;
let calibSamples = [];
let uGx = 0, uGy = 0, uGz = 1.0; // Gravity unit vector
let baselineTilt = 0;
let isCalibrated = false;

// HAR (Human Activity Recognition: Walking vs Riding vs Stationary)
let zWindow = [];
let userActivity = 'RIDING'; // 'WALKING', 'RIDING', 'STATIONARY'

// Behavioral Nudge & Adaptive SDI Self-Healing
let lastViolationTime = Date.now();
let smoothSecondsCounter = 0;

// Hermes 4-Gate Crash Filter
let crashPulseCounter = 0;

// Background Keep-Alive & WakeLock for Mobile Screen Locking
let wakeLock = null;
let bgAudio = null;

// Pocket Mode Timer
let pocketTimerInterval = null;
let pocketSeconds = 0;

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

// ==========================================
// Auto-Gravity Pocket Orientation Calibration
// ==========================================
function startAutoCalibration() {
  if (!isRealSensorActive) {
    startRealSensors();
  }
  isCalibrating = true;
  calibSamples = [];
  const btn = document.getElementById('btn-auto-calib');
  if (btn) {
    btn.innerText = 'Đang đo...';
    btn.style.background = '#f59e0b';
  }
  const badge = document.getElementById('pocket-calib-val');
  if (badge) badge.innerText = 'Đang lấy mẫu (2s)...';
  updateVoice("Đang tự động đo góc nghiêng túi quần của bạn. Hãy ngồi yên trên xe trong 2 giây.");
}

function finishCalibration() {
  isCalibrating = false;
  if (calibSamples.length < 5) return;
  let sumX = 0, sumY = 0, sumZ = 0;
  for (const s of calibSamples) {
    sumX += s.x; sumY += s.y; sumZ += s.z;
  }
  const meanX = sumX / calibSamples.length;
  const meanY = sumY / calibSamples.length;
  const meanZ = sumZ / calibSamples.length;
  const norm = Math.sqrt(meanX * meanX + meanY * meanY + meanZ * meanZ) || 9.81;
  uGx = meanX / norm;
  uGy = meanY / norm;
  uGz = meanZ / norm;
  baselineTilt = Math.acos(Math.min(1.0, Math.max(-1.0, Math.abs(uGz)))) * (180 / Math.PI);
  isCalibrated = true;

  const btn = document.getElementById('btn-auto-calib');
  if (btn) {
    btn.innerText = 'Đã Khóa Góc';
    btn.style.background = '#10b981';
  }
  const badge = document.getElementById('pocket-calib-val');
  if (badge) badge.innerText = `${baselineTilt.toFixed(1)}° (Đã bù)`;
  updateVoice(`Đã hiệu chuẩn góc túi quần ${baselineTilt.toFixed(0)} độ thành công! Hệ thống đã ghi nhớ tư thế đùi người lái.`);
}

// ==========================================
// HAR: Human Activity Recognition (Đi bộ vs Lái xe)
// ==========================================
function processHAR(az) {
  zWindow.push(az);
  if (zWindow.length > 30) zWindow.shift();
  if (zWindow.length < 20) return;

  // Calculate variance of Az in rolling window
  let sum = 0;
  for (let v of zWindow) sum += v;
  let mean = sum / zWindow.length;
  let variance = 0;
  for (let v of zWindow) variance += Math.pow(v - mean, 2);
  variance = variance / zWindow.length;

  // Count zero crossings around mean (cadence estimation)
  let crossings = 0;
  for (let i = 1; i < zWindow.length; i++) {
    if ((zWindow[i - 1] - mean) * (zWindow[i] - mean) < 0) {
      crossings++;
    }
  }

  const pill = document.getElementById('user-context-pill');
  if (variance > 2.0 && variance < 16.0 && crossings >= 3 && crossings <= 8) {
    userActivity = 'WALKING';
    if (pill) {
      pill.innerText = '🚶 Đang Đi Bộ (Tạm dừng tính điểm)';
      pill.style.background = 'rgba(16, 185, 129, 0.2)';
      pill.style.color = '#34d399';
      pill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    }
  } else if (variance >= 0.1) {
    userActivity = 'RIDING';
    if (pill) {
      pill.innerText = '🏍️ Đang Lái Xe (Giám sát)';
      pill.style.background = 'rgba(59, 130, 246, 0.2)';
      pill.style.color = '#60a5fa';
      pill.style.borderColor = 'rgba(59, 130, 246, 0.4)';
    }
  } else {
    userActivity = 'STATIONARY';
    if (pill) {
      pill.innerText = '⏸️ Đang Dừng Xe (Bảo lưu)';
      pill.style.background = 'rgba(148, 163, 184, 0.2)';
      pill.style.color = '#94a3b8';
      pill.style.borderColor = 'rgba(148, 163, 184, 0.4)';
    }
  }
}

// ==========================================
// Core Motion Event Processing
// ==========================================
function handleMotion(event) {
  if (!isRealSensorActive) return;

  const acc = event.accelerationIncludingGravity || { x: 0, y: 0, z: 9.8 };
  const rot = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };

  const ax = acc.x || 0;
  const ay = acc.y || 0;
  const az = acc.z || 9.8;
  const gz = rot.gamma || rot.alpha || rot.beta || 0; // Rotational rate

  // Pocket calibration sampling
  if (isCalibrating) {
    calibSamples.push({ x: ax, y: ay, z: az });
    if (calibSamples.length >= 35) {
      finishCalibration();
    }
  }

  // Low-pass filter to decouple gravity vector
  gravX = ALPHA * gravX + (1 - ALPHA) * ax;
  gravY = ALPHA * gravY + (1 - ALPHA) * ay;
  gravZ = ALPHA * gravZ + (1 - ALPHA) * az;

  const totalAcc = Math.sqrt(ax * ax + ay * ay + az * az);
  
  // Calculate raw tilt angle relative to gravity plane
  let tiltDeg = 0;
  if (totalAcc > 0.1) {
    const cosTilt = Math.min(1.0, Math.max(-1.0, Math.abs(az) / totalAcc));
    tiltDeg = Math.acos(cosTilt) * (180 / Math.PI);
  }

  // Activity recognition
  processHAR(az);

  // Calibrated vertical road acceleration
  const aVertical = isCalibrated ? (ax * uGx + ay * uGy + az * uGz) : az;
  const relativeTiltChange = isCalibrated ? Math.abs(tiltDeg - baselineTilt) : tiltDeg;

  // Update UI Telemetry
  document.getElementById('val-tilt').innerText = tiltDeg.toFixed(1) + '°';
  document.getElementById('sensor-raw-debug').innerText = 
    `Ax: ${ax.toFixed(1)} | Ay: ${ay.toFixed(1)} | Az: ${az.toFixed(1)} | Gyro: ${gz.toFixed(1)}°/s | V-Shock: ${aVertical.toFixed(1)} m/s²`;

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

  // Skip driving penalties or false crash alarms if user is currently WALKING
  if (userActivity === 'WALKING') {
    return;
  }

  const pill = document.getElementById('behavior-pill');
  const text = document.getElementById('behavior-text');

  // ==========================================
  // Hermes 4-Gate Crash Filter
  // ==========================================
  // Gate 1: High Total Force (>= 18.0 m/s2)
  // Gate 2: Pulse width duration 60ms - 300ms (2 - 15 samples)
  // Gate 3: Relative posture shift >= 45 degrees
  // Gate 4: Not walking
  if (totalAcc >= 18.0) {
    crashPulseCounter++;
  } else {
    if (crashPulseCounter >= 2 && crashPulseCounter <= 15 && relativeTiltChange >= 45 && userActivity !== 'WALKING') {
      pill.className = 'status-pill danger';
      text.innerText = 'Ngã Xe Thật!';
      crashPulseCounter = 0;
      triggerSOS();
      return;
    }
    crashPulseCounter = 0;
  }

  // 2. Swerving Detection (High rotational rate or lateral jerk)
  if (Math.abs(gz) > 40 || (Math.abs(ax) > 4.5 && relativeTiltChange > 18)) {
    pill.className = 'status-pill warning';
    text.innerText = 'Lạng Lách!';
    lastViolationTime = now;
    sdiScore = Math.max(70, sdiScore - 1);
    document.getElementById('sdi-score').innerText = Math.round(sdiScore);
    if (now - lastSensorSpeechTime > 6000) {
      updateVoice("Cảnh báo: Phát hiện rung lắc lạng lách bất thường! Hãy giữ vững tay lái.");
      lastSensorSpeechTime = now;
    }
    return;
  }

  // 3. Pothole vs Speed Bump Discrimination (Phân biệt Ổ gà vs Gờ giảm tốc)
  const dynZ = Math.abs(aVertical - (isCalibrated ? 9.81 : gravZ));
  if (dynZ > 6.5) {
    pulseZCount++;
  } else {
    if (pulseZCount >= 1 && pulseZCount <= 3) {
      // Xung nhọn đơn lẻ rất ngắn (<= 60ms) -> Sụp Ổ Gà thực tế!
      pill.className = 'status-pill';
      text.innerText = 'Sụp Ổ Gà!';
      lastViolationTime = now;
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
  }

  // 4. Return to Normal if within reasonable bounds
  if (Math.abs(gz) < 15 && relativeTiltChange < 15 && dynZ < 3.0) {
    pill.className = 'status-pill';
    text.innerText = 'Bình Thường';
  }
}

// ==========================================
// Behavioral Nudge: Adaptive SDI Self-Healing Loop
// ==========================================
setInterval(() => {
  if (userActivity === 'RIDING' || isRealSensorActive) {
    const now = Date.now();
    if (now - lastViolationTime >= 10000) { // No violations in last 10s
      smoothSecondsCounter++;
      if (smoothSecondsCounter % 30 === 0 && sdiScore < 100) {
        sdiScore = Math.min(100, Math.round((sdiScore + 0.5) * 10) / 10);
        const sdiElem = document.getElementById('sdi-score');
        if (sdiElem) sdiElem.innerText = Math.round(sdiScore);
        
        const status = document.getElementById('sdi-recovery-status');
        if (status) status.innerText = `🌱 Đang hồi phục: Điểm SDI đạt ${Math.round(sdiScore)} (+0.5đ)`;

        if (smoothSecondsCounter % 60 === 0 && now - lastSensorSpeechTime > 8000) {
          updateVoice("Cảm ơn bạn đã duy trì lái xe an toàn và êm ái! Điểm an toàn của bạn vừa được cộng thưởng.");
          lastSensorSpeechTime = now;
        }
      }
    }
  }
}, 1000);

// ==========================================
// Mode Toggle (0d vs 150k)
// ==========================================
function toggleMode() {
  const modeText = document.getElementById('mode-text');
  const badgeBtn = document.getElementById('mode-badge-btn');
  const valTemp = document.getElementById('val-temp');

  if (currentMode === 'phone') {
    currentMode = 'hybrid';
    modeText.innerText = 'Chế độ: Mũ Bảo Hiểm AI (150k)';
    badgeBtn.innerText = 'Dùng Điện Thoại (0đ)';
    valTemp.innerText = '31.5°C';
    updateVoice('Đã kích hoạt Chế độ Mũ Bảo Hiểm Thông Minh 150 nghìn đồng. Kết nối Bluetooth ESP32 thành công.');
  } else {
    currentMode = 'phone';
    modeText.innerText = 'Chế độ: 100% Điện thoại (0đ)';
    badgeBtn.innerText = 'Đổi Chế Độ';
    valTemp.innerText = '32°C';
    updateVoice('Đã chuyển sang Chế độ Điện thoại Không Đồng. Giám sát bằng cảm biến chuyển động trong túi quần.');
  }
}

// Navigation Tab Switcher
function switchNav(tabId, element) {
  const tabs = ['tab-ride', 'tab-passport', 'tab-map', 'tab-sos'];
  tabs.forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById(tabId).style.display = 'block';

  const items = document.querySelectorAll('.nav-item');
  items.forEach(item => item.classList.remove('active'));
  element.classList.add('active');
}

function updateVoice(message) {
  const el = document.getElementById('voice-text');
  if (el) el.innerText = `"${message}"`;
  speakVietnamese(message);
}

// Scenarios Simulator
function simulateScenario(type) {
  const pill = document.getElementById('behavior-pill');
  const text = document.getElementById('behavior-text');
  const tilt = document.getElementById('val-tilt');
  const speed = document.getElementById('val-speed');

  if (type === 'swerving') {
    pill.className = 'status-pill warning';
    text.innerText = 'Lạng Lách!';
    tilt.innerText = '24.8°';
    speed.innerText = '34.2';
    sdiScore = Math.max(70, sdiScore - 2);
    document.getElementById('sdi-score').innerText = sdiScore;
    lastViolationTime = Date.now();
    updateVoice("Cảnh báo: Bạn vừa lắc tay lái mạnh! Vui lòng đi chậm và giữ thẳng làn đường.");
  } else if (type === 'speedbump') {
    pill.className = 'status-pill';
    text.innerText = 'Gờ Giảm Tốc';
    tilt.innerText = '6.1°';
    speed.innerText = '16.0';
    updateVoice("Đã nhận diện gờ giảm tốc. Tốc độ an toàn.");
  } else if (type === 'pothole') {
    pill.className = 'status-pill';
    text.innerText = 'Sụp Ổ Gà!';
    tilt.innerText = '12.4°';
    speed.innerText = '28.5';
    lastViolationTime = Date.now();
    updateVoice("Đã phát hiện ổ gà mặt đường. Đang gửi tọa độ ẩn danh lên bản đồ cảnh báo.");
  } else if (type === 'crash') {
    pill.className = 'status-pill danger';
    text.innerText = 'Ngã Xe!';
    tilt.innerText = '78.5°';
    speed.innerText = '0.0';
    triggerSOS();
  }
}

function resetStatus() {
  const pill = document.getElementById('behavior-pill');
  const text = document.getElementById('behavior-text');
  pill.className = 'status-pill';
  text.innerText = 'Bình Thường';
  document.getElementById('val-tilt').innerText = isCalibrated ? `${baselineTilt.toFixed(1)}°` : '4.2°';
  document.getElementById('val-speed').innerText = '18.5';
  updateVoice("Hành trình an toàn. Cảm biến đang hoạt động tối ưu.");
}

// ==========================================
// Emergency SOS System & Custom Phone Setup
// ==========================================
function getEmergencyPhone() {
  return localStorage.getItem('eco_emergency_phone') || '0912.345.678';
}

function saveEmergencyPhone() {
  const input = document.getElementById('input-emergency-phone');
  if (!input) return;
  const raw = input.value.trim();
  const clean = raw.replace(/[^0-9+]/g, '');
  if (clean.length < 9 || clean.length > 12) {
    alert('Số điện thoại không hợp lệ! Vui lòng nhập từ 9 đến 11 chữ số.');
    return;
  }
  localStorage.setItem('eco_emergency_phone', clean);
  initEmergencyContactUI();
  updateVoice(`Đã lưu số điện thoại người thân: ${clean}. Hệ thống sẽ gọi số này khi có sự cố.`);
  const feedback = document.getElementById('phone-saved-feedback');
  if (feedback) {
    feedback.style.display = 'block';
    setTimeout(() => { feedback.style.display = 'none'; }, 4000);
  }
}

function initEmergencyContactUI() {
  const phone = getEmergencyPhone();
  const input = document.getElementById('input-emergency-phone');
  if (input) input.value = phone;

  const displayPhone = document.getElementById('display-saved-phone');
  if (displayPhone) displayPhone.innerText = phone;

  const listTarget = document.getElementById('list-target-phone');
  if (listTarget) listTarget.innerText = phone;

  const modalTarget = document.getElementById('modal-target-phone');
  if (modalTarget) modalTarget.innerText = phone;

  const testBtn = document.getElementById('btn-test-call');
  if (testBtn) testBtn.href = 'tel:' + phone;
}

function triggerSOS() {
  const modal = document.getElementById('sos-modal');
  modal.classList.add('active');
  sosSecondsLeft = 30;
  document.getElementById('sos-timer').innerText = sosSecondsLeft;
  
  const targetPhone = getEmergencyPhone();
  const modalPhone = document.getElementById('modal-target-phone');
  if (modalPhone) modalPhone.innerText = targetPhone;

  updateVoice(`CẢNH BÁO KHẨN CẤP: Phát hiện ngã xe bất thường! Bạn có ba mươi giây để bấm Tôi Ổn, trước khi hệ thống tự động gọi người thân theo số ${targetPhone}.`);

  if (sosTimer) clearInterval(sosTimer);
  sosTimer = setInterval(() => {
    sosSecondsLeft--;
    document.getElementById('sos-timer').innerText = sosSecondsLeft;
    if (sosSecondsLeft <= 0) {
      clearInterval(sosTimer);
      const phone = getEmergencyPhone();
      const clean = phone.replace(/[^0-9+]/g, '');
      updateVoice(`Hết ba mươi giây. Đang thực hiện cuộc gọi khẩn cấp tới người thân qua số ${clean}!`);
      try {
        window.location.href = 'tel:' + clean;
      } catch (e) {
        console.error('Trigger call tel: failed:', e);
      }
    }
  }, 1000);
}

function cancelSOS() {
  if (sosTimer) clearInterval(sosTimer);
  const modal = document.getElementById('sos-modal');
  modal.classList.remove('active');
  resetStatus();
  updateVoice("Đã hủy cảnh báo khẩn cấp. Rất mừng vì bạn vẫn an toàn!");
}

function claimReward(badgeName) {
  alert(`Chúc mừng bạn đã nhận thưởng huy hiệu: "${badgeName}"! Đã cộng thêm 50 Eco-Points vào hộ chiếu.`);
  ecoPoints += 50;
  document.getElementById('eco-points').innerText = ecoPoints;
  updateVoice(`Chúc mừng bạn đã nhận thêm năm mươi điểm xanh cho huy hiệu ${badgeName}!`);
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

async function startDataRecording() {
  if (!isRealSensorActive) {
    await startRealSensors();
  }
  isRecordingData = true;
  recordedBuffer = [];
  const btn = document.getElementById('btn-record-toggle');
  if (btn) {
    btn.innerText = '⏹️ Dừng Thu Thập';
    btn.style.background = '#ef4444';
  }
  const desc = document.getElementById('rec-status-desc');
  if (desc) {
    desc.innerText = '🔴 Đang ghi 50Hz... Hãy thực hiện động tác đi bộ hoặc đi xe!';
    desc.style.color = '#ef4444';
  }
  const expBtn = document.getElementById('btn-export-csv');
  if (expBtn) expBtn.disabled = true;
  updateVoice("Bắt đầu thu thập dữ liệu cảm biến thực tế ở tần số năm mươi héc.");
}

function stopDataRecording() {
  isRecordingData = false;
  const btn = document.getElementById('btn-record-toggle');
  if (btn) {
    btn.innerText = '🔴 Bắt Đầu Thu Mẫu';
    btn.style.background = '#8b5cf6';
  }
  const desc = document.getElementById('rec-status-desc');
  if (desc) {
    desc.innerText = `✅ Đã ghi nhận ${recordedBuffer.length} mẫu. Bấm "Xuất CSV" để tải về máy!`;
    desc.style.color = '#10b981';
  }
  const expBtn = document.getElementById('btn-export-csv');
  if (expBtn) expBtn.disabled = recordedBuffer.length === 0;
  updateVoice(`Đã dừng ghi. Tổng cộng thu được ${recordedBuffer.length} mẫu dữ liệu.`);
}

function exportRecordedCSV() {
  if (!recordedBuffer || recordedBuffer.length === 0) {
    alert('Chưa có mẫu dữ liệu nào để xuất!');
    return;
  }
  const headers = ['timestamp', 'ax', 'ay', 'az', 'total_acc', 'gyro_alpha', 'gyro_beta', 'gyro_gamma', 'tilt_deg', 'phone_orientation', 'activity_label'];
  let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
  recordedBuffer.forEach(row => {
    const line = [
      row.timestamp,
      row.ax,
      row.ay,
      row.az,
      row.total_acc,
      row.gyro_a,
      row.gyro_b,
      row.gyro_g,
      row.tilt,
      `"${row.orientation}"`,
      `"${row.activity}"`
    ].join(',');
    csvContent += line + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  const filename = `eco_motion_${document.getElementById('sel-motion-activity').value}_${document.getElementById('sel-phone-orient').value}_${Date.now()}.csv`;
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  updateVoice("Đã tải tệp dữ liệu cảm biến CSV thành công về thiết bị của bạn.");
}

// ==========================================
// Pocket Mode Engine (Màn hình đen OLED)
// ==========================================
async function enterPocketMode() {
  if (!isRealSensorActive) {
    await startRealSensors();
  }
  await enableWakeLock();
  startBgAudioKeepAlive();
  const overlay = document.getElementById('pocket-mode-overlay');
  if (overlay) overlay.style.display = 'flex';
  
  pocketSeconds = 0;
  const timerElem = document.getElementById('pocket-timer-display');
  if (timerElem) timerElem.innerText = '00:00';
  
  if (pocketTimerInterval) clearInterval(pocketTimerInterval);
  pocketTimerInterval = setInterval(() => {
    pocketSeconds++;
    const m = String(Math.floor(pocketSeconds / 60)).padStart(2, '0');
    const s = String(pocketSeconds % 60).padStart(2, '0');
    if (timerElem) timerElem.innerText = `${m}:${s}`;
  }, 1000);

  updateVoice("Đã kích hoạt chế độ bỏ túi màn hình đen. Cảm biến và âm thanh đang bảo vệ ngầm.");
}

function exitPocketMode() {
  if (pocketTimerInterval) {
    clearInterval(pocketTimerInterval);
    pocketTimerInterval = null;
  }
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
window.startAutoCalibration = startAutoCalibration;

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  initEmergencyContactUI();
});
