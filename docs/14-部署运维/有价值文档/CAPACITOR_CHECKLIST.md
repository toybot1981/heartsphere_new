# Capacitor 设置检查清单

## ✅ 已完成项目

### 环境配置
- [x] 安装 Node Version Manager (nvm)
- [x] 安装 Node.js v22.21.1
- [x] 设置 Node 22 为默认版本
- [x] 重新安装 npm 依赖包 (兼容 Node 22)
- [x] 安装 Capacitor CLI 8.0.0
- [x] 安装 Capacitor Core 8.0.0
- [x] 安装 Capacitor Android 8.0.0

### Capacitor 配置
- [x] 创建 `capacitor.config.json`
- [x] 配置 App ID: `com.heartsphere.app`
- [x] 配置 App 名称: `心域`
- [x] 配置 Web 目录: `dist`
- [x] 配置服务器 scheme: `https`
- [x] 配置 SplashScreen 插件

### Android 项目
- [x] 添加 Android 平台 (`npx cap add android`)
- [x] 生成 Android 项目结构
- [x] 同步 Web 资源到 Android
- [x] 更新 Android 插件
- [x] 配置 Gradle 构建

### 前端构建
- [x] 清理 node_modules (解决 rollup 兼容性)
- [x] 重新安装依赖
- [x] 构建生产版本 (`npm run build`)
- [x] 生成 dist 目录
- [x] 验证构建输出

### 文档
- [x] 创建完整设置总结 ([CAPACITOR_SETUP_SUMMARY.md](CAPACITOR_SETUP_SUMMARY.md))
- [x] 创建快速开始指南 ([CAPACITOR_QUICK_START.md](CAPACITOR_QUICK_START.md))
- [x] 创建检查清单 (本文件)

## ⏳ 待完成项目

### Android 开发环境
- [ ] 安装 Android Studio
  ```
  下载: https://developer.android.com/studio
  安装后启动并完成初始化向导
  ```

- [ ] 配置 Android SDK
  ```
  打开 Android Studio → Preferences → Android SDK
  安装:
  - Android SDK Platform-Tools
  - Android SDK Build-Tools 33.0.0+
  - Android 13.0 (API 33) 或更高版本
  ```

- [ ] 配置环境变量
  ```bash
  # 添加到 ~/.zshrc
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  export PATH=$PATH:$ANDROID_HOME/tools
  export PATH=$PATH:$ANDROID_HOME/tools/bin

  # 重新加载配置
  source ~/.zshrc
  ```

- [ ] 创建 Android 虚拟设备 (AVD) 或连接真实设备
  ```
  Android Studio → Tools → Device Manager → Create Device
  推荐设备: Pixel 6
  推荐系统: Android 13 (API 33)
  ```

### 应用配置
- [ ] 设计并添加应用图标
  ```
  推荐: 512x512px PNG 格式
  命令: npx cap assets generate --icon ./icon.png
  ```

- [ ] 设计并添加启动画面
  ```
  推荐: 2732x2732px PNG 格式
  命令: npx cap assets generate --splash ./splash.png
  ```

- [ ] 配置应用权限
  ```
  编辑: android/app/src/main/AndroidManifest.xml
  添加所需权限 (网络、相机等)
  ```

- [ ] 配置应用签名
  ```
  生成 keystore: keytool -genkey ...
  配置: android/app/build.gradle
  ```

### 首次运行
- [ ] 打开 Android Studio
  ```bash
  npm run cap:open:android
  ```

- [ ] 等待 Gradle 同步完成
  ```
  Android Studio 会自动下载依赖
  首次可能需要 5-10 分钟
  ```

- [ ] 选择设备或模拟器

- [ ] 点击 Run 按钮 (绿色三角形)

- [ ] 验证应用正常运行
  ```
  检查:
  - 应用启动
  - 显示 Mobile 界面
  - 功能正常
  - 控制台无错误
  ```

## 🧪 测试清单

### 基础功能测试
- [ ] 应用启动无崩溃
- [ ] UI 显示正常
- [ ] 导航功能正常
- [ ] 角色选择功能
- [ ] 场景选择功能
- [ ] 聊天窗口功能
- [ ] 个人档案功能

### Capacitor 插件测试
- [ ] SplashScreen 显示正常
- [ ] StatusBar 颜色正确
- [ ] 键盘弹出无遮挡
- [ ] 返回键行为正确
- [ ] 权限请求正常

### 性能测试
- [ ] 启动时间 < 3秒
- [ ] 页面切换流畅
- [ ] 内存占用合理 (< 200MB)
- [ ] 无明显卡顿

## 📋 快速命令参考

### 环境准备
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22
```

### 构建流程
```bash
cd frontend
npm run build          # 构建前端
cd ..
npx cap sync android   # 同步到 Android
```

### 开发流程
```bash
# 方式 1: 使用 Android Studio
npm run cap:open:android

# 方式 2: 命令行直接运行
npm run cap:run:android

# 方式 3: Live Reload 开发
# 1. 修改 capacitor.config.json 添加 url 配置
# 2. npm run dev
# 3. npx cap run android
```

### 调试命令
```bash
# 查看日志
adb logcat | grep Capacitor

# 查看设备
adb devices

# 重启应用
adb shell am force-stop com.heartsphere.app
adb shell am start -n com.heartsphere.app/.MainActivity

# 清除缓存
adb shell pm clear com.heartsphere.app
```

## 🎯 优先级建议

### 高优先级 (立即完成)
1. ✅ 安装 Android Studio
2. ✅ 配置 Android SDK
3. ✅ 创建/连接设备
4. ✅ 首次运行应用

### 中优先级 (本周完成)
1. ⚠️ 添加应用图标
2. ⚠️ 添加启动画面
3. ⚠️ 测试核心功能
4. ⚠️ 修复发现的 bug

### 低优先级 (后续优化)
1. 📝 配置应用签名
2. 📝 优化应用性能
3. 📝 添加更多 Capacitor 插件
4. 📝 准备应用商店发布

## 📞 遇到问题？

### 资源链接
- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [Capacitor Forum](https://forum.capacitorjs.com/)
- [Stack Overflow - Capacitor](https://stackoverflow.com/questions/tagged/capacitor)

### 常见错误码
- `ANDROID_SDK_NOT_FOUND`: 需要安装 Android SDK
- `GRADLE_BUILD_FAILED`: 检查 `android/` 目录下运行 `./gradlew build`
- `NO_DEVICES_FOUND`: 连接设备或创建模拟器
- `CAPACITOR_NOT_CONFIGURED`: 确保 `capacitor.config.json` 存在

---

## 🎉 完成进度

```
环境配置:   ████████████████████ 100%
Capacitor:  ████████████████████ 100%
Android:    █████████░░░░░░░░░░░ 50%
测试:       ░░░░░░░░░░░░░░░░░░░░░   0%
发布:       ░░░░░░░░░░░░░░░░░░░░░   0%

总进度:     ████████░░░░░░░░░░░░ 50%
```

**下一步**: 安装 Android Studio 并完成首次运行！

---

*更新时间: 2026-01-06*
*当前状态: 🟢 环境就绪，等待 Android Studio 安装*
