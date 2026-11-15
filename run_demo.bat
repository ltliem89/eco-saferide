@echo off
chcp 65001 > nul
title Eco-SafeRide Mobile App Server
echo ==============================================================
echo   🚀 ECO-SAFERIDE — MÁY CHỦ THỰC NGHIỆM ỨNG DỤNG DI ĐỘNG (PWA)
echo ==============================================================
echo   Đang khởi động máy chủ và tạo mã QR...
echo.
python "%~dp0serve_mobile.py"
pause
