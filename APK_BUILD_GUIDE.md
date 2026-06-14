# AiLIt Android APK Build Guide

Your project is fully configured for Android development with Capacitor. Follow these steps to generate the APK:

## Prerequisites

Before building, ensure you have installed:

1. **Node.js** (v18+)
2. **Android Studio** or Android SDK Command-line Tools
3. **Java Development Kit (JDK)** (v11 or higher)
4. **Gradle** (included with Android Studio)

## Setup Environment Variables

On **Windows**:
```bash
setx JAVA_HOME "C:\Program Files\Android\Android Studio\jre"
setx ANDROID_HOME "C:\Users\YourUsername\AppData\Local\Android\Sdk"
```

On **macOS/Linux**:
```bash
export JAVA_HOME=$(/usr/libexec/java_home)
export ANDROID_HOME=$HOME/Android/Sdk
```

## Build Instructions

### Option 1: Direct Gradle Build (Recommended for APK)

```bash
# Navigate to your project
cd your-project-directory

# Install dependencies
npm install

# Build web assets
npm run build

# Sync to Android
npm run android:sync

# Build APK (debug version)
cd android
./gradlew assembleDebug

# Or build release APK (requires signing)
./gradlew assembleRelease
```

The APK will be generated at:
- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`

### Option 2: Android Studio GUI

1. Open Android Studio
2. Click "Open an existing Android Studio project"
3. Navigate to the `android` folder in your project
4. Wait for Gradle sync to complete
5. Select **Build → Build Bundle(s)/APK(s) → Build APK(s)**
6. Monitor the build progress in the bottom panel

## Signing Release APK

For Google Play Store, you need to sign the APK:

### Create a Keystore (first time only):

```bash
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

### Sign APK:

```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore app-release.apk my-key-alias
```

## Testing the APK

To install on an Android device:

```bash
# Using ADB (Android Debug Bridge)
adb install -r app-debug.apk

# Or use Android Studio's device manager
```

## Troubleshooting

### Issue: "JAVA_HOME is not set"
**Solution**: Set JAVA_HOME environment variable to your JDK installation path

### Issue: "Gradle sync failed"
**Solution**: 
- Update Gradle in Android Studio
- Check JDK version compatibility (should be 11+)
- Clear Gradle cache: `cd android && ./gradlew clean`

### Issue: "Build failed: resources error"
**Solution**: 
- Run: `cd android && ./gradlew clean`
- Then rebuild

### Issue: Multiple APKs generated
**Solution**: Check `android/app/build.gradle` for APK split configurations

## Your App Configuration

- **App ID**: xyz.ailitmagazine.app
- **App Name**: AiLit
- **Capacitor Plugins**: App, Browser, Push Notifications, Share, Splash Screen, Status Bar
- **Min API Level**: Check `android/app/build.gradle`
- **Target API Level**: Check `android/app/build.gradle`

## Next Steps

1. Download and install Android Studio from: https://developer.android.com/studio
2. Set up Android SDK and JDK
3. Follow the build instructions above
4. Test on an emulator or physical device
5. Sign and upload to Google Play Store when ready

## Additional Resources

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Studio Setup Guide](https://developer.android.com/studio/install)
- [Google Play Console](https://play.google.com/console)
- [Android Signing Guide](https://developer.android.com/studio/publish/app-signing)

---

**Note**: The web assets are already built and synced to the Android project. You just need to run the Gradle build command on your local machine where Java and Android SDK are installed.
