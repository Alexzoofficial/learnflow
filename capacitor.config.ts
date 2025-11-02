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
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;