# Tasks: 添加 Main 项目端到端自动化测试

## 1. 测试框架搭建

- [x] 1.1 安装 Playwright 依赖
  - [x] 1.1.1 在 `main/frontend/package.json` 中添加 Playwright 依赖
  - [ ] 1.1.2 运行 `npm install` 安装依赖（需要用户执行）
  - [ ] 1.1.3 运行 `npx playwright install` 安装浏览器（需要用户执行）

- [x] 1.2 创建测试目录结构
  - [x] 1.2.1 创建 `main/frontend/e2e/` 目录
  - [x] 1.2.2 创建 `main/frontend/e2e/config/` 目录
  - [x] 1.2.3 创建 `main/frontend/e2e/utils/` 目录
  - [x] 1.2.4 创建 `main/frontend/e2e/tests/pc/` 目录
  - [x] 1.2.5 创建 `main/frontend/e2e/tests/mobile/` 目录
  - [x] 1.2.6 创建 `main/frontend/e2e/reports/` 目录
  - [x] 1.2.7 创建 `main/frontend/e2e/screenshots/` 目录

- [x] 1.3 创建 Playwright 配置文件
  - [x] 1.3.1 创建 `main/frontend/e2e/config/playwright.config.ts`
  - [x] 1.3.2 配置测试环境 URL（localhost:3000）
  - [x] 1.3.3 配置浏览器选项（Chromium、Firefox、WebKit）
  - [x] 1.3.4 配置测试报告输出
  - [x] 1.3.5 配置截图和视频选项

- [x] 1.4 创建测试数据配置
  - [x] 1.4.1 创建 `main/frontend/e2e/config/test-data.ts`
  - [x] 1.4.2 配置测试账号（tongyexin/123456）
  - [x] 1.4.3 配置测试数据（场景、角色、剧本等）
  - [x] 1.4.4 配置测试环境 URL

## 2. 测试工具函数

- [x] 2.1 创建页面对象模型
  - [x] 2.1.1 创建 `main/frontend/e2e/utils/page-objects.ts`
  - [x] 2.1.2 实现登录页面对象
  - [x] 2.1.3 实现主页面对象
  - [x] 2.1.4 实现场景管理页面对象
  - [x] 2.1.5 实现角色管理页面对象
  - [x] 2.1.6 实现聊天页面对象
  - [x] 2.1.7 实现其他功能页面对象（基础实现）

- [x] 2.2 创建测试辅助函数
  - [x] 2.2.1 创建 `main/frontend/e2e/utils/helpers.ts`
  - [x] 2.2.2 实现登录辅助函数
  - [x] 2.2.3 实现等待和重试函数
  - [x] 2.2.4 实现截图函数
  - [x] 2.2.5 实现数据清理函数（基础实现）

- [x] 2.3 创建自定义断言
  - [x] 2.3.1 创建 `main/frontend/e2e/utils/assertions.ts`
  - [x] 2.3.2 实现页面元素存在断言
  - [x] 2.3.3 实现文本内容断言
  - [x] 2.3.4 实现功能状态断言

## 3. PC 版本测试

- [x] 3.1 登录功能测试
  - [x] 3.1.1 创建 `main/frontend/e2e/tests/pc/login.spec.ts`
  - [x] 3.1.2 测试登录页面加载
  - [x] 3.1.3 测试使用 tongyexin/123456 登录
  - [x] 3.1.4 测试登录成功后的页面跳转
  - [x] 3.1.5 测试登录失败的错误提示

- [x] 3.2 场景管理测试
  - [x] 3.2.1 创建 `main/frontend/e2e/tests/pc/scenario.spec.ts`
  - [x] 3.2.2 测试场景列表加载
  - [x] 3.2.3 测试创建新场景（基础实现，需要根据实际 UI 调整）
  - [ ] 3.2.4 测试编辑场景（需要根据实际 UI 实现）
  - [ ] 3.2.5 测试删除场景（需要根据实际 UI 实现）
  - [ ] 3.2.6 测试场景切换（需要根据实际 UI 实现）

- [x] 3.3 角色管理测试
  - [x] 3.3.1 创建 `main/frontend/e2e/tests/pc/character.spec.ts`
  - [x] 3.3.2 测试角色列表加载
  - [x] 3.3.3 测试创建新角色（基础实现，需要根据实际 UI 调整）
  - [ ] 3.3.4 测试编辑角色（需要根据实际 UI 实现）
  - [ ] 3.3.5 测试删除角色（需要根据实际 UI 实现）
  - [x] 3.3.6 测试角色选择（基础实现，需要根据实际 UI 调整）

- [x] 3.4 聊天功能测试
  - [x] 3.4.1 创建 `main/frontend/e2e/tests/pc/chat.spec.ts`
  - [x] 3.4.2 测试聊天窗口打开（基础实现，需要根据实际 UI 调整）
  - [x] 3.4.3 测试发送消息（基础实现，需要根据实际 UI 调整）
  - [ ] 3.4.4 测试接收 AI 回复（需要根据实际 UI 实现）
  - [ ] 3.4.5 测试聊天历史记录（需要根据实际 UI 实现）
  - [ ] 3.4.6 测试多轮对话（需要根据实际 UI 实现）

- [ ] 3.5 剧本系统测试（待实现）
  - [ ] 3.5.1 创建 `main/frontend/e2e/tests/pc/script.spec.ts`
  - [ ] 3.5.2 测试剧本列表加载
  - [ ] 3.5.3 测试创建新剧本
  - [ ] 3.5.4 测试编辑剧本
  - [ ] 3.5.5 测试执行剧本
  - [ ] 3.5.6 测试删除剧本

- [ ] 3.6 信箱功能测试（待实现）
  - [ ] 3.6.1 创建 `main/frontend/e2e/tests/pc/mailbox.spec.ts`
  - [ ] 3.6.2 测试信箱打开
  - [ ] 3.6.3 测试发送消息
  - [ ] 3.6.4 测试接收消息
  - [ ] 3.6.5 测试消息列表

- [ ] 3.7 心域连接测试（待实现）
  - [ ] 3.7.1 创建 `main/frontend/e2e/tests/pc/heartconnect.spec.ts`
  - [ ] 3.7.2 测试心域共享功能
  - [ ] 3.7.3 测试快速连接功能
  - [ ] 3.7.4 测试共享模式切换

- [ ] 3.8 用户设置测试（待实现）
  - [ ] 3.8.1 创建 `main/frontend/e2e/tests/pc/settings.spec.ts`
  - [ ] 3.8.2 测试设置页面打开
  - [ ] 3.8.3 测试修改设置
  - [ ] 3.8.4 测试设置保存

## 4. Mobile 版本测试

- [x] 4.1 登录功能测试
  - [x] 4.1.1 创建 `main/frontend/e2e/tests/mobile/login.spec.ts`
  - [x] 4.1.2 测试移动端登录页面
  - [x] 4.1.3 测试使用 tongyexin/123456 登录
  - [x] 4.1.4 测试登录成功后的页面跳转

- [ ] 4.2 场景管理测试（待实现）
  - [ ] 4.2.1 创建 `main/frontend/e2e/tests/mobile/scenario.spec.ts`
  - [ ] 4.2.2 测试移动端场景列表
  - [ ] 4.2.3 测试移动端场景操作（触摸交互）

- [ ] 4.3 角色管理测试（待实现）
  - [ ] 4.3.1 创建 `main/frontend/e2e/tests/mobile/character.spec.ts`
  - [ ] 4.3.2 测试移动端角色列表
  - [ ] 4.3.3 测试移动端角色操作

- [ ] 4.4 聊天功能测试（待实现）
  - [ ] 4.4.1 创建 `main/frontend/e2e/tests/mobile/chat.spec.ts`
  - [ ] 4.4.2 测试移动端聊天界面
  - [ ] 4.4.3 测试移动端消息发送和接收
  - [ ] 4.4.4 测试移动端触摸交互

- [ ] 4.5 响应式布局测试（待实现）
  - [ ] 4.5.1 创建 `main/frontend/e2e/tests/mobile/responsive.spec.ts`
  - [ ] 4.5.2 测试不同屏幕尺寸的布局
  - [ ] 4.5.3 测试移动端特有功能

## 5. 测试报告和文档

- [x] 5.1 配置测试报告生成
  - [x] 5.1.1 配置 HTML 报告输出（在 playwright.config.ts 中配置）
  - [x] 5.1.2 配置 JSON 报告输出（在 playwright.config.ts 中配置）
  - [x] 5.1.3 配置截图和视频保存（在 playwright.config.ts 中配置）
  - [ ] 5.1.4 测试报告生成功能（需要运行测试验证）

- [x] 5.2 创建测试执行脚本
  - [x] 5.2.1 在 `package.json` 中添加测试脚本
  - [x] 5.2.2 创建 `npm run test:e2e` 脚本（完整测试）
  - [x] 5.2.3 创建 `npm run test:e2e:pc` 脚本（PC 测试）
  - [x] 5.2.4 创建 `npm run test:e2e:mobile` 脚本（Mobile 测试）
  - [x] 5.2.5 创建 `npm run test:e2e:report` 脚本（查看报告）
  - [x] 5.2.6 创建 `npm run test:e2e:ui` 脚本（UI 模式）

- [x] 5.3 创建测试文档
  - [x] 5.3.1 创建 `main/frontend/e2e/README.md`
  - [x] 5.3.2 说明测试环境要求
  - [x] 5.3.3 说明如何运行测试
  - [x] 5.3.4 说明如何查看测试报告
  - [x] 5.3.5 说明如何添加新测试

- [ ] 5.4 验证测试流程（需要用户执行）
  - [ ] 5.4.1 验证测试环境准备（需要用户执行 npm install 和 playwright install）
  - [ ] 5.4.2 验证测试执行（需要用户运行测试）
  - [ ] 5.4.3 验证测试报告生成（需要用户运行测试）
  - [ ] 5.4.4 验证测试结果准确性（需要用户根据实际 UI 调整测试脚本）
