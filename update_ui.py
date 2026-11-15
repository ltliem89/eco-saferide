import os
import re

base_dir = r"g:\My Drive\DATA-LIEM\NH 2026-2027\11.ThiNhaGiaoAI\sangkienatgt.dantri\11_APP_DI_DONG_ECO_SAFERIDE"
index_path = os.path.join(base_dir, "index.html")
sim_path = os.path.join(base_dir, "MOBILE_APP_SIMULATOR", "index.html")
main_js_path = os.path.join(base_dir, "src", "main.js")

# 1. READ INDEX.HTML
with open(index_path, "r", encoding="utf-8") as f:
    index_html = f.read()

# Check if AI context card already exists
ai_context_card = """      <!-- AI Thấu Hiểu Bối Cảnh & Tự Hiệu Chuẩn Túi Quần (User-Centric AI) -->
      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #1e293b; border-radius: 16px; padding: 12px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #a78bfa; letter-spacing: 0.5px; display: flex; align-items: center; gap: 5px;">
            <span>🧠</span> AI THẤU HIỂU BỐI CẢNH
          </span>
          <span id="user-context-pill" style="font-size: 10px; background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); padding: 3px 8px; border-radius: 12px; font-weight: 700;">
            🏍️ Đang Lái Xe (Giám sát)
          </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: #0f172a; padding: 8px 10px; border-radius: 10px; border: 1px solid #1e293b;">
          <div>
            <div style="font-size: 11px; color: #cbd5e1; font-weight: 600;">Góc Bù Túi Quần: <strong id="pocket-calib-val" style="color: #38bdf8;">Chưa hiệu chuẩn</strong></div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Tự căn chỉnh vector trọng trường đùi người lái</div>
          </div>
          <button id="btn-auto-calib" onclick="startAutoCalibration()" style="background: #7c3aed; color: #fff; border: none; padding: 6px 12px; border-radius: 14px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s;">
            🎯 Tự Căn Chỉnh
          </button>
        </div>

        <!-- Dynamic Recovery Notice -->
        <div style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: #10b981; margin-top: 8px;">
          <span>🌱</span>
          <span id="sdi-recovery-status">Điểm SDI tự hồi phục +0.5đ mỗi 30s lái xe êm ái</span>
        </div>
      </div>
"""

# Insert AI context card right after the Smart Voice Nudge Banner in index.html
if "AI THẤU HIỂU BỐI CẢNH" not in index_html:
    voice_box_end = '</div>\n      </div>'
    target = index_html.find('<!-- Real Phone Gyro/Accelerometer Live Control -->')
    if target != -1:
        index_html = index_html[:target] + ai_context_card + "\n      " + index_html[target:]
        print("Inserted AI Context Card into index.html")
    else:
        print("Could not find insertion target for AI Context Card")

# Update Pocket Mode Overlay to include the live timer and better typography
enhanced_pocket_overlay = """    <!-- Pocket Mode Fullscreen Black OLED Overlay -->
    <div id="pocket-mode-overlay" style="display: none; position: absolute; inset: 0; background: #000; z-index: 99999; border-radius: 36px; flex-direction: column; justify-content: center; align-items: center; color: #475569; text-align: center; padding: 24px; user-select: none;">
      <div style="font-size: 48px; margin-bottom: 8px; opacity: 0.4;">🌙</div>
      <div style="font-size: 14px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">CHẾ ĐỘ BỎ TÚI ĐANG BẢO VỆ</div>
      <div id="pocket-timer-display" style="font-size: 32px; font-weight: 900; color: #10b981; margin: 12px 0; font-family: monospace;">00:00</div>
      <div style="font-size: 11px; color: #475569; line-height: 1.6; max-width: 270px;">
        Màn hình đen OLED tiết kiệm 95% pin & chống chạm nhầm.<br>
        <strong style="color: #38bdf8;">Cảm biến Gyro, Gia tốc & SOS khẩn cấp đang chạy nền 100%.</strong>
      </div>
      <button onclick="exitPocketMode()" style="margin-top: 32px; background: #0f172a; color: #cbd5e1; border: 1px solid #334155; padding: 12px 28px; border-radius: 24px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <span>👆</span> Chạm để Mở Màn Hình
      </button>
    </div>"""

# Replace old pocket overlay in index_html
index_html = re.sub(r'<!-- Pocket Mode Fullscreen Black OLED Overlay -->[\s\S]*?</div>\s*</div>\s*(?=<!-- Vite Entrypoint -->|</body>)', enhanced_pocket_overlay + '\n\n  </div>\n\n', index_html)

# Save updated index.html
with open(index_path, "w", encoding="utf-8") as f:
    f.write(index_html)
print("Updated index.html successfully")
