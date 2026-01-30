# Android 版本构建指南 - 基于 Mobile 版本

本指南将帮助您将现有的 Mobile Web 版本打包成 Android 原生应用。

## 📋 前提条件

### 1. 环境要求
- ✅ Node.js 22+ (已安装)
- ✅ Capacitor 6.2.1+ (已安装)
- ⚠️ Android Studio (需要安装)
- ⚠️ Android SDK API 33+ (需要安装)

### 2. 检查当前状态

```bash
# 进入前端目录
cd main/frontend

# 检查 Capacitor 是否已安装
npm list @capacitor/core @capacitor/android

# 检查 Android 项目是否存在
ls android/
```

## 🚀 快速开始

### 一键构建和运行（推荐）

```bash
cd main/frontend

# 构建并同步到 Android（会自动处理 mobile.html → index.html）
npm run cap:build:android

# 打开 Android Studio
npm run cap:open:android

# 在 Android Studio 中点击 Run 按钮运行应用
```

就是这么简单！🎉

---

## 🚀 详细构建步骤

### 步骤 1: 构建 Web 版本

首先确保 Mobile 版本的 Web 应用能够正常构建：

```bash
cd main/frontend

# 安装依赖（如果还没安装）
npm install

# 构建生产版本（会生成 dist 目录，包含 mobile.html）
npm run build
```

**验证构建结果：**
```bash
# 检查 mobile.html 是否存在
ls -la dist/mobile.html

# 本地预览构建结果
npm run preview
# 访问 http://localhost:4173/mobile.html 确认页面正常
```

### 步骤 2: 构建并同步到 Android 项目

**重要提示**：由于 Capacitor 默认加载 `index.html`，而我们希望 Android 应用加载 `mobile.html`，需要使用专门的构建脚本。

使用专用的 Android 构建脚本（推荐）：

```bash
# 使用专用脚本：构建 + 将 mobile.html 复制为 index.html + 同步到 Android
npm run cap:build:android
```

这个脚本会：
1. 构建 Web 版本（生成 dist 目录）
2. 将 `mobile.html` 复制为 `index.html`（供 Android 使用）
3. 同步到 Android 项目
4. 恢复原始的 `index.html`（如果有备份）

**或者手动执行**：

```bash
# 1. 构建
npm run build

# 2. 将 mobile.html 复制为 index.html
cp dist/mobile.html dist/index.html

# 3. 同步到 Android
npx cap sync android

# 4. （可选）恢复原始 index.html
# cp dist/index.html.backup dist/index.html
```

### 步骤 3: 配置 Android 加载 Mobile 版本

Android 应用需要配置为加载 `mobile.html` 而不是默认的 `index.html`。

**重要：** MainActivity 已经配置为加载 `mobile.html`（见下一步）。

### 步骤 3: 打开 Android Studio

```bash
# 使用 Capacitor CLI 打开 Android Studio
npm run cap:open:android

# 或直接打开 Android 项目
open -a "Android Studio" android/
```

### 步骤 4: 在 Android Studio 中构建和运行

1. **等待 Gradle 同步完成**
   - Android Studio 会自动检测项目并开始同步
   - 如果出现错误，点击 "Sync Now" 按钮

2. **选择运行设备**
   - 点击工具栏中的设备选择器
   - 选择已连接的 Android 设备或创建一个模拟器（AVD）

3. **运行应用**
   - 点击绿色的 "Run" 按钮（▶️）
   - 或使用快捷键 `Shift + F10`（Windows/Linux）或 `Ctrl + R`（Mac）

## 📱 构建 APK

### 开发版本（Debug APK）

```bash
cd main/frontend/android

# 构建 Debug APK
./gradlew assembleDebug

# APK 位置
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 发布版本（Release APK/AAB）

#### 1. 生成签名密钥

```bash
# 在 android/app 目录下执行
cd main/frontend/android/app

keytool -genkey -v -keystore heartsphere-release.keystore \
  -alias heartsphere -keyalg RSA -keysize 2048 -validity 10000
```

#### 2. 配置签名

编辑 `android/app/build.gradle`，添加签名配置：

```gradle
android {
    signingConfigs {
        release {
            storeFile file("heartsphere-release.keystore")
            storePassword "your-keystore-password"
            keyAlias "heartsphere"
            keyPassword "your-key-password"
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
```

#### 3. 构建 Release APK

```bash
cd main/frontend/android

# 构建 Release APK
./gradlew assembleRelease

# APK 位置
# android/app/build/outputs/apk/release/app-release.apk
```

#### 4. 构建 AAB（用于 Google Play 发布）

```bash
cd main/frontend/android

# 构建 Release AAB
./gradlew bundleRelease

# AAB 位置
# android/app/build/outputs/bundle/release/app-release.aab
```

## 🔧 配置说明

### Capacitor 配置

`capacitor.config.ts` 已经配置为：
- **App ID**: `com.heartsphere.mobile`
- **App 名称**: `心域`
- **Web 目录**: `dist` (构建输出目录)
- **Android 调试**: 已启用

### MainActivity 配置

`MainActivity.java` 使用默认的 `BridgeActivity` 实现。因为构建脚本会在同步前将 `mobile.html` 复制为 `index.html`，所以不需要在代码中特殊处理。

**重要**：始终使用 `npm run cap:build:android` 而不是直接使用 `npx cap sync`，这样可以确保 Android 应用加载正确的移动端版本。

## 🐛 常见问题

### 问题 1: 应用启动后显示白屏

**原因**: Web 资源未正确同步或构建失败

**解决方法**:
```bash
cd main/frontend

# 重新构建
npm run build

# 重新同步
npm run cap:sync

# 在 Android Studio 中: Build → Clean Project，然后重新构建
```

### 问题 2: Gradle 同步失败

**原因**: Android SDK 未正确配置或版本不匹配

**解决方法**:
1. 打开 Android Studio → Preferences → Android SDK
2. 确保安装了：
   - Android SDK Platform-Tools
   - Android SDK Build-Tools 33.0.0+
   - Android 13.0 (API 33) 或更高版本

### 问题 3: 找不到 Android SDK

**解决方法**:
```bash
# 在 ~/.zshrc 或 ~/.bash_profile 中添加
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# 重新加载配置
source ~/.zshrc  # 或 source ~/.bash_profile
```

### 问题 4: 应用加载了错误的页面（index.html 而非 mobile.html）

**原因**: 未使用专用的构建脚本，直接使用了 `npx cap sync`

**解决方法**: 
- 确保使用 `npm run cap:build:android` 而不是 `npx cap sync`
- 构建脚本会自动处理 mobile.html → index.html 的转换
- 检查构建脚本是否正确执行（查看构建日志）

### 问题 5: 构建脚本执行失败

**原因**: 环境未正确配置或依赖缺失

**解决方法**:
```bash
# 检查 Node.js 和 npm 版本
node --version  # 应该 >= 18
npm --version

# 检查 Capacitor 是否安装
npm list @capacitor/core @capacitor/android

# 如果未安装，重新安装
npm install

# 检查 Android 目录是否存在
ls android/

# 如果不存在，添加 Android 平台
npx cap add android
```

### 问题 6: 构建脚本提示 mobile.html 不存在

**原因**: Web 构建失败或 vite.config.ts 未正确配置 mobile 入口

**解决方法**:
```bash
# 检查 vite.config.ts 中是否配置了 mobile.html 作为构建入口
grep -A 5 "rollupOptions" vite.config.ts

# 应该包含类似以下配置：
# rollupOptions: {
#   input: {
#     main: path.resolve(__dirname, 'index.html'),
#     mobile: path.resolve(__dirname, 'mobile.html'),
#   }
# }

# 手动执行构建，查看是否有错误
npm run build

# 检查 dist 目录
ls -la dist/
```

### 问题 7: Capacitor 同步后文件丢失

**原因**: 构建脚本在恢复 index.html 时出错

**解决方法**:
```bash
# 检查是否有备份文件
ls -la dist/index.html.backup

# 如果有备份，手动恢复
if [ -f "dist/index.html.backup" ]; then
  mv dist/index.html.backup dist/index.html
fi

# 重新执行构建
npm run cap:build:android
```

### 问题 8: Android Studio 无法打开项目

**原因**: Android Studio 未安装或项目路径错误

**解决方法**:
```bash
# 检查 Android Studio 是否安装
which studio  # 或 which android-studio

# 如果未安装，下载并安装 Android Studio
# https://developer.android.com/studio

# 手动打开 Android 项目
open -a "Android Studio" android/

# 或使用 Capacitor 命令（推荐）
npm run cap:open:android
```

## 📂 项目结构

```
main/frontend/
├── mobile.html              # Mobile 版本 HTML 入口
├── mobile.tsx               # Mobile 版本 React 入口
├── mobile/                  # Mobile 组件目录
├── dist/                    # 构建输出（包含 mobile.html）
│   ├── mobile.html
│   └── assets/
├── android/                 # Android 原生项目
│   └── app/
│       └── src/main/
│           ├── assets/public/    # Web 资源（自动同步）
│           └── java/com/heartsphere/mobile/
│               └── MainActivity.java  # 已配置加载 mobile.html
└── capacitor.config.ts      # Capacitor 配置
```

## 🔄 开发工作流

### 日常开发流程

```bash
# 1. 修改前端代码
# 2. 构建并同步到 Android（使用专用脚本）
npm run cap:build:android

# 3. 在 Android Studio 中运行或使用命令行
npm run cap:open:android
# 或在 Android Studio 中点击 Run
```

**提示**：使用 `npm run cap:build:android` 而不是 `npm run cap:sync`，这样可以确保加载正确的 mobile.html 版本。

### 快速构建脚本

可以创建一个便捷的构建脚本：

```bash
#!/bin/bash
# build-android.sh

cd main/frontend
npm run build
npx cap sync android
echo "✅ 构建完成！现在可以在 Android Studio 中运行应用。"
```

使用方式：
```bash
chmod +x build-android.sh
./build-android.sh
```

## 🎨 自定义配置

### 修改应用图标

1. 准备图标文件（推荐 512x512px PNG）
2. 使用 Capacitor Assets 工具：

```bash
npm install @capacitor/assets --save-dev
npx cap assets generate --icon ./images/logo.png
npx cap sync android
```

### 修改启动画面

```bash
npx cap assets generate --splash ./images/splash.png
npx cap sync android
```

### 配置应用权限

编辑 `android/app/src/main/AndroidManifest.xml`：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<!-- 根据需要添加其他权限 -->
```

## 📚 相关文档

- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [Android 开发指南](https://capacitorjs.com/docs/android)
- [构建发布版本](https://capacitorjs.com/docs/android/building)
- [Mobile 版本文档](../12-开发指南/快速开始/INTEGRATION_GUIDE.md)

## ✅ 检查清单

在发布之前，确认以下项目：

- [ ] Web 版本能够正常构建
- [ ] mobile.html 在浏览器中正常显示
- [ ] Android 项目能够成功同步
- [ ] 应用在 Android 设备/模拟器上正常运行
- [ ] 应用正确加载 mobile.html（而不是 index.html）
- [ ] 应用图标和启动画面已设置
- [ ] 应用权限已正确配置
- [ ] Release 版本 APK/AAB 已成功构建
- [ ] 应用已签名（用于发布）

---

**提示**: 首次构建可能需要较长时间，请耐心等待 Gradle 下载依赖和同步项目。
