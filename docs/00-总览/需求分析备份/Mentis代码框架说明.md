# Mentis超级智能体 - 代码框架说明

**文档版本**: v1.0  
**创建日期**: 2025-01-06  
**框架状态**: 基础骨架完成

---

## 一、已创建的代码结构

### 1.1 Service 层（业务逻辑层）

#### 接口
- `MentisAgentService` - 智能体核心服务接口
- `MentisSessionService` - 会话管理服务接口
- `MentisTaskService` - 任务管理服务接口
- `MentisVmService` - 虚拟机管理服务接口

#### 实现类
- `MentisAgentServiceImpl` - 智能体核心服务实现（TODO：实现核心逻辑）
- `MentisSessionServiceImpl` - 会话管理服务实现（✅ 已完成基础CRUD）
- `MentisTaskServiceImpl` - 任务管理服务实现（TODO：实现任务执行）
- `MentisVmServiceImpl` - 虚拟机管理服务实现（TODO：集成虚拟机管理器）

### 1.2 Controller 层（REST API）

- `MentisChatController` - 对话接口
  - `POST /api/mentis/chat` - 发送消息
  - `POST /api/mentis/chat/stream` - 流式发送消息
  
- `MentisSessionController` - 会话管理接口
  - `POST /api/mentis/sessions` - 创建会话
  - `GET /api/mentis/sessions/{sessionId}` - 获取会话
  - `GET /api/mentis/sessions` - 获取用户会话列表
  - `PUT /api/mentis/sessions/{sessionId}/status` - 更新会话状态
  - `DELETE /api/mentis/sessions/{sessionId}` - 删除会话
  
- `MentisTaskController` - 任务管理接口
  - `GET /api/mentis/tasks/{taskId}` - 获取任务
  - `GET /api/mentis/tasks?sessionId=xxx` - 获取会话任务列表
  - `POST /api/mentis/tasks/{taskId}/execute` - 执行任务
  - `POST /api/mentis/tasks/{taskId}/cancel` - 取消任务

### 1.3 Executor 层（执行器）

#### 接口
- `TaskPlanner` - 任务规划器接口
  - `planTask()` - 规划任务
  - `validateTask()` - 验证任务
  
- `ExecutionEngine` - 执行引擎接口
  - `execute()` - 执行任务计划
  - `getStatus()` - 获取执行状态
  
- `ComputerUseExecutor` - Computer-Use 执行器接口
  - `executeCommand()` - 执行命令
  - `executeScript()` - 执行脚本
  - `performGuiAction()` - GUI 自动化操作

#### 实现类
- 所有 Executor 接口的实现类需要后续开发

### 1.4 Agent 层（智能体核心）

#### 接口
- `IntentRecognizer` - 意图识别器接口
  - `recognize()` - 识别用户意图
  
- `ResponseGenerator` - 响应生成器接口
  - `generate()` - 生成自然语言响应

#### 实现类
- 所有 Agent 接口的实现类需要后续开发

### 1.5 VM 层（虚拟机管理）

#### 接口
- `VmProvider` - 虚拟机提供者接口
  - `createVm()` - 创建虚拟机
  - `getVmStatus()` - 获取虚拟机状态
  - `deleteVm()` - 删除虚拟机
  - `executeCommand()` - 执行命令
  - `createSnapshot()` - 创建快照
  - `restoreSnapshot()` - 恢复快照

#### 实现类
- `DockerVmProvider` - Docker 虚拟机提供者实现（TODO：实现具体逻辑）

### 1.6 Config 层（配置）

- `MentisConfig` - Mentis 配置类
  - 支持通过 `application.yml` 配置 Mentis 相关参数
  - 配置项：是否启用、默认镜像、资源限制、任务超时等

---

## 二、代码框架特点

### 2.1 分层清晰
- **Controller 层**：处理 HTTP 请求和响应
- **Service 层**：业务逻辑处理
- **Executor 层**：任务执行相关
- **Agent 层**：智能体核心能力
- **VM 层**：虚拟机管理

### 2.2 接口驱动
- 所有核心功能都定义了接口
- 便于后续扩展和替换实现
- 支持多种虚拟机提供者（Docker、QEMU、云平台）

### 2.3 模块化设计
- 各模块职责清晰，低耦合
- 支持独立开发和测试
- 便于并行开发

### 2.4 扩展性好
- 接口设计灵活，易于扩展新功能
- 支持插件化扩展
- 配置化设计

---

## 三、待实现的核心功能

### 3.1 Agent 核心逻辑
- [ ] `MentisAgentServiceImpl.processMessage()` - 实现消息处理流程
- [ ] `IntentRecognizer` 实现 - 使用 LLM 识别意图
- [ ] `ResponseGenerator` 实现 - 使用 LLM 生成响应

### 3.2 任务规划与执行
- [ ] `TaskPlanner` 实现 - 任务分解和规划
- [ ] `ExecutionEngine` 实现 - 任务执行引擎
- [ ] `ComputerUseExecutor` 实现 - Computer-Use 能力

### 3.3 虚拟机管理
- [ ] `DockerVmProvider` 实现 - Docker 容器管理
- [ ] 虚拟机快照功能
- [ ] 资源监控和控制

### 3.4 其他功能
- [ ] 错误处理和重试机制
- [ ] 操作审计日志
- [ ] 权限控制
- [ ] 性能优化

---

## 四、下一步开发建议

### 4.1 优先级1：核心流程打通
1. 实现 `IntentRecognizer` - 识别用户意图
2. 实现 `TaskPlanner` - 任务规划
3. 实现基础的 `ExecutionEngine` - 任务执行
4. 实现 `ResponseGenerator` - 响应生成
5. 在 `MentisAgentServiceImpl` 中串联整个流程

### 4.2 优先级2：虚拟机管理
1. 完善 `DockerVmProvider` 实现
2. 实现命令执行功能
3. 实现脚本执行功能
4. 实现快照功能

### 4.3 优先级3：Computer-Use 能力
1. 实现 `CommandExecutor` - 命令执行
2. 实现 `ScriptExecutor` - 脚本执行
3. 实现 `GuiAutomationExecutor` - GUI 自动化

### 4.4 优先级4：完善和优化
1. 错误处理和重试
2. 安全机制
3. 性能优化
4. 监控和日志

---

## 五、代码规范

### 5.1 命名规范
- 接口使用名词或名词短语：`TaskPlanner`、`IntentRecognizer`
- 实现类使用接口名 + `Impl`：`TaskPlannerImpl`、`IntentRecognizerImpl`
- Service 接口使用 `Service` 后缀：`MentisAgentService`
- Controller 使用 `Controller` 后缀：`MentisChatController`

### 5.2 注释规范
- 所有类和方法都有 JavaDoc 注释
- TODO 标记待实现的功能
- 复杂逻辑添加行内注释

### 5.3 日志规范
- 使用 `@Slf4j` 注解
- 关键操作记录 INFO 日志
- 错误记录 ERROR 日志
- 调试信息记录 DEBUG 日志

---

## 六、依赖关系

```
Controller
  ↓
Service (MentisAgentService)
  ↓
Agent (IntentRecognizer, ResponseGenerator)
  ↓
Executor (TaskPlanner, ExecutionEngine)
  ↓
ComputerUseExecutor
  ↓
VmManager → VmProvider (DockerVmProvider)
```

---

**框架状态**：基础骨架完成，待实现核心业务逻辑  
**更新时间**：2025-01-06
