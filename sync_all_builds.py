import os
import re

base_dir = r"g:\My Drive\DATA-LIEM\NH 2026-2027\11.ThiNhaGiaoAI\sangkienatgt.dantri\11_APP_DI_DONG_ECO_SAFERIDE"
root_index = os.path.join(base_dir, "index.html")
style_path = os.path.join(base_dir, "src", "style.css")
main_js_path = os.path.join(base_dir, "src", "main.js")
sim_index = os.path.join(base_dir, "MOBILE_APP_SIMULATOR", "index.html")

with open(root_index, "r", encoding="utf-8") as f:
    html_content = f.read()

with open(style_path, "r", encoding="utf-8") as f:
    css_content = f.read()

with open(main_js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

# Strip module import from main.js when inlined
js_inlined = js_content.replace("import './style.css';", "// Styles inlined in head")

# Replace stylesheet link with inline <style>
html_inlined = re.sub(
    r'<link rel="stylesheet" href="/src/style\.css">',
    f'<style>\n{css_content}\n  </style>',
    html_content
)

# Replace <script type="module" src="/src/main.js"></script> with inline <script>
html_inlined = re.sub(
    r'<script type="module" src="/src/main\.js"></script>',
    f'<script>\n{js_inlined}\n  </script>',
    html_inlined
)

with open(sim_index, "w", encoding="utf-8") as f:
    f.write(html_inlined)

print("Synchronized MOBILE_APP_SIMULATOR/index.html successfully!")
