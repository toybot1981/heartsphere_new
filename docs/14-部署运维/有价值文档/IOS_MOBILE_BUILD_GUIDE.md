# iOS Mobile 版本构建指南

本指南说明如何基于现有 Mobile Web 版本构建 iOS 应用。

## 📋 前提条件

- **macOS**：必须使用 macOS
- **Xcode**：最新稳定版（从 App Store 安装）
- **Node.js**：18+ 或 22+
- **Capacitor**：已随项目配置（所有 Capacitor 包版本需一致，当前为 6.2.1）

## 🚀 快速开始

```bash
cd main/frontend

# 构建并同步到 iOS
npm run cap:build:ios

# 打开 Xcode
npm run cap:open:ios
```

在 Xcode 中选择模拟器或真机，点击 Run 运行。

## 📂 构建脚本说明

`scripts/build-ios.sh` 会：

1. 检查环境（macOS、Node、Xcode 等）
2. 执行 `npm run build`
3. 将 `dist/mobile.html` 复制为 `dist/index.html`（供 iOS 使用）
4. 执行 `npx cap copy ios`（仅复制 Web 资源，避免无 Xcode 时 `pod install` 失败）
5. 恢复原始 `index.html`

**务必使用 `npm run cap:build:ios`**，不要直接 `npx cap sync ios`。

若修改了原生依赖或新增 Capacitor 插件，可在项目根目录执行 `npx cap sync ios`（需安装 Xcode 与 CocoaPods）。

## 🌐 网络配置

### 环境变量配置

iOS 应用使用 Vite 环境变量来配置 API 地址。可以创建 `.env.ios.local` 文件（此文件会被 gitignore，不会提交到版本库）：

```bash
# iOS 模拟器访问宿主机使用 localhost
VITE_API_BASE_URL=http://localhost:8081

# 真实设备需要使用电脑的局域网 IP（取消注释并替换为实际 IP）
# VITE_API_BASE_URL=http://192.168.1.100:8081
```

### 网络访问说明

- **iOS 模拟器**：默认 `localhost:8081` 可访问宿主机，无需改配置。
- **真实设备**：需使用电脑局域网 IP，在 `.env.ios.local` 中设置后，重新执行 `npm run cap:build:ios`。

## 📱 Info.plist 与权限

已在 `ios/App/App/Info.plist` 中配置：

- **NSAppTransportSecurity**：允许 HTTP 与本地网络，便于开发时访问后端。

发布前可根据需要收紧为仅 HTTPS。

## 📦 发布构建（IPA）

1. 在 Xcode 中选中 **Any iOS Device**，Product → Archive。
2. 在 Organizer 中 Distribute App，选择 App Store Connect 或 Ad Hoc 等。
3. 按向导完成签名与上传。

## 🐛 故障排除

| 现象 | 处理 |
|------|------|
| `pod install` 失败 | 安装 CocoaPods：`brew install cocoapods`，再在 `ios/App` 下执行 `pod install` |
| 模拟器无法访问 API | 确认后端在 `localhost:8081`，或使用电脑 IP |
| 真机无法访问 API | 使用 `VITE_API_BASE_URL` 指向电脑 IP，且手机与电脑同一 WiFi |
| 白屏 | 重新执行 `npm run cap:build:ios`，在 Xcode 中 Clean Build Folder 后重跑 |

## 📂 相关路径

```
main/frontend/
├── ios/                 # iOS 项目
│   └── App/
│       └── App/
│           ├── Info.plist
│           └── Base.lproj/Main.storyboard  # CAPBridgeViewController
├── scripts/build-ios.sh
├── capacitor.config.ts
└── package.json         # cap:build:ios, cap:open:ios, cap:run:ios
```

## 📚 参考

- [Capacitor iOS 文档](https://capacitorjs.com/docs/ios)
- [Android Mobile 构建指南](./ANDROID_MOBILE_BUILD_GUIDE.md)
