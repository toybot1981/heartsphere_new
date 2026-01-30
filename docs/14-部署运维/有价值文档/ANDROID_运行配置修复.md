# Android "No main class defined" 错误修复指南

## 🔴 问题描述

在 Android Studio 中点击运行按钮时出现错误：
```
Error running 'Unnamed' No main class defined
```

## ✅ 解决方案

这个错误是因为运行配置被设置为普通的 Java 应用，而不是 Android 应用。需要创建正确的 Android 运行配置。

### 方法一：在 Android Studio 中创建运行配置（推荐）

#### 步骤 1: 确认项目识别为 Android 项目

1. 打开 Android Studio
2. 确保项目已正确导入：
   - 如果看到 "Gradle Sync" 提示，等待同步完成
   - 如果项目结构不正确，重新导入：
     - `File` → `Close Project`
     - `Open` → 选择 `main/frontend/android` 目录

#### 步骤 2: 创建 Android 运行配置

1. **打开运行配置**：
   - 点击工具栏中的运行配置下拉菜单（通常显示 "app" 或 "No configurations"）
   - 选择 `Edit Configurations...`
   - 或使用菜单：`Run` → `Edit Configurations...`

2. **添加 Android 配置**：
   - 点击左上角的 `+` 号
   - 选择 `Android App`

3. **配置设置**：
   - **Name**: `app`（或您喜欢的名称）
   - **Module**: 选择 `android.app`（如果存在）
   - **Launch**: 选择 `Default Activity`
   - **Deploy**: 保持默认设置

4. **应用并保存**：
   - 点击 `Apply`
   - 点击 `OK`

#### 步骤 3: 选择设备并运行

1. **选择设备**：
   - 在运行配置下拉菜单右侧，点击设备选择器
   - 选择已连接的设备或启动模拟器

2. **运行应用**：
   - 点击绿色的运行按钮（▶️）
   - 或使用快捷键 `Shift + F10`（Windows/Linux）或 `Ctrl + R`（Mac）

### 方法二：让 Android Studio 自动检测

如果方法一不行，尝试以下步骤：

1. **同步 Gradle**：
   - `File` → `Sync Project with Gradle Files`
   - 等待同步完成

2. **刷新项目**：
   - `File` → `Invalidate Caches / Restart`
   - 选择 `Invalidate and Restart`
   - 等待 Android Studio 重启

3. **检查模块**：
   - `File` → `Project Structure`（或 `Cmd + ;`）
   - 在左侧选择 `Modules`
   - 确保看到 `android.app` 模块
   - 如果没有，点击 `+` 添加模块

### 方法三：使用命令行运行（快速验证）

如果 Android Studio 配置有问题，可以先用命令行验证：

```bash
cd main/frontend/android

# 确保有设备连接
adb devices

# 构建并安装
./gradlew installDebug

# 启动应用
adb shell am start -n com.heartsphere.mobile/.MainActivity
```

### 方法四：重新导入项目

如果以上方法都不行，尝试重新导入：

1. **关闭项目**：
   - `File` → `Close Project`

2. **重新导入**：
   - 选择 `Open`
   - 导航到 `main/frontend/android` 目录
   - 选择该目录并打开

3. **等待 Gradle 同步**：
   - Android Studio 会自动检测 Android 项目
   - 等待同步完成

4. **检查运行配置**：
   - 运行配置下拉菜单应该自动显示 `app`

## 🔍 验证配置

运行配置正确后，您应该看到：

1. **运行配置下拉菜单**：
   - 显示 `app` 或类似名称
   - 不是 `Unnamed` 或 `No configurations`

2. **设备选择器**：
   - 显示可用设备列表
   - 或显示 "No devices"（需要连接设备）

3. **运行按钮**：
   - 绿色运行按钮（▶️）可用
   - 点击后会显示 Android 应用的运行日志

## 🐛 其他可能的问题

### 问题 1: 找不到 "Android App" 选项

**原因**: Android SDK 或插件未正确安装

**解决方案**:
1. `File` → `Settings`（或 `Preferences` on Mac）
2. `Plugins` → 确保 "Android Support" 插件已启用
3. `Appearance & Behavior` → `System Settings` → `Android SDK`
4. 确保已安装：
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - 至少一个 Android API Level（推荐 API 33+）

### 问题 2: 运行配置存在但无法运行

**检查清单**:
- [ ] MainActivity.java 是否存在且正确
- [ ] AndroidManifest.xml 配置正确
- [ ] Gradle 同步成功，无错误
- [ ] 已选择设备（模拟器或真实设备）
- [ ] 设备状态为 "Online"

### 问题 3: 项目结构不正确

**检查**:
```
android/
├── app/
│   └── src/
│       └── main/
│           ├── java/com/heartsphere/mobile/
│           │   └── MainActivity.java  ✅ 必须存在
│           ├── res/
│           └── AndroidManifest.xml    ✅ 必须存在
├── build.gradle
└── settings.gradle
```

## ✅ 成功标志

配置正确后，运行应用时应该看到：

1. **构建输出**：
   ```
   > Task :app:assembleDebug
   BUILD SUCCESSFUL
   ```

2. **安装输出**：
   ```
   > Task :app:installDebug
   Installing APK 'app-debug.apk' on 'Pixel_7_API_33(AVD) - 13'
   ```

3. **应用启动**：
   - 设备/模拟器上显示启动画面
   - 然后显示应用界面

## 📚 参考

- [Android Studio 官方文档](https://developer.android.com/studio/run)
- [Capacitor Android 指南](https://capacitorjs.com/docs/android)

---

**提示**: 如果问题仍然存在，请检查 Android Studio 的版本是否支持您的项目配置。
