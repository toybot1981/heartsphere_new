# Design: 基于 Mobile 版本适配生成 Android 应用

## Context

当前项目已有完整的 Mobile Web 版本，基于 React + TypeScript 构建，通过 `mobile.html` 入口文件访问。项目已配置 Capacitor 框架，具备生成 Android 应用的基础条件。

**核心约束**：直接适配，不进行二次开发。现有的 Mobile React 代码应能在 Android WebView 中直接运行，无需修改业务逻辑。

## Goals / Non-Goals

### Goals
- ✅ 将现有的 Mobile React 版本打包成 Android 原生应用
- ✅ 确保 Android 应用能正确加载和运行 Mobile 版本的所有功能
- ✅ 提供标准化的构建和发布流程
- ✅ 保持 Mobile React 代码不变，仅通过配置和构建流程适配 Android

### Non-Goals
- ❌ 不修改 Mobile React 的业务代码和组件
- ❌ 不在本次变更中添加原生插件功能（文件系统、推送通知等）
- ❌ 不进行性能优化（此变更仅关注打包适配）
- ❌ 不涉及 iOS 应用打包（未来可扩展）

## Decisions

### Decision 1: 使用 Capacitor 框架进行打包
**Why**: 项目已配置 Capacitor，Capacitor 是业界标准的混合应用框架，支持将 Web 应用打包为原生应用。

**Alternatives considered**:
- React Native：需要重写所有组件，违反"不二次开发"原则
- Cordova：功能类似，但 Capacitor 是 Ionic 推荐的现代化替代方案
- 原生开发：开发成本高，不符合快速适配的目标

### Decision 2: 构建时处理 mobile.html → index.html 转换
**Why**: Capacitor 默认加载 `index.html`，而 Mobile 版本使用 `mobile.html` 作为入口。通过构建脚本在同步前将 `mobile.html` 复制为 `index.html`，确保 Android 应用加载正确的页面。

**Alternatives considered**:
- 修改 MainActivity 加载 mobile.html：需要修改原生代码，增加维护成本
- 重命名源文件：会影响 Web 版本的访问路径
- 构建时转换：最小化影响，仅在 Android 构建时转换

### Decision 3: 使用构建脚本自动化处理
**Why**: 手动操作容易出错，构建脚本可以确保每次构建的一致性。

**Implementation**:
- 创建 `scripts/build-android.sh` 脚本
- 脚本执行：构建 → 备份 index.html → 复制 mobile.html → 同步 → 恢复
- 添加 npm 脚本 `cap:build:android` 方便调用

### Decision 4: 保持 MainActivity 默认实现
**Why**: 由于构建脚本已处理页面加载问题，MainActivity 只需继承 BridgeActivity 即可，无需特殊处理。

**Code**:
```java
public class MainActivity extends BridgeActivity {
    // 使用默认实现，构建脚本已处理 mobile.html → index.html 转换
}
```

## Architecture

### 构建流程

```
1. 执行 npm run build
   └─> 生成 dist/ 目录
       ├─> index.html (PC 版本)
       ├─> mobile.html (Mobile 版本)
       └─> assets/ (资源文件)

2. 执行 build-android.sh
   ├─> 备份 dist/index.html (如果存在)
   ├─> 复制 dist/mobile.html → dist/index.html
   ├─> 执行 npx cap sync android
   │   └─> 复制 dist/ 内容到 android/app/src/main/assets/public/
   └─> 恢复 dist/index.html (如果有备份)

3. Android 应用启动
   └─> MainActivity 加载 index.html
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
├── android/                 # Android 项目
│   └── app/
│       └── src/main/
│           ├── assets/public/    # Web 资源（Capacitor 同步）
│           └── java/com/heartsphere/mobile/
│               └── MainActivity.java
├── scripts/
│   └── build-android.sh     # Android 构建脚本
├── capacitor.config.ts      # Capacitor 配置
└── package.json             # npm 脚本配置
```

## Risks / Trade-offs

### Risk 1: 构建脚本失败导致构建流程中断
**Mitigation**: 
- 添加错误处理逻辑
- 在脚本中验证每个步骤的执行结果
- 提供清晰的错误提示信息

### Risk 2: WebView 兼容性问题
**Mitigation**:
- Android WebView 版本较新，支持现代 Web 特性
- 如遇到兼容性问题，可以通过 Capacitor 插件或 polyfill 解决

### Risk 3: 性能问题（WebView 性能 vs 原生）
**Trade-off**: 
- 接受 WebView 性能，换取快速适配和代码复用
- 如需更高性能，未来可以逐步将关键功能迁移到原生插件

### Risk 4: 构建产物大小（WebView 应用通常较大）
**Trade-off**:
- 接受较大的 APK 大小（通常 10-20MB），换取开发效率
- 可以通过代码分割和资源优化减小体积（未来优化）

## Migration Plan

### Phase 1: 验证现有配置（已完成）
- ✅ Capacitor 配置
- ✅ Android 项目结构
- ✅ 构建脚本创建

### Phase 2: 完善构建流程（进行中）
- 验证构建脚本
- 测试完整构建流程
- 修复发现的问题

### Phase 3: 测试和文档（待完成）
- 功能测试
- 文档完善
- 发布流程验证

## Open Questions

- [ ] 是否需要添加原生插件支持（文件系统、相机等）？
- [ ] 应用图标和启动画面是否已准备？
- [ ] 是否需要配置应用签名（用于发布）？

## References

- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [Android 开发指南](https://capacitorjs.com/docs/android)
- 项目现有文档：`docs/14-部署运维/有价值文档/ANDROID_MOBILE_BUILD_GUIDE.md`
