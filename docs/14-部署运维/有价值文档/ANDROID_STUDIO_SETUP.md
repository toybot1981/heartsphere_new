# Android Studio 安装和配置指南

## 📥 第一步：下载 Android Studio

### 方式 A：直接下载（推荐）

```bash
# 在浏览器中打开以下链接：
https://developer.android.com/studio

# 或者使用 Mac Apple Silicon 版本（推荐）：
https://redirector.gvt1.com/edgedl/android/studio/install/2024.1.1.12/android-studio-2024.1.1.12-mac_arm.dmg

# Intel 版本：
https://redirector.gvt1.com/edgedl/android/studio/install/2024.1.1.12/android-studio-2024.1.1.12-mac.dmg
```

### 方式 B：使用 Homebrew 安装（如果您的 Homebrew 可用）

```bash
# 检查您是 ARM (Apple Silicon) 还是 Intel Mac
uname -m

# ARM Mac (Apple Silicon)
arch -arm64 brew install --cask android-studio

# Intel Mac
arch -x86_64 brew install --cask android-studio
```

---

## 🛠️ 第二步：安装 Android Studio

### 1. 打开下载的 DMG 文件
- 双击下载的 `.dmg` 文件
- 将 "Android Studio" 拖到 "Applications" 文件夹

### 2. 首次启动 Android Studio
```bash
# 从 Launchpad 或 Applications 启动 Android Studio
open -a "Android Studio"
```

### 3. 完成安装向导
Android Studio 首次启动时会显示安装向导：

**选择 "Standard" 安装类型**
- ✅ Standard (标准安装，推荐)
- ❌ Custom (自定义安装)

**等待下载组件**
- Android SDK
- Android SDK Platform-Tools
- Android SDK Build-Tools
- Android SDK Emulator
- Intel® HAXM (如果使用 Intel Mac)
- 下载大小：约 1-2 GB
- 下载时间：10-30 分钟（取决于网络速度）

---

## ⚙️ 第三步：配置 Android SDK

### 1. 打开 SDK Manager
```
Android Studio → Settings (macOS: Preferences)
    → Appearance & Behavior
    → System Settings
    → Android SDK
```

### 2. 确保安装以下组件

#### SDK Platforms 选项卡
- ✅ Android 13.0 (API 33) - 推荐
- ✅ Android 14.0 (API 34) - 可选

#### SDK Tools 选项卡
- ✅ Android SDK Build-Tools 33.0.0 或更高
- ✅ Android SDK Platform-Tools
- ✅ Android SDK Tools
- ✅ Android Emulator
- ✅ Intel® HAXM installer (Intel Mac) 或 HYPNOTIZER (ARM Mac)

### 3. 点击 "Apply" 或 "OK" 安装缺少的组件

---

## 📱 第四步：创建虚拟设备 (AVD)

### 方式 A：在 Android Studio 中创建（推荐）

1. **打开 Device Manager**
   ```
   Android Studio → Tools → Device Manager
   ```

2. **点击 "Create Device"**

3. **选择设备**
   - 推荐选择: **Pixel 6**
   - 屏幕尺寸和分辨率适中

4. **选择系统镜像**
   - 推荐选择: **Android 13.0 (API 33)**
   - 如果图标旁边有下载按钮，点击下载
   - 下载大小：约 1-2 GB

5. **配置 AVD**
   - AVD Name: `Pixel_6_API_33`
   - Show Advanced Settings:
     - RAM: 推荐 2048 MB 或更高
     - VM Heap: 512 MB
     - Internal Storage: 2048 MB
     - SD Card: (可选)

6. **点击 "Finish" 完成创建**

### 方式 B：使用命令行创建

```bash
# 列出可用的系统镜像
$HOME/Library/Android/sdk/emulator/list-avds

# 创建 AVD（需要先在 Android Studio 中下载系统镜像）
avdmanager create avd -n Pixel_6_API_33 -k "system-images;android-33;google_apis;x86_64"

# 启动模拟器
emulator -avd Pixel_6_API_33
```

---

## 🎯 第五步：验证安装

### 1. 验证 Android Studio

```bash
# 检查 Android Studio 版本
cat "/Applications/Android Studio.app/Contents/info.plist" | grep CFBundleShortVersionString

# 或在 Android Studio 中查看
# Help → About
```

### 2. 验证 Android SDK

```bash
# 检查 SDK 路径
ls -la $HOME/Library/Android/sdk

# 应该看到以下目录：
# - build-tools
# - emulator
# - platform-tools
# - platforms
# - tools
```

### 3. 验证 ADB（Android Debug Bridge）

```bash
# 将 Android SDK 工具添加到 PATH（添加到 ~/.zshrc）
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# 重新加载配置
source ~/.zshrc

# 验证 ADB
adb version

# 列出已连接的设备（应该看到模拟器）
adb devices
```

---

## 🚀 第六步：启动您的第一个 Capacitor 应用

### 1. 打开项目

```bash
# 确保在正确的目录
cd /Users/admin/Workspace/heartsphere_new

# 激活 Node 环境
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22

# 打开 Android Studio
npx cap open android
```

### 2. 在 Android Studio 中

1. **等待 Gradle 同步**
   - 首次打开会自动开始 Gradle 同步
   - 底部状态栏显示 "Gradle Build Running..."
   - 同步时间：5-10 分钟

2. **选择设备**
   - 顶部工具栏，设备选择下拉菜单
   - 选择您创建的虚拟设备（例如：Pixel_6_API_33）

3. **点击运行按钮**
   - 绿色三角形 ▶️ 按钮
   - 或快捷键：`Ctrl + R` (Windows/Linux) 或 `Control + R` (Mac)

4. **等待应用启动**
   - 模拟器会自动启动
   - 应用会自动安装并运行
   - 首次可能需要 1-2 分钟

### 3. 验证应用运行

您应该看到：
- ✅ 模拟器启动
- ✅ "心域" 应用图标出现在主屏幕
- ✅ 应用自动打开
- ✅ 显示 Mobile 版本的界面
- ✅ 可以正常导航和使用功能

---

## 🔧 故障排除

### 问题 1: Gradle 同步失败

**解决方案：**
```bash
cd android
./gradlew clean
./gradlew build

# 如果仍然失败，尝试删除 .gradle 缓存
cd ..
rm -rf android/.gradle
npx cap sync android
```

### 问题 2: 模拟器启动失败

**解决方案：**
```bash
# 检查系统要求
# macOS: 需要 macOS 10.13 或更高

# 冷启动模拟器
$HOME/Library/Android/sdk/emulator/emulator -avd Pixel_6_API_33 -no-snapshot-load

# 查看详细错误日志
$HOME/Library/Android/sdk/emulator/emulator -avd Pixel_6_API_33 -verbose
```

### 问题 3: HAXM 安装失败（Intel Mac）

**解决方案：**
```bash
# 手动安装 HAXM
sudo $HOME/Library/Android/sdk/extras/intel/HAXM/silent_install.sh

# 验证 HAXM 运行
kextstat | grep intel
```

### 问题 4: 应用白屏或崩溃

**解决方案：**
```bash
# 检查日志
adb logcat | grep Capacitor

# 重新构建和同步
cd frontend && npm run build && cd .. && npx cap sync android

# 清除应用数据
adb shell pm clear com.heartsphere.app
```

### 问题 5: "INSTALL_FAILED_INSUFFICIENT_STORAGE"

**解决方案：**
```bash
# 在 AVD 管理器中增加模拟器存储空间
# 或在创建 AVD 时设置更大的内部存储（至少 2048 MB）
```

---

## 📚 有用的命令和快捷键

### Android Studio 快捷键

| 功能 | Mac | Windows/Linux |
|------|-----|---------------|
| 运行应用 | Control + R | Shift + F10 |
| 调试应用 | Control + D | Shift + F9 |
| 停止应用 | Command + F2 | Control + F2 |
| 清理项目 | - | Build → Clean Project |
| 重新构建 | - | Build → Rebuild Project |

### ADB 命令

```bash
# 列出设备
adb devices

# 查看实时日志
adb logcat

# 查看特定标签的日志
adb logcat | grep "Capacitor"
adb logcat | grep "heartsphere"

# 安装 APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 卸载应用
adb uninstall com.heartsphere.app

# 重启应用
adb shell am force-stop com.heartsphere.app
adb shell am start -n com.heartsphere.app/.MainActivity

# 查看设备属性
adb shell getprop

# 截图
adb shell screencap -p /sdcard/screen.png
adb pull /sdcard/screen.png
```

---

## 🎯 完成检查清单

安装完成后，验证以下项目：

- [ ] Android Studio 已安装并可以启动
- [ ] Android SDK 已下载并配置
- [ ] 至少创建了一个虚拟设备 (AVD)
- [ ] 可以通过命令行运行 `adb devices`
- [ ] Gradle 同步成功完成
- [ ] 可以在 Android Studio 中运行应用
- [ ] 应用在模拟器中成功启动
- [ ] 应用界面正常显示
- [ ] 可以正常导航和使用基本功能

---

## 📖 下一步

安装完成后，参考以下文档：

1. **[CAPACITOR_QUICK_START.md](CAPACITOR_QUICK_START.md)** - 开发工作流
2. **[CAPACITOR_CHECKLIST.md](CAPACITOR_CHECKLIST.md)** - 测试清单
3. **[CAPACITOR_SETUP_SUMMARY.md](CAPACITOR_SETUP_SUMMARY.md)** - 完整配置说明

---

## 🆘 需要帮助？

### 官方资源
- [Android Studio 官方文档](https://developer.android.com/studio/intro)
- [Android 开发者指南](https://developer.android.com/guide)
- [Capacitor Android 指南](https://capacitorjs.com/docs/android)

### 社区支持
- [Stack Overflow - Android](https://stackoverflow.com/questions/tagged/android)
- [Stack Overflow - Capacitor](https://stackoverflow.com/questions/tagged/capacitor)

---

**预计总安装时间**: 30-60 分钟（取决于网络速度）

**准备好后，让我们开始运行您的第一个 Android 应用！** 🚀
