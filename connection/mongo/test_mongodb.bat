@echo off
echo ========================================
echo    MongoDB Connection Test Helper
echo ========================================
echo.

echo Checking MongoDB service status...
sc query "MongoDB" | findstr "RUNNING"
if %errorlevel% equ 0 (
    echo ✅ MongoDB service is RUNNING
) else (
    echo ❌ MongoDB service is NOT running
    echo Please start MongoDB service first
    pause
    exit /b 1
)

echo.
echo Checking if port 27017 is open...
netstat -an | findstr "27017" | findstr "LISTENING"
if %errorlevel% equ 0 (
    echo ✅ Port 27017 is LISTENING
) else (
    echo ❌ Port 27017 is not listening
    pause
    exit /b 1
)

echo.
echo ========================================
echo    MongoDB Status: READY ✅
echo ========================================
echo.
echo Now you can:
echo 1. Open MongoDB Compass
echo 2. Connect to: mongodb://localhost:27017
echo 3. Create database: sampleDB
echo 4. Create collection: users
echo.
echo Opening test guide in browser...
start "" "simple_test.html"

echo.
echo Press any key to open MongoDB Compass...
pause >nul

echo Opening MongoDB Compass...
start "" "C:\Program Files\MongoDB Compass\MongoDB Compass.exe"

echo.
echo Test completed! Check MongoDB Compass for connection.
pause 