# Design: 基于 Mobile 版本适配生成 iOS 应用

## Context

当前项目已有完整的 Mobile Web 版本，基于 React + TypeScript 构建，通过 `mobile.html` 入口文件访问。项目已成功适配 Android 应用，具备适配 iOS 应用的基础条件。Capacitor 配置中已包含 iOS 相关配置。

**核心约束**：直接适配，不进行二次开发。现有的 Mobile React 代码应能在 iOS WebView 中直接运行，无需修改业务逻辑。

## Goals / Non-Goals

### Goals
- ✅ 将现有的 Mobile React 版本打包成 iOS 原生应用
- ✅ 确保 iOS 应用能正确加载和运行 Mobile 版本的所有功能
- ✅ 提供标准化的构建和发布流程
- ✅ 保持 Mobile React 代码不变，仅通过配置和构建流程适配 iOS
- ✅ 复用 Android 适配的成功经验，保持构建流程一致性

### Non-Goals
- ❌ 不修改 Mobile React 的业务代码和组件
- ❌ 不在本次变更中添加原生插件功能（文件系统、推送通知等）
- ❌ 不进行性能优化（此变更仅关注打包适配）
- ❌ 不涉及 WatchOS、tvOS 等其他 Apple 平台

## Decisions

### Decision 1: 使用 Capacitor 框架进行打包
**Why**: 项目已配置 Capacitor，且 Android 适配已成功验证。Capacitor 支持跨平台（Android 和 iOS），使用统一的 Web 代码库。

**Alternatives considered**:
- React Native：需要重写所有组件，违反"不二次开发"原则
- 原生 Swift/Objective-C 开发：开发成本高，不符合快速适配的目标
- Cordova：功能类似，但 Capacitor 是现代化替代方案

### Decision 2: 复用 Android 构建脚本模式
**Why**: Android 适配已成功实现 mobile.html → index.html 的转换，iOS 可以复用相同的模式，保持一致性。

**Implementation**:
- 创建 `scripts/build-ios.sh` 脚本，逻辑与 Android 构建脚本类似
- 脚本执行：构建 → 备份 index.html → 复制 mobile.html → 同步 → 恢复
- 添加 npm 脚本 `cap:build:ios` 方便调用

### Decision 3: iOS 特有的配置处理
**Why**: iOS 有一些特有的配置需求（如安全区域、状态栏、网络权限等），需要在 iOS 项目中进行配置。

**Key configurations**:
- **Info.plist**: 配置网络权限（NSAppTransportSecurity）、应用名称等
- **安全区域**: 使用已有的 Mobile 组件安全区域适配
- **状态栏**: 通过 Capacitor StatusBar 插件配置

### Decision 4: 保持 ViewController 默认实现
**Why**: 由于构建脚本已处理页面加载问题，iOS 的 ViewController 只需使用默认的 Capacitor ViewController 即可，无需特殊处理。

## Architecture

### 构建流程

```
1. 执行 npm run build
   └─> 生成 dist/ 目录
       ├─> index.html (PC 版本)
       ├─> mobile.html (Mobile 版本)
       └─> assets/ (资源文件)

2. 执行 build-ios.sh
   ├─> 备份 dist/index.html (如果存在)
   ├─> 复制 dist/mobile.html → dist/index.html
   ├─> 执行 npx cap sync ios
   │   └─> 复制 dist/ 内容到 ios/App/App/public/
   └─> 恢复 dist/index.html (如果有备份)

3. iOS 应用启动
   └─> ViewController 加载 index.html
       └─> index.html 实际是 mobile.html 的内容
           └─> 加载 mobile.tsx → MobileApp 组件
```

### 项目结构

```
main/frontend/
├── mobile.html              # Mobile 版本 HTML 入口
├── mobile.tsx               # Mobile 版本 React 入口
├── mobile/                  # Mobile 组件目录
├── dist/                    # 构建输出
│   ├── index.html           # PC 版本（构建后）
│   ├── mobile.html          # Mobile 版本（构建后）
│   └── assets/              # 静态资源
├── ios/                     # iOS 项目（需要创建）
│   └── App/
│       ├── App/             # iOS 应用代码
│       │   ├── AppDelegate.swift
│       │   ├── ViewController.swift
│       │   └── Info.plist
│       └── App.xcodeproj    # Xcode 项目文件
├── scripts/
│   ├── build-android.sh     # Android 构建脚本（已存在）
│   └── build-ios.sh         # iOS 构建脚本（需要创建）
├── capacitor.config.ts      # Capacitor 配置
└── package.json             # npm 脚本配置
```

## Risks / Trade-offs

### Risk 1: 需要 macOS 环境进行构建
**Mitigation**: 
- 使用 GitHub Actions 或其他 CI/CD 平台进行自动化构建
- 提供详细的本地构建文档

### Risk 2: Xcode 版本兼容性
**Trade-off**:
- 需要兼容不同版本的 Xcode
- 使用 Capacitor 推荐的最低 Xcode 版本

### Risk 3: iOS 网络配置（与 Android 类似）
**Mitigation**:
- iOS 模拟器访问 localhost 需要使用电脑的实际 IP 地址
- 真实设备需要使用电脑的局域网 IP
- 提供网络配置文档

### Risk 4: App Store 发布流程复杂
**Trade-off**:
- 提供详细的 App Store 发布指南
- 需要 Apple Developer 账号
- 需要配置代码签名和证书

### Risk 5: iOS 特有的 WebView 限制
**Mitigation**:
- iOS WKWebView 对某些 Web 特性的支持可能与 Android WebView 不同
- 使用 Capacitor 插件解决兼容性问题
- 测试关键功能在 iOS 上的表现

## Migration Plan

### Phase 1: 添加 iOS 平台
- 添加 iOS 平台到 Capacitor 项目
- 验证 iOS 项目结构生成
- 配置基本信息（Bundle ID、应用名称等）

### Phase 2: 创建构建脚本
- 创建 iOS 构建脚本（参考 Android）
- 验证脚本逻辑
- 测试构建流程

### Phase 3: 配置 iOS 项目
- 配置 Info.plist（权限、网络等）
- 验证 ViewController 配置
- 配置应用图标和启动画面

### Phase 4: 测试和文档
- 功能测试
- 文档完善
- 发布流程验证

## Open Questions

- [ ] 是否需要配置 iOS 应用图标和启动画面？
- [ ] 是否需要配置 App Store 发布相关设置？
- [ ] 是否需要配置代码签名（用于真机测试）？
- [ ] iOS 模拟器的网络配置策略（localhost vs 实际 IP）？

## References

- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [iOS 开发指南](https://capacitorjs.com/docs/ios)
- Android 适配参考：`openspec/changes/adapt-mobile-to-android/`
- 项目现有文档：`docs/14-部署运维/有价值文档/ANDROID_MOBILE_BUILD_GUIDE.md`
