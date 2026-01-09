# Capacitor 跨端应用构建 - 完成总结

## ✅ 已完成任务

### 1. Node.js 升级
- **原版本**: Node v21.2.0
- **新版本**: Node v22.21.1 (使用 nvm 管理)
- **安装方式**: 通过 nvm (Node Version Manager)

### 2. Capacitor 安装
- **Capacitor CLI**: v8.0.0
- **Capacitor Core**: v8.0.0
- **Capacitor Android**: v8.0.0
- **配置文件**: [capacitor.config.json](capacitor.config.json)

### 3. Android 平台配置
- **App ID**: `com.heartsphere.app`
- **App 名称**: `心域`
- **Web 目录**: `dist`
- **项目位置**: [android/](android/)

## 📱 项目结构

```
heartsphere_new/
├── android/                    # Android 原生项目
│   ├── app/                   # Android 应用代码
│   ├── build.gradle           # 构建配置
│   ├── gradle/                # Gradle wrapper
│   └── gradlew                # Gradle 构建脚本
├── frontend/                   # React 前端
│   ├── dist/                  # 构建输出 (同步到 Android)
│   ├── mobile.tsx            # Mobile 入口
│   └── mobile/               # Mobile 组件
└── capacitor.config.json      # Capacitor 配置
```

## 🚀 开发工作流

### 日常开发命令

```bash
# 1. 设置 Node 环境
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22

# 2. 进入 frontend 目录
cd frontend

# 3. 开发模式 (推荐)
npm run dev

# 4. 构建生产版本
npm run build

# 5. 同步到 Android
npx cap sync android

# 6. 打开 Android Studio
npx cap open android

# 7. 运行到设备/模拟器
npx cap run android
```

### 快捷脚本 (已在 package.json 配置)

```bash
npm run cap:build       # 构建 + 同步
npm run cap:sync        # 仅同步
npm run cap:open:android # 打开 Android Studio
npm run cap:run:android  # 运行到设备
```

## 📝 配置说明

### Capacitor 配置 ([capacitor.config.json](capacitor.config.json))

```json
{
  "appId": "com.heartsphere.app",
  "appName": "心域",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "launchAutoHide": true,
      "backgroundColor": "#000000",
      "androidScaleType": "CENTER_CROP"
    }
  }
}
```

## 🔧 开发环境要求

### 必需工具
- ✅ Node.js 22.21.1 (已安装)
- ✅ npm 10.9.4 (已安装)
- ✅ Capacitor 8.0.0 (已安装)
- ⚠️ Android Studio (需要安装)
- ⚠️ Android SDK (需要安装)

### Android 开发环境设置

#### 1. 安装 Android Studio
```bash
# 下载: https://developer.android.com/studio
# 安装后打开 Android Studio
```

#### 2. 配置 Android SDK
在 Android Studio 中:
- 打开 Preferences → Appearance & Behavior → System Settings → Android SDK
- 安装 Android SDK Platform-Tools
- 安装 Android SDK Build-Tools
- 安装至少一个 Android API Level (推荐 API 33+)

#### 3. 配置环境变量
```bash
# 添加到 ~/.zshrc 或 ~/.bash_profile
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

## 📱 构建和运行

### 方式一: 使用 Android Studio (推荐)

```bash
# 1. 构建并同步
npm run cap:build

# 2. 打开 Android Studio
npm run cap:open:android

# 3. 在 Android Studio 中:
#    - 等待 Gradle 同步完成
#    - 选择设备或模拟器
#    - 点击 Run 按钮
```

### 方式二: 使用命令行

```bash
# 1. 构建并同步
npm run cap:build

# 2. 运行到连接的设备
npm run cap:run:android

# 或使用 Gradle 直接构建 APK
cd android
./gradlew assembleDebug
# APK 输出: android/app/build/outputs/apk/debug/app-debug.apk
```

## 🎯 下一步行动

### 立即可做:
1. ✅ 安装 Android Studio
2. ✅ 配置 Android SDK
3. ✅ 创建 Android 虚拟设备 (AVD) 或连接真实设备
4. ✅ 运行 `npm run cap:open:android` 打开项目
5. ✅ 构建并运行第一个版本

### 优化建议:
1. **应用图标**: 替换默认图标
   - 位置: `android/app/src/main/res/`
   - 需要生成不同尺寸的图标 (mipmap-xxx)

2. **启动画面**: 配置自定义启动画面
   - 位置: `android/app/src/main/res/drawable/splash.png`

3. **应用权限**: 配置所需权限
   - 位置: `android/app/src/main/AndroidManifest.xml`

4. **应用签名**: 配置发布签名
   - 生成 keystore
   - 配置签名配置

## 📚 相关资源

### 官方文档
- [Capacitor 官方文档](https://capacitorjs.com/)
- [Android 开发指南](https://capacitorjs.com/docs/android)
- [开发者工作流](https://capacitorjs.com/docs/basics/workflow)

### 有用的 Capacitor 插件
```bash
# 状态栏
npm install @capacitor/status-bar
npx cap sync

# 相机
npm install @capacitor/camera
npx cap sync

# 文件系统
npm install @capacitor/filesystem
npx cap sync

# 设备信息
npm install @capacitor/device
npx cap sync

# 本地通知
npm install @capacitor/local-notifications
npx cap sync
```

## ⚠️ 注意事项

1. **Node 版本**: 始终使用 Node 22 (`nvm use 22`)
2. **构建前同步**: 每次修改代码后需要先 `npm run build` 再 `npx cap sync`
3. **iOS 平台**: 如需 iOS 支持，需要 macOS 和 Xcode
   ```bash
   npm install @capacitor/ios
   npx cap add ios
   npx cap open ios
   ```

## 🎉 成功指标

- ✅ Node.js 升级到 v22.21.1
- ✅ Capacitor 8.0.0 安装成功
- ✅ Android 平台添加成功
- ✅ 项目构建成功
- ✅ Web 资源同步到 Android 项目

**状态**: 🟢 开发环境就绪，可以开始移动端开发！

---

*生成时间: 2026-01-06*
*Capacitor 版本: 8.0.0*
*Node 版本: 22.21.1*
