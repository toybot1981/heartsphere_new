# Electron 桌面应用快速开始指南

## 🚀 三步构建桌面应用

```bash
cd main/frontend

# 1. 安装依赖（首次）
npm install

# 2. 开发模式（启动 Vite + Electron）
npm run electron:dev

# 3. 打包应用
npm run electron:pack
```

## 📋 前提条件

- **Node.js**：18+ 或 22+
- **npm**：已随 Node.js 安装
- **Electron**：通过 `npm install` 自动安装

## ⚡ 常用命令

| 命令 | 说明 |
|------|------|
| `npm run electron:dev` | 开发模式（启动 Vite 开发服务器 + Electron） |
| `npm run electron:build` | 构建 Web 版本（生成 dist/） |
| `npm run electron:pack` | 构建并打包（生成安装包到 release/） |

## ⚠️ 重要提示

- **开发模式**：`electron:dev` 会自动启动 Vite 开发服务器，然后打开 Electron 窗口
- **打包**：`electron:pack` 会先构建 Web 版本，然后使用 electron-builder 打包
- **平台**：打包会生成当前平台的安装包（Windows: .exe/.msi, macOS: .dmg, Linux: .AppImage）

## 🐛 常见问题

### Electron 窗口白屏
```bash
# 确保 Vite 开发服务器已启动（electron:dev 会自动处理）
# 或手动运行：
npm run dev  # 在另一个终端
npm run electron:dev
```

### 打包失败
```bash
# 确保已安装所有依赖
npm install

# 确保已构建 Web 版本
npm run build
```

### 找不到 Electron
```bash
# 重新安装 Electron 依赖
npm install electron electron-builder --save-dev
```

## 📚 完整文档

- [Electron 桌面应用构建完整指南](./ELECTRON_DESKTOP_BUILD_GUIDE.md)
