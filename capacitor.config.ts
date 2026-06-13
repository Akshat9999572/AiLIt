import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'xyz.ailitmagazine.app',
  appName: 'AiLit',
  webDir: 'dist',
  server: {
    url: 'https://ailitmagazine.xyz',
    cleartext: false,
    errorPath: 'offline.html',
    allowNavigation: [
      'ailitmagazine.xyz',
      'www.ailitmagazine.xyz',
      'lvghjhjxntaeaukfcsrt.supabase.co',
    ],
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#f2eee4',
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: '#f2eee4',
      style: 'LIGHT',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
