#!/bin/bash

# AiLIt Android APK Build Script
# This script automates the APK building process

set -e

echo "🚀 AiLIt Android APK Builder"
echo "=============================="
echo ""

# Check for required tools
echo "Checking prerequisites..."

if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java Development Kit (JDK 11+)"
    exit 1
fi

if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME is not set. Please set it to your Android SDK path"
    exit 1
fi

if [ -z "$JAVA_HOME" ]; then
    echo "⚠️  JAVA_HOME is not set. Attempting to set it automatically..."
    export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
fi

echo "✅ Prerequisites found"
echo ""

# Build steps
echo "Step 1: Installing dependencies..."
npm install

echo ""
echo "Step 2: Building web assets..."
npm run build

echo ""
echo "Step 3: Syncing with Android project..."
npm run android:sync

echo ""
echo "Step 4: Building APK..."
cd android

echo ""
echo "Choose build type:"
echo "1) Debug APK (recommended for testing)"
echo "2) Release APK (for Google Play Store)"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo "Building debug APK..."
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "✅ Debug APK built successfully!"
    echo "📱 APK Location: $APK_PATH"
    echo ""
    echo "To install on device:"
    echo "  adb install -r $APK_PATH"
elif [ "$choice" = "2" ]; then
    echo "Building release APK..."
    echo ""
    echo "Note: You'll need to sign the APK. Do you have a keystore file?"
    read -p "Enter keystore path (or press Enter to create a new one): " keystore_path
    
    if [ -z "$keystore_path" ]; then
        echo ""
        echo "Creating new keystore..."
        keytool -genkey -v -keystore my-release-key.keystore \
            -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
        keystore_path="my-release-key.keystore"
    fi
    
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
    
    echo ""
    echo "Signing APK..."
    jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
        -keystore "$keystore_path" \
        "$APK_PATH" my-key-alias
    
    echo ""
    echo "✅ Release APK built and signed successfully!"
    echo "📱 APK Location: $APK_PATH"
else
    echo "❌ Invalid choice"
    exit 1
fi

echo ""
echo "=============================="
echo "Build complete! 🎉"
echo ""
