# Electron 桌面应用构建指南

本指南说明如何构建心域桌面应用程序。

## 快速开始

```bash
cd main/frontend
npm run electron:dev    # 开发模式
npm run electron:pack   # 打包应用
```

## 详细文档

- [Electron 桌面应用快速开始](./docs/14-部署运维/有价值文档/ELECTRON_DESKTOP_QUICK_START.md)
- [Electron 桌面应用构建完整指南](./docs/14-部署运维/有价值文档/ELECTRON_DESKTOP_BUILD_GUIDE.md)

## 核心命令

| 命令 | 说明 |
|------|------|
| `npm run electron:dev` | 开发模式（启动 Vite + Electron） |
| `npm run electron:build` | 构建 Web 版本 |
| `npm run electron:pack` | 构建并打包桌面应用 |

## 项目结构

```
main/frontend/
├── electron/
│   ├── main.cjs        # Electron 主进程
│   └── icons/          # 应用图标
├── scripts/
│   └── build-electron.sh
└── package.json        # Electron 配置
```
