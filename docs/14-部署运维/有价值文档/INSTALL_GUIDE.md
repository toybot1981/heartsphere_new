# 📥 Android Studio 下载完成后的安装步骤

## ✅ 下载完成确认

首先检查下载是否完成：

```bash
./watch-download.sh
```

或者手动检查：

```bash
ls -lh /tmp/android-studio-mac.dmg
```

应该看到约 1.2 GB 的文件。

---

## 🚀 安装步骤

### 方法 1：使用 Finder（推荐）

1. **打开 Finder**
   - 按 `Cmd + N` 打开新窗口

2. **前往 /tmp 目录**
   - 按 `Cmd + Shift + G`
   - 输入: `/tmp`
   - 按回车

3. **打开 DMG 文件**
   - 找到 `android-studio-mac.dmg`
   - 双击打开

4. **安装 Android Studio**
   - 会看到 Android Studio 图标
   - 将图标拖到 "Applications" 文件夹

5. **启动 Android Studio**
   - 打开 Applications 文件夹
   - 找到 Android Studio
   - 双击启动

### 方法 2：使用命令行

```bash
# 1. 挂载 DMG 文件
hdiutil attach /tmp/android-studio-mac.dmg

# 2. 复制到 Applications
sudo cp -R "/Volumes/Android Studio/Android Studio.app" /Applications/

# 3. 卸载 DMG
hdiutil detach "/Volumes/Android Studio"

# 4. 启动 Android Studio
open -a "Android Studio"
```

### 方法 3：一键安装脚本

```bash
# 运行安装脚本
./install-android-studio.sh
```

---

## 🎯 首次启动配置

### 1. 欢迎向导

启动后会看到：
- **"Welcome to Android Studio"**
- 点击 **"Next"**

### 2. 安装类型

选择：
- ✅ **Standard** (标准安装) - 推荐
- ❌ Custom (自定义)

点击 **"Next"**

### 3. 验证设置

点击 **"Next"** 或 **"Finish"**

### 4. 下载组件

Android Studio 会自动下载：
- Android SDK
- Android SDK Platform-Tools
- Android SDK Build-Tools
- Android Emulator
- 系统镜像

**预计时间**: 10-30 分钟（取决于网络速度）

**下载大小**: 约 1-2 GB

### 5. 完成安装

下载完成后，点击 **"Finish"**

您会看到 Android Studio 主界面。

---

## 📱 创建虚拟设备（可选但推荐）

### 在 Android Studio 中创建

1. **打开 Device Manager**
   ```
   Tools → Device Manager
   ```

2. **点击 "Create Device"**

3. **选择设备**
   - 推荐: **Pixel 6**
   - 点击 **"Next"**

4. **选择系统镜像**
   - 推荐: **Android 13.0 (API 33)**
   - 如果需要下载，点击下载按钮
   - 下载大小: 约 1-2 GB

5. **配置 AVD**
   - AVD Name: `Pixel_6_API_33`
   - 点击 **"Finish"**

---

## 🎯 运行心域应用

安装完成后，返回项目目录：

```bash
cd /Users/admin/Workspace/heartsphere_new

# 启动开发环境
source dev-env.sh

# 打开 Android Studio
npx cap open android
```

### 在 Android Studio 中：

1. **等待 Gradle 同步**
   - 首次需要 5-10 分钟
   - 底部会显示进度

2. **选择设备**
   - 顶部工具栏选择虚拟设备
   - 或连接真实 Android 设备

3. **运行应用**
   - 点击绿色运行按钮 ▶️
   - 或按 `Control + R`

4. **查看应用**
   - 模拟器会自动启动
   - 应用会自动安装并运行
   - 应该看到"心域"应用的界面

---

## 🔧 故障排除

### 问题 1: DMG 文件损坏

**解决方案**：
```bash
# 删除并重新下载
rm /tmp/android-studio-mac.dmg
# 然后重新运行下载命令
```

### 问题 2: 无法打开 Android Studio

**解决方案**：
```bash
# 允许来自未知开发者的应用
sudo xattr -rd com.apple.quarantine "/Applications/Android Studio.app"
```

### 问题 3: SDK 下载失败

**解决方案**：
1. 检查网络连接
2. 配置代理（如果需要）
3. 重试下载

---

## ✅ 验证安装成功

运行以下命令验证：

```bash
# 检查 Android Studio
ls -la "/Applications/Android Studio.app"

# 检查 Android SDK
ls -la "$HOME/Library/Android/sdk"

# 检查 ADB
$HOME/Library/Android/sdk/platform-tools/adb version

# 或者使用开发环境脚本
source dev-env.sh
```

---

## 📚 下一步

安装完成后，请参考：

- **[CAPACITOR_QUICK_START.md](CAPACITOR_QUICK_START.md)** - 开发工作流
- **[CAPACITOR_CHECKLIST.md](CAPACITOR_CHECKLIST.md)** - 测试清单
- **[ANDROID_STUDIO_SETUP.md](ANDROID_STUDIO_SETUP.md)** - 详细配置指南

---

## 🆘 需要帮助？

如果遇到问题：
1. 查看 [ANDROID_STUDIO_SETUP.md](ANDROID_STUDIO_SETUP.md) 的故障排除部分
2. 访问 [Android Studio 官方文档](https://developer.android.com/studio/intro)
3. 运行 `source dev-env.sh` 检查环境

---

**准备好后，让我们开始运行您的第一个 Android 应用！** 🚀
