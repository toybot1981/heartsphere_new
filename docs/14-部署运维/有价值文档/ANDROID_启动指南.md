# Android 应用启动指南

## 🚀 快速启动（三步）

```bash
cd main/frontend

# 1. 构建并同步到 Android
npm run cap:build:android

# 2. 打开 Android Studio
npm run cap:open:android

# 3. 在 Android Studio 中点击 Run ▶️ 按钮
```

## 📋 详细步骤

### 步骤 1: 确保构建和同步完成

```bash
cd main/frontend

# 构建并同步（会自动处理 mobile.html → index.html 转换）
npm run cap:build:android
```

**输出示例**：
```
✅ Android 构建完成！
📱 下一步操作:
   1. 打开 Android Studio: npm run cap:open:android
```

### 步骤 2: 打开 Android Studio

#### 方法 A: 使用命令（推荐）

```bash
npm run cap:open:android
```

#### 方法 B: 手动打开

1. 启动 Android Studio
2. 选择 "Open an Existing Project"
3. 导航到 `main/frontend/android` 目录
4. 点击 "OK"

### 步骤 3: 等待 Gradle 同步

首次打开项目时，Android Studio 会自动同步 Gradle：
- 底部状态栏会显示 "Gradle Sync"
- 等待同步完成（可能需要几分钟）
- 如果同步失败，点击 "Sync Now" 按钮

### 步骤 4: 选择运行设备

#### 选项 A: 使用 Android 模拟器

1. **创建模拟器**（如果还没有）：
   - 点击工具栏中的 "Device Manager" 图标（📱）
   - 点击 "Create Device"
   - 选择设备型号（如 Pixel 7）
   - 选择系统镜像（推荐 API 33 或更高）
   - 完成创建

2. **启动模拟器**：
   - 在设备列表中选择模拟器
   - 点击 "Play" 按钮启动
   - 等待模拟器完全启动

#### 选项 B: 使用真实 Android 设备

1. **启用开发者选项**：
   - 打开手机的"设置" → "关于手机"
   - 连续点击"版本号" 7 次
   - 返回设置，找到"开发者选项"

2. **启用 USB 调试**：
   - 进入"开发者选项"
   - 启用"USB 调试"
   - 连接手机到电脑（使用 USB 线）

3. **授权调试**：
   - 手机上会弹出授权提示
   - 勾选"始终允许来自这台计算机"并点击"确定"

4. **验证连接**：
   ```bash
   adb devices
   # 应该看到设备列表，显示 "device" 状态
   ```

### 步骤 5: 运行应用

#### 在 Android Studio 中运行

1. **选择设备**：
   - 在工具栏的设备选择器中选择目标设备
   - 确保设备状态显示为 "Online"

2. **点击 Run 按钮**：
   - 点击工具栏中的绿色 "Run" 按钮（▶️）
   - 或使用快捷键：
     - Mac: `Ctrl + R`
     - Windows/Linux: `Shift + F10`

3. **等待构建和安装**：
   - 首次运行需要编译，可能需要几分钟
   - 构建完成后会自动安装到设备/模拟器
   - 应用会自动启动

## 🖥️ 方式二：使用命令行（更快）

如果您已经配置好 Android SDK 环境变量，可以直接使用命令行运行：

```bash
cd main/frontend

# 确保已构建和同步
npm run cap:build:android

# 直接运行到已连接的设备/模拟器
npm run cap:run:android
```

**注意**：使用此方法需要：
- Android SDK 已正确配置
- 环境变量 `ANDROID_HOME` 已设置
- 设备已连接或模拟器正在运行

## 📱 验证应用运行

应用启动后，您应该看到：

1. **启动画面**（Splash Screen）：
   - 黑色背景，显示 2 秒

2. **Mobile 版本界面**：
   - 登录界面或入口页面
   - 界面与浏览器访问 `mobile.html` 一致

3. **功能测试**：
   - 尝试登录
   - 选择场景
   - 进入聊天
   - 所有功能应该与 Web 版本一致

## 🐛 常见问题

### 问题 1: Android Studio 无法打开项目

**解决方案**：
```bash
# 手动指定路径
open -a "Android Studio" main/frontend/android

# 或检查 Android Studio 是否正确安装
which studio
```

### 问题 2: Gradle 同步失败

**解决方案**：
1. 在 Android Studio 中：`File` → `Invalidate Caches / Restart`
2. 选择 "Invalidate and Restart"
3. 等待重启后重新同步

### 问题 3: 找不到设备

**解决方案**：
```bash
# 检查 adb 连接
adb devices

# 如果设备显示为 "unauthorized"：
# 1. 在手机上取消 USB 调试授权
# 2. 重新连接 USB
# 3. 重新授权

# 重启 adb
adb kill-server
adb start-server
```

### 问题 4: 应用安装失败

**可能原因**：
- 设备存储空间不足
- 签名冲突（已安装同名应用但签名不同）

**解决方案**：
```bash
# 卸载旧版本
adb uninstall com.heartsphere.mobile

# 重新安装
npm run cap:run:android
```

### 问题 5: 应用启动后白屏

**解决方案**：
```bash
# 重新构建和同步
npm run cap:build:android

# 在 Android Studio 中：
# Build → Clean Project
# 然后重新运行
```

### 问题 6: 找不到 Android SDK

**解决方案**：
```bash
# 添加到 ~/.zshrc（Mac）或 ~/.bash_profile（Linux）
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# 重新加载配置
source ~/.zshrc  # 或 source ~/.bash_profile
```

## 🔍 调试技巧

### 查看应用日志

在 Android Studio 中：
1. 打开 "Logcat" 标签（底部）
2. 过滤日志：搜索 "heartsphere" 或 "capacitor"
3. 查看错误和警告信息

### 使用 Chrome DevTools 调试

1. **启用远程调试**：
   - 应用启动后，在 Chrome 地址栏输入：
     ```
     chrome://inspect
     ```
   - 在 "Remote Target" 中找到您的应用
   - 点击 "inspect" 打开 DevTools

2. **调试 WebView**：
   - 可以查看 Console 日志
   - 检查 Network 请求
   - 调试 JavaScript 代码

### 检查 Web 资源是否正确加载

在 Logcat 中搜索：
```
Ionic WebView: file:///android_asset/public/index.html
```

如果看到此日志，说明资源加载成功。

## 📦 构建 APK 文件

如果需要生成 APK 文件安装到设备：

### Debug APK（开发版本）

```bash
cd main/frontend/android

# 构建 Debug APK
./gradlew assembleDebug

# APK 位置
# android/app/build/outputs/apk/debug/app-debug.apk
```

安装到设备：
```bash
# 安装到已连接的设备
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK（发布版本）

需要先配置签名（见完整构建指南）。

## ✅ 快速检查清单

在运行前确认：

- [ ] 已执行 `npm run cap:build:android`
- [ ] Android Studio 已安装
- [ ] 已创建模拟器或连接真实设备
- [ ] 设备/模拟器状态为 "Online"
- [ ] Gradle 同步成功
- [ ] 没有构建错误

## 📚 相关文档

- [Android Mobile 构建完整指南](./ANDROID_MOBILE_BUILD_GUIDE.md)
- [Android Mobile 快速开始](./ANDROID_MOBILE_QUICK_START.md)
- [Capacitor 官方文档](https://capacitorjs.com/docs/android)

---

**提示**：首次运行可能需要较长时间，请耐心等待。如果遇到问题，请查看上面的常见问题解决方案。
