@echo off
REM AiLIt Android APK Build Script for Windows

echo.
echo Building AiLIt Android APK
echo ===========================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo Error: Java is not installed. Please install JDK 11 or higher.
    exit /b 1
)

REM Check if ANDROID_HOME is set
if "%ANDROID_HOME%"=="" (
    echo Error: ANDROID_HOME environment variable is not set.
    exit /b 1
)

echo [Step 1] Installing dependencies...
call npm install
if errorlevel 1 exit /b 1

echo.
echo [Step 2] Building web assets...
call npm run build
if errorlevel 1 exit /b 1

echo.
echo [Step 3] Syncing with Android project...
call npm run android:sync
if errorlevel 1 exit /b 1

echo.
echo [Step 4] Building APK...
cd android

echo.
echo Choose build type:
echo 1 = Debug APK (for testing)
echo 2 = Release APK (for Google Play)
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo Building debug APK...
    call gradlew.bat assembleDebug
    if errorlevel 1 exit /b 1
    echo.
    echo Success! APK at: app\build\outputs\apk\debug\app-debug.apk
) else if "%choice%"=="2" (
    echo Building release APK...
    call gradlew.bat assembleRelease
    if errorlevel 1 exit /b 1
    echo.
    echo Success! APK at: app\build\outputs\apk\release\app-release-unsigned.apk
) else (
    echo Invalid choice.
    exit /b 1
)

cd ..
echo.
echo Build complete!
echo.
pause
