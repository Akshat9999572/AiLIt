# 📱 AiLIt Android Capacitor App - Setup & Build Guide

Your AiLIt website has been successfully prepared for Android as a Capacitor app! Here's everything you need to know.

## ✅ What's Been Done

1. ✅ Web app built and optimized (`dist/` folder)
2. ✅ Android project structure configured
3. ✅ Capacitor plugins installed and synced
4. ✅ App signing configuration prepared
5. ✅ All assets synced to Android project

## 🎯 Your App Details

- **App ID**: `xyz.ailitmagazine.app`
- **App Name**: AiLit
- **Web Directory**: `dist/` (already built)
- **Capacitor Plugins**: 6 plugins installed
  - App (lifecycle management)
  - Browser (external link handling)
  - Push Notifications
  - Share (native sharing)
  - Splash Screen (app launch)
  - Status Bar (system bar styling)

## 🚀 Quick Start - Building Your APK

### Option A: Automated Build (Recommended)

**On macOS/Linux:**
```bash
chmod +x build-apk.sh
./build-apk.sh
```

**On Windows:**
```bash
build-apk.bat
```

### Option B: Manual Build

```bash
# 1. Install dependencies
npm install

# 2. Build web assets
npm run build

# 3. Sync to Android
npm run android:sync

# 4a. Build debug APK (for testing)
cd android
./gradlew assembleDebug

# 4b. OR build release APK (for app store)
./gradlew assembleRelease
```

## 🔧 Prerequisites

Before building, you need:

### 1. **Java Development Kit (JDK)**
- Required: JDK 11 or higher
- Download: https://adoptium.net/ or https://www.oracle.com/java/technologies/downloads/
- Verify: Run `java -version`

### 2. **Android SDK**
- Easiest: Install [Android Studio](https://developer.android.com/studio)
- Or: Use [Command-line Tools](https://developer.android.com/tools/command-line) only

### 3. **Environment Variables**

**Windows (via Environment Variables GUI):**
- `JAVA_HOME`: Path to your JDK (e.g., `C:\Program Files\Android\Android Studio\jre`)
- `ANDROID_HOME`: Path to Android SDK (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)

**macOS/Linux (add to `~/.bash_profile` or `~/.zshrc`):**
```bash
export JAVA_HOME=$(/usr/libexec/java_home)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

## 📂 Project Structure

```
your-project/
├── android/                    # Android native project
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       └── assets/
│   │   │           └── public/  # Your web assets (auto-synced)
│   │   └── build/
│   │       └── outputs/
│   │           └── apk/         # Generated APK files
│   └── gradlew                 # Gradle wrapper
├── dist/                       # Built web app (created after npm run build)
├── src/                        # Your source code
├── capacitor.config.ts         # Capacitor configuration
├── package.json
├── build-apk.sh               # Linux/macOS build script
└── build-apk.bat              # Windows build script
```

## 🏗️ Build Process Explained

1. **npm run build** → Builds React app to `dist/`
2. **npm run android:sync** → Copies web files to Android project
3. **./gradlew assembleDebug** → Compiles to debug APK (for testing)
4. **./gradlew assembleRelease** → Compiles to release APK (for Play Store)

## 📲 Output APK Locations

After building, find your APK at:

- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## 🧪 Testing the APK

### Option 1: Android Emulator
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Option 2: Physical Device
1. Connect USB device
2. Enable Developer Mode on device
3. Run same command as above

### Option 3: Android Studio
1. Open `android` folder in Android Studio
2. Run → Select device/emulator

## 🔐 For Google Play Store Release

### Step 1: Create Signing Key (one-time)
```bash
keytool -genkey -v -keystore my-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias
```

### Step 2: Update Signing Config
Edit `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        keyAlias = 'my-key-alias'
        keyPassword = 'your-password'
        storeFile = file('path/to/my-release-key.jks')
        storePassword = 'your-store-password'
    }
}

buildTypes {
    release {
        signingConfig = signingConfigs.release
    }
}
```

### Step 3: Build Signed APK
```bash
cd android
./gradlew assembleRelease
```

### Step 4: Upload to Play Store
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Upload APK
4. Fill in metadata and publish

## 🔌 Using Capacitor Plugins in Your App

Your app already has these plugins available:

### Splash Screen
```typescript
import { SplashScreen } from '@capacitor/splash-screen';
await SplashScreen.hide();
```

### Share
```typescript
import { Share } from '@capacitor/share';
await Share.share({
  title: 'AiLit',
  text: 'Check out AiLit!',
  url: 'https://ailitmagazine.xyz'
});
```

### Push Notifications
```typescript
import { PushNotifications } from '@capacitor/push-notifications';
const registerNotifications = async () => {
  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }
};
```

## ⚠️ Common Issues & Solutions

### "JAVA_HOME is not set"
```bash
# Linux/macOS
export JAVA_HOME=$(/usr/libexec/java_home)

# Windows: Set via System Environment Variables
```

### "Could not find com.android.build.gradle:gradle"
→ Run `cd android && ./gradlew --refresh-dependencies`

### "Build failed: SDK not found"
→ Run Android Studio → SDK Manager → Install required SDKs

### "Gradle sync failed"
→ In Android Studio: File → Invalidate Caches → Restart

## 📞 Support Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Dev Docs](https://developer.android.com/docs)
- [Gradle Documentation](https://gradle.org/docs/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

## 🎉 Next Steps

1. Install prerequisites (Java + Android SDK)
2. Set environment variables
3. Run build script or manual commands
4. Test on emulator or device
5. Publish to Google Play Store

Good luck! 🚀
