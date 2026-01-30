# Implementation Tasks

## 1. 任务与对话关联

### 1.1 数据库变更
- [x] 创建数据库迁移脚本，为 `mentis_tasks` 表添加 `message_id` 字段
- [x] 添加索引 `idx_message_id` 优化查询性能
- [x] 更新 `MentisTask` 实体类，添加 `messageId` 字段和关联关系

### 1.2 后端实现
- [x] 修改 `ExecutionEngineImpl`，在创建任务时关联 `messageId`
- [x] 修改 `MentisTaskServiceImpl.getSessionTasks`，支持按 `messageId` 过滤
- [x] 添加查询方法 `findByMessageIdOrderByCreatedAtAsc`
- [x] 修改任务查询逻辑，只返回最后一次对话（最新用户消息）的任务

### 1.3 前端实现
- [x] 修改 `TaskProgressPanel`，使用打对勾的方式展示任务
- [x] 添加任务完成状态的视觉反馈（绿色对勾）
- [x] 修改任务列表样式，参照 Manus 的设计
- [x] 确保任务列表只显示当前对话的任务（后端已实现按 messageId 过滤）

## 2. 虚拟机关联到对话

### 2.1 后端实现
- [x] 增强 `VmManagerImpl`，确保虚拟机与对话的关联
- [x] 添加虚拟机状态变更的 SSE 事件推送
- [x] 修改 `SessionRealtimeService`，支持虚拟机状态更新事件（已通过现有 sendEvent 方法支持）

### 2.2 前端实现
- [x] 增强 `VirtualComputerView`，实时显示虚拟机执行情况
- [x] 添加虚拟机状态指示器（运行中、暂停、错误等）- VirtualComputerStatus 组件已存在
- [x] 实现虚拟机屏幕实时刷新（通过 SSE 或轮询）- VmScreenViewer 已支持自动刷新
- [x] 添加虚拟机操作按钮（暂停、恢复、销毁）- 已存在

## 3. 工具系统构建

### 3.1 工具接口定义
- [x] 创建 `Tool` 接口，定义工具的基本结构
- [x] 创建 `ToolRegistry`，管理所有工具
- [x] 创建 `ToolExecutor`，执行工具调用

### 3.2 浏览器工具实现（10种）
- [x] 实现 `BrowserGotoTool` - 访问URL
- [ ] 实现 `BrowserClickTool` - 点击元素
- [ ] 实现 `BrowserTypeTool` - 输入文本
- [ ] 实现 `BrowserScrollTool` - 滚动页面
- [ ] 实现 `BrowserScreenshotTool` - 截取屏幕
- [ ] 实现 `BrowserBackTool` - 后退
- [ ] 实现 `BrowserForwardTool` - 前进
- [ ] 实现 `BrowserRefreshTool` - 刷新
- [ ] 实现 `BrowserSearchTool` - 搜索
- [ ] 实现 `BrowserExtractTool` - 提取内容

### 3.3 终端工具实现（5种）
- [x] 实现 `TerminalExecTool` - 执行命令
- [ ] 实现 `TerminalWriteTool` - 写文件
- [ ] 实现 `TerminalReadTool` - 读文件
- [ ] 实现 `TerminalCdTool` - 切换目录
- [ ] 实现 `TerminalLsTool` - 列出文件

### 3.4 文件系统工具实现（4种）
- [ ] 实现 `FileCreateTool` - 创建文件
- [ ] 实现 `FileDeleteTool` - 删除文件
- [ ] 实现 `FileCopyTool` - 复制文件
- [ ] 实现 `FileMoveTool` - 移动文件

### 3.5 代码执行工具实现（3种）
- [x] 实现 `PythonRunTool` - Python代码执行
- [ ] 实现 `NodeRunTool` - Node.js代码执行
- [ ] 实现 `BashRunTool` - Bash脚本执行

### 3.6 系统工具实现（5种）
- [x] 实现 `SystemInfoTool` - 系统信息
- [ ] 实现 `SystemSnapshotTool` - 创建快照
- [ ] 实现 `SystemRestoreTool` - 恢复快照
- [ ] 实现 `SystemWaitTool` - 等待
- [ ] 实现 `SystemLogTool` - 查看日志

### 3.7 工具集成
- [x] 将所有工具注册到 `ToolRegistry`（已创建 ToolConfiguration）
- [x] 修改 `ExecutionEngineImpl`，使用工具系统执行任务
- [x] 添加工具调用日志和错误处理（已在 ToolExecutor 中实现）

## 4. 结果展示能力提升

### 4.1 结果展示组件
- [x] 创建 `TextResultViewer` - 文本展示组件
- [x] 创建 `ListResultViewer` - 列表展示组件
- [x] 创建 `TableResultViewer` - 表格展示组件
- [x] 创建 `ChartResultViewer` - 图表展示组件（占位符，待集成图表库）
- [x] 创建 `ImageResultViewer` - 图片展示组件
- [x] 创建 `ResultPresentation` - 结果格式自动识别和渲染

### 4.2 结果格式识别
- [x] 实现结果格式自动识别逻辑
- [x] 支持文本、列表、表格、图表、图片格式识别
- [x] 支持混合格式（同时包含多种格式）
- [ ] 根据结果类型自动选择合适的展示组件
- [ ] 支持混合格式的结果展示

### 4.3 前端集成
- [x] 在 `MessageListManus` 中集成结果展示组件
- [x] 修改消息渲染逻辑，支持多种结果格式
- [x] 更新 Message 接口，支持 result 和 resultFormat 字段
- [ ] 测试各种结果格式的展示效果（待测试）

## 5. E2B MCP 扩展

### 5.1 MCP Gateway 集成
- [x] 在 E2B Bridge Service 中添加 MCP Gateway 支持
- [x] 实现 MCP URL 和 Token 获取
- [x] 更新 Java 后端，支持获取 MCP 信息
- [ ] 配置 MCP 服务器（Browserbase, Exa, Notion 等）- 需要 E2B Template 配置

### 5.2 MCP 客户端实现
- [x] 集成 `@modelcontextprotocol/sdk` 客户端（已添加到 package.json）
- [x] 创建 mcp-client.js 模块（基础结构）
- [x] 实现 MCP 连接和工具调用（Bridge Service 端点已实现）
- [x] 创建 McpToolAdapter，将 MCP 工具适配为系统工具
- [x] 添加 MCP 工具到工具注册表（动态注册）
- [ ] 测试 MCP 工具调用（需要实际 MCP Gateway 环境）

### 5.3 MCP Inspector 集成
- [x] 添加 MCP Inspector 调试工具（McpInspectorService）
- [x] 提供 MCP 工具测试界面（McpInspectorButton 组件）
- [x] 添加 MCP Inspector API 端点
- [x] 集成到 VirtualComputerView

## 6. 测试与验证

### 6.1 单元测试
- [x] 为任务与对话关联功能编写单元测试（MentisTaskServiceTest）
- [x] 为工具系统编写单元测试（ToolRegistryTest, ToolExecutorTest）
- [ ] 为结果展示组件编写单元测试（前端组件，可选）

### 6.2 集成测试
- [x] 测试工具系统集成流程（ToolSystemIntegrationTest）
- [ ] 测试任务创建和关联流程（需要数据库）
- [ ] 测试工具调用和执行流程（需要虚拟机）
- [ ] 测试结果展示和渲染流程（前端测试）
- [ ] 测试 E2B MCP 集成流程（需要 E2B Gateway）

### 6.3 E2E 测试
- [ ] 测试完整任务执行流程（从用户消息到结果展示）
- [ ] 测试虚拟机实时查看功能
- [ ] 测试多种结果展示格式

## 7. 文档更新

### 7.1 API 文档
- [x] 更新任务管理 API 文档（API_DOCUMENTATION.md）
- [x] 添加工具调用 API 文档（API_DOCUMENTATION.md）
- [x] 添加结果展示 API 文档（API_DOCUMENTATION.md）

### 7.2 用户文档
- [x] 更新用户手册，说明新的任务展示方式（USER_GUIDE.md）
- [x] 添加工具使用指南（USER_GUIDE.md）
- [x] 添加结果展示说明（USER_GUIDE.md）

### 7.3 开发文档
- [x] 添加工具系统开发指南（DEVELOPER_GUIDE.md）
- [x] 添加 E2B MCP 集成指南（DEVELOPER_GUIDE.md）
- [x] 更新架构文档（DEVELOPER_GUIDE.md、README.md）
