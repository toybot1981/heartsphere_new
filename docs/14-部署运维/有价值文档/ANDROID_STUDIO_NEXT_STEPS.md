# 🎯 Android Studio 首次配置和运行应用指南

## 📱 第一步：完成 Android Studio 首次配置

Android Studio 应该已经打开。如果看到欢迎向导，请按以下步骤操作：

### 1. 欢迎界面
- **看到**: "Welcome to Android Studio"
- **操作**: 点击 **"Next"** 按钮

### 2. 安装类型选择
- **看到**: "Install Type"
- **选择**: ✅ **"Standard"** (标准安装，推荐)
- **操作**: 点击 **"Next"**

### 3. 验证设置
- **看到**: "Verify Settings"
- **操作**: 点击 **"Finish"** 或 **"Next"**

### 4. 下载组件（最重要，需要等待）
- **看到**: 开始下载各种组件
- **下载内容**:
  - Android SDK
  - Android SDK Platform-Tools
  - Android SDK Build-Tools
  - Android Emulator
  - 系统镜像（System Images）

**预计时间**: 10-30 分钟（取决于网络速度）

**下载大小**: 约 2-3 GB

**注意事项**:
- ✅ 保持网络连接
- ✅ 耐心等待，不要关闭 Android Studio
- ✅ 底部会显示下载进度

### 5. 完成下载
- **操作**: 下载完成后点击 **"Finish"**

您会看到 Android Studio 主界面。

---

## 📱 第二步：打开心域项目

### 方式 A：使用命令行（推荐）

打开终端，运行：

```bash
# 确保在项目目录
cd /Users/admin/Workspace/heartsphere_new

# 激活 Node 环境
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22

# 打开 Android Studio（会自动打开心域项目）
npx cap open android
```

### 方式 B：在 Android Studio 中手动打开

1. **打开 Android Studio**
2. **点击**: "Open" 或 "File → Open"
3. **导航到**: `/Users/admin/Workspace/heartsphere_new/android`
4. **选择**: `android` 文件夹
5. **点击**: "OK"

---

## ⏳ 第三步：等待 Gradle 同步（重要！）

项目打开后，Android Studio 会自动开始 **Gradle 同步**：

### 您会看到：
- 底部状态栏显示：**"Gradle Build Running..."**
- 右下角有进度指示器
- 可能会看到 "Background Tasks"

### 需要做：
- ✅ **耐心等待**（首次 5-10 分钟）
- ✅ 保持网络连接
- ❌ 不要点击 "Stop" 按钮
- ❌ 不要关闭 Android Studio

### 如何知道同步完成：
- 看到 **"BUILD SUCCESSFUL"** 消息
- 底部状态栏不再显示构建进度
- 左侧项目树可以看到 `app` 文件夹及其内容

### 如果同步失败：
1. 点击 "Try Again"
2. 或者运行：
   ```bash
   cd android
   ./gradlew clean
   ./gradlew build
   ```

---

## 📱 第四步：创建虚拟设备（AVD）

### 1. 打开 Device Manager

在 Android Studio 中：
- **方式 A**: 菜单栏 → **Tools → Device Manager**
- **方式 B**: 顶部工具栏的设备图标

### 2. 创建新设备

- **点击**: "Create Device" 按钮

### 3. 选择硬件设备

- **推荐选择**: **Pixel 6**
- **操作**: 选中后点击 **"Next"**

### 4. 选择系统镜像

- **推荐**: **Android 13.0 (API 33)** 或 **Android 14 (API 34)**
- **注意**:
  - 如果旁边有下载图标，点击下载
  - 下载大小：约 1-2 GB
  - 下载时间：5-15 分钟
- **操作**: 选择后点击 **"Next"**

### 5. 配置 AVD

- **AVD Name**: `Pixel_6_API_33` （可以自定义）
- **Show Advanced Settings** (可选):
  - **RAM**: 2048 MB 或更高
  - **VM Heap**: 512 MB
  - **Internal Storage**: 2048 MB
- **操作**: 点击 **"Finish"**

### 6. 验证

设备列表中应该显示您刚创建的设备。

---

## 🚀 第五步：运行心域应用

### 1. 选择设备

在 Android Studio 顶部工具栏：
- 找到设备选择下拉菜单（通常显示设备名称）
- **选择**: 您刚创建的虚拟设备（例如：Pixel_6_API_33）

### 2. 运行应用

**方式 A**: 点击工具栏的绿色运行按钮 ▶️

**方式 B**: 使用快捷键
- **Mac**: `Control + R`
- **Windows/Linux**: `Shift + F10`

### 3. 等待应用启动

您会看到：
- 模拟器自动启动
- Android 系统启动（首次可能较慢）
- "心域"应用自动安装
- 应用自动打开

**预计时间**: 2-5 分钟（首次较慢）

### 4. 验证应用运行

您应该看到：
- ✅ 模拟器显示手机界面
- ✅ "心域"应用图标出现在主屏幕
- ✅ 应用自动打开
- ✅ 显示移动版界面（角色选择、场景等）
- ✅ 可以正常导航和使用

---

## 🎯 成功标志

如果看到以下内容，说明一切正常：

### Android Studio
- ✅ Gradle 同步成功
- ✅ 没有红色错误提示
- ✅ 可以看到项目文件

### 模拟器
- ✅ 模拟器正常启动
- ✅ 应用成功安装
- ✅ 应用界面显示正常
- ✅ 可以点击和交互

### 应用
- ✅ 显示"心域"的移动界面
- ✅ 可以导航到不同页面
- ✅ 角色选择功能正常
- ✅ 场景选择功能正常

---

## 🔧 常见问题和解决方案

### 问题 1: Gradle 同步很慢或卡住

**解决方案**:
```bash
cd android
./gradlew clean
./gradlew build --info
```

### 问题 2: 找不到设备

**检查**:
```bash
# 检查模拟器是否运行
adb devices

# 如果没有设备，手动启动模拟器
# 在 Device Manager 中点击设备旁的播放按钮
```

### 问题 3: 应用安装失败

**解决方案**:
```bash
# 清除项目重新构建
cd android
./gradlew clean
cd ..
npx cap sync android
```

### 问题 4: 应用白屏或崩溃

**解决方案**:
```bash
# 检查日志
adb logcat | grep "heartsphere"

# 重新构建
cd frontend && npm run build && cd .. && npx cap sync android
```

### 问题 5: 模拟器启动很慢

**提示**:
- 首次启动总是很慢（2-3分钟）
- 后续会快很多
- 可以选择使用更低的 API 级别（如 API 31）
- 增加模拟器的 RAM 配置

---

## 📋 快速检查清单

在运行应用前，确认以下各项：

- [ ] Android Studio 已完成首次配置
- [ ] Android SDK 已下载
- [ ] 心域项目已在 Android Studio 中打开
- [ ] Gradle 同步成功
- [ ] 已创建虚拟设备（AVD）
- [ ] 已选择运行设备
- [ ] 点击了运行按钮

---

## 💡 提示和技巧

### 1. 保持耐心
- 首次配置需要时间
- Gradle 同步需要 5-10 分钟
- 模拟器首次启动需要 2-3 分钟

### 2. 保持网络连接
- SDK 下载需要网络
- Gradle 依赖下载需要网络
- 系统镜像下载需要网络

### 3. 使用真实设备（可选）
如果模拟器太慢：
```bash
# 在手机上启用开发者模式和 USB 调试
# 连接手机到电脑
# 运行：
adb devices
# 应该看到您的设备
```

### 4. 查看日志
```bash
# 实时查看应用日志
adb logcat | grep "heartsphere"

# 或在 Android Studio 底部查看 "Logcat" 标签
```

---

## 📚 相关文档

- **[CAPACITOR_QUICK_START.md](CAPACITOR_QUICK_START.md)** - 开发工作流
- **[CAPACITOR_CHECKLIST.md](CAPACITOR_CHECKLIST.md)** - 测试清单
- **[ANDROID_STUDIO_SETUP.md](ANDROID_STUDIO_SETUP.md)** - 详细配置

---

## 🎊 完成后

成功运行应用后，您可以：
- ✅ 测试所有功能
- ✅ 修改代码并重新构建
- ✅ 调试应用
- ✅ 准备发布

**祝您成功运行第一个心域移动应用！** 🚀
