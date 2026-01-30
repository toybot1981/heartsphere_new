## ADDED Requirements

### Requirement: iOS 应用构建能力
系统 SHALL 提供将 Mobile React 版本打包成 iOS 原生应用的能力，使用 Capacitor 框架将 Web 应用适配为 iOS 应用。

#### Scenario: 开发者执行 iOS 构建
- **WHEN** 开发者在 `main/frontend` 目录下执行 `npm run cap:build:ios`
- **THEN** 系统 SHALL 自动完成以下步骤：
  - 构建 Web 版本（生成 dist 目录）
  - 将 mobile.html 复制为 index.html（供 iOS 使用）
  - 同步 Web 资源到 iOS 项目
  - 恢复原始的 index.html（如果有备份）
- **THEN** 构建成功后可以在 Xcode 中打开项目

#### Scenario: iOS 应用启动
- **WHEN** 用户在 iOS 设备上启动应用
- **THEN** 应用 SHALL 正确加载 Mobile React 版本的所有内容
- **THEN** WebView 中显示的内容与浏览器访问 mobile.html 一致
- **THEN** 所有功能（登录、场景管理、聊天等）都能正常工作

### Requirement: iOS 构建脚本自动化
系统 SHALL 提供自动化的构建脚本，处理 Mobile 版本到 iOS 应用的适配过程。

#### Scenario: 构建脚本执行
- **WHEN** 执行 `scripts/build-ios.sh` 脚本
- **THEN** 脚本 SHALL 自动处理 mobile.html 到 index.html 的转换
- **THEN** 脚本 SHALL 在同步前备份原始的 index.html（如果存在）
- **THEN** 脚本 SHALL 在同步后恢复原始的 index.html
- **THEN** 脚本 SHALL 提供清晰的执行日志和错误提示

#### Scenario: 构建失败处理
- **WHEN** 构建过程中出现错误（如 mobile.html 不存在、构建失败、Xcode 未安装等）
- **THEN** 脚本 SHALL 输出清晰的错误信息
- **THEN** 脚本 SHALL 正确清理临时文件（如有）
- **THEN** 脚本 SHALL 以非零退出码退出

### Requirement: Capacitor iOS 配置
系统 SHALL 提供正确的 Capacitor iOS 配置，确保 iOS 应用能够正确加载和运行。

#### Scenario: Capacitor 配置验证
- **WHEN** 查看 `capacitor.config.ts` 配置
- **THEN** 配置 SHALL 包含：
  - `appId`: `com.heartsphere.mobile`
  - `appName`: `心域`
  - `webDir`: `dist`
  - iOS 平台相关配置（contentInset、scrollEnabled 等）
  - 插件配置（StatusBar、SplashScreen）

#### Scenario: iOS 项目同步
- **WHEN** 执行 `npx cap sync ios`
- **THEN** 系统 SHALL 将 dist 目录的内容同步到 `ios/App/App/public/`
- **THEN** iOS 项目中的 Web 资源 SHALL 与 dist 目录保持一致

### Requirement: iOS 项目结构
系统 SHALL 提供完整的 iOS 项目结构，符合 Capacitor 和 iOS 开发规范。

#### Scenario: iOS 项目验证
- **WHEN** 查看 `ios/` 目录
- **THEN** 目录 SHALL 包含：
  - `App/App/Info.plist` - iOS 应用信息配置文件
  - `App/App/AppDelegate.swift` - 应用委托文件
  - `App/App/ViewController.swift` - 主视图控制器
  - `App/App.xcodeproj` - Xcode 项目文件

#### Scenario: ViewController 配置
- **WHEN** 查看 `ViewController.swift`
- **THEN** 类 SHALL 继承 `CAPBridgeViewController`（Capacitor 提供的视图控制器）
- **THEN** 类 SHALL 使用默认实现（构建脚本已处理页面加载）
- **THEN** 应用启动时 SHALL 正确加载 index.html（实际是 mobile.html 的内容）

### Requirement: iOS 网络配置
系统 SHALL 支持 iOS 应用访问后端 API，正确处理 iOS 模拟器和真实设备的网络访问。

#### Scenario: iOS 模拟器网络访问
- **WHEN** 应用在 iOS 模拟器中运行
- **THEN** 应用 SHALL 能够访问宿主机上的后端 API
- **THEN** API 请求应发送到正确的位置（localhost 或配置的地址）

#### Scenario: 真实设备网络访问
- **WHEN** 应用在真实 iOS 设备上运行
- **THEN** 应用 SHALL 能够通过局域网访问后端 API
- **THEN** API 请求应发送到配置的 IP 地址（如 192.168.x.x:8081）

### Requirement: 构建文档
系统 SHALL 提供完整的构建和运行文档，帮助开发者了解如何构建和发布 iOS 应用。

#### Scenario: 开发者查阅构建文档
- **WHEN** 开发者查看 `docs/14-部署运维/有价值文档/IOS_MOBILE_BUILD_GUIDE.md`
- **THEN** 文档 SHALL 包含：
  - 前提条件和环境要求（macOS、Xcode 版本等）
  - 详细的构建步骤
  - Xcode 使用方法
  - IPA 构建和发布流程
  - 常见问题和解决方案

#### Scenario: 快速开始指南
- **WHEN** 开发者查看 `docs/14-部署运维/有价值文档/IOS_MOBILE_QUICK_START.md`
- **THEN** 文档 SHALL 提供简洁的三步构建流程
- **THEN** 文档 SHALL 包含常用命令速查表
- **THEN** 文档 SHALL 包含常见问题的快速解决方案
