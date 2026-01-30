# Change: 基于 Mobile 版本适配生成 Android 应用

## Why

目前项目已有完整的 Mobile Web 版本（React + TypeScript），通过浏览器访问 `mobile.html` 可以正常使用。为了扩展移动端应用的分发渠道，需要将现有的 Mobile React 版本打包成 Android 原生应用，使用户可以通过 Google Play 或其他渠道安装使用。

**核心原则**：直接适配，不进行二次开发。现有的 Mobile React 代码应能直接在 Android WebView 中运行，无需修改业务逻辑和组件代码。

## What Changes

- **构建配置完善**：
  - 完善 Capacitor 配置，确保 Android 应用正确加载 mobile.html
  - 创建构建脚本，自动处理 mobile.html → index.html 的转换
  - 配置 Android 项目的基本信息（应用图标、启动画面、权限等）

- **构建流程标准化**：
  - 创建标准化的构建流程文档
  - 提供一键构建和运行的 npm 脚本
  - 确保构建产物可以正常在 Android 设备上运行

- **Android 项目配置**：
  - 配置 Android Manifest（权限、应用信息等）
  - 配置 Gradle 构建脚本
  - 确保 WebView 正确加载和渲染 Mobile 版本

- **文档和指南**：
  - 创建 Android 构建和运行指南
  - 提供常见问题解决方案
  - 记录构建和发布的完整流程

## Impact

- **影响的代码**：
  - `main/frontend/capacitor.config.ts` - Capacitor 配置
  - `main/frontend/android/` - Android 项目配置
  - `main/frontend/scripts/build-android.sh` - 构建脚本（已创建，需完善）
  - `main/frontend/package.json` - npm 脚本（已添加，需验证）

- **影响的文档**：
  - `docs/14-部署运维/有价值文档/ANDROID_MOBILE_BUILD_GUIDE.md` - 构建指南（已创建，需完善）
  - `docs/14-部署运维/有价值文档/ANDROID_MOBILE_QUICK_START.md` - 快速开始（已创建）

- **影响的工作流**：
  - 新增 Android 应用的构建和发布流程
  - 开发者在发布新版本时需要同步构建 Android 版本

- **不改变的内容**：
  - ✅ Mobile React 代码不需要修改
  - ✅ 业务逻辑保持原样
  - ✅ UI 组件保持原样
  - ✅ API 调用方式保持原样

## Notes

- 此变更仅涉及构建和打包配置，不涉及业务代码修改
- 使用 Capacitor 框架，将 Web 应用包装为原生应用
- Android 应用本质上是一个 WebView 容器，加载构建后的 mobile.html
- 未来可以考虑添加原生插件（如文件系统访问、推送通知等），但不在本次变更范围内
