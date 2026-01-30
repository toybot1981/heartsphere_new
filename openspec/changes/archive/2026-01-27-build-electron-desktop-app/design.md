# Design: 基于 PC 版本构建心域桌面应用程序

## Context

当前项目已有完整的 PC Web 版本，基于 React + TypeScript 构建，通过 `index.html` 入口文件访问。项目已成功适配 Android 和 iOS 应用，具备适配桌面应用的基础条件。

**核心约束**：直接适配，不进行二次开发。现有的 PC React 代码应能在 Electron 中直接运行，无需修改业务逻辑。

## Goals / Non-Goals

### Goals
- ✅ 将现有的 PC React 版本打包成 Electron 桌面应用
- ✅ 确保桌面应用能正确加载和运行 PC 版本的所有功能
- ✅ 提供标准化的构建和发布流程
- ✅ 保持 PC React 代码不变，仅通过配置和构建流程适配 Electron
- ✅ 复用 Android/iOS 适配的成功经验，保持构建流程一致性
- ✅ 支持 Windows、macOS、Linux 三大平台

### Non-Goals
- ❌ 不修改 PC React 的业务代码和组件
- ❌ 不在本次变更中添加原生功能（文件系统、系统通知、自动更新等）
- ❌ 不进行性能优化（此变更仅关注打包适配）
- ❌ 不涉及 Electron 插件开发（未来可扩展）

## Decisions

### Decision 1: 使用 Electron 框架进行打包
**Why**: Electron 是成熟的跨平台桌面应用框架，支持 Windows、macOS、Linux，使用 Web 技术栈，与项目现有技术栈完全匹配。

**Alternatives considered**:
- Tauri：更轻量，但需要 Rust 开发，学习成本高
- NW.js：功能类似，但 Electron 生态更成熟
- 原生开发：开发成本高，不符合快速适配的目标

### Decision 2: 复用 Android/iOS 构建脚本模式
**Why**: Android/iOS 适配已成功实现构建脚本模式，Electron 可以复用相同的模式，保持一致性。

**Implementation**:
- 创建 `scripts/build-electron.sh` 脚本，逻辑与移动端构建脚本类似
- 脚本执行：构建 → 配置 Electron → 打包
- 添加 npm 脚本 `electron:build` 方便调用

### Decision 3: 使用 Electron Builder 进行打包
**Why**: Electron Builder 是 Electron 官方推荐的打包工具，支持多平台、代码签名、自动更新等功能。

**Key configurations**:
- **应用信息**: 配置应用名称、版本、图标等
- **打包配置**: 配置 Windows、macOS、Linux 的打包选项
- **代码签名**: 配置 macOS 和 Windows 的代码签名（可选，用于分发）

### Decision 4: 保持主进程最小化
**Why**: 为了保持简单，主进程只负责窗口管理和基础功能，不添加复杂的原生功能。

**Key responsibilities**:
- 创建和管理应用窗口
- 处理应用生命周期（启动、退出等）
- 配置菜单栏（可选）
- 处理系统托盘（可选）

## Architecture

### 构建流程

```
1. 执行 npm run build
   └─> 生成 dist/ 目录
       ├─> index.html (PC 版本)
       ├─> assets/ (资源文件)
       └─> ...

2. 执行 build-electron.sh
   ├─> 检查环境（Node、Electron 等）
   ├─> 执行 npm run build（如果未构建）
   ├─> 配置 Electron 主进程
   └─> 执行 electron-builder 打包
       └─> 生成安装包（.exe, .dmg, .AppImage 等）

3. Electron 应用启动
   └─> 主进程创建窗口
       └─> 加载 file:// 或 http:// 协议下的 index.html
           └─> 加载 index.tsx → App 组件
```

### 项目结构

```
main/frontend/
├── index.html              # PC 版本 HTML 入口
├── index.tsx               # PC 版本 React 入口
├── dist/                   # 构建输出
│   ├── index.html          # PC 版本（构建后）
│   └── assets/             # 静态资源
├── electron/               # Electron 项目（需要创建）
│   ├── main.js             # 主进程入口
│   ├── preload.js          # 预加载脚本（可选）
│   └── icons/               # 应用图标
├── scripts/
│   ├── build-android.sh    # Android 构建脚本（已存在）
│   ├── build-ios.sh        # iOS 构建脚本（已存在）
│   └── build-electron.sh   # Electron 构建脚本（需要创建）
├── electron.config.js      # Electron Builder 配置（需要创建）
└── package.json            # npm 脚本配置
```

## Risks / Trade-offs

### Risk 1: 应用体积较大
**Mitigation**: 
- Electron 应用包含 Chromium，体积较大（~100MB+）
- 使用 Electron Builder 的压缩选项
- 考虑未来使用 Tauri 作为替代方案（如果体积成为问题）

### Risk 2: 性能问题
**Trade-off**:
- Electron 应用性能可能不如原生应用
- 对于当前应用场景（AI 对话、场景管理），性能足够
- 未来可以优化（代码分割、懒加载等）

### Risk 3: 安全策略
**Mitigation**:
- 配置 Content Security Policy (CSP)
- 禁用 Node.js 在渲染进程中的访问（安全模式）
- 使用 contextIsolation 和 preload 脚本

### Risk 4: 跨平台兼容性
**Mitigation**:
- 测试 Windows、macOS、Linux 三大平台
- 处理平台特定的路径、菜单等差异
- 提供平台特定的构建脚本

### Risk 5: 代码签名和分发
**Trade-off**:
- macOS 和 Windows 需要代码签名才能正常分发
- 需要 Apple Developer 账号（macOS）和代码签名证书（Windows）
- 提供详细的签名配置文档

## Migration Plan

### Phase 1: 集成 Electron
- 安装 Electron 和 Electron Builder
- 创建主进程入口文件
- 配置基础窗口和菜单

### Phase 2: 创建构建脚本
- 创建 Electron 构建脚本（参考 Android/iOS）
- 验证脚本逻辑
- 测试构建流程

### Phase 3: 配置打包
- 配置 Electron Builder
- 配置应用图标和信息
- 测试多平台打包

### Phase 4: 测试和文档
- 功能测试
- 文档完善
- 发布流程验证

## Open Questions

- [ ] 是否需要配置系统托盘功能？
- [ ] 是否需要配置自动更新功能？
- [ ] 是否需要配置代码签名（用于分发）？
- [ ] 是否需要配置自定义菜单栏？
- [ ] 开发环境是使用 file:// 协议还是本地服务器？

## References

- [Electron 官方文档](https://www.electronjs.org/docs)
- [Electron Builder 文档](https://www.electron.build/)
- Android 适配参考：`openspec/changes/adapt-mobile-to-android/`
- iOS 适配参考：`openspec/changes/adapt-mobile-to-ios/`
- 项目现有文档：`docs/14-部署运维/有价值文档/ANDROID_MOBILE_BUILD_GUIDE.md`
