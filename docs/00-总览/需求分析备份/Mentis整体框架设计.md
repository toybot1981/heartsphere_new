# Mentis超级智能体 - 整体框架设计

**文档版本**: v1.0  
**创建日期**: 2025-01-06  
**设计阶段**: 第二步 - 整体框架设计

---

## 一、核心架构设计

### 1.1 模块划分

```
mentis/
├── controller/          # REST API 接口层
│   ├── MentisChatController      # 对话接口
│   ├── MentisSessionController   # 会话管理接口
│   └── MentisTaskController      # 任务管理接口
│
├── service/             # 业务逻辑层
│   ├── MentisAgentService        # 智能体核心服务
│   ├── MentisSessionService       # 会话管理服务
│   ├── MentisTaskService         # 任务管理服务
│   └── MentisVmService            # 虚拟机管理服务
│
├── executor/            # 执行器层
│   ├── TaskPlanner                # 任务规划器
│   ├── ExecutionEngine            # 执行引擎
│   ├── ComputerUseExecutor        # Computer-Use 执行器
│   │   ├── CommandExecutor        # 命令执行器
│   │   ├── ScriptExecutor         # 脚本执行器
│   │   └── GuiAutomationExecutor  # GUI 自动化执行器
│   └── VmManager                  # 虚拟机管理器
│
├── agent/               # 智能体核心
│   ├── MentisAgent               # 智能体主类
│   ├── IntentRecognizer          # 意图识别器
│   ├── TaskDecomposer            # 任务分解器
│   └── ResponseGenerator         # 响应生成器
│
├── vm/                  # 虚拟机管理
│   ├── VmProvider                # 虚拟机提供者接口
│   ├── DockerVmProvider          # Docker 虚拟机提供者
│   ├── QemuVmProvider            # QEMU 虚拟机提供者
│   └── CloudVmProvider            # 云虚拟机提供者
│
├── entity/              # 实体层（已存在）
├── repository/          # 数据访问层（已存在）
├── dto/                 # 数据传输对象（部分存在）
└── config/              # 配置类
    ├── MentisConfig              # Mentis 配置
    └── VmConfig                  # 虚拟机配置
```

### 1.2 核心组件职责

#### 1.2.1 MentisAgent（智能体核心）
- **职责**：智能体的核心大脑，协调各个组件
- **功能**：
  - 接收用户消息
  - 调用意图识别器理解用户意图
  - 调用任务规划器分解任务
  - 调用执行引擎执行任务
  - 生成响应返回用户

#### 1.2.2 IntentRecognizer（意图识别器）
- **职责**：理解用户自然语言，识别任务意图
- **功能**：
  - 使用 LLM 分析用户消息
  - 识别任务类型（COMMAND、SCRIPT、COMPUTER_USE 等）
  - 提取任务参数和目标

#### 1.2.3 TaskPlanner（任务规划器）
- **职责**：将用户需求分解为可执行的任务步骤
- **功能**：
  - 任务分解：将复杂任务分解为子任务
  - 任务编排：确定任务执行顺序和依赖关系
  - 任务验证：验证任务的可执行性

#### 1.2.4 ExecutionEngine（执行引擎）
- **职责**：负责任务的实际执行
- **功能**：
  - 任务调度：按顺序执行任务
  - 执行监控：监控任务执行状态
  - 错误处理：处理执行错误和异常
  - 结果收集：收集执行结果

#### 1.2.5 ComputerUseExecutor（Computer-Use 执行器）
- **职责**：在虚拟机中执行 Computer-Use 操作
- **功能**：
  - 命令执行：执行 Shell/PowerShell 命令
  - 脚本执行：执行 Python/JavaScript 脚本
  - GUI 自动化：操作桌面应用程序

#### 1.2.6 VmManager（虚拟机管理器）
- **职责**：管理虚拟机的生命周期
- **功能**：
  - 虚拟机创建和销毁
  - 虚拟机状态管理
  - 虚拟机快照和恢复
  - 资源监控和控制

### 1.3 数据流设计

```
用户消息
    ↓
MentisChatController
    ↓
MentisAgentService
    ↓
┌─────────────────────────────────────┐
│  IntentRecognizer (意图识别)         │
│  → 识别任务类型和参数                │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  TaskPlanner (任务规划)              │
│  → 分解任务为执行步骤                │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  ExecutionEngine (执行引擎)          │
│  → 调度任务执行                      │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  ComputerUseExecutor (执行器)        │
│  → 在虚拟机中执行操作                │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  VmManager (虚拟机管理)              │
│  → 提供虚拟机环境                    │
└─────────────────────────────────────┘
    ↓
执行结果
    ↓
ResponseGenerator (响应生成)
    ↓
返回用户
```

---

## 二、接口与交互设计

### 2.1 REST API 设计

#### 2.1.1 对话接口

```
POST /api/mentis/chat
功能：发送消息给 Mentis，获取响应
请求体：
{
  "sessionId": "mentis_xxx",
  "message": "帮我创建一个Python脚本，计算1到100的和",
  "stream": false  // 是否流式返回
}
响应：
{
  "code": 200,
  "data": {
    "messageId": "msg_xxx",
    "content": "好的，我来帮你创建这个脚本...",
    "tasks": [
      {
        "taskId": "task_xxx",
        "status": "COMPLETED",
        "result": "..."
      }
    ]
  }
}
```

#### 2.1.2 会话管理接口

```
POST /api/mentis/sessions
功能：创建新会话
GET /api/mentis/sessions/{sessionId}
功能：获取会话信息
GET /api/mentis/sessions
功能：获取用户的所有会话列表
PUT /api/mentis/sessions/{sessionId}
功能：更新会话（暂停、恢复等）
DELETE /api/mentis/sessions/{sessionId}
功能：删除会话
```

#### 2.1.3 任务管理接口

```
GET /api/mentis/tasks/{taskId}
功能：获取任务详情
GET /api/mentis/tasks?sessionId=xxx
功能：获取会话的所有任务
POST /api/mentis/tasks/{taskId}/cancel
功能：取消任务执行
GET /api/mentis/tasks/{taskId}/result
功能：获取任务执行结果
```

#### 2.1.4 虚拟机管理接口

```
GET /api/mentis/vm/{sessionId}/status
功能：获取虚拟机状态
POST /api/mentis/vm/{sessionId}/snapshot
功能：创建虚拟机快照
POST /api/mentis/vm/{sessionId}/restore
功能：恢复虚拟机快照
GET /api/mentis/vm/{sessionId}/screenshot
功能：获取虚拟机屏幕截图
```

### 2.2 服务层接口设计

#### 2.2.1 MentisAgentService

```java
public interface MentisAgentService {
    // 处理用户消息，返回响应
    ChatResponse processMessage(Long userId, ChatRequest request);
    
    // 流式处理消息
    void processMessageStream(Long userId, ChatRequest request, 
                              StreamResponseHandler handler);
}
```

#### 2.2.2 MentisSessionService

```java
public interface MentisSessionService {
    // 创建会话
    MentisSession createSession(Long userId, String title);
    
    // 获取会话
    MentisSession getSession(String sessionId);
    
    // 更新会话状态
    void updateSessionStatus(String sessionId, String status);
    
    // 获取用户的所有会话
    List<MentisSession> getUserSessions(Long userId);
}
```

#### 2.2.3 MentisTaskService

```java
public interface MentisTaskService {
    // 创建任务
    MentisTask createTask(String sessionId, TaskCreateRequest request);
    
    // 执行任务
    TaskExecutionResult executeTask(String taskId);
    
    // 获取任务状态
    MentisTask getTask(String taskId);
    
    // 取消任务
    void cancelTask(String taskId);
}
```

#### 2.2.4 VmService

```java
public interface VmService {
    // 为会话创建虚拟机
    VmInstance createVm(String sessionId, VmConfig config);
    
    // 获取虚拟机状态
    VmStatus getVmStatus(String sessionId);
    
    // 执行命令
    CommandResult executeCommand(String sessionId, String command);
    
    // 创建快照
    String createSnapshot(String sessionId);
    
    // 恢复快照
    void restoreSnapshot(String sessionId, String snapshotId);
}
```

### 2.3 执行器接口设计

#### 2.3.1 TaskPlanner

```java
public interface TaskPlanner {
    // 规划任务
    TaskPlan planTask(String userRequest, String sessionId);
    
    // 验证任务可执行性
    boolean validateTask(TaskPlan plan);
}
```

#### 2.3.2 ExecutionEngine

```java
public interface ExecutionEngine {
    // 执行任务计划
    ExecutionResult execute(TaskPlan plan, String sessionId);
    
    // 获取执行状态
    ExecutionStatus getStatus(String executionId);
}
```

#### 2.3.3 ComputerUseExecutor

```java
public interface ComputerUseExecutor {
    // 执行命令
    CommandResult executeCommand(String sessionId, String command);
    
    // 执行脚本
    ScriptResult executeScript(String sessionId, String script, String language);
    
    // GUI 自动化操作
    GuiActionResult performGuiAction(String sessionId, GuiAction action);
}
```

---

## 三、关键技术选型

### 3.1 虚拟机技术栈

- **首选方案**：Docker（轻量级，快速启动）
- **备选方案**：QEMU/KVM（完整虚拟机，功能更强）
- **云方案**：支持阿里云 ECS、腾讯云 CVM

### 3.2 Computer-Use 技术栈

- **命令执行**：Java Process API + SSH
- **脚本执行**：Python Interpreter、Node.js Runtime
- **GUI 自动化**：Selenium WebDriver、Playwright
- **屏幕交互**：截图 + OCR（Tesseract）

### 3.3 AI 能力

- **复用现有**：Spring AI Alibaba DashScope
- **意图识别**：使用 LLM 进行意图理解和任务分解
- **响应生成**：使用 LLM 生成自然语言响应

---

## 四、实施阶段规划（细化）

### 阶段一：基础框架搭建 ✅（已完成）
- [x] 数据库模型设计
- [x] 实体类创建
- [x] Repository 层创建
- [x] 基础 DTO 创建

### 阶段二：核心服务层（当前阶段）
**目标**：实现核心业务逻辑层

**步骤 2.1：服务层骨架**
- MentisSessionService 实现
- MentisTaskService 实现
- MentisVmService 基础实现

**步骤 2.2：智能体核心**
- MentisAgentService 实现
- IntentRecognizer 实现
- ResponseGenerator 实现

### 阶段三：任务规划与执行
**目标**：实现任务规划和执行能力

**步骤 3.1：任务规划器**
- TaskPlanner 实现
- TaskDecomposer 实现
- 任务验证逻辑

**步骤 3.2：执行引擎**
- ExecutionEngine 实现
- 任务调度机制
- 执行状态管理

### 阶段四：Computer-Use 能力
**目标**：实现 Computer-Use 执行能力

**步骤 4.1：命令执行**
- CommandExecutor 实现
- Shell/PowerShell 命令执行
- 命令结果解析

**步骤 4.2：脚本执行**
- ScriptExecutor 实现
- Python/JavaScript 脚本执行
- 脚本环境管理

**步骤 4.3：GUI 自动化**
- GuiAutomationExecutor 实现
- Selenium/Playwright 集成
- 屏幕截图和 OCR

### 阶段五：虚拟机管理
**目标**：实现虚拟机生命周期管理

**步骤 5.1：Docker 虚拟机**
- DockerVmProvider 实现
- 容器创建和管理
- 容器状态监控

**步骤 5.2：虚拟机快照**
- 快照创建和恢复
- 状态持久化
- 快照管理

**步骤 5.3：资源管理**
- 资源限制和控制
- 资源监控
- 自动清理机制

### 阶段六：REST API 接口
**目标**：提供完整的 REST API

**步骤 6.1：对话接口**
- MentisChatController 实现
- 消息处理逻辑
- 流式响应支持

**步骤 6.2：管理接口**
- MentisSessionController 实现
- MentisTaskController 实现
- VmController 实现

### 阶段七：安全与优化
**目标**：完善安全机制和性能优化

**步骤 7.1：安全机制**
- 权限控制实现
- 操作审计日志
- 危险操作拦截

**步骤 7.2：性能优化**
- 虚拟机池化
- 任务队列优化
- 缓存机制

**步骤 7.3：监控与告警**
- 执行监控
- 错误告警
- 性能指标收集

### 阶段八：前端界面
**目标**：开发前端交互界面

**步骤 8.1：对话界面**
- 对话 UI 组件
- 消息展示
- 任务状态展示

**步骤 8.2：可视化**
- 虚拟机屏幕展示
- 执行日志展示
- 任务进度可视化

**步骤 8.3：管理界面**
- 会话管理界面
- 任务管理界面
- 虚拟机管理界面

---

## 五、核心设计原则

### 5.1 模块化设计
- 各模块职责清晰，低耦合高内聚
- 通过接口定义模块间交互
- 支持模块独立测试和替换

### 5.2 可扩展性
- 支持多种虚拟机提供者（Docker、QEMU、云平台）
- 支持多种执行器（命令、脚本、GUI）
- 支持插件化扩展

### 5.3 安全性
- 虚拟机完全隔离
- 权限控制和操作审计
- 资源限制和防护机制

### 5.4 可靠性
- 任务失败重试机制
- 虚拟机快照和恢复
- 异常处理和错误恢复

---

**下一步工作**：
1. 详细设计各个模块的实现方案
2. 数据库表结构详细设计
3. 接口详细设计文档
4. 开始阶段二的实施
