# Electron 桌面应用构建指南

本指南说明如何基于现有 PC Web 版本构建 Electron 桌面应用。

## 📋 前提条件

- **Node.js**：18+ 或 22+
- **npm**：已随 Node.js 安装
- **Electron**：通过 `npm install` 自动安装

## 🚀 快速开始

```bash
cd main/frontend

# 开发模式
npm run electron:dev

# 打包应用
npm run electron:pack
```

## 📂 构建脚本说明

`scripts/build-electron.sh` 会：

1. 检查环境（Node.js、npm、Electron 等）
2. 执行 `npm run build`（生成 dist/ 目录）
3. 验证构建产物（dist/index.html）

**务必使用 `npm run electron:build`** 来构建 Web 版本，然后使用 `npm run electron:pack` 打包。

## 🖥️ Electron 主进程

主进程文件位于 `electron/main.cjs`，负责：

- 创建和管理应用窗口
- 处理应用生命周期（启动、退出等）
- 配置安全策略（contextIsolation、nodeIntegration 关闭）

### 开发模式 vs 生产模式

- **开发模式**（`APP_DEV=1`）：加载 `http://localhost:3000`（Vite 开发服务器）
- **生产模式**：加载 `file://` 协议下的 `dist/index.html`

## 📦 打包配置

Electron Builder 配置在 `package.json` 的 `build` 字段：

- **应用 ID**：`com.heartsphere.desktop`
- **应用名称**：`心域`
- **输出目录**：`release/`
- **平台支持**：Windows（.exe/.msi）、macOS（.dmg）、Linux（.AppImage）

### 多平台打包

```bash
# 当前平台
npm run electron:pack

# 指定平台（需要对应系统）
npm run electron:pack -- --win
npm run electron:pack -- --mac
npm run electron:pack -- --linux
```

## 🔒 代码签名（可选）

### macOS

需要 Apple Developer 账号和证书：

1. 在 Apple Developer 中创建证书
2. 在 `package.json` 的 `build.mac` 中添加：
   ```json
   "identity": "Developer ID Application: Your Name (TEAM_ID)"
   ```

### Windows

需要代码签名证书：

1. 获取代码签名证书
2. 在 `package.json` 的 `build.win` 中添加：
   ```json
   "signingHashAlgorithms": ["sha256"],
   "certificateFile": "path/to/certificate.pfx",
   "certificatePassword": "password"
   ```

## 🐛 故障排除

| 现象 | 处理 |
|------|------|
| Electron 窗口无法打开 | 检查 `electron/main.cjs` 是否存在且正确 |
| 开发模式无法加载页面 | 确保 Vite 开发服务器在 `http://localhost:3000` 运行 |
| 打包失败 | 检查 `dist/` 目录是否存在且包含 `index.html` |
| 应用图标缺失 | 在 `electron/icons/` 中添加图标文件（.ico, .icns, .png） |

## 📂 相关路径

```
main/frontend/
├── electron/                 # Electron 项目
│   ├── main.cjs             # 主进程入口
│   └── icons/                # 应用图标
├── scripts/build-electron.sh # 构建脚本
├── dist/                    # 构建输出（Web 版本）
├── release/                 # 打包输出（安装包）
└── package.json             # electron:dev, electron:build, electron:pack
```

## 📚 参考

- [Electron 官方文档](https://www.electronjs.org/docs)
- [Electron Builder 文档](https://www.electron.build/)
- [Android Mobile 构建指南](./ANDROID_MOBILE_BUILD_GUIDE.md)
- [iOS Mobile 构建指南](./IOS_MOBILE_BUILD_GUIDE.md)
