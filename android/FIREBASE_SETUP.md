# Firebase setup

1. Create an Android app in Firebase with package name `xyz.ailitmagazine.app`.
2. Download `google-services.json` to `android/app/google-services.json`.
3. Create a Firebase service account with Firebase Cloud Messaging permissions.
4. Add the complete service-account JSON as the Supabase Edge Function secret `FIREBASE_SERVICE_ACCOUNT`.
5. Deploy the `push-notifications` Edge Function.

Both credential files are intentionally excluded from Git.
