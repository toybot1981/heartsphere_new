# Mentis超级智能体 - 代码编写计划

**文档版本**: v1.0  
**创建日期**: 2025-01-06  
**代码编写阶段**: 分模块实施

---

## 一、代码编写总览

### 1.1 编写原则
- **模块化编写**：每个步骤独立完成一个模块或功能
- **依赖管理**：按照依赖关系顺序编写
- **测试同步**：关键模块编写后立即编写测试
- **代码审查**：每个步骤完成后进行代码审查

### 1.2 编写顺序
按照从基础到高级、从底层到上层的顺序进行编写。

---

## 二、详细编写步骤（20+ 步）

### 第1步：完善 DTO 类
**模块**：DTO 层  
**目标**：完善所有数据传输对象

**任务清单**：
- [ ] 完善 `ChatRequestDTO.java`
- [ ] 完善 `ChatResponseDTO.java`
- [ ] 创建 `SessionCreateRequestDTO.java`
- [ ] 创建 `SessionUpdateRequestDTO.java`
- [ ] 创建 `TaskCreateRequestDTO.java`
- [ ] 创建 `TaskResultDTO.java`
- [ ] 创建 `VmConfigDTO.java`
- [ ] 创建 `VmStatusDTO.java`
- [ ] 创建 `CommandResultDTO.java`
- [ ] 创建 `ScriptResultDTO.java`

**验收标准**：
- 所有 DTO 类字段完整
- 包含必要的验证注解
- 包含 Lombok 注解

---

### 第2步：创建异常类
**模块**：异常处理  
**目标**：定义自定义异常类

**任务清单**：
- [ ] 创建 `MentisException.java`（基础异常类）
- [ ] 创建 `SessionNotFoundException.java`
- [ ] 创建 `TaskNotFoundException.java`
- [ ] 创建 `VmException.java`
- [ ] 创建 `ExecutionException.java`
- [ ] 创建 `SecurityException.java`

**验收标准**：
- 异常类继承结构合理
- 包含错误码和错误信息
- 异常类文档完整

---

### 第3步：创建工具类
**模块**：工具类  
**目标**：实现通用工具类

**任务清单**：
- [ ] 创建 `IdGenerator.java`（ID 生成工具）
- [ ] 创建 `JsonUtils.java`（JSON 处理工具）
- [ ] 创建 `TimeUtils.java`（时间处理工具）
- [ ] 创建 `ValidationUtils.java`（验证工具）

**验收标准**：
- 工具类方法完整
- 包含单元测试
- 工具类文档完整

---

### 第4步：实现 MentisSessionService
**模块**：Service 层 - 会话管理  
**目标**：实现会话管理服务

**任务清单**：
- [ ] 实现 `MentisSessionService` 接口（已存在，需完善）
- [ ] 实现 `MentisSessionServiceImpl`（已存在，需完善）
- [ ] 实现会话创建逻辑
- [ ] 实现会话查询逻辑
- [ ] 实现会话更新逻辑
- [ ] 实现会话删除逻辑
- [ ] 编写单元测试

**验收标准**：
- 所有方法实现完整
- 事务处理正确
- 异常处理完善
- 单元测试通过

---

### 第5步：实现 MentisTaskService
**模块**：Service 层 - 任务管理  
**目标**：实现任务管理服务

**任务清单**：
- [ ] 创建 `MentisTaskService.java` 接口
- [ ] 创建 `MentisTaskServiceImpl.java` 实现类
- [ ] 实现任务创建逻辑
- [ ] 实现任务查询逻辑
- [ ] 实现任务状态更新逻辑
- [ ] 实现任务取消逻辑
- [ ] 编写单元测试

**验收标准**：
- 所有方法实现完整
- 任务状态管理正确
- 异常处理完善
- 单元测试通过

---

### 第6步：实现 MentisMessageService
**模块**：Service 层 - 消息管理  
**目标**：实现消息管理服务

**任务清单**：
- [ ] 创建 `MentisMessageService.java` 接口
- [ ] 创建 `MentisMessageServiceImpl.java` 实现类
- [ ] 实现消息保存逻辑
- [ ] 实现消息查询逻辑
- [ ] 实现消息历史查询
- [ ] 实现消息分页查询
- [ ] 编写单元测试

**验收标准**：
- 所有方法实现完整
- 消息关联正确
- 查询性能优化
- 单元测试通过

---

### 第7步：实现配置类
**模块**：配置层  
**目标**：实现 Mentis 配置管理

**任务清单**：
- [ ] 创建 `MentisConfig.java` 配置类
- [ ] 创建 `VmConfig.java` 配置类
- [ ] 创建 `MentisProperties.java`（配置属性）
- [ ] 配置 `application.yml` 相关属性
- [ ] 实现配置验证

**验收标准**：
- 配置类字段完整
- 配置属性文档完整
- 配置验证正确

---

### 第8步：实现 IntentRecognizer
**模块**：Agent 层 - 意图识别  
**目标**：实现意图识别功能

**任务清单**：
- [ ] 创建 `IntentRecognizer.java` 接口
- [ ] 创建 `LLMIntentRecognizer.java` 实现类
- [ ] 设计意图识别 Prompt 模板
- [ ] 集成 AIService 调用 LLM
- [ ] 实现意图解析逻辑
- [ ] 实现参数提取逻辑
- [ ] 编写单元测试

**验收标准**：
- 意图识别准确
- Prompt 模板优化
- 解析逻辑正确
- 单元测试通过

---

### 第9步：实现 ResponseGenerator
**模块**：Agent 层 - 响应生成  
**目标**：实现响应生成功能

**任务清单**：
- [ ] 创建 `ResponseGenerator.java` 接口
- [ ] 创建 `LLMResponseGenerator.java` 实现类
- [ ] 设计响应生成 Prompt 模板
- [ ] 实现响应格式化逻辑
- [ ] 实现响应模板管理
- [ ] 编写单元测试

**验收标准**：
- 响应生成质量好
- 模板管理完善
- 格式化正确
- 单元测试通过

---

### 第10步：实现 TaskDecomposer
**模块**：Executor 层 - 任务分解  
**目标**：实现任务分解功能

**任务清单**：
- [ ] 创建 `TaskDecomposer.java` 接口
- [ ] 创建 `LLMTaskDecomposer.java` 实现类
- [ ] 设计任务分解 Prompt 模板
- [ ] 实现任务分解逻辑
- [ ] 实现子任务生成
- [ ] 实现任务类型识别
- [ ] 编写单元测试

**验收标准**：
- 任务分解合理
- 子任务正确
- 类型识别准确
- 单元测试通过

---

### 第11步：实现 TaskPlanner
**模块**：Executor 层 - 任务规划  
**目标**：实现任务规划功能

**任务清单**：
- [ ] 创建 `TaskPlanner.java` 接口
- [ ] 创建 `TaskPlannerImpl.java` 实现类
- [ ] 实现任务规划逻辑
- [ ] 实现任务依赖分析
- [ ] 实现任务编排
- [ ] 实现任务验证
- [ ] 编写单元测试

**验收标准**：
- 任务规划合理
- 依赖分析正确
- 编排逻辑正确
- 单元测试通过

---

### 第12步：实现 CommandExecutor
**模块**：Executor 层 - 命令执行  
**目标**：实现命令执行功能

**任务清单**：
- [ ] 创建 `CommandExecutor.java` 接口
- [ ] 创建 `ShellCommandExecutor.java`（Linux）
- [ ] 创建 `PowerShellCommandExecutor.java`（Windows）
- [ ] 实现命令执行逻辑
- [ ] 实现命令超时控制
- [ ] 实现命令结果解析
- [ ] 实现命令安全验证
- [ ] 编写单元测试

**验收标准**：
- 命令执行正确
- 超时控制有效
- 安全验证完善
- 单元测试通过

---

### 第13步：实现 ScriptExecutor
**模块**：Executor 层 - 脚本执行  
**目标**：实现脚本执行功能

**任务清单**：
- [ ] 创建 `ScriptExecutor.java` 接口
- [ ] 创建 `PythonScriptExecutor.java`
- [ ] 创建 `JavaScriptScriptExecutor.java`
- [ ] 实现脚本执行逻辑
- [ ] 实现脚本环境管理
- [ ] 实现脚本参数传递
- [ ] 实现脚本结果解析
- [ ] 编写单元测试

**验收标准**：
- 脚本执行正确
- 环境管理完善
- 参数传递正确
- 单元测试通过

---

### 第14步：实现 GuiAutomationExecutor
**模块**：Executor 层 - GUI 自动化  
**目标**：实现 GUI 自动化功能

**任务清单**：
- [ ] 创建 `GuiAutomationExecutor.java` 接口
- [ ] 创建 `SeleniumGuiExecutor.java`
- [ ] 集成 Selenium WebDriver
- [ ] 实现浏览器自动化
- [ ] 实现元素操作（点击、输入等）
- [ ] 实现屏幕截图功能
- [ ] 实现 OCR 识别（集成 Tesseract）
- [ ] 编写单元测试

**验收标准**：
- GUI 自动化稳定
- 元素操作正确
- 截图功能正常
- OCR 识别可用
- 单元测试通过

---

### 第15步：实现 ComputerUseExecutor
**模块**：Executor 层 - Computer-Use 统一接口  
**目标**：整合所有执行器

**任务清单**：
- [ ] 创建 `ComputerUseExecutor.java` 接口
- [ ] 创建 `ComputerUseExecutorImpl.java` 实现类
- [ ] 整合 CommandExecutor
- [ ] 整合 ScriptExecutor
- [ ] 整合 GuiAutomationExecutor
- [ ] 实现执行器路由逻辑
- [ ] 实现执行器选择策略
- [ ] 编写单元测试

**验收标准**：
- 执行器整合正确
- 路由逻辑合理
- 选择策略有效
- 单元测试通过

---

### 第16步：实现 ExecutionEngine
**模块**：Executor 层 - 执行引擎  
**目标**：实现任务执行引擎

**任务清单**：
- [ ] 创建 `ExecutionEngine.java` 接口
- [ ] 创建 `ExecutionEngineImpl.java` 实现类
- [ ] 实现任务调度逻辑
- [ ] 实现任务队列管理
- [ ] 实现执行状态管理
- [ ] 实现执行进度跟踪
- [ ] 实现执行日志记录
- [ ] 实现错误处理机制
- [ ] 编写单元测试

**验收标准**：
- 任务调度正确
- 队列管理完善
- 状态管理正确
- 错误处理完善
- 单元测试通过

---

### 第17步：实现 VmProvider 接口和 DockerVmProvider
**模块**：VM 层 - 虚拟机提供者  
**目标**：实现 Docker 虚拟机管理

**任务清单**：
- [ ] 创建 `VmProvider.java` 接口
- [ ] 创建 `DockerVmProvider.java` 实现类
- [ ] 集成 Docker Java Client
- [ ] 实现容器创建
- [ ] 实现容器生命周期管理
- [ ] 实现容器状态查询
- [ ] 实现容器配置管理
- [ ] 实现快照功能
- [ ] 编写单元测试

**验收标准**：
- Docker 操作正确
- 容器管理完善
- 快照功能正常
- 单元测试通过

---

### 第18步：实现 VmService 和 VmManager
**模块**：VM 层 - 虚拟机服务  
**目标**：封装统一的虚拟机服务

**任务清单**：
- [ ] 创建 `VmService.java` 接口
- [ ] 创建 `VmServiceImpl.java` 实现类
- [ ] 创建 `VmManager.java` 管理类
- [ ] 实现虚拟机创建接口
- [ ] 实现虚拟机状态查询
- [ ] 实现虚拟机快照管理
- [ ] 实现资源监控
- [ ] 实现自动清理机制
- [ ] 编写单元测试

**验收标准**：
- 服务接口完整
- 虚拟机管理完善
- 资源监控正常
- 自动清理有效
- 单元测试通过

---

### 第19步：实现 MentisAgentService
**模块**：Service 层 - 智能体核心  
**目标**：实现智能体核心服务

**任务清单**：
- [ ] 完善 `MentisAgentService` 接口（已存在）
- [ ] 完善 `MentisAgentServiceImpl` 实现类（已存在）
- [ ] 集成 IntentRecognizer
- [ ] 集成 TaskPlanner
- [ ] 集成 ExecutionEngine
- [ ] 集成 ResponseGenerator
- [ ] 实现完整消息处理流程
- [ ] 实现流式响应处理
- [ ] 编写集成测试

**验收标准**：
- 消息处理流程完整
- 各组件集成正确
- 流式响应正常
- 集成测试通过

---

### 第20步：实现 MentisChatController
**模块**：Controller 层 - 对话接口  
**目标**：实现对话 REST API

**任务清单**：
- [ ] 创建 `MentisChatController.java`
- [ ] 实现 POST `/api/mentis/chat` 接口
- [ ] 实现流式响应支持（SSE）
- [ ] 实现请求参数验证
- [ ] 实现异常处理
- [ ] 实现响应格式化
- [ ] 编写接口测试

**验收标准**：
- 接口功能完整
- 参数验证正确
- 异常处理完善
- 流式响应正常
- 接口测试通过

---

### 第21步：实现 MentisSessionController
**模块**：Controller 层 - 会话管理接口  
**目标**：实现会话管理 REST API

**任务清单**：
- [ ] 创建 `MentisSessionController.java`
- [ ] 实现 POST `/api/mentis/sessions`（创建会话）
- [ ] 实现 GET `/api/mentis/sessions/{sessionId}`（获取会话）
- [ ] 实现 GET `/api/mentis/sessions`（会话列表）
- [ ] 实现 PUT `/api/mentis/sessions/{sessionId}`（更新会话）
- [ ] 实现 DELETE `/api/mentis/sessions/{sessionId}`（删除会话）
- [ ] 实现请求参数验证
- [ ] 实现异常处理
- [ ] 编写接口测试

**验收标准**：
- 所有接口实现完整
- CRUD 操作正确
- 参数验证正确
- 异常处理完善
- 接口测试通过

---

### 第22步：实现 MentisTaskController
**模块**：Controller 层 - 任务管理接口  
**目标**：实现任务管理 REST API

**任务清单**：
- [ ] 创建 `MentisTaskController.java`
- [ ] 实现 GET `/api/mentis/tasks/{taskId}`（获取任务）
- [ ] 实现 GET `/api/mentis/tasks`（任务列表）
- [ ] 实现 POST `/api/mentis/tasks/{taskId}/cancel`（取消任务）
- [ ] 实现 GET `/api/mentis/tasks/{taskId}/result`（获取结果）
- [ ] 实现请求参数验证
- [ ] 实现异常处理
- [ ] 编写接口测试

**验收标准**：
- 所有接口实现完整
- 任务操作正确
- 参数验证正确
- 异常处理完善
- 接口测试通过

---

### 第23步：实现 VmController
**模块**：Controller 层 - 虚拟机管理接口  
**目标**：实现虚拟机管理 REST API

**任务清单**：
- [ ] 创建 `VmController.java`
- [ ] 实现 GET `/api/mentis/vm/{sessionId}/status`（虚拟机状态）
- [ ] 实现 POST `/api/mentis/vm/{sessionId}/snapshot`（创建快照）
- [ ] 实现 POST `/api/mentis/vm/{sessionId}/restore`（恢复快照）
- [ ] 实现 GET `/api/mentis/vm/{sessionId}/screenshot`（获取截图）
- [ ] 实现请求参数验证
- [ ] 实现异常处理
- [ ] 编写接口测试

**验收标准**：
- 所有接口实现完整
- 虚拟机操作正确
- 参数验证正确
- 异常处理完善
- 接口测试通过

---

### 第24步：实现全局异常处理
**模块**：异常处理层  
**目标**：实现全局异常处理机制

**任务清单**：
- [ ] 创建 `MentisExceptionHandler.java`
- [ ] 实现异常统一处理
- [ ] 实现错误码定义
- [ ] 实现错误响应格式化
- [ ] 实现日志记录
- [ ] 编写异常处理测试

**验收标准**：
- 异常处理统一
- 错误响应规范
- 日志记录完整
- 异常处理测试通过

---

### 第25步：配置 Swagger/OpenAPI 文档
**模块**：API 文档  
**目标**：生成 API 接口文档

**任务清单**：
- [ ] 配置 Swagger/OpenAPI
- [ ] 为所有 Controller 添加注解
- [ ] 为所有 DTO 添加注解
- [ ] 生成 API 文档
- [ ] 验证文档完整性
- [ ] 编写 API 使用示例

**验收标准**：
- API 文档完整
- 接口描述清晰
- 参数说明详细
- 示例代码正确

---

## 三、代码编写检查清单

### 3.1 每个步骤完成后检查
- [ ] 代码编译通过
- [ ] 单元测试通过
- [ ] 代码符合规范
- [ ] 注释文档完整
- [ ] 异常处理完善
- [ ] 日志记录合理

### 3.2 关键模块额外检查
- [ ] 性能测试通过
- [ ] 集成测试通过
- [ ] 代码审查通过
- [ ] 安全性检查通过

---

## 四、依赖关系图

```
DTO/异常/工具类（1-3步）
    ↓
Service 层（4-6步）
    ↓
配置类（第7步）
    ↓
Agent 层（8-9步）
    ↓
Executor 层 - 规划（10-11步）
    ↓
Executor 层 - 执行（12-16步）
    ↓
VM 层（17-18步）
    ↓
智能体核心服务（第19步）
    ↓
Controller 层（20-23步）
    ↓
异常处理和文档（24-25步）
```

---

## 五、测试策略

### 5.1 单元测试
- **覆盖率要求**：> 70%
- **关键模块**：必须 100% 覆盖
- **测试时机**：每个步骤完成后立即编写

### 5.2 集成测试
- **测试范围**：关键业务流程
- **测试时机**：相关模块完成后
- **测试重点**：组件间协作

### 5.3 接口测试
- **测试工具**：Postman / RestAssured
- **测试范围**：所有 REST API
- **测试时机**：Controller 层完成后

---

## 六、代码审查要点

### 6.1 代码质量
- 代码规范符合性
- 命名规范性
- 代码可读性
- 代码复用性

### 6.2 功能完整性
- 功能实现完整
- 边界条件处理
- 异常情况处理
- 错误提示友好

### 6.3 性能和安全
- 性能优化
- 安全性考虑
- 资源管理
- 并发处理

---

## 七、下一步行动

### 立即开始
1. ✅ 完成代码编写计划（当前任务）
2. ⏭️ 开始第1步：完善 DTO 类

### 本周目标
- 完成第1-4步（DTO、异常、工具类、SessionService）

---

**文档状态**：代码编写计划制定完成  
**更新时间**：2025-01-06  
**总步骤数**：25 步
