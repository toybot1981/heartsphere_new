## ADDED Requirements

### Requirement: Main 项目端到端自动化测试框架

系统 SHALL 提供端到端自动化测试框架，用于测试 Main 项目的 PC 和 Mobile 版本的所有核心功能。

#### Scenario: 测试框架安装和配置
- **WHEN** 开发者运行 `npm install` 安装依赖
- **THEN** Playwright 测试框架及其依赖被正确安装
- **THEN** 浏览器驱动被正确安装
- **THEN** 测试配置文件 `playwright.config.ts` 存在且配置正确

#### Scenario: 测试目录结构创建
- **WHEN** 测试框架初始化完成
- **THEN** 测试目录结构按功能模块组织（e2e/tests/pc/, e2e/tests/mobile/）
- **THEN** 测试工具函数目录存在（e2e/utils/）
- **THEN** 测试报告目录存在（e2e/reports/）
- **THEN** 测试截图目录存在（e2e/screenshots/）

### Requirement: PC 版本功能测试

系统 SHALL 提供 PC 版本（http://localhost:3000）的全面功能测试，覆盖所有核心功能模块。

#### Scenario: PC 登录功能测试
- **WHEN** 测试脚本访问 http://localhost:3000
- **THEN** 登录页面正确加载
- **WHEN** 使用测试账号（tongyexin/123456）登录
- **THEN** 登录成功，页面跳转到主界面
- **THEN** 用户信息正确显示

#### Scenario: PC 场景管理测试
- **WHEN** 用户已登录 PC 版本
- **THEN** 场景列表正确加载
- **WHEN** 用户创建新场景
- **THEN** 场景创建成功，出现在场景列表中
- **WHEN** 用户编辑场景
- **THEN** 场景信息正确更新
- **WHEN** 用户删除场景
- **THEN** 场景从列表中移除

#### Scenario: PC 角色管理测试
- **WHEN** 用户已登录 PC 版本
- **THEN** 角色列表正确加载
- **WHEN** 用户创建新角色
- **THEN** 角色创建成功，出现在角色列表中
- **WHEN** 用户编辑角色
- **THEN** 角色信息正确更新
- **WHEN** 用户选择角色
- **THEN** 角色选择成功，聊天窗口打开

#### Scenario: PC 聊天功能测试
- **WHEN** 用户已选择角色并打开聊天窗口
- **THEN** 聊天窗口正确显示
- **WHEN** 用户发送消息
- **THEN** 消息正确显示在聊天窗口中
- **WHEN** AI 回复消息
- **THEN** AI 回复正确显示
- **THEN** 聊天历史记录正确保存

#### Scenario: PC 剧本系统测试
- **WHEN** 用户已登录 PC 版本
- **THEN** 剧本列表正确加载
- **WHEN** 用户创建新剧本
- **THEN** 剧本创建成功
- **WHEN** 用户执行剧本
- **THEN** 剧本正确执行，剧情推进

#### Scenario: PC 信箱功能测试
- **WHEN** 用户已登录 PC 版本
- **THEN** 信箱功能可以正常打开
- **WHEN** 用户发送消息
- **THEN** 消息发送成功
- **WHEN** 用户接收消息
- **THEN** 消息正确显示在信箱中

#### Scenario: PC 心域连接测试
- **WHEN** 用户已登录 PC 版本
- **THEN** 心域共享功能可以正常使用
- **WHEN** 用户使用快速连接
- **THEN** 快速连接功能正常工作
- **WHEN** 用户进入共享模式
- **THEN** 共享模式正确激活

#### Scenario: PC 用户设置测试
- **WHEN** 用户已登录 PC 版本
- **THEN** 设置页面可以正常打开
- **WHEN** 用户修改设置
- **THEN** 设置修改成功并保存

### Requirement: Mobile 版本功能测试

系统 SHALL 提供 Mobile 版本（http://localhost:3000/mobile.html）的全面功能测试，覆盖移动端特有功能和触摸交互。

#### Scenario: Mobile 登录功能测试
- **WHEN** 测试脚本访问 http://localhost:3000/mobile.html
- **THEN** 移动端登录页面正确加载
- **WHEN** 使用测试账号（tongyexin/123456）登录
- **THEN** 登录成功，页面跳转到移动端主界面
- **THEN** 移动端界面布局正确

#### Scenario: Mobile 场景管理测试
- **WHEN** 用户已登录 Mobile 版本
- **THEN** 移动端场景列表正确加载
- **WHEN** 用户通过触摸操作创建场景
- **THEN** 场景创建成功
- **WHEN** 用户通过触摸操作编辑场景
- **THEN** 场景信息正确更新

#### Scenario: Mobile 角色管理测试
- **WHEN** 用户已登录 Mobile 版本
- **THEN** 移动端角色列表正确加载
- **WHEN** 用户通过触摸操作选择角色
- **THEN** 角色选择成功，移动端聊天界面打开

#### Scenario: Mobile 聊天功能测试
- **WHEN** 用户已选择角色并打开移动端聊天窗口
- **THEN** 移动端聊天窗口正确显示
- **WHEN** 用户通过触摸输入发送消息
- **THEN** 消息正确发送和显示
- **WHEN** AI 回复消息
- **THEN** AI 回复正确显示在移动端界面

#### Scenario: Mobile 响应式布局测试
- **WHEN** 测试脚本使用不同屏幕尺寸测试 Mobile 版本
- **THEN** 界面在不同屏幕尺寸下正确适配
- **THEN** 触摸交互功能正常工作
- **THEN** 移动端特有功能正常显示

### Requirement: 测试报告生成

系统 SHALL 自动生成详细的测试报告，包含测试结果、截图和错误信息。

#### Scenario: HTML 测试报告生成
- **WHEN** 测试执行完成
- **THEN** HTML 格式的测试报告被生成到 `e2e/reports/` 目录
- **THEN** 报告包含测试结果概览（通过、失败、跳过）
- **THEN** 报告包含每个测试用例的详细结果
- **THEN** 失败的测试用例包含截图和错误信息
- **THEN** 报告包含测试执行时间统计

#### Scenario: JSON 测试报告生成
- **WHEN** 测试执行完成
- **THEN** JSON 格式的测试报告被生成到 `e2e/reports/` 目录
- **THEN** 报告包含机器可读的测试结果数据
- **THEN** 报告支持 CI/CD 集成和自动化分析

#### Scenario: 测试截图保存
- **WHEN** 测试执行过程中发生失败
- **THEN** 失败时的页面截图被保存到 `e2e/screenshots/` 目录
- **THEN** 截图文件名包含测试用例名称和时间戳
- **THEN** 截图在测试报告中可查看

### Requirement: 测试执行脚本

系统 SHALL 提供多种测试执行脚本，支持不同的测试场景和需求。

#### Scenario: 完整测试执行
- **WHEN** 开发者运行 `npm run test:e2e`
- **THEN** 所有 PC 和 Mobile 版本的测试用例被执行
- **THEN** 测试结果报告被生成

#### Scenario: PC 版本测试执行
- **WHEN** 开发者运行 `npm run test:e2e:pc`
- **THEN** 只执行 PC 版本的测试用例
- **THEN** PC 版本测试结果报告被生成

#### Scenario: Mobile 版本测试执行
- **WHEN** 开发者运行 `npm run test:e2e:mobile`
- **THEN** 只执行 Mobile 版本的测试用例
- **THEN** Mobile 版本测试结果报告被生成

#### Scenario: 测试报告查看
- **WHEN** 开发者运行 `npm run test:e2e:report`
- **THEN** 最新的 HTML 测试报告在浏览器中打开
- **THEN** 开发者可以查看详细的测试结果
