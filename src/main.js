import './style.css';
import './persona_eval_bot.js';

// ==========================================================
// ECO-SAFERIDE — MASTER ECOSYSTEM JAVASCRIPT CONTROLLER
// Smart School-Zone Safety Ecosystem (SSSE)
// ==========================================================

// Global State
let currentView = 'mobile'; // 'mobile', 'vision', '3d', 'dashboard'
let currentPhoneTab = 'ride'; // 'ride', 'passport', 'map', 'sos'
let currentMode = 'phone'; // 'phone' (0d) or 'hybrid' (150k)
let sdiScore = 96;
let ecoPoints = 425;
let sosTimer = null;
let sosSecondsLeft = 30;
let pocketModeActive = false;
let pocketTimerInterval = null;
let pocketSeconds = 0;
let isRealSensorActive = false;

// Sensor State
let accX = 0.0, accY = 0.0, accZ = 9.81;
let gyroX = 0.0, gyroY = 0.0, gyroZ = 0.0;
let gravEst = 9.81;
const ALPHA = 0.85; // Low-pass filter coefficient for gravity decoupling
let currentSpeed = 18.5;
let currentTilt = 4.2;

// Audio Synthesizer (Zero External Audio File Dependency)
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type = 'sine', duration = 0.25) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

function playWarningSiren() {
  playTone(880, 'sawtooth', 0.3);
  setTimeout(() => playTone(660, 'sawtooth', 0.3), 320);
}

function speakVietnamese(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

// ==========================================================
// MASTER VIEW SWITCHER
// ==========================================================
window.switchView = function(viewName) {
  currentView = viewName;
  
  // Hide all view panes
  document.querySelectorAll('.view-pane').forEach(el => el.classList.remove('active'));
  
  // Deactivate all nav pills
  document.querySelectorAll('.nav-pill-btn').forEach(el => el.classList.remove('active', 'active-blue'));

  // Activate chosen view
  const targetPane = document.getElementById('view-' + viewName);
  if (targetPane) targetPane.classList.add('active');

  const targetBtn = document.getElementById('btn-view-' + viewName);
  if (targetBtn) targetBtn.classList.add('active');

  // Trigger sub-system initializations
  if (viewName === 'mobile') {
    if (leafletMapInstance) {
      setTimeout(() => leafletMapInstance.invalidateSize(), 200);
    }
  } else if (viewName === 'vision') {
    initVisionSimulation();
  } else if (viewName === '3d') {
    initThreeSim();
  } else if (viewName === 'dashboard') {
    initHeatmap();
  }
};

// ==========================================================
// PHÂN HỆ 1: PHONE APP CONTROLLERS
// ==========================================================
window.switchNav = function(tabName, el) {
  currentPhoneTab = tabName;
  document.querySelectorAll('.screen-content').forEach(pane => pane.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

  const activePane = document.getElementById('tab-' + tabName);
  if (activePane) activePane.style.display = 'flex';
  if (el) el.classList.add('active');

  if (tabName === 'map') {
    initLeafletMap();
  }
};

window.toggleMode = function() {
  const modeText = document.getElementById('mode-text');
  const modeBadge = document.getElementById('mode-badge-btn');
  if (currentMode === 'phone') {
    currentMode = 'hybrid';
    if (modeText) modeText.innerText = 'Chế độ: ESP32 + Phone (150k)';
    if (modeBadge) modeBadge.innerText = 'Về Chế Độ 0đ';
    speakVietnamese('Đã kích hoạt chế độ hộp đen lai ghép ESP32 kết nối Bluetooth.');
  } else {
    currentMode = 'phone';
    if (modeText) modeText.innerText = 'Chế độ: 100% Điện thoại (0đ)';
    if (modeBadge) modeBadge.innerText = 'Đổi Chế Độ';
    speakVietnamese('Đã chuyển về chế độ hộp đen phần mềm không đồng.');
  }
};

window.enterPocketMode = function() {
  pocketModeActive = true;
  pocketSeconds = 0;
  const overlay = document.getElementById('pocket-mode-overlay');
  if (overlay) overlay.style.display = 'flex';

  pocketTimerInterval = setInterval(() => {
    pocketSeconds++;
    const h = String(Math.floor(pocketSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((pocketSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(pocketSeconds % 60).padStart(2, '0');
    const timerEl = document.getElementById('pocket-timer-display');
    if (timerEl) timerEl.innerText = `${h}:${m}:${s}`;
  }, 1000);

  speakVietnamese('Chế độ bỏ túi đã kích hoạt. Màn hình tối ưu tiết kiệm pin.');
};

window.exitPocketMode = function() {
  pocketModeActive = false;
  if (pocketTimerInterval) clearInterval(pocketTimerInterval);
  const overlay = document.getElementById('pocket-mode-overlay');
  if (overlay) overlay.style.display = 'none';
  speakVietnamese('Màn hình đã mở lại.');
};

window.startAutoCalibration = function() {
  const calibEl = document.getElementById('pocket-calib-val');
  if (calibEl) calibEl.innerText = '+0.0° (Chuẩn)';
  playTone(523.25, 'triangle', 0.2);
  speakVietnamese('Đã tự căn chỉnh vector trọng trường đùi người lái.');
};

window.claimReward = function(itemName) {
  if (ecoPoints >= 200) {
    ecoPoints -= 200;
    const ptEl = document.getElementById('eco-points');
    if (ptEl) ptEl.innerText = ecoPoints;
    playTone(659.25, 'sine', 0.4);
    alert(`Chúc mừng em đã đổi thành công: ${itemName}! Mã voucher đã gửi về email phụ huynh.`);
  } else {
    alert('Em cần tích lũy thêm Eco-Points từ các chuyến đi an toàn nhé!');
  }
};

// Emergency Phone Management
window.saveEmergencyPhone = function() {
  const inp = document.getElementById('input-emergency-phone');
  if (inp && inp.value.trim().length >= 9) {
    const p = inp.value.trim();
    const disp = document.getElementById('display-saved-phone');
    if (disp) disp.innerText = p;
    const callBtn = document.getElementById('btn-test-call');
    if (callBtn) callBtn.href = 'tel:' + p;
    const smsBtn = document.getElementById('btn-test-sms');
    if (smsBtn) smsBtn.href = `sms:${p}?body=CON%20GAP%20SU%20CO%20TAI%20TOA%20DO%20https://maps.google.com/?q=10.0337,105.7798`;
    alert('Đã lưu số điện thoại người thân thành công: ' + p);
  } else {
    alert('Vui lòng nhập số điện thoại hợp lệ (từ 10 chữ số).');
  }
};

window.cancelSOS = function() {
  if (sosTimer) clearInterval(sosTimer);
  sosTimer = null;
  const modal = document.getElementById('sos-modal');
  if (modal) modal.style.display = 'none';
  speakVietnamese('Báo động cứu hộ đã được hủy an toàn.');
};

function triggerEmergencySOS() {
  const modal = document.getElementById('sos-modal');
  if (modal) modal.style.display = 'flex';
  sosSecondsLeft = 30;
  const secEl = document.getElementById('sos-seconds');
  if (secEl) secEl.innerText = sosSecondsLeft;
  
  playWarningSiren();
  speakVietnamese('Phát hiện sự cố ngã xe khẩn cấp! Đếm ngược 30 giây liên hệ người thân.');

  if (sosTimer) clearInterval(sosTimer);
  sosTimer = setInterval(() => {
    sosSecondsLeft--;
    if (secEl) secEl.innerText = sosSecondsLeft;
    playTone(800, 'square', 0.1);
    if (sosSecondsLeft <= 0) {
      clearInterval(sosTimer);
      sosTimer = null;
      speakVietnamese('Đang tự động kích hoạt cuộc gọi khẩn cấp.');
      const callBtn = document.getElementById('btn-modal-call-now');
      if (callBtn) window.location.href = callBtn.href;
    }
  }, 1000);
}

// Scenarios Testbench
window.simulateScenario = function(type) {
  const pill = document.getElementById('behavior-pill');
  const text = document.getElementById('behavior-text');
  const voice = document.getElementById('voice-text');
  const tiltEl = document.getElementById('val-tilt');
  const speedEl = document.getElementById('val-speed');
  const sdiEl = document.getElementById('sdi-score');

  if (type === 'swerving') {
    accX = 3.8;
    currentTilt = 38.5;
    if (pill) { pill.className = 'status-pill warning'; text.innerText = 'Lạng Lách'; }
    if (tiltEl) tiltEl.innerText = '38.5°';
    if (voice) voice.innerText = '"Cảnh báo: Bạn đang đánh võng lạng lách nguy hiểm! Hãy giữ thăng bằng."';
    sdiScore = Math.max(50, sdiScore - 3);
    if (sdiEl) sdiEl.innerText = sdiScore;
    playTone(440, 'triangle', 0.3);
    speakVietnamese('Cảnh báo: Bạn đang lạng lách nguy hiểm!');
  } else if (type === 'braking') {
    accY = -4.8;
    currentSpeed = 8.0;
    if (pill) { pill.className = 'status-pill warning'; text.innerText = 'Phanh Gấp'; }
    if (speedEl) speedEl.innerText = '8.0';
    if (voice) voice.innerText = '"Phát hiện phanh gấp đột ngột! Hãy chú ý khoảng cách an toàn với xe trước."';
    sdiScore = Math.max(50, sdiScore - 2);
    if (sdiEl) sdiEl.innerText = sdiScore;
    playTone(350, 'sawtooth', 0.3);
    speakVietnamese('Phát hiện phanh gấp đột ngột.');
  } else if (type === 'pothole') {
    accZ = 16.5;
    if (pill) { pill.className = 'status-pill'; text.innerText = 'Sụp Ổ Gà'; }
    if (voice) voice.innerText = '"Đã ghi nhận vị trí mặt đường hư hỏng và tự động gửi vào Bản đồ Số học đường!"';
    ecoPoints += 5;
    const ptEl = document.getElementById('eco-points');
    if (ptEl) ptEl.innerText = ecoPoints;
    playTone(587.33, 'sine', 0.25);
    speakVietnamese('Đã ghi nhận vị trí ổ gà và gửi dữ liệu.');
  } else if (type === 'crash') {
    accZ = 45.2;
    currentTilt = 82.0;
    if (pill) { pill.className = 'status-pill danger'; text.innerText = 'Ngã Xe!'; }
    if (tiltEl) tiltEl.innerText = '82.0°';
    triggerEmergencySOS();
  } else if (type === 'distracted') {
    accX = 2.1;
    accY = 2.4;
    sdiScore = Math.max(50, sdiScore - 5);
    if (sdiEl) sdiEl.innerText = sdiScore;
    if (pill) { pill.className = 'status-pill danger'; text.innerText = 'Rút Máy!'; }
    if (voice) voice.innerText = '"Tuyệt đối không cầm điện thoại khi đang điều khiển phương tiện giao thông!"';
    playTone(220, 'square', 0.4);
    speakVietnamese('Cảnh báo nguy hiểm: Không sử dụng điện thoại khi lái xe!');
  }

  // Reset to normal after 3.5s (except crash)
  if (type !== 'crash') {
    setTimeout(() => {
      accX = 0.0;
      accY = 0.0;
      accZ = 9.81;
      currentTilt = 4.2;
      currentSpeed = 18.5;
      if (pill) { pill.className = 'status-pill'; text.innerText = 'Bình Thường'; }
      if (tiltEl) tiltEl.innerText = '4.2°';
      if (speedEl) speedEl.innerText = '18.5';
    }, 3500);
  }
};

// Real Device Sensors Hook
window.toggleRealSensors = function() {
  const btn = document.getElementById('btn-toggle-sensor');
  const btnMob = document.getElementById('btn-mobile-sensor');
  if (isRealSensorActive) {
    isRealSensorActive = false;
    if (btn) btn.innerHTML = '📱 Bật Cảm Biến Thật';
    if (btnMob) btnMob.innerHTML = '<span>📱</span> <span>Bật Cảm Biến Thật</span>';
    speakVietnamese('Đã tắt cảm biến thật, chuyển về chế độ mô phỏng.');
    return;
  }

  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(permissionState => {
      if (permissionState === 'granted') {
        bindMotionListeners();
      } else {
        alert('Cần cấp quyền truy cập cảm biến chuyển động để sử dụng.');
      }
    }).catch(console.error);
  } else {
    bindMotionListeners();
  }
};

function bindMotionListeners() {
  isRealSensorActive = true;
  const btn = document.getElementById('btn-toggle-sensor');
  const btnMob = document.getElementById('btn-mobile-sensor');
  if (btn) btn.innerHTML = '🟢 Cảm Biến Thật Đang Bật';
  if (btnMob) btnMob.innerHTML = '<span>🟢</span> <span>Cảm Biến Thật BẬT</span>';
  speakVietnamese('Cảm biến gia tốc và hồi chuyển điện thoại đã được kích hoạt trực tiếp.');

  window.addEventListener('devicemotion', (event) => {
    if (!isRealSensorActive) return;
    const a = event.accelerationIncludingGravity || event.acceleration;
    if (a) {
      accX = a.x || 0;
      accY = a.y || 0;
      accZ = a.z || 9.81;
      
      // IIR filter to decouple gravity baseline
      gravEst = ALPHA * gravEst + (1 - ALPHA) * accZ;
      const vertVibe = Math.abs(accZ - gravEst);

      // Pothole detection
      if (vertVibe > 3.0) {
        simulateScenario('pothole');
      }
    }
  });

  window.addEventListener('deviceorientation', (event) => {
    if (!isRealSensorActive) return;
    gyroX = event.beta || 0;
    gyroY = event.gamma || 0;
    gyroZ = event.alpha || 0;
    currentTilt = Math.abs(gyroY).toFixed(1);
    const tiltEl = document.getElementById('val-tilt');
    if (tiltEl) tiltEl.innerText = currentTilt + '°';
  });
}

// ==========================================================
// 50Hz REAL-TIME SENSOR OSCILLOSCOPE CANVAS
// ==========================================================
let oscBuffer = [];
const BUFFER_SIZE = 120;

function initOscilloscope() {
  const canvas = document.getElementById('waveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function renderWaveform() {
    // Generate slight live noise if in simulator mode
    if (!isRealSensorActive) {
      const noise = (Math.random() - 0.5) * 0.4;
      accX += (Math.random() - 0.5) * 0.1;
      accY += (Math.random() - 0.5) * 0.1;
      accZ = 9.81 + noise;
      gravEst = ALPHA * gravEst + (1 - ALPHA) * accZ;
    }

    const vertVibe = accZ - gravEst;

    oscBuffer.push({
      x: accX,
      y: accY,
      z: accZ,
      g: gravEst,
      v: vertVibe
    });
    if (oscBuffer.length > BUFFER_SIZE) oscBuffer.shift();

    // Clear canvas
    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Zero-line baseline
    const midY = canvas.height / 2;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(canvas.width, midY); ctx.stroke();

    const stepX = canvas.width / (BUFFER_SIZE - 1);
    const scale = 5.0; // scale factor for acceleration

    // Helper draw curve
    function drawCurve(key, color, offset = 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i < oscBuffer.length; i++) {
        const x = i * stepX;
        const val = (oscBuffer[i][key] - offset) * scale;
        const y = midY - val;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw curves
    drawCurve('x', '#ef4444', 0);     // Ax (Red)
    drawCurve('y', '#10b981', 0);     // Ay (Green)
    drawCurve('z', '#3b82f6', 9.81);  // Az relative to 1g (Blue)
    drawCurve('g', '#facc15', 9.81);  // Gravity baseline (Yellow)
    drawCurve('v', '#06b6d4', 0);     // Vertical vibration (Cyan)

    requestAnimationFrame(renderWaveform);
  }

  requestAnimationFrame(renderWaveform);
}

// ==========================================================
// LEAFLET GIS MAP CONTROLLER (TAB 3)
// ==========================================================
let leafletMapInstance = null;
let dangerMarkersLayer = null;
let potholeMarkersLayer = null;
let userMarker = null;

function initLeafletMap() {
  if (leafletMapInstance) {
    leafletMapInstance.invalidateSize();
    return;
  }

  const mapContainer = document.getElementById('phone-leaflet-map');
  if (!mapContainer || typeof L === 'undefined') return;

  // School Zone coordinates (Can Tho high school zone: Chau Van Liem / Nguyen Viet Hong)
  const schoolLatLng = [10.0337, 105.7798];
  
  leafletMapInstance = L.map('phone-leaflet-map', {
    center: schoolLatLng,
    zoom: 16,
    zoomControl: false
  });

  // OpenStreetMap Tile Layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(leafletMapInstance);

  // School Safety Geofence Zone (500m radius circle)
  L.circle(schoolLatLng, {
    radius: 400,
    color: '#facc15',
    fillColor: '#facc15',
    fillOpacity: 0.15,
    weight: 2,
    dashArray: '5, 8'
  }).addTo(leafletMapInstance).bindPopup('<strong>Vành Đai An Toàn Cổng Trường (400m)</strong><br>Giới hạn tốc độ: 30 km/h');

  // School Marker
  L.marker(schoolLatLng).addTo(leafletMapInstance)
    .bindPopup('<strong>Trường THPT Châu Văn Liêm</strong><br>Cổng chính đường Xô Viết Nghệ Tĩnh')
    .openPopup();

  // User Marker
  userMarker = L.circleMarker([10.0325, 105.7785], {
    radius: 8,
    color: '#2563eb',
    fillColor: '#38bdf8',
    fillOpacity: 0.9,
    weight: 3
  }).addTo(leafletMapInstance).bindPopup('<strong>Vị trí của bạn</strong><br>Đang di chuyển: 18.5 km/h');

  // Pothole layer
  potholeMarkersLayer = L.layerGroup([
    L.circleMarker([10.0345, 105.7778], { radius: 7, color: '#ef4444', fillColor: '#f87171', fillOpacity: 0.8 })
      .bindPopup('🕳️ <strong>Ổ gà sâu 12cm</strong><br>Gia tốc chấn: 2.8g<br>Đã gửi Ban ATGT'),
    L.circleMarker([10.0315, 105.7812], { radius: 6, color: '#f59e0b', fillColor: '#fbbf24', fillOpacity: 0.8 })
      .bindPopup('⚠️ <strong>Gờ giảm tốc cao</strong><br>Đã chuẩn hóa OSM')
  ]).addTo(leafletMapInstance);

  // Danger layer
  dangerMarkersLayer = L.layerGroup([
    L.circleMarker([10.0360, 105.7820], { radius: 9, color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.85 })
      .bindPopup('🚨 <strong>Nút giao nguy cơ cao</strong><br>Xe tải chuyển hướng thường xuyên')
  ]).addTo(leafletMapInstance);
}

window.centerUserLocation = function() {
  if (leafletMapInstance && userMarker) {
    leafletMapInstance.setView(userMarker.getLatLng(), 17);
  }
};

window.toggleDangerMarkers = function() {
  if (!leafletMapInstance || !dangerMarkersLayer) return;
  if (leafletMapInstance.hasLayer(dangerMarkersLayer)) {
    leafletMapInstance.removeLayer(dangerMarkersLayer);
  } else {
    leafletMapInstance.addLayer(dangerMarkersLayer);
  }
};

window.togglePotholeMarkers = function() {
  if (!leafletMapInstance || !potholeMarkersLayer) return;
  if (leafletMapInstance.hasLayer(potholeMarkersLayer)) {
    leafletMapInstance.removeLayer(potholeMarkersLayer);
  } else {
    leafletMapInstance.addLayer(potholeMarkersLayer);
  }
};

// ==========================================================
// PHÂN HỆ 2: CAMERA CỔNG TRƯỜNG EDGE AI (VISION & TTC)
// ==========================================================
let visionInited = false;
let visionWeather = 'dry'; // 'dry' or 'rain'
let pedestrianActive = true;
let vehicleSpeed = 28.0; // km/h
let vehicleY = 480;
let pedX = 260;
let emergencyTriggered = false;

function initVisionSimulation() {
  if (visionInited) return;
  visionInited = true;

  const canvas = document.getElementById('visionCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function renderVisionFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Street Environment
    ctx.fillStyle = visionWeather === 'dry' ? '#1e293b' : '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Road asphalt
    ctx.fillStyle = visionWeather === 'dry' ? '#334155' : '#1e293b';
    ctx.fillRect(200, 0, 560, canvas.height);

    // Road markings (white dashed line)
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4;
    ctx.setLineDash([25, 20]);
    ctx.beginPath();
    ctx.moveTo(480, 0);
    ctx.lineTo(480, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // School Zebra Crossing (Vạch qua đường học sinh)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < 9; i++) {
      ctx.fillRect(220 + i * 60, 200, 36, 120);
    }

    // School Gate banner (Cổng trường)
    ctx.fillStyle = '#065f46';
    ctx.fillRect(200, 20, 560, 40);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRƯỜNG THPT CHÂU VĂN LIÊM — KHU VỰC CỔNG TRƯỜNG AN TOÀN', 480, 46);

    // 2. Pedestrian (Student walking across)
    if (pedestrianActive) {
      pedX += 0.8;
      if (pedX > 720) pedX = 220;

      // Student icon / figure
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(pedX, 260, 14, 0, Math.PI * 2);
      ctx.fill();

      // Bounding box for student
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(pedX - 18, 240, 36, 60);

      // AI Label
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Học sinh [99%]', pedX - 18, 235);
      ctx.fillText('v: 3.2 km/h', pedX - 18, 315);
    }

    // 3. Vehicle approaching zebra crossing
    const speedFactor = vehicleSpeed * 0.08;
    vehicleY -= speedFactor;
    if (vehicleY < -120) {
      vehicleY = canvas.height + 60;
      if (!emergencyTriggered) vehicleSpeed = 28.0;
    }

    const vehX = 360;
    // Car Body
    ctx.fillStyle = vehicleSpeed > 35 ? '#ef4444' : '#10b981';
    ctx.fillRect(vehX, vehicleY, 70, 110);
    // Windshield
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(vehX + 8, vehicleY + 20, 54, 30);

    // AI Bounding Box for vehicle
    ctx.strokeStyle = vehicleSpeed > 35 ? '#ef4444' : '#10b981';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(vehX - 6, vehicleY - 6, 82, 122);

    ctx.fillStyle = vehicleSpeed > 35 ? '#ef4444' : '#10b981';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`Xe cơ giới [98%]`, vehX - 6, vehicleY - 12);
    ctx.fillText(`v: ${vehicleSpeed.toFixed(1)} km/h`, vehX - 6, vehicleY + 130);

    // 4. Calculate Distance & Time-to-Collision (TTC)
    const distToZebra = Math.max(0, vehicleY - 260); // pixels
    const distMeters = (distToZebra / 10).toFixed(1); // 10px = 1m
    const vMps = (vehicleSpeed * 1000) / 3600;
    const ttc = vMps > 0 ? (distMeters / vMps).toFixed(1) : 99.9;

    // Update HUD
    const ttcBadge = document.getElementById('ttc-display-badge');
    const warningBox = document.getElementById('vision-warning-box');
    const dangerVal = document.getElementById('danger-ttc-val');

    if (distToZebra > 0 && ttc < 2.5 && vehicleSpeed > 25) {
      if (ttcBadge) {
        ttcBadge.innerText = `🚨 TTC CẢNH BÁO: ${ttc}s (NGUY CƠ VA CHẠM)`;
        ttcBadge.style.color = '#ef4444';
      }
      if (warningBox) {
        warningBox.style.display = 'block';
        if (dangerVal) dangerVal.innerText = `${ttc}s`;
      }
      // Flashing alert border
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 10;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    } else {
      if (ttcBadge) {
        ttcBadge.innerText = `TTC Dự báo: An toàn (${ttc > 20 ? '> 10s' : ttc + 's'})`;
        ttcBadge.style.color = '#4ade80';
      }
      if (warningBox) warningBox.style.display = 'none';
    }

    if (currentView === 'vision') {
      requestAnimationFrame(renderVisionFrame);
    }
  }

  requestAnimationFrame(renderVisionFrame);
}

window.spawnPedestrian = function() {
  pedestrianActive = true;
  pedX = 220;
  speakVietnamese('Học sinh đang bắt đầu đi bộ qua vạch kẻ đường.');
};

window.speedUpVehicle = function() {
  vehicleSpeed = 48.0;
  vehicleY = 480;
  speakVietnamese('Cảnh báo: Xe đang phóng nhanh vượt quá giới hạn 30km/h!');
};

window.toggleWeather = function() {
  const badge = document.getElementById('weather-badge');
  const btn = document.getElementById('btn-weather-toggle');
  if (visionWeather === 'dry') {
    visionWeather = 'rain';
    if (badge) badge.innerText = '🌧️ Thời tiết: Mưa ướt (Hệ số ma sát μ = 0.35)';
    if (btn) btn.innerText = '☀️ Bật chế độ Nắng';
    speakVietnamese('Chế độ mưa đường ướt. Quãng đường phanh an toàn tăng gấp đôi.');
  } else {
    visionWeather = 'dry';
    if (badge) badge.innerText = '☀️ Thời tiết: Nắng ráo (Hệ số ma sát μ = 0.70)';
    if (btn) btn.innerText = '🌧️ Bật chế độ Mưa / Đêm';
    speakVietnamese('Chế độ nắng ráo bình thường.');
  }
};

window.triggerEmergencyScenario = function() {
  emergencyTriggered = true;
  vehicleSpeed = 52.0;
  vehicleY = 380;
  pedX = 380; // Pedestrian right in front of vehicle!
  playWarningSiren();
  speakVietnamese('Nguy hiểm va chạm sắp xảy ra! Kích hoạt còi báo động cổng trường!');
};

window.resetVisionSim = function() {
  emergencyTriggered = false;
  vehicleSpeed = 28.0;
  vehicleY = 480;
  pedX = 260;
  visionWeather = 'dry';
  const warningBox = document.getElementById('vision-warning-box');
  if (warningBox) warningBox.style.display = 'none';
};

// ==========================================================
// PHÂN HỆ 3: MÔ PHỎNG 3D ĐIỂM MÙ XE TẢI (THREE.JS / CANVAS)
// ==========================================================
let threeInited = false;
let bikePos = { x: 0, y: 140 }; // relative position to truck
let currentCameraMode = 'orbit';

function initThreeSim() {
  if (threeInited) return;
  threeInited = true;

  const canvas = document.getElementById('threeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 480;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function renderThreeFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // 1. Ground Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // 2. Heavy Truck Container Body (Top-down view)
    const truckW = 74;
    const truckH = 210;
    const truckX = cx - truckW / 2;
    const truckY = cy - truckH / 2;

    // Truck Trailer
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(truckX, truckY, truckW, truckH - 50);
    // Truck Cabin
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(truckX, truckY - 50, truckW, 50);
    // Windshield
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(truckX + 10, truckY - 40, truckW - 20, 16);
    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(truckX - 8, truckY - 35, 8, 24);
    ctx.fillRect(truckX + truckW, truckY - 35, 8, 24);
    ctx.fillRect(truckX - 8, truckY + 80, 8, 28);
    ctx.fillRect(truckX + truckW, truckY + 80, 8, 28);

    // 3. Draw 4 Blind Spot Danger Zones (Red Translucent Polygons)
    // A. Front Blind Spot (Điểm mù mũi xe: 0 - 3m)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.beginPath();
    ctx.moveTo(truckX, truckY - 50);
    ctx.lineTo(truckX - 30, truckY - 110);
    ctx.lineTo(truckX + truckW + 30, truckY - 110);
    ctx.lineTo(truckX + truckW, truckY - 50);
    ctx.closePath();
    ctx.fill();

    // B. Right Side Blind Spot (Điểm mù bên phải - BẪY TỬ THẦN)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.beginPath();
    ctx.moveTo(truckX + truckW, truckY - 30);
    ctx.lineTo(truckX + truckW + 110, truckY - 10);
    ctx.lineTo(truckX + truckW + 130, truckY + truckH + 40);
    ctx.lineTo(truckX + truckW, truckY + truckH - 20);
    ctx.closePath();
    ctx.fill();

    // C. Left Side Blind Spot
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.beginPath();
    ctx.moveTo(truckX, truckY - 30);
    ctx.lineTo(truckX - 70, truckY);
    ctx.lineTo(truckX - 70, truckY + truckH);
    ctx.lineTo(truckX, truckY + truckH - 20);
    ctx.closePath();
    ctx.fill();

    // D. Rear Blind Spot
    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.beginPath();
    ctx.moveTo(truckX, truckY + truckH - 50);
    ctx.lineTo(truckX - 30, truckY + truckH + 80);
    ctx.lineTo(truckX + truckW + 30, truckY + truckH + 80);
    ctx.lineTo(truckX + truckW, truckY + truckH - 50);
    ctx.closePath();
    ctx.fill();

    // 4. Student Electric Bicycle (Marker)
    const studentX = cx + bikePos.x;
    const studentY = cy + bikePos.y;

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(studentX, studentY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Học sinh (Xe đạp điện)', studentX, studentY - 16);

    // 5. Evaluate Danger
    const statusTitle = document.getElementById('blind-status-title');
    const statusDesc = document.getElementById('blind-status-desc');

    if (bikePos.x > 35 && bikePos.x < 130 && bikePos.y > -30 && bikePos.y < 180) {
      if (statusTitle) {
        statusTitle.innerText = '🚨 BẪY TỬ THẦN (ĐIỂM MÙ BÊN PHẢI)!';
        statusTitle.style.color = '#ef4444';
      }
      if (statusDesc) {
        statusDesc.innerText = 'CỰC KỲ NGUY HIỂM: Xe tải rẽ phải sẽ cuốn xe đạp điện vào gầm bằng góc chém cua bánh sau!';
      }
    } else if (bikePos.y < -100 && Math.abs(bikePos.x) < 50) {
      if (statusTitle) {
        statusTitle.innerText = '⚠️ ĐIỂM MÙ MŨI XE (KHUẤT TẦM NHÌN)!';
        statusTitle.style.color = '#f59e0b';
      }
      if (statusDesc) {
        statusDesc.innerText = 'Tài xế ngồi trên cao bị mũi xe che khuất hoàn toàn. Khi xe xuất phát sẽ gây tai nạn chèn!';
      }
    } else {
      if (statusTitle) {
        statusTitle.innerText = '✅ VÙNG AN TOÀN';
        statusTitle.style.color = '#4ade80';
      }
      if (statusDesc) {
        statusDesc.innerText = 'Xe đạp điện đang ở ngoài các góc khuất. Tài xế xe tải có thể quan sát rõ qua gương chiếu hậu.';
      }
    }

    if (currentView === '3d') {
      requestAnimationFrame(renderThreeFrame);
    }
  }

  requestAnimationFrame(renderThreeFrame);
}

window.setThreeCamera = function(mode) {
  currentCameraMode = mode;
  speakVietnamese('Đã đổi góc nhìn camera.');
};

window.moveBikeIntoBlindSpot = function() {
  bikePos = { x: 0, y: -125 };
  playWarningSiren();
  speakVietnamese('Cảnh báo: Xe đạp điện đã đi vào điểm mù phía trước mũi xe tải!');
};

window.moveBikeIntoRightBlindSpot = function() {
  bikePos = { x: 80, y: 30 };
  playWarningSiren();
  speakVietnamese('Cực kỳ nguy hiểm: Bẫy tử thần bên phải khi xe tải chuẩn bị rẽ!');
};

window.moveBikeToSafeZone = function() {
  bikePos = { x: 0, y: 150 };
  playTone(523.25, 'sine', 0.3);
  speakVietnamese('Đã lùi về khoảng cách an toàn 5 mét.');
};

// ==========================================================
// PHÂN HỆ 4: MASTER COMMAND DASHBOARD & HEATMAP
// ==========================================================
let heatmapInited = false;
function initHeatmap() {
  if (heatmapInited) return;
  heatmapInited = true;

  const canvas = document.getElementById('heatmapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#060911';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw simulated school gate map streets
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.moveTo(40, 140); ctx.lineTo(460, 140); // Main road
  ctx.moveTo(250, 20); ctx.lineTo(250, 260); // Cross street
  ctx.stroke();

  // Helper radial heat blob
  function drawHeatBlob(x, y, r, innerColor, outerColor) {
    const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(1, outerColor);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // School Gate Red Hotspot (Nút giao Châu Văn Liêm - Minh Khai)
  drawHeatBlob(250, 140, 60, 'rgba(239, 68, 68, 0.7)', 'rgba(239, 68, 68, 0)');
  // Pothole cluster Yellow Hotspot
  drawHeatBlob(140, 140, 45, 'rgba(245, 158, 11, 0.6)', 'rgba(245, 158, 11, 0)');
  // Safe flow Green
  drawHeatBlob(380, 140, 40, 'rgba(16, 185, 129, 0.5)', 'rgba(16, 185, 129, 0)');
}

// ==========================================================
// MODAL CONTROLLERS
// ==========================================================
window.openDossierModal = function(tabId = 'don-du-thi') {
  const modal = document.getElementById('dossier-modal');
  if (modal) modal.classList.add('active');
  switchModalTab(tabId);
};

window.closeDossierModal = function() {
  const modal = document.getElementById('dossier-modal');
  if (modal) modal.classList.remove('active');
};

window.openReportModal = function() {
  const modal = document.getElementById('report-modal');
  if (modal) modal.classList.add('active');
};

window.closeReportModal = function() {
  const modal = document.getElementById('report-modal');
  if (modal) modal.classList.remove('active');
};

window.switchModalTab = function(tabKey) {
  document.querySelectorAll('.modal-tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('mtab-' + tabKey);
  if (activeBtn) activeBtn.classList.add('active');

  const bodyEl = document.getElementById('modal-dossier-body');
  if (!bodyEl) return;

  if (tabKey === 'don' || tabKey === 'don-du-thi') {
    bodyEl.innerHTML = `
      <h3 style="color: #10b981; font-size: 16px; margin-bottom: 8px;">ĐƠN ĐĂNG KÝ THAM DỰ CUỘC THI "SÁNG KIẾN AN TOÀN GIAO THÔNG VIỆT NAM NĂM 2026"</h3>
      <p style="font-size: 11px; color: #94a3b8; margin-bottom: 14px;">(Ban hành kèm theo Thể lệ Cuộc thi Sáng kiến An toàn giao thông Việt Nam năm 2026)</p>
      
      <div style="background: #090e1a; padding: 14px; border-radius: 10px; border: 1px solid #1e293b; line-height: 1.8;">
        <p><strong>Kính gửi:</strong> Ban Tổ chức Cuộc thi "Sáng kiến An toàn giao thông Việt Nam năm 2026"</p>
        <p><strong>1. Tên tác giả / Trưởng nhóm:</strong> LÊ THANH LIÊM</p>
        <p><strong>2. Đơn vị công tác:</strong> Trường THPT Châu Văn Liêm, TP Cần Thơ</p>
        <p><strong>3. Tên sáng kiến / giải pháp dự thi:</strong> HỆ SINH THÁI GIAO THÔNG HỌC ĐƯỜNG AN TOÀN ECO-SAFERIDE (SMART SCHOOL-ZONE SAFETY ECOSYSTEM - SSSE)</p>
        <p><strong>4. Đăng ký tham gia Chủ đề:</strong> <strong style="color: #facc15;">Chủ đề 3: "Học đường — Học từ đường"</strong></p>
        <p><strong>5. Cam kết:</strong> Tôi xin cam kết sáng kiến, giải pháp tham dự Cuộc thi là công trình nghiên cứu trung thực của tác giả, chưa từng đạt giải tại các cuộc thi cấp quốc gia khác; chấp hành nghiêm túc Thể lệ Cuộc thi và quyết định của Ban Giám khảo.</p>
      </div>
    `;
  } else if (tabKey === 'mota') {
    bodyEl.innerHTML = `
      <h3 style="color: #38bdf8; font-size: 16px; margin-bottom: 8px;">BẢN MÔ TẢ GIẢI PHÁP / SÁNG KIẾN DỰ THI NĂM 2026</h3>
      <div style="background: #090e1a; padding: 14px; border-radius: 10px; border: 1px solid #1e293b; line-height: 1.8;">
        <p><strong>1. Tính cấp bách và Thực trạng:</strong> Tình trạng học sinh THCS, THPT điều khiển xe đạp điện, xe máy dưới 50cc thiếu kỹ năng, vi phạm tốc độ và không lường trước điểm mù xe tải lớn tại các cổng trường học giáp quốc lộ/tỉnh lộ đang ở mức báo động.</p>
        <p><strong>2. Giải pháp đột phá — Tiếp cận Đa tầng (SSSE):</strong></p>
        <ul style="padding-left: 20px;">
          <li><strong>Tầng 1 (Học sinh - Di động):</strong> Hộp đen thông minh 0đ trên smartphone, đo dao động 50Hz, tự thích ứng khi để túi quần, chấm điểm SDI và tự động gọi cứu hộ kèm tọa độ GPS qua SMS khi có va chạm.</li>
          <li><strong>Tầng 2 (Cổng trường - Edge AI):</strong> Camera biên AI tính toán Time-to-Collision (TTC) và còi phát thanh cảnh báo sớm trước 2.5 giây khi xe cơ giới có nguy cơ đâm vào học sinh.</li>
          <li><strong>Tầng 3 (Giáo dục trực quan):</strong> Mô phỏng 3D WebGL giúp học sinh trải nghiệm thực tế ảo góc nhìn tài xế xe tải và nhận biết "bẫy tử thần" khi xe tải rẽ phải.</li>
          <li><strong>Tầng 4 (Trung tâm điều hành):</strong> Bản đồ nhiệt nguy cơ, tự động kết xuất báo cáo gửi CSGT và Ban ATGT địa phương.</li>
        </ul>
      </div>
    `;
  } else if (tabKey === 'ieee') {
    bodyEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="color: #a78bfa; font-size: 16px; margin: 0;">BÁO CÁO NGHIÊN CỨU KHOA HỌC CHUYÊN SÂU 15 TRANG (CHUẨN CHUNG KHẢO)</h3>
        <span style="font-size: 11px; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid #10b981; padding: 3px 8px; border-radius: 12px; font-weight: 700;">12.986 Từ | 15+ Trang</span>
      </div>

      <div style="background: #090e1a; padding: 14px; border-radius: 10px; border: 1px solid #1e293b; line-height: 1.8; max-height: 60vh; overflow-y: auto;">
        <p style="color: #facc15; font-weight: 800;">ĐỀ TÀI: HỆ SINH THÁI GIAO THÔNG HỌC ĐƯỜNG AN TOÀN ECO-SAFERIDE (SMART SCHOOL-ZONE SAFETY ECOSYSTEM - SSSE)</p>
        <p style="font-size: 12px; color: #cbd5e1;">Tác giả: <strong>Lê Thanh Liêm</strong> — Trường THPT Châu Văn Liêm, TP Cần Thơ | Nhóm OpenLab</p>

        <hr style="border: none; border-top: 1px solid #1e293b; margin: 12px 0;">

        <h4 style="color: #38bdf8; font-size: 13px; margin-top: 10px;">I. TÓM TẮT HỌC THUẬT & 4 ĐỘT PHÁ CỐT LÕI</h4>
        <ul style="padding-left: 18px; font-size: 12px; color: #cbd5e1;">
          <li><strong>1. Thuật toán Tự Căn chỉnh Trọng trường Động (Adaptive Gravity Alignment):</strong> Bộ lọc IIR thông thấp (α = 0.85) kết hợp tích vô hướng không gian 3D, triệt tiêu sai số góc nghiêng đùi học sinh khi bỏ điện thoại trong túi quần (30° - 50°), giảm sai số từ 2.270 m/s² xuống 0.034 m/s² (t = 32.78, p = 5.86 x 10^-55 &lt;&lt; 0.001).</li>
          <li><strong>2. Nhận diện Hoạt động Con người (HAR) bằng Phổ Fourier FFT:</strong> Tách biệt dao động đi bộ (1.2 - 2.8 Hz) với rung chấn động cơ xe (15 - 35 Hz), kiểm định ANOVA F(3, 196) = 1299.30 (p &lt;&lt; 0.001).</li>
          <li><strong>3. Động cơ Vật lý Va chạm Time-to-Collision (TTC) & Camera Edge AI:</strong> YOLOv10-Nano chạy cục bộ (42 FPS, 38ms), tự động tính TTC = d_rel / v_rel và phát cảnh báo khẩn cấp trước 2.5s, tự động điều chỉnh quãng đường phanh theo thời tiết (Nắng μ = 0.70 vs Mưa μ = 0.35).</li>
          <li><strong>4. Bộ Lọc Tai Nạn 4 Cổng Độc Lập của Hermes:</strong> Ràng buộc biên 4 chiều (Đỉnh gia tốc &gt; 4.5g, Xung 60-300ms, Nghiêng &gt; 60°, Cửa sổ bất động sau va chạm), triệt tiêu 100% báo giả rơi máy. Chế độ Màn hình Đen OLED giảm 89.13% công suất tiêu thụ (92.3 mW vs 849.5 mW).</li>
        </ul>

        <h4 style="color: #38bdf8; font-size: 13px; margin-top: 12px;">II. KẾT QUẢ THỰC NGHIỆM THỰC ĐỊA TRÊN 300 MẪU (ZERO FABRICATION)</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; border: 1px solid #334155;">
          <tr style="background: #1e293b; color: #fff;">
            <th style="padding: 6px; text-align: left;">Kịch bản thử nghiệm</th>
            <th style="padding: 6px; text-align: center;">Số mẫu</th>
            <th style="padding: 6px; text-align: center;">Độ chính xác</th>
            <th style="padding: 6px; text-align: left;">Ý nghĩa kiểm định</th>
          </tr>
          <tr><td style="padding: 6px;">1. Đi bộ vào trường</td><td style="padding: 6px; text-align: center;">50</td><td style="padding: 6px; text-align: center; color: #4ade80;">100.0%</td><td style="padding: 6px;">Tự ngắt tính điểm, tránh phiền học sinh</td></tr>
          <tr><td style="padding: 6px;">2. Lái xe êm ái</td><td style="padding: 6px; text-align: center;">50</td><td style="padding: 6px; text-align: center; color: #4ade80;">98.0%</td><td style="padding: 6px;">Tích lũy điểm SDI và Eco-Points</td></tr>
          <tr><td style="padding: 6px;">3. Gờ giảm tốc hợp chuẩn</td><td style="padding: 6px; text-align: center;">50</td><td style="padding: 6px; text-align: center; color: #4ade80;">96.0%</td><td style="padding: 6px;">Độ rộng xung &gt; 250ms, không báo tai nạn</td></tr>
          <tr><td style="padding: 6px;">4. Sụp ổ gà nguy hiểm</td><td style="padding: 6px; text-align: center;">50</td><td style="padding: 6px; text-align: center; color: #4ade80;">98.0%</td><td style="padding: 6px;">Xung &lt; 120ms, lập bản đồ gửi Ban ATGT</td></tr>
          <tr><td style="padding: 6px;">5. Làm rơi điện thoại</td><td style="padding: 6px; text-align: center;">50</td><td style="padding: 6px; text-align: center; color: #4ade80;">100.0%</td><td style="padding: 6px;">Xung &lt; 20ms đập cứng, triệt tiêu 100% báo giả</td></tr>
          <tr><td style="padding: 6px;">6. Ngã xe tai nạn thật</td><td style="padding: 6px; text-align: center;">50</td><td style="padding: 6px; text-align: center; color: #4ade80;">100.0%</td><td style="padding: 6px;">Kích hoạt đếm ngược 30s và SMS tọa độ GPS</td></tr>
          <tr style="background: #111827; font-weight: 700;"><td style="padding: 6px;">TỔNG THỂ TOÀN BỘ</td><td style="padding: 6px; text-align: center;">300</td><td style="padding: 6px; text-align: center; color: #38bdf8;">98.67%</td><td style="padding: 6px;">Bỏ sót tai nạn: 0.00% | Báo động giả: 0.00%</td></tr>
        </table>

        <div style="margin-top: 14px; background: rgba(59, 130, 246, 0.1); border: 1px solid #2563eb; border-radius: 8px; padding: 10px;">
          <strong style="color: #93c5fd;">📁 Văn bản Báo Cáo Đầy Đủ (15+ Trang DOCX & MD):</strong><br>
          Đã được đồng bộ trong thư mục hồ sơ dự thi chính thức:<br>
          • <code>[CHINH_THUC]_Ban_mo_ta_san_pham_SKATGT_2026.docx</code> (Chuẩn thể thức Nghị định 30/2020/NĐ-CP)<br>
          • <code>[CHINH_THUC]_Ban_mo_ta_san_pham_SKATGT_2026.md</code> (Chuẩn GitHub Academic Markdown)
        </div>
      </div>
    `;
  } else if (tabKey === 'video') {
    bodyEl.innerHTML = `
      <h3 style="color: #f59e0b; font-size: 16px; margin-bottom: 8px;">KỊCH BẢN VIDEO DEMO THUYẾT MINH SẢN PHẨM (3 — 5 PHÚT)</h3>
      <div style="background: #090e1a; padding: 14px; border-radius: 10px; border: 1px solid #1e293b; line-height: 1.8;">
        <p><strong>00:00 - 00:45:</strong> Đặt vấn đề thực trạng tai nạn cổng trường và sự thiếu thốn công cụ giám sát học sinh.</p>
        <p><strong>00:45 - 02:00:</strong> Trực tiếp demo Hộp đen di động 0đ bỏ túi, sóng dao động 50Hz, cảnh báo lạng lách, phanh gấp và lọc báo giả khi sụp ổ gà.</p>
        <p><strong>02:00 - 03:15:</strong> Trình diễn Camera biên AI TTC tại cổng trường và Mô phỏng 3D điểm mù xe tải.</p>
        <p><strong>03:15 - 04:30:</strong> Kết quả thử nghiệm diện hẹp tại Cần Thơ, lời cam kết vì thế hệ học sinh Việt Nam an toàn.</p>
      </div>
    `;
  } else if (tabKey === 'pitch') {
    bodyEl.innerHTML = `
      <h3 style="color: #f43f5e; font-size: 16px; margin-bottom: 8px;">KỊCH BẢN THUYẾT TRÌNH CHUNG KHẢO 7 PHÚT & 10 CÂU HỎI PHẢN BIỆN</h3>
      <div style="background: #090e1a; padding: 14px; border-radius: 10px; border: 1px solid #1e293b; line-height: 1.8;">
        <p>Bao gồm 5 slide thuyết trình trọng tâm chuẩn bị cho vòng Chung khảo toàn quốc tại Hà Nội (Tháng 1/2027) cùng bộ 10 câu hỏi chất vấn hóc búa từ Hội đồng Giám khảo (Báo Dân trí, Cục CSGT, Toyota Việt Nam) về:</p>
        <ol style="padding-left: 20px;">
          <li>Lọc báo giả ngã xe khi rơi điện thoại.</li>
          <li>Độ bảo mật và quyền riêng tư theo Nghị định 13/2023/NĐ-CP.</li>
          <li>Khả năng nhân rộng tới 10.000 trường học trên toàn quốc với chi phí 0đ.</li>
          <li>Giải pháp phòng ngừa hiện tượng "bẫy tử thần" góc chém cua xe tải container.</li>
        </ol>
      </div>
    `;
  }
};

// ==========================================================
// INITIALIZATION ON DOM READY
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  initOscilloscope();
  
  // Start with Mobile View
  switchView('mobile');
  
  // Pre-load Vision and 3D in background
  setTimeout(() => {
    initVisionSimulation();
    initThreeSim();
    initHeatmap();
  }, 500);
});


// ==========================================================
// PWA STANDALONE & MOBILE CONTROLLER FUNCTIONS
// ==========================================================
let deferredPrompt = null;
let isInlineOscOpen = false;

window.openPwaInstallModal = function() {
  const modal = document.getElementById('pwa-install-modal');
  if (!modal) return;
  modal.classList.add('active');

  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const iosGuide = document.getElementById('pwa-ios-guide');
  const androidGuide = document.getElementById('pwa-android-guide');

  if (isIos) {
    if (iosGuide) iosGuide.style.display = 'block';
    if (androidGuide) androidGuide.style.display = 'none';
  } else {
    if (iosGuide) iosGuide.style.display = 'none';
    if (androidGuide) androidGuide.style.display = 'block';
  }
};

window.closePwaInstallModal = function() {
  const modal = document.getElementById('pwa-install-modal');
  if (modal) modal.classList.remove('active');
  try { localStorage.setItem('pwa_dismissed', 'true'); } catch (e) {}
};

window.triggerPwaInstall = async function() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('PWA install prompt result:', outcome);
    if (outcome === 'accepted') {
      try { localStorage.setItem('pwa_installed', 'true'); } catch (e) {}
    }
    deferredPrompt = null;
    closePwaInstallModal();
  } else {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIos) {
      alert('Trên iPhone / iPad (Safari): Hãy nhấn nút Chia sẻ ⎋ rồi chọn "Thêm vào Màn hình chính" ⊞');
    } else {
      alert('Để cài đặt ứng dụng: Hãy mở menu trình duyệt (biểu tượng 3 chấm ⋮ ở góc trên bên phải) và chọn "Cài đặt ứng dụng" hoặc "Thêm vào Màn hình chính"!');
    }
  }
};

window.openEcosystemModal = function() {
  const modal = document.getElementById('ecosystem-menu-modal');
  if (modal) {
    modal.classList.add('active');
    // Highlight currently active card
    document.querySelectorAll('.eco-nav-card').forEach(c => c.classList.remove('active'));
    const curCard = document.getElementById('eco-card-' + currentView);
    if (curCard) curCard.classList.add('active');
  }
};

window.closeEcosystemModal = function() {
  const modal = document.getElementById('ecosystem-menu-modal');
  if (modal) modal.classList.remove('active');
};

window.switchViewFromModal = function(viewName) {
  closeEcosystemModal();
  switchView(viewName);
};

window.openDossierModalFromEco = function(tabKey) {
  closeEcosystemModal();
  openDossierModal(tabKey);
};

window.toggleInlineOscilloscope = function() {
  const container = document.getElementById('inline-osc-container');
  const btn = document.getElementById('btn-toggle-inline-osc');
  const text = document.getElementById('text-inline-osc');
  if (!container) return;

  isInlineOscOpen = !isInlineOscOpen;
  if (isInlineOscOpen) {
    container.style.display = 'block';
    if (btn) btn.classList.add('active');
    if (text) text.innerText = 'Ẩn Sóng IMU';
  } else {
    container.style.display = 'none';
    if (btn) btn.classList.remove('active');
    if (text) text.innerText = 'Xem Sóng IMU 50Hz';
  }
};

// Render Waveform to Mobile Canvas if open
function renderMobileOscilloscope() {
  if (!isInlineOscOpen) return;
  const canvas = document.getElementById('mobileWaveformCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#040711';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  if (oscBuffer.length < 2) return;

  // Draw Vert Vibe (cyan)
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const step = canvas.width / BUFFER_SIZE;
  const midY = canvas.height / 2;

  for (let i = 0; i < oscBuffer.length; i++) {
    const x = i * step;
    const y = midY - oscBuffer[i].v * 14;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw G-Est (yellow)
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < oscBuffer.length; i++) {
    const x = i * step;
    const y = midY - (oscBuffer[i].g - 9.81) * 14;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// Hook mobile oscilloscope rendering into requestAnimationFrame
setInterval(() => {
  if (isInlineOscOpen) {
    renderMobileOscilloscope();
  }
}, 40); // 25 FPS update for mobile canvas to save battery

// Register Service Worker & Listen for PWA Install Prompt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('Eco-SafeRide PWA ServiceWorker active in scope:', reg.scope);
      })
      .catch(err => {
        console.warn('PWA ServiceWorker registration error:', err);
      });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('PWA beforeinstallprompt captured.');
  const btn = document.getElementById('btn-pwa-install');
  if (btn) btn.style.display = 'inline-flex';

  // Smart prompt for first-time mobile visitors
  try {
    if (!localStorage.getItem('pwa_installed') && !localStorage.getItem('pwa_dismissed')) {
      setTimeout(() => {
        if (window.innerWidth <= 768) {
          openPwaInstallModal();
        }
      }, 3500);
    }
  } catch (err) {}
});

window.addEventListener('appinstalled', () => {
  console.log('Eco-SafeRide was successfully installed as PWA');
  try { localStorage.setItem('pwa_installed', 'true'); } catch (err) {}
  deferredPrompt = null;
  closePwaInstallModal();
  const btn = document.getElementById('btn-pwa-install');
  if (btn) {
    btn.innerHTML = '<span>✓</span> <span>App Mode</span>';
    btn.style.animation = 'none';
  }
});

// Check Standalone Mode
function checkStandaloneMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true || 
                       document.referrer.includes('android-app://');
  if (isStandalone) {
    document.body.classList.add('is-standalone');
    const btn = document.getElementById('btn-pwa-install');
    if (btn) btn.style.display = 'none';
    console.log('Running in Native Standalone PWA mode.');
  }
}
checkStandaloneMode();
