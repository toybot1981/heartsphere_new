# iOS Mobile 版本快速开始指南

## 🚀 三步构建 iOS 应用

```bash
cd main/frontend

# 1. 构建并同步（使用专用脚本）
npm run cap:build:ios

# 2. 打开 Xcode
npm run cap:open:ios

# 3. 在 Xcode 中选择设备并点击 Run ▶️
```

## 📋 前提条件

- **macOS**：iOS 构建必须在 macOS 上运行
- **Xcode**：从 App Store 安装最新版本
- **Node.js**：18+ 或 22+
- **CocoaPods**（可选）：Capacitor 会自动处理，或 `brew install cocoapods`

## ⚡ 常用命令

| 命令 | 说明 |
|------|------|
| `npm run cap:build:ios` | 构建并同步到 iOS（**推荐使用**） |
| `npm run cap:open:ios` | 打开 Xcode |
| `npm run cap:run:ios` | 直接在设备/模拟器上运行 |
| `npm run build` | 仅构建 Web 版本（不包含 iOS 同步） |

## ⚠️ 重要提示

- **始终使用 `npm run cap:build:ios`** 而不是 `npx cap sync`，确保加载 `mobile.html`
- 首次在 Xcode 中打开需等待 CocoaPods 安装完成

## 🐛 常见问题

### 白屏或页面错误
```bash
npm run cap:build:ios
```

### CocoaPods 安装失败
```bash
cd ios/App
pod install
```

### 找不到模拟器
- 在 Xcode 中：Window → Devices and Simulators → 下载所需模拟器

## 📚 完整文档

- [iOS Mobile 构建完整指南](./IOS_MOBILE_BUILD_GUIDE.md)
