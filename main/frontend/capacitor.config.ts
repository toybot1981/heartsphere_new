import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.heartsphere.mobile',
  appName: '心域',
  webDir: 'dist',
  // 配置服务器URL（开发环境）
  server: {
    // 开发时可以连接到本地开发服务器
    // url: 'http://localhost:5173/mobile.html',
    // androidScheme: 'https'
  },
  // iOS 配置
  ios: {
    // 配置内容模式，自动滚动处理等
    contentInset: 'automatic',
    scrollEnabled: true
  },
  // Android 配置
  android: {
    // 配置Webview调试
    webContentsDebuggingEnabled: true
  },
  // 插件配置
  plugins: {
    // Capacitor StatusBar 插件配置
    StatusBar: {
      style: 'DARK'
    },
    // Capacitor SplashScreen 插件配置
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
};

export default config;
