# Android Mobile 版本快速开始指南

## 🚀 三步构建 Android 应用

```bash
cd main/frontend

# 1. 构建并同步（使用专用脚本）
npm run cap:build:android

# 2. 打开 Android Studio
npm run cap:open:android

# 3. 在 Android Studio 中点击 Run ▶️
```

## 📋 前提条件检查

```bash
# 检查 Node.js 版本（需要 22+）
node --version

# 检查 Capacitor 是否安装
npm list @capacitor/core @capacitor/android

# 检查 Android SDK（如果已配置）
echo $ANDROID_HOME
```

如果 Android SDK 未配置，请：
1. 安装 [Android Studio](https://developer.android.com/studio)
2. 配置环境变量（见完整指南）

## ⚡ 常用命令

| 命令 | 说明 |
|------|------|
| `npm run cap:build:android` | 构建并同步到 Android（**推荐使用**） |
| `npm run cap:open:android` | 打开 Android Studio |
| `npm run cap:run:android` | 直接在设备/模拟器上运行 |
| `npm run build` | 仅构建 Web 版本（不包含 Android 同步） |

## ⚠️ 重要提示

- **始终使用 `npm run cap:build:android`** 而不是 `npx cap sync`，这样可以确保 Android 应用加载 `mobile.html` 而不是 `index.html`
- 首次构建可能需要较长时间（下载依赖、Gradle 同步等）

## 🐛 遇到问题？

### 白屏或页面错误
```bash
# 重新构建
npm run cap:build:android
```

### Gradle 同步失败
- 打开 Android Studio
- File → Invalidate Caches / Restart
- 重新同步项目

### 找不到 Android SDK
```bash
# 添加到 ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 重新加载
source ~/.zshrc
```

## 📚 完整文档

详细的构建指南、配置说明和故障排除，请参阅：
- [Android Mobile 构建完整指南](./ANDROID_MOBILE_BUILD_GUIDE.md)

---

**提示**：将此页加入书签，方便快速查阅！
