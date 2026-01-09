# Capacitor 快速开始指南

## 🚀 快速启动 (5分钟)

### 前置条件
```bash
# 1. 激活 Node 22 环境
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22
```

### 构建和运行
```bash
cd frontend

# 方式 A: 完整构建 (推荐首次使用)
npm run build && cd .. && npx cap sync android && npx cap open android

# 方式 B: 使用快捷脚本
npm run cap:build          # 构建前端 + 同步到 Android
npm run cap:open:android   # 打开 Android Studio
```

## 📱 常用命令速查

| 命令 | 说明 |
|------|------|
| `nvm use 22` | 切换到 Node 22 |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npx cap sync android` | 同步 Web 资源到 Android |
| `npx cap open android` | 打开 Android Studio |
| `npx cap run android` | 运行到设备/模拟器 |
| `npx cap copy android` | 仅复制文件 (不更新插件) |

## 🔄 开发工作流

### 日常开发循环
```bash
# 1. 修改代码
# 2. 本地测试
npm run dev

# 3. 构建并同步到 Android
npm run build
cd ..
npx cap sync android

# 4. 在 Android Studio 中重新运行
# 或者命令行运行
npx cap run android
```

### 快速开发模式 (Live Reload)
```bash
# 在 capacitor.config.json 中配置开发服务器:
# "server": { "url": "http://localhost:5173", "androidScheme": "https" }

# 然后运行
npm run dev
npx cap run android

# 修改代码后会自动刷新！
```

## 🛠️ 环境检查

### 检查安装
```bash
# Node 版本
node --version  # 应该是 v22.21.1

# npm 版本
npm --version   # 应该是 10.9.4

# Capacitor 版本
npx cap --version  # 应该是 8.0.0

# Android SDK (如果已配置)
echo $ANDROID_HOME
```

### 检查设备连接
```bash
# 列出所有连接的设备
adb devices

# 列出所有模拟器
emulator -list-avds

# 启动模拟器
emulator -avd <模拟器名称>
```

## 🐛 常见问题

### 问题 1: "Cannot find module '@rollup/rollup-darwin-arm64'"
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### 问题 2: Gradle 构建失败
```bash
cd android
./gradlew clean
./gradlew build
```

### 问题 3: 找不到 Android SDK
```bash
# 安装 Android Studio
# 然后配置环境变量
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 问题 4: 应用启动后白屏
```bash
# 检查 webDir 配置是否正确
cat capacitor.config.json | grep webDir

# 确保已构建前端
cd frontend && npm run build

# 重新同步
cd .. && npx cap sync android
```

## 📂 关键文件位置

```
heartsphere_new/
├── capacitor.config.json          # Capacitor 配置 ⭐
├── android/                       # Android 项目
│   ├── app/
│   │   └── src/main/
│   │       ├── assets/public/     # Web 资源 (自动同步)
│   │       ├── res/               # Android 资源 (图标、启动画面等)
│   │       └── AndroidManifest.xml # Android 配置
│   └── build.gradle              # 构建配置
└── frontend/
    ├── dist/                      # 构建输出 ⭐
    ├── mobile.tsx                # Mobile 入口 ⭐
    └── mobile/                   # Mobile 组件 ⭐
```

## 🎨 自定义配置

### 修改应用图标
```bash
# 1. 准备图标文件 (png)
# 建议尺寸: 512x512px

# 2. 使用 Capacitor 资源生成工具
npm install @capacitor/assets
npx cap assets generate --icon ./path-to-icon.png

# 3. 同步到 Android
npx cap sync android
```

### 修改启动画面
```bash
# 1. 准备启动画面 (png)
# 建议尺寸: 2732x2732px

# 2. 生成资源
npx cap assets generate --splash ./path-to-splash.png

# 3. 同步
npx cap sync android
```

### 配置应用权限
编辑 `android/app/src/main/AndroidManifest.xml`:
```xml
<!-- 添加所需权限 -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## 📦 构建发布版本

### 开发版本 (Debug)
```bash
cd android
./gradlew assembleDebug
# 输出: app/build/outputs/apk/debug/app-debug.apk
```

### 生产版本 (Release)
```bash
# 1. 生成签名 keystore
keytool -genkey -v -keystore heartsphere-release.keystore -alias heartsphere -keyalg RSA -keysize 2048 -validity 10000

# 2. 配置签名 (android/app/build.gradle)
android {
    signingConfigs {
        release {
            storeFile file("heartsphere-release.keystore")
            storePassword "your-password"
            keyAlias "heartsphere"
            keyPassword "your-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

# 3. 构建 Release APK
./gradlew assembleRelease
# 输出: app/build/outputs/apk/release/app-release.apk

# 4. 构建 AAB (用于 Google Play)
./gradlew bundleRelease
# 输出: app/build/outputs/bundle/release/app-release.aab
```

## 🎯 学习资源

### 官方文档
- [Capacitor 文档](https://capacitorjs.com/docs)
- [Android 指南](https://capacitorjs.com/docs/android)
- [插件 API](https://capacitorjs.com/docs/apis)

### 视频教程
- [Capacitor 快速开始](https://www.youtube.com/watch?v=mtOQFXmHPaI)
- [构建第一个应用](https://www.youtube.com/watch?v=9QXrm8u6sBw)

---

**提示**: 将此文件添加到浏览器书签，方便随时查阅！
