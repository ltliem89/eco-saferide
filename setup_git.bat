@echo off
chcp 65001 > nul
title Khởi tạo Git cho Eco-SafeRide
echo ==============================================================
echo   🚀 ECO-SAFERIDE — KHỞI TẠO GIT REPOSITORY
echo ==============================================================
echo.
cd /d "%~dp0"

echo [1/3] Khởi tạo git repository...
git init

echo [2/3] Thêm toàn bộ mã nguồn vào staging...
git add .

echo [3/3] Tạo commit đầu tiên...
git commit -m "feat: Khoi tao du an Eco-SafeRide Mobile App Chế độ 0đ (PWA + Flutter + Simulator)"

echo.
echo ==============================================================
echo   Khởi tạo Git thành công!
echo   Để đẩy lên GitHub của bạn:
echo     1. Tạo repo mới trên github.com (ví dụ: eco-saferide)
echo     2. Chạy 2 lệnh sau:
echo        git remote add origin https://github.com/USERNAME/eco-saferide.git
echo        git push -u origin master (hoặc main)
echo ==============================================================
pause
