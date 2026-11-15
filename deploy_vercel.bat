@echo off
chcp 65001 > nul
title Triển khai Eco-SafeRide lên Vercel
echo ==============================================================
echo   🚀 ECO-SAFERIDE — TRIỂN KHAI LÊN VERCEL (HTTPS CHO ĐIỆN THOẠI)
echo ==============================================================
echo   Tài khoản Vercel hiện tại: ltliem89-4995
echo   Thư mục triển khai: MOBILE_APP_SIMULATOR
echo.
cd /d "%~dp0MOBILE_APP_SIMULATOR"
echo   Đang tiến hành triển khai lên Production...
call vercel --prod
echo.
echo ==============================================================
echo   Hoàn tất! Hãy sao chép liên kết HTTPS ở trên để gửi mọi người!
echo ==============================================================
pause
