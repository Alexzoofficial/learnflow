import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.alexzo.learnflow',
  appName: 'LearnFlow',
  webDir: 'dist',
  server: {
    url: 'https://a24500fe-81f2-4031-8b21-b5d9f5fae0c8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#4A7AB8",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#4A7AB8"
    }
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    contentInset: "automatic"
  }
};

export default config;