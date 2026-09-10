@echo off
title Talent Tution Classes Tracker
echo =======================================================
echo    Starting Talent Tution Classes Tracker
echo =======================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Check if port 5000 is already in use
netstat -ano | findstr :5000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [OK] Backend server is already running on port 5000.
) else (
    echo [*] Launching Node.js Backend Server on port 5000...
    start /min "TTC Server" node server.js
    timeout /t 2 /nobreak >nul
)

:: Open the complete app in the default web browser
echo [*] Opening Web Application in your browser...
start http://localhost:5000

:: Detect active Wi-Fi / LAN IP address
set LOCAL_IP=192.168.1.12
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
    )
)

echo.
echo =======================================================
echo [SUCCESS] Talent Tution Classes Tracker is Active!
echo  - Host PC Browser:     http://localhost:5000
echo  - Other PC / Mobile:   http://%LOCAL_IP%:5000
echo =======================================================
timeout /t 3 >nul
exit /b 0

