# Mentis超级智能体 - 整体框架设计（第一部分：核心架构）

**文档版本**: v1.0  
**创建日期**: 2025-01-06  
**阶段**: 框架设计 - 第一部分（核心架构）  
**下一步**: 第二部分（详细组件设计）

---

## 一、核心架构概览

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     用户交互层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  REST API   │  │ WebSocket   │  │  前端界面    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Mentis 服务层                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         MentisService (核心服务)                      │   │
│  │  - 会话管理、对话处理、任务协调                        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │SessionManager│  │  TaskManager │  │MessageHandler│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     智能体核心层                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         MentisAgent (智能体核心)                      │   │
│  │  - 对话理解、意图识别、任务规划、决策制定              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │IntentAnalyzer│  │TaskPlanner   │  │DecisionMaker │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     执行引擎层                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │      ExecutionEngine (执行引擎)                       │   │
│  │  - 任务执行、状态管理、错误处理、结果反馈              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   ComputerUseExecutor (Computer-Use 执行器)          │   │
│  │  - 命令执行、脚本运行、GUI自动化、文件操作            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     虚拟机管理层                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │       VMManager (虚拟机管理器)                        │   │
│  │  - 虚拟机生命周期、资源管理、状态快照、网络管理        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ VMFactory    │  │ VMMonitor    │  │SnapshotMgr   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     基础设施层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Docker    │  │  QEMU/KVM    │  │  云虚拟机     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、核心层次职责

### 2.1 用户交互层

**职责**：
- 提供 REST API 和 WebSocket 接口
- 接收用户请求，返回响应
- 消息格式转换和验证

**关键接口**：
- `POST /api/mentis/chat` - 对话接口
- `GET /api/mentis/sessions` - 会话列表
- `GET /api/mentis/tasks/{taskId}` - 任务状态查询
- WebSocket `/ws/mentis` - 实时对话和状态推送

### 2.2 Mentis 服务层

**职责**：
- 业务流程编排和协调
- 会话生命周期管理
- 任务调度和状态跟踪
- 消息处理和路由

**核心服务**：
- `MentisService` - 核心服务，协调各个组件
- `SessionManager` - 会话管理
- `TaskManager` - 任务管理
- `MessageHandler` - 消息处理

### 2.3 智能体核心层

**职责**：
- 理解用户意图
- 规划任务步骤
- 做出执行决策
- 与 AI 模型交互

**核心组件**：
- `MentisAgent` - 智能体核心，负责任务规划和决策
- `IntentAnalyzer` - 意图分析器，理解用户需求
- `TaskPlanner` - 任务规划器，分解任务为步骤
- `DecisionMaker` - 决策制定器，决定下一步行动

### 2.4 执行引擎层

**职责**：
- 执行具体任务
- 管理执行状态
- 处理执行错误
- 反馈执行结果

**核心组件**：
- `ExecutionEngine` - 执行引擎，负责任务执行调度
- `ComputerUseExecutor` - Computer-Use 执行器
  - `CommandExecutor` - 命令执行器
  - `ScriptExecutor` - 脚本执行器
  - `GUIAutomationExecutor` - GUI 自动化执行器
  - `FileOperationExecutor` - 文件操作执行器

### 2.5 虚拟机管理层

**职责**：
- 虚拟机创建和销毁
- 虚拟机状态管理
- 资源监控和限制
- 快照和恢复

**核心组件**：
- `VMManager` - 虚拟机管理器
- `VMFactory` - 虚拟机工厂，创建虚拟机实例
- `VMMonitor` - 虚拟机监控，监控资源使用
- `SnapshotManager` - 快照管理器

---

## 三、数据流设计

### 3.1 对话流程

```
用户输入
  ↓
MentisController (接收请求)
  ↓
MentisService (业务逻辑)
  ↓
MentisAgent (意图理解、任务规划)
  ↓
ExecutionEngine (执行任务)
  ↓
VMManager (虚拟机操作)
  ↓
ComputerUseExecutor (具体执行)
  ↓
结果反馈 → MentisAgent → MentisService → 用户
```

### 3.2 任务执行流程

```
用户需求
  ↓
意图识别 (IntentAnalyzer)
  ↓
任务规划 (TaskPlanner)
  ↓
任务分解为步骤
  ↓
步骤1执行 → 步骤2执行 → ... → 步骤N执行
  ↓
结果汇总 → 反馈用户
```

---

## 四、核心接口定义

### 4.1 MentisService 核心接口

```java
public interface MentisService {
    // 处理对话消息
    ChatResponse processMessage(Long userId, ChatRequest request);
    
    // 创建会话
    MentisSessionDTO createSession(Long userId, CreateSessionRequest request);
    
    // 执行任务
    TaskExecutionResult executeTask(String sessionId, TaskExecuteRequest request);
    
    // 获取会话状态
    SessionStatus getSessionStatus(String sessionId);
}
```

### 4.2 MentisAgent 核心接口

```java
public interface MentisAgent {
    // 理解用户意图
    UserIntent understandIntent(String userMessage, ConversationContext context);
    
    // 规划任务
    TaskPlan planTask(UserIntent intent, SessionContext context);
    
    // 决定下一步行动
    NextAction decideNextAction(TaskPlan plan, ExecutionState state);
    
    // 生成回复
    String generateResponse(ExecutionResult result, ConversationContext context);
}
```

### 4.3 ExecutionEngine 核心接口

```java
public interface ExecutionEngine {
    // 执行任务
    ExecutionResult execute(Task task, VMContext vmContext);
    
    // 执行步骤
    StepResult executeStep(TaskStep step, VMContext vmContext);
    
    // 获取执行状态
    ExecutionState getExecutionState(String taskId);
}
```

### 4.4 VMManager 核心接口

```java
public interface VMManager {
    // 创建虚拟机
    VMInstance createVM(VMConfig config);
    
    // 启动虚拟机
    void startVM(String vmId);
    
    // 停止虚拟机
    void stopVM(String vmId);
    
    // 创建快照
    String createSnapshot(String vmId, String snapshotName);
    
    // 恢复快照
    void restoreSnapshot(String vmId, String snapshotId);
}
```

---

## 五、关键技术决策

### 5.1 AI 模型集成

- **复用现有 AI 服务**：使用 `AIService` 进行对话理解和生成
- **Function Calling**：使用 Function Calling 让 AI 模型能够调用工具
- **流式响应**：支持流式响应，提升用户体验

### 5.2 虚拟机技术选型

- **容器方案（Docker）**：轻量级任务，快速启动
- **虚拟机方案（QEMU/KVM）**：复杂任务，完整操作系统环境
- **云平台方案**：大规模部署，弹性扩展

### 5.3 Computer-Use 实现

- **命令执行**：通过 SSH 或容器 exec 执行命令
- **脚本执行**：在虚拟机中运行 Python/Node.js 脚本
- **GUI 自动化**：使用 Playwright/Selenium 进行 Web 自动化，PyAutoGUI 进行桌面自动化

### 5.4 状态管理

- **会话状态**：Redis 缓存，MySQL 持久化
- **任务状态**：内存状态机 + MySQL 持久化
- **虚拟机状态**：虚拟机平台 API + 数据库记录

---

## 六、安全架构

### 6.1 隔离机制

- **会话隔离**：每个会话使用独立的虚拟机
- **资源限制**：CPU、内存、磁盘、网络限制
- **网络隔离**：虚拟机网络与宿主机隔离

### 6.2 权限控制

- **操作白名单**：只允许执行白名单中的操作
- **命令过滤**：过滤危险命令（如 rm -rf、format 等）
- **文件访问控制**：限制文件访问范围

### 6.3 审计日志

- **操作日志**：记录所有操作
- **执行日志**：记录任务执行过程
- **错误日志**：记录错误和异常

---

## 七、扩展性设计

### 7.1 水平扩展

- **无状态服务**：MentisService 设计为无状态，支持多实例部署
- **会话路由**：通过负载均衡器路由到不同实例
- **共享存储**：使用 Redis 和 MySQL 作为共享存储

### 7.2 插件化设计

- **执行器插件**：Computer-Use 执行器支持插件化扩展
- **工具插件**：支持自定义工具和技能
- **AI 模型插件**：支持不同 AI 模型的集成

---

## 八、性能优化

### 8.1 虚拟机管理

- **虚拟机池**：预创建虚拟机池，减少创建时间
- **快照复用**：复用虚拟机快照，快速恢复
- **资源复用**：虚拟机资源复用，提高利用率

### 8.2 任务执行

- **异步执行**：任务异步执行，不阻塞用户请求
- **并发控制**：控制并发任务数量，避免资源耗尽
- **结果缓存**：缓存常见任务结果

---

**下一步**：第二部分 - 详细组件设计（接口详细定义、数据模型设计、组件交互流程）
