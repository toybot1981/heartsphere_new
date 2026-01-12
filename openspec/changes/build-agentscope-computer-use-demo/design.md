# Design: AgentScope Computer-Use Demo Prototype

## 架构概览

演示原型分为三个主要部分：
1. **后端演示 API**：提供工具调用日志、虚拟机状态查询、实时推送等功能
2. **客户端演示界面**：用户交互界面，展示与 AgentScope Agent 的对话和工具调用
3. **管理端演示界面**：管理员监控和控制界面，展示系统状态和性能指标

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    客户端演示界面                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Chat 组件    │  │ 工具调用监控  │  │ VM 状态面板  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    后端演示 API                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ DemoController│ │ ToolCallLog  │  │ WebSocket    │     │
│  │               │ │ Service      │  │ Push Service │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
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
                            │
                            │ 操作
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Mentis VM & Executor System                     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ VmManager    │  │ ComputerUse  │                        │
│  │              │  │ Executor     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## 数据流

### 1. 用户消息处理流程

```
用户输入消息
  ↓
前端发送到后端 API
  ↓
后端创建/获取会话，调用 AgentScope Agent
  ↓
Agent 推理并决定调用工具
  ↓
工具执行（VmManagerTool / ComputerUseTool）
  ↓
工具调用日志记录（异步）
  ↓
工具执行结果返回给 Agent
  ↓
Agent 继续推理或生成响应
  ↓
流式返回给前端
  ↓
前端显示消息和工具调用信息
```

### 2. 工具调用日志流程

```
工具调用开始
  ↓
记录 ToolCallLog（状态: PENDING）
  ↓
推送 WebSocket 事件（tool_call_start）
  ↓
工具执行中
  ↓
工具执行完成/失败
  ↓
更新 ToolCallLog（状态: SUCCESS/ERROR，记录结果和耗时）
  ↓
推送 WebSocket 事件（tool_call_end）
```

### 3. 虚拟机状态查询流程

```
前端请求虚拟机状态
  ↓
后端查询 VmManager.getVmForSession(sessionId)
  ↓
返回虚拟机状态信息
  ↓
前端显示虚拟机状态
  ↓
（可选）WebSocket 推送状态变更事件
```

## 组件设计

### 后端组件

#### ToolCallLog 实体

```java
@Entity
public class ToolCallLog {
    @Id
    private String id;
    private String sessionId;
    private String toolName;
    private Map<String, Object> parameters;
    private ToolResultBlock result;
    private ToolCallStatus status; // PENDING, RUNNING, SUCCESS, ERROR
    private Long startTime;
    private Long endTime;
    private Long duration; // 毫秒
    private String errorMessage;
}
```

#### DemoController

```java
@RestController
@RequestMapping("/api/demo")
public class DemoController {
    
    @GetMapping("/tool-calls")
    public List<ToolCallLog> getToolCalls(
        @RequestParam(required = false) String sessionId,
        @RequestParam(required = false) String toolName,
        @RequestParam(required = false) Long startTime,
        @RequestParam(required = false) Long endTime
    );
    
    @GetMapping("/vm-status/{sessionId}")
    public VmStatusInfo getVmStatus(@PathVariable String sessionId);
    
    @GetMapping("/scenarios")
    public List<Scenario> getScenarios();
}
```

#### WebSocket 推送服务

```java
@Service
public class DemoWebSocketService {
    
    public void pushToolCallEvent(String sessionId, ToolCallEvent event);
    public void pushVmStatusEvent(String sessionId, VmStatusEvent event);
}
```

### 前端组件

#### AgentScopeDemo (客户端)

```tsx
<AgentScopeDemo>
  <ChatArea>
    <MessageList />
    <MessageInput />
  </ChatArea>
  <SidePanel>
    <ToolCallMonitor />
    <VmStatusPanel />
  </SidePanel>
</AgentScopeDemo>
```

#### ToolCallMonitor

```tsx
<ToolCallMonitor>
  <ToolCallTimeline>
    {toolCalls.map(call => (
      <ToolCallItem
        key={call.id}
        status={call.status}
        toolName={call.toolName}
        duration={call.duration}
        onClick={() => showDetails(call)}
      />
    ))}
  </ToolCallTimeline>
  <ToolCallDetailModal />
</ToolCallMonitor>
```

#### AgentScopeDemoAdmin (管理端)

```tsx
<AgentScopeDemoAdmin>
  <Sidebar>
    <NavItem>工具调用监控</NavItem>
    <NavItem>虚拟机管理</NavItem>
    <NavItem>会话管理</NavItem>
    <NavItem>性能监控</NavItem>
  </Sidebar>
  <MainContent>
    <Route path="/tool-calls" component={ToolCallMonitorPanel} />
    <Route path="/vms" component={VmManagementPanel} />
    <Route path="/sessions" component={SessionManagementPanel} />
    <Route path="/performance" component={PerformancePanel} />
  </MainContent>
</AgentScopeDemoAdmin>
```

## 技术选型

### 后端技术

- **工具调用日志存储**：使用 JPA/Hibernate 存储到数据库（MySQL）
- **实时推送**：使用 Spring WebSocket 或 SSE（Server-Sent Events）
- **异步日志记录**：使用 `@Async` 或消息队列（如需要）

### 前端技术

- **UI 框架**：继续使用现有的 React + TypeScript
- **状态管理**：使用 React Context 或 Redux（如需要）
- **WebSocket 客户端**：使用 `useWebSocket` hook 或类似库
- **图表库**：使用 Chart.js 或 Recharts（管理端性能监控）
- **样式**：使用现有的 Tailwind CSS 或 CSS Modules

## 性能考虑

### 工具调用日志记录

- **异步记录**：使用 `@Async` 确保日志记录不影响工具执行性能
- **批量写入**：可以考虑批量写入日志，减少数据库操作
- **日志清理**：定期清理旧日志，避免数据库过大

### 实时推送

- **连接管理**：合理管理 WebSocket 连接，避免连接泄漏
- **消息频率**：控制推送频率，避免前端处理不过来
- **断线重连**：实现 WebSocket 断线重连机制

### 前端渲染

- **虚拟滚动**：如果工具调用列表很长，使用虚拟滚动
- **分页加载**：日志查询使用分页，避免一次加载过多数据
- **防抖/节流**：对频繁的状态更新使用防抖或节流

## 安全考虑

### 权限控制

- **管理端访问**：仅管理员可以访问管理端演示界面
- **日志查询**：限制日志查询的范围和权限
- **虚拟机操作**：演示环境的虚拟机操作需要权限验证

### 数据安全

- **敏感信息过滤**：工具调用日志中不记录敏感信息（如密码）
- **会话隔离**：不同用户的会话数据严格隔离
- **演示环境隔离**：演示环境与生产环境隔离

## 扩展性考虑

### 未来扩展

- **多 Agent 支持**：可以扩展支持多个 Agent 的对比演示
- **性能对比**：可以对比 AgentScope 与现有实现的性能
- **A/B 测试**：可以支持 A/B 测试不同的 Agent 配置
- **演示录制**：可以录制演示过程并回放

### 可维护性

- **组件复用**：客户端和管理端可以复用部分组件
- **配置化**：演示场景配置化，便于添加新场景
- **文档完善**：完善的代码注释和使用文档

## 集成点

### 与现有系统集成

1. **Mentis 系统**：
   - 复用现有的 VmManager 和 ComputerUseExecutor
   - 复用现有的会话管理系统
   - 复用现有的认证和权限系统

2. **AgentScope 原型**：
   - 复用已实现的 VmManagerTool 和 ComputerUseTool
   - 集成 AgentScope ReActAgent

3. **前端基础设施**：
   - 复用现有的 UI 组件库
   - 复用现有的路由和状态管理
   - 复用现有的 API 客户端

## 风险评估

### 技术风险

- **WebSocket 稳定性**：WebSocket 连接可能不稳定，需要实现重连机制
- **日志性能影响**：日志记录可能影响系统性能，需要异步处理
- **前端复杂性**：前端需要处理大量实时更新，可能导致性能问题

### 缓解措施

- **降级方案**：WebSocket 失败时降级到轮询
- **性能监控**：监控日志记录的性能影响，及时优化
- **前端优化**：使用虚拟滚动、防抖等技术优化前端性能
