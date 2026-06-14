# 🚀 Quick Reference - Build Your APK in 3 Steps

## Prerequisites (One-time Setup)
```bash
# 1. Download & Install
- Java JDK 11+ from https://adoptium.net/
- Android Studio from https://developer.android.com/studio

# 2. Set Environment Variables
JAVA_HOME → Point to JDK installation
ANDROID_HOME → Point to Android SDK location
```

## Build Your APK (3 Commands)

### Windows:
```bash
build-apk.bat
# Then select: 1 for debug, 2 for release
```

### macOS/Linux:
```bash
chmod +x build-apk.sh
./build-apk.sh
# Then select: 1 for debug, 2 for release
```

## OR Manual Build:
```bash
npm install
npm run build
npm run android:sync
cd android
./gradlew assembleDebug    # for testing
./gradlew assembleRelease  # for Play Store
```

## Where's My APK?
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Test on Device/Emulator:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Ready to Deploy?
See ANDROID_BUILD_README.md for Google Play Store instructions

---
**Questions?** Check the complete guides:
- `ANDROID_BUILD_README.md` - Full setup guide
- `APK_BUILD_GUIDE.md` - Detailed instructions
