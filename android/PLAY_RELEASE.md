# Google Play release

1. Install Android Studio with Android SDK 36 and JDK 21.
2. Add `android/app/google-services.json`.
3. Create a release keystore and copy `keystore.properties.example` to an untracked `keystore.properties`.
4. Pass the four `AILIT_RELEASE_*` values as Gradle properties or place them in the user Gradle properties file.
5. Run `npm run android:bundle`; the bundle is written under `android/app/build/outputs/bundle/release/`.
6. Enable Play App Signing and copy its SHA-256 certificate fingerprint into `android/assetlinks.template.json`.
7. Publish that JSON at `https://ailitmagazine.xyz/.well-known/assetlinks.json`.
8. Upload the bundle to an Internal testing release before production.

Use `https://ailitmagazine.xyz/privacy` as the privacy-policy URL after that route is deployed.
