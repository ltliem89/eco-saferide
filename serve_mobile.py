"""
Eco-SafeRide — Mobile App Simulator & Live Sensor Web Server
============================================================
Chạy script này để mở giao diện Web App mô phỏng trên trình duyệt máy tính,
hoặc quét mã QR bằng camera điện thoại để trải nghiệm TRỰC TIẾP cảm biến hồi chuyển
(Gyroscope) và gia tốc kế (Accelerometer) thật của điện thoại!
"""

import http.server
import socketserver
import socket
import os
import sys
import webbrowser

PORT = 8080
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "MOBILE_APP_SIMULATOR")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        # Clean logging
        pass

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def print_banner(local_ip, port):
    print("=" * 64)
    print("🚀  ECO-SAFERIDE — MÁY CHỦ THỰC NGHIỆM ỨNG DỤNG DI ĐỘNG")
    print("=" * 64)
    print(f"👉  Xem trên máy tính (Simulator): http://localhost:{port}")
    print(f"📱  Xem trên điện thoại thật:     http://{local_ip}:{port}")
    print("=" * 64)
    
    try:
        import qrcode
        import io
        qr = qrcode.QRCode(box_size=1, border=1)
        qr.add_data(f"http://{local_ip}:{port}")
        qr.make(fit=True)
        buf = io.StringIO()
        qr.print_ascii(out=buf)
        print("\n📸 QUÉT MÃ QR NÀY BẰNG CAMERA ĐIỆN THOẠI (CÙNG MẠNG WI-FI):\n")
        print(buf.getvalue())
    except Exception as e:
        print(f"(Gợi ý: Nhập địa chỉ http://{local_ip}:{port} vào trình duyệt điện thoại)")
    
    print("=" * 64)
    print("💡 HƯỚNG DẪN TRẢI NGHIỆM:")
    print("  1. Bấm các nút giả lập (Lạng lách, Phanh gấp, Sụp ổ gà, Ngã xe) để nghe tiếng Việt.")
    print("  2. Trên điện thoại: Nhấn 'Bật Cảm Biến Thật' để đọc con quay hồi chuyển live!")
    print("  3. Nhấn Ctrl+C để dừng máy chủ bất cứ lúc nào.")
    print("=" * 64)

def run():
    global PORT
    while PORT < 8090:
        try:
            with socketserver.TCPServer(("", PORT), Handler) as httpd:
                local_ip = get_local_ip()
                print_banner(local_ip, PORT)
                webbrowser.open(f"http://localhost:{PORT}")
                httpd.serve_forever()
                break
        except OSError:
            PORT += 1

if __name__ == '__main__':
    try:
        run()
    except KeyboardInterrupt:
        print("\n👋 Máy chủ đã dừng an toàn.")
        sys.exit(0)
