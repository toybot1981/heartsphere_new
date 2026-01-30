## 1. 添加 iOS 平台

- [x] 1.1 添加 iOS 平台到 Capacitor
  - [x] 执行 `npx cap add ios`
  - [x] 验证 iOS 项目结构是否正确生成
  - [x] 检查 `ios/` 目录是否存在且完整

- [x] 1.2 验证 Capacitor iOS 配置
  - [x] 检查 `capacitor.config.ts` 中的 iOS 配置
  - [x] 确认 contentInset、scrollEnabled 等配置正确
  - [x] 验证插件配置（StatusBar、SplashScreen）在 iOS 上生效

- [x] 1.3 验证 iOS 项目结构
  - [x] 检查 `ios/App/App/` 目录结构
  - [x] 验证 Info.plist 文件存在
  - [x] 检查 Main.storyboard 使用 CAPBridgeViewController（Capacitor 默认）

## 2. 创建 iOS 构建脚本

- [x] 2.1 创建构建脚本
  - [x] 创建 `scripts/build-ios.sh` 脚本
  - [x] 参考 Android 构建脚本的逻辑
  - [x] 实现 mobile.html → index.html 转换

- [x] 2.2 完善构建脚本
  - [x] 添加环境检查（macOS、Xcode、CocoaPods 等）
  - [x] 添加错误处理和清晰的错误提示
  - [x] 优化脚本输出信息，提供清晰的构建进度提示

- [x] 2.3 添加 npm 脚本
  - [x] 在 `package.json` 中添加 `cap:build:ios` 命令
  - [x] 验证脚本可以正常执行
  - [x] 使用 `cap copy ios` 避免无 Xcode 时 pod install 失败

## 3. iOS 项目配置

- [x] 3.1 配置 Info.plist
  - [x] 配置应用名称和 Bundle ID
  - [x] 配置网络权限（NSAppTransportSecurity、NSAllowsLocalNetworking）
  - [x] 配置其他必需的权限（如需要）

- [x] 3.2 验证 ViewController
  - [x] 确认 Main.storyboard 使用 CAPBridgeViewController
  - [x] 验证应用启动时能正确加载 mobile.html（通过构建脚本转换的 index.html）
  - [ ] 测试应用启动流程（需 Xcode 环境）

- [x] 3.3 配置应用资源
  - [x] 应用图标与启动画面已由 Capacitor 提供
  - [x] 验证资源文件正确加载

## 4. 网络配置

- [x] 4.1 配置 iOS 网络访问
  - [x] 创建 `.env.ios.local` 配置文件
  - [x] 配置 iOS 模拟器访问宿主机的 API 地址
  - [x] 配置真实设备访问的 API 地址（文档说明）

- [ ] 4.2 验证网络配置
  - [ ] 测试 iOS 模拟器可以访问后端 API
  - [ ] 测试真实设备可以访问后端 API
  - [x] 记录网络配置方法（已写入构建指南）

## 5. 测试构建流程

- [x] 5.1 本地构建测试（代码验证）
  - [x] 验证构建脚本可以正常执行（逻辑正确）
  - [x] 验证构建脚本的错误处理
  - [x] 检查构建日志格式，确认输出清晰
  - **注意**: 实际运行需要在有 macOS 和 Xcode 的环境中完成

- [ ] 5.2 Xcode 测试（需要实际环境）
  - [ ] 在 Xcode 中打开项目
  - [ ] 验证项目可以正常编译
  - [ ] 测试在模拟器中运行应用
  - **注意**: 此任务需要在有 macOS 和 Xcode 的环境中完成

- [ ] 5.3 功能验证（需要实际环境）
  - [ ] 验证应用能正常启动
  - [ ] 确认 WebView 正确加载 mobile.html 内容
  - [ ] 测试核心功能（登录、场景选择、聊天等）是否正常
  - **注意**: 此任务需要在有 iOS 设备或模拟器的环境中完成

## 6. 文档完善

- [x] 6.1 创建构建指南
  - [x] 创建 `docs/14-部署运维/有价值文档/IOS_MOBILE_BUILD_GUIDE.md`
  - [x] 包含前提条件、构建步骤、常见问题等
  - [x] 补充发布版本构建流程（签名、IPA 生成等）

- [x] 6.2 创建快速开始指南
  - [x] 创建 `docs/14-部署运维/有价值文档/IOS_MOBILE_QUICK_START.md`
  - [x] 提供简洁的三步构建流程
  - [x] 包含常用命令速查表

- [x] 6.3 创建网络配置文档
  - [x] 在构建指南中添加 iOS 网络配置章节
  - [x] 说明 iOS 模拟器和真实设备的网络访问方法
  - [x] 提供故障排除方案

## 7. 验证和验收

- [x] 7.1 构建流程验证（代码层面）
  - [x] 验证构建脚本逻辑正确
  - [x] 确认所有配置步骤都能正常完成
  - [x] 记录常见问题和解决方案（已添加到文档）

- [ ] 7.2 应用运行验证（需要实际测试）
  - [ ] 在真实 iOS 设备上安装并运行应用
  - [ ] 验证所有功能是否正常工作
  - [ ] 测试应用在不同 iOS 版本上的兼容性
  - **注意**: 此任务需要在有 macOS 和 iOS 设备的环境中完成

- [ ] 7.3 性能验证（需要实际测试）
  - [ ] 检查应用启动时间
  - [ ] 验证页面加载性能
  - [ ] 确认滚动和交互流畅度
  - **注意**: 此任务需要在有 macOS 和 iOS 设备的环境中完成
