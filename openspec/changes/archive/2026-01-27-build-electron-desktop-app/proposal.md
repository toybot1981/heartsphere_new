# Change: 基于 PC 版本构建心域桌面应用程序

## Why

目前项目已有完整的 PC Web 版本（React + TypeScript），通过浏览器访问 `index.html` 可以正常使用。为了提供更好的桌面体验和离线能力，需要将现有的 PC React 版本打包成 Electron 桌面应用程序，使用户可以像原生应用一样安装和使用。

**核心原则**：直接适配，不进行二次开发。现有的 PC React 代码应能直接在 Electron 中运行，无需修改业务逻辑和组件代码。参考 Android/iOS 适配的成功经验，保持构建流程一致性。

## What Changes

- **Electron 集成**：
  - 安装和配置 Electron 框架
  - 创建 Electron 主进程和渲染进程配置
  - 配置 Electron 窗口、菜单、系统托盘等基础功能

- **构建配置完善**：
  - 创建 Electron 构建脚本，自动处理构建和打包流程
  - 配置 Electron Builder 用于生成可分发安装包（Windows、macOS、Linux）
  - 配置应用图标、应用信息等元数据

- **构建流程标准化**：
  - 创建标准化的构建流程文档
  - 提供一键构建和打包的 npm 脚本
  - 确保构建产物可以正常在桌面系统上运行

- **Electron 项目配置**：
  - 配置主进程（main process）入口文件
  - 配置渲染进程（renderer process）加载 PC 版本
  - 配置安全策略、窗口大小、菜单栏等

- **文档和指南**：
  - 创建 Electron 构建和打包指南
  - 提供常见问题解决方案
  - 记录构建和发布的完整流程（包括代码签名、自动更新等）

## Impact

- **影响的代码**：
  - `main/frontend/electron/` - Electron 项目配置（需要创建）
  - `main/frontend/scripts/build-electron.sh` - Electron 构建脚本（需要创建）
  - `main/frontend/package.json` - npm 脚本和依赖（需要添加）
  - `main/frontend/electron.config.js` - Electron 配置（需要创建）

- **影响的文档**：
  - `docs/ELECTRON_BUILD_GUIDE.md` - 构建指南（需要创建）
  - `docs/14-部署运维/有价值文档/ELECTRON_DESKTOP_BUILD_GUIDE.md` - 详细构建指南（需要创建）
  - `docs/14-部署运维/有价值文档/ELECTRON_DESKTOP_QUICK_START.md` - 快速开始（需要创建）

- **影响的工作流**：
  - 新增桌面应用的构建和发布流程
  - 开发者在发布新版本时需要同步构建桌面版本
  - 需要配置代码签名（用于 macOS/Windows 分发）

- **不改变的内容**：
  - ✅ PC React 代码不需要修改
  - ✅ 业务逻辑保持原样
  - ✅ UI 组件保持原样
  - ✅ API 调用方式保持原样

## Notes

- 此变更仅涉及构建和打包配置，不涉及业务代码修改
- 使用 Electron 框架，将 Web 应用包装为桌面原生应用
- Electron 应用本质上是一个 Chromium 浏览器窗口，加载构建后的 index.html
- 桌面应用适配参考 Android/iOS 适配的实现方式，保持一致性
- 未来可以考虑添加原生功能（如文件系统访问、系统通知、自动更新等），但不在本次变更范围内
