# AgentScope Computer-Use 演示架构说明

## 架构概览

演示原型采用前后端分离架构，使用 SSE (Server-Sent Events) 实现实时推送。

```
┌─────────────────────────────────────────────────────────────┐
│                    前端演示界面                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ 客户端演示    │  │ 管理端监控    │  │ 共享组件      │       │
│  │ AgentScopeDemo│ │ AgentScope   │  │ ToolCall    │       │
│  │              │ │ DemoAdmin    │  │ Monitor     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/SSE
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    后端演示 API                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ DemoController│ │ DemoEvent    │  │ ToolCallLog │       │
│  │              │ │ Service       │  │ Service     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 调用
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              AgentScope Agent & Tools                        │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ ReActAgent   │  │ VmManagerTool│                        │
│  │              │  │ ComputerUseTool│                      │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## 技术栈

### 前端

- **框架**: React + TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Hooks (useState, useEffect)
- **实时通信**: EventSource (SSE)

### 后端

- **框架**: Spring Boot
- **数据库**: MySQL (JPA/Hibernate)
- **实时推送**: SSE (Server-Sent Events)
- **异步处理**: Spring @Async

## 数据流

### 1. 用户消息处理流程

```
用户输入消息
  ↓
前端发送 POST /api/admin/mentis/chat/stream
  ↓
后端创建/获取会话，调用 AgentScope Agent
  ↓
Agent 推理并决定调用工具
  ↓
工具执行（VmManagerTool / ComputerUseTool）
  ↓
工具调用日志记录（异步，ToolCallLogService）
  ↓
推送 SSE 事件（DemoEventService）
  ↓
工具执行结果返回给 Agent
  ↓
Agent 继续推理或生成响应
  ↓
流式返回给前端（SSE）
  ↓
前端显示消息和工具调用信息
```

### 2. 工具调用日志流程

```
工具调用开始
  ↓
ToolCallLogService.logToolCallStart()
  ↓
记录 ToolCallLog（状态: PENDING）
  ↓
推送 SSE 事件（tool_call_start）
  ↓
工具执行中
  ↓
ToolCallLogService.logToolCallRunning()
  ↓
更新 ToolCallLog（状态: RUNNING）
  ↓
工具执行完成/失败
  ↓
ToolCallLogService.logToolCallSuccess/Error()
  ↓
更新 ToolCallLog（状态: SUCCESS/ERROR，记录结果和耗时）
  ↓
推送 SSE 事件（tool_call_end/error）
```

### 3. SSE 事件推送流程

```
客户端订阅 SSE
  ↓
GET /api/demo/events/session/{sessionId}
  ↓
DemoEventService.registerSessionEmitter()
  ↓
工具调用发生时
  ↓
DemoEventService.pushToolCallStart/End/Error()
  ↓
推送到所有订阅的 SSE 连接
  ↓
客户端接收事件并更新 UI
```

## 组件结构

### 前端组件

#### 客户端组件

- `AgentScopeDemo.tsx` - 主组件
  - 管理会话、消息、工具调用、虚拟机状态
  - 处理 SSE 事件流
  - 集成所有子组件

- `ToolCallMonitor.tsx` - 工具调用监控组件
  - 显示工具调用列表
  - 支持展开/折叠查看详情

- `VmStatusPanel.tsx` - 虚拟机状态面板
  - 显示虚拟机状态信息
  - 支持刷新和操作

- `ScenarioSelector.tsx` - 演示场景选择器
  - 显示场景列表
  - 支持分类筛选
  - 自动填充示例对话

#### 管理端组件

- `AgentScopeDemoAdmin.tsx` - 管理端主组件
  - 标签导航
  - 集成所有监控面板

- `ToolCallMonitorPanel.tsx` - 工具调用监控面板
  - 显示所有会话的工具调用
  - 筛选和统计功能
  - 详情视图

- `VmManagementPanel.tsx` - 虚拟机管理面板
  - 显示所有虚拟机
  - 筛选和操作功能

- `SessionManagementPanel.tsx` - 会话管理面板
  - 显示所有会话
  - 会话操作功能

- `PerformancePanel.tsx` - 性能监控面板
  - 显示性能指标
  - 统计信息展示

### 后端组件

#### 模型层

- `ToolCallLog.java` - 工具调用日志实体
  - 字段：sessionId, toolName, parameters, result, status, timestamp, duration

#### 数据访问层

- `ToolCallLogRepository.java` - Repository 接口
  - 各种查询方法
  - 统计方法

#### 服务层

- `ToolCallLogService.java` - 工具调用日志服务
  - 异步日志记录
  - 日志查询
  - 统计计算

- `DemoService.java` - 演示业务服务
  - 工具调用统计
  - 虚拟机状态汇总
  - 演示场景管理

- `DemoEventService.java` - 事件推送服务
  - SSE 连接管理
  - 事件推送

#### 控制器层

- `DemoController.java` - REST API 控制器
  - 工具调用日志查询
  - 虚拟机状态查询
  - 统计信息查询
  - 演示场景列表

- `DemoEventController.java` - SSE 事件流控制器
  - 会话事件订阅
  - 全局事件订阅

## 数据库设计

### tool_call_logs 表

```sql
CREATE TABLE tool_call_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    parameters TEXT,
    result TEXT,
    status VARCHAR(20) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration BIGINT,
    error_message TEXT,
    created_at DATETIME NOT NULL,
    INDEX idx_session_id (session_id),
    INDEX idx_tool_name (tool_name),
    INDEX idx_timestamp (start_time)
);
```

## 集成点

### 与现有系统集成

1. **Mentis 系统**
   - 复用现有的 VmManager 和 ComputerUseExecutor
   - 复用现有的会话管理系统
   - 复用现有的认证和权限系统

2. **AgentScope 原型**
   - 复用已实现的 VmManagerTool 和 ComputerUseTool
   - 集成 AgentScope ReActAgent

3. **管理后台**
   - 集成到 AdminScreen 的路由系统
   - 添加到 AdminSidebar 的菜单

## 性能考虑

### 工具调用日志记录

- **异步记录**: 使用 `@Async` 确保日志记录不影响工具执行性能
- **批量写入**: 可以考虑批量写入日志（如果需要）
- **日志清理**: 定期清理旧日志，避免数据库过大

### SSE 实时推送

- **连接管理**: 合理管理 SSE 连接，避免连接泄漏
- **消息频率**: 控制推送频率，避免前端处理不过来
- **断线重连**: 前端实现 SSE 断线重连机制

### 前端渲染

- **虚拟滚动**: 如果工具调用列表很长，可以使用虚拟滚动
- **分页加载**: 日志查询使用分页，避免一次加载过多数据
- **防抖/节流**: 对频繁的状态更新使用防抖或节流

## 安全考虑

### 权限控制

- **管理端访问**: 仅管理员可以访问管理端演示界面
- **日志查询**: 限制日志查询的范围和权限
- **演示环境隔离**: 演示环境与生产环境隔离

### 数据安全

- **敏感信息过滤**: 工具调用日志中不记录敏感信息（如密码）
- **会话隔离**: 不同用户的会话数据严格隔离

## 扩展性考虑

### 未来扩展

- **多 Agent 支持**: 可以扩展支持多个 Agent 的对比演示
- **性能对比**: 可以对比 AgentScope 与现有实现的性能
- **A/B 测试**: 可以支持 A/B 测试不同的 Agent 配置
- **演示录制**: 可以录制演示过程并回放

### 可维护性

- **组件复用**: 客户端和管理端可以复用部分组件
- **配置化**: 演示场景配置化，便于添加新场景
- **文档完善**: 完善的代码注释和使用文档

## 最后更新

2026-01-10 - 创建架构文档
