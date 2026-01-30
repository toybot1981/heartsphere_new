# Change: Enhance Mentis with Manus-style Capabilities

## Why

参照 Manus AI 的成功实现，提升 Mentis 系统的能力，使其能够：
1. 更好地关联任务与对话，提供清晰的任务执行进度展示
2. 实时查看虚拟机执行情况，提升用户体验
3. 构建完整的工具系统，支持27种工具（浏览器、终端、文件系统、代码执行、系统工具）
4. 支持多种结果展示形式（文本、列表、表格、图表、图片）
5. 扩展 E2B MCP 能力，支持更多高级功能

当前系统存在以下不足：
- 任务与生成任务的用户消息没有明确关联
- 任务列表显示所有历史任务，而非仅显示当前对话的任务
- 任务展示方式不够直观（缺少打对勾的视觉反馈）
- 虚拟机与对话的关联不够紧密，无法实时查看执行情况
- 工具系统不完整，缺少 Manus 支持的多种工具
- 结果展示形式单一，无法以多种形式展示结果
- E2B 能力未充分利用，缺少 MCP 集成

## What Changes

### 1. 任务与对话关联
- **ADDED**: 任务实体增加 `messageId` 字段，关联生成任务的用户消息
- **ADDED**: 任务列表查询接口支持按 `messageId` 过滤
- **MODIFIED**: 任务列表只显示最后一次对话（最新用户消息）生成的任务
- **MODIFIED**: 任务展示改为打对勾的方式（类似 Manus 的视觉设计）

### 2. 虚拟机关联到对话
- **ADDED**: 虚拟机与对话的实时关联机制
- **ADDED**: 实时查看虚拟机执行情况的 UI 组件
- **MODIFIED**: 虚拟机状态更新通过 SSE 实时推送到前端

### 3. 工具系统构建
- **ADDED**: 浏览器工具（10种）：browser_goto, browser_click, browser_type, browser_scroll, browser_screenshot, browser_back, browser_forward, browser_refresh, browser_search, browser_extract
- **ADDED**: 终端工具（5种）：terminal_exec, terminal_write, terminal_read, terminal_cd, terminal_ls
- **ADDED**: 文件系统工具（4种）：file_create, file_delete, file_copy, file_move
- **ADDED**: 代码执行工具（3种）：python_run, node_run, bash_run
- **ADDED**: 系统工具（5种）：system_info, system_snapshot, system_restore, system_wait, system_log
- **ADDED**: 工具注册表和工具执行引擎

### 4. 结果展示能力提升
- **ADDED**: 文本展示组件
- **ADDED**: 列表展示组件
- **ADDED**: 表格展示组件
- **ADDED**: 图表展示组件（支持多种图表类型）
- **ADDED**: 图片展示组件
- **ADDED**: 结果展示格式自动识别和渲染

### 5. E2B MCP 扩展
- **ADDED**: E2B MCP Gateway 集成
- **ADDED**: MCP 服务器支持（Browserbase, Exa, Notion 等）
- **ADDED**: MCP 客户端连接和工具调用
- **ADDED**: MCP Inspector 调试工具集成

## Impact

### Affected Specs
- `task-management`: 任务管理能力
- `vm-integration`: 虚拟机集成能力
- `tool-system`: 工具系统能力
- `result-presentation`: 结果展示能力
- `e2b-mcp`: E2B MCP 集成能力

### Affected Code
- **Backend**:
  - `mentis/backend/src/main/java/com/heartsphere/mentis/entity/MentisTask.java`: 添加 `messageId` 字段
  - `mentis/backend/src/main/java/com/heartsphere/mentis/service/MentisTaskServiceImpl.java`: 修改任务查询逻辑
  - `mentis/backend/src/main/java/com/heartsphere/mentis/executor/impl/ExecutionEngineImpl.java`: 关联任务与消息
  - `mentis/backend/src/main/java/com/heartsphere/mentis/tool/`: 新增工具系统包
  - `mentis/backend/src/main/java/com/heartsphere/mentis/vm/e2b/`: 扩展 E2B 集成
- **Frontend**:
  - `mentis/frontend/src/components/manus/content/TaskProgressPanel.tsx`: 修改任务展示方式
  - `mentis/frontend/src/components/manus/content/VirtualComputerView.tsx`: 增强虚拟机实时查看
  - `mentis/frontend/src/components/manus/content/ResultPresentation.tsx`: 新增结果展示组件
  - `mentis/frontend/src/services/mentisApi.ts`: 添加工具调用和结果展示 API

### Database Changes
- **Migration**: 为 `mentis_tasks` 表添加 `message_id` 字段
- **Migration**: 为 `mentis_tasks` 表添加索引 `idx_message_id`

### External Dependencies
- **NEW**: E2B MCP SDK (`@modelcontextprotocol/sdk`)
- **NEW**: 图表库（如 `recharts` 或 `chart.js`）
- **NEW**: MCP 相关服务配置（Browserbase API Key, Exa API Key, Notion API Key 等）
