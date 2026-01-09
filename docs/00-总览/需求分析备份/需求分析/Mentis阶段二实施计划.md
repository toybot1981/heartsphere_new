# Mentis阶段二实施计划：核心服务层开发

**阶段**：阶段二  
**时间**：4周  
**目标**：完成核心服务层开发

---

## 步骤划分（4个主要步骤）

### 步骤 2.1：数据库与实体层完善（第1周）
### 步骤 2.2：DTO 和基础服务实现（第2周）
### 步骤 2.3：智能体核心组件实现（第3周）
### 步骤 2.4：配置和工具类完善（第4周）

---

## 步骤 2.1：数据库与实体层完善

### 目标
完善数据库设计和实体类，确保数据模型完整。

### 子任务

#### 任务 2.1.1：数据库表结构设计
- [ ] 设计 `mentis_sessions` 表详细字段
  - [ ] 添加必要索引
  - [ ] 添加外键约束
  - [ ] 添加检查约束
- [ ] 设计 `mentis_tasks` 表详细字段
  - [ ] 添加必要索引
  - [ ] 添加外键约束
- [ ] 设计 `mentis_messages` 表详细字段
  - [ ] 添加必要索引
  - [ ] 添加外键约束
- [ ] 设计 `mentis_vm_states` 表详细字段
  - [ ] 添加必要索引
  - [ ] 添加外键约束

#### 任务 2.1.2：创建数据库迁移脚本
- [ ] 创建 Flyway 迁移脚本
- [ ] 编写表创建 SQL
- [ ] 编写索引创建 SQL
- [ ] 测试迁移脚本

#### 任务 2.1.3：完善实体类
- [ ] 完善 `MentisSession` 实体类
- [ ] 完善 `MentisTask` 实体类
- [ ] 完善 `MentisMessage` 实体类
- [ ] 完善 `MentisVmState` 实体类

#### 任务 2.1.4：完善 Repository 层
- [ ] 完善 `MentisSessionRepository` 自定义查询
- [ ] 完善 `MentisTaskRepository` 自定义查询
- [ ] 完善 `MentisMessageRepository` 自定义查询
- [ ] 完善 `MentisVmStateRepository` 自定义查询

### 交付物
- 数据库表结构文档
- Flyway 迁移脚本
- 完善的实体类
- 完善的 Repository 接口

---

## 步骤 2.2：DTO 和基础服务实现

### 目标
实现所有 DTO 类和基础服务层（Session、Task、Message）。

### 子任务

#### 任务 2.2.1：完善 DTO 类
- [ ] 完善 `ChatRequestDTO` 和 `ChatResponseDTO`
- [ ] 创建 `SessionCreateRequestDTO`
- [ ] 创建 `SessionUpdateRequestDTO`
- [ ] 创建 `TaskResultDTO`
- [ ] 创建其他必要 DTO

#### 任务 2.2.2：实现 MentisSessionService
- [ ] 完善 `MentisSessionService` 接口
- [ ] 完善 `MentisSessionServiceImpl` 实现
- [ ] 实现会话创建逻辑
- [ ] 实现会话查询逻辑
- [ ] 实现会话更新逻辑
- [ ] 实现会话删除逻辑
- [ ] 编写单元测试

#### 任务 2.2.3：实现 MentisTaskService
- [ ] 完善 `MentisTaskService` 接口
- [ ] 完善 `MentisTaskServiceImpl` 实现
- [ ] 实现任务创建逻辑
- [ ] 实现任务查询逻辑
- [ ] 实现任务状态更新逻辑
- [ ] 实现任务取消逻辑
- [ ] 编写单元测试

#### 任务 2.2.4：实现 MentisMessageService
- [ ] 创建 `MentisMessageService` 接口
- [ ] 创建 `MentisMessageServiceImpl` 实现
- [ ] 实现消息保存逻辑
- [ ] 实现消息查询逻辑
- [ ] 实现消息历史查询
- [ ] 编写单元测试

### 交付物
- 完整的 DTO 类
- SessionService 实现
- TaskService 实现
- MessageService 实现
- 单元测试用例

---

## 步骤 2.3：智能体核心组件实现

### 目标
实现智能体核心服务（意图识别、响应生成、智能体服务）。

### 子任务

#### 任务 2.3.1：实现 IntentRecognizer
- [ ] 创建 `IntentRecognizer` 接口
- [ ] 创建 `LLMIntentRecognizer` 实现类
- [ ] 设计意图识别 Prompt 模板
- [ ] 集成 AIService 调用 LLM
- [ ] 实现意图解析逻辑
- [ ] 实现参数提取逻辑
- [ ] 编写单元测试

#### 任务 2.3.2：实现 ResponseGenerator
- [ ] 创建 `ResponseGenerator` 接口
- [ ] 创建 `LLMResponseGenerator` 实现类
- [ ] 设计响应生成 Prompt 模板
- [ ] 实现响应格式化逻辑
- [ ] 实现响应模板管理
- [ ] 编写单元测试

#### 任务 2.3.3：完善 MentisAgentService
- [ ] 完善 `MentisAgentService` 接口
- [ ] 完善 `MentisAgentServiceImpl` 实现
- [ ] 集成 IntentRecognizer
- [ ] 集成 ResponseGenerator
- [ ] 实现完整消息处理流程
- [ ] 实现流式响应处理
- [ ] 编写集成测试

#### 任务 2.3.4：集成测试和优化
- [ ] 智能体核心功能集成测试
- [ ] 意图识别准确性测试
- [ ] 响应生成质量测试
- [ ] 性能优化
- [ ] 代码审查

### 交付物
- IntentRecognizer 实现
- ResponseGenerator 实现
- MentisAgentService 完整实现
- 集成测试用例

---

## 步骤 2.4：配置和工具类完善

### 目标
完善配置管理和工具类，完善异常处理。

### 子任务

#### 任务 2.4.1：实现配置类
- [ ] 创建 `MentisConfig` 配置类
- [ ] 创建 `VmConfig` 配置类
- [ ] 创建 `MentisProperties` 配置属性类
- [ ] 配置 `application.yml` 相关属性
- [ ] 实现配置验证

#### 任务 2.4.2：创建工具类
- [ ] 创建 `IdGenerator` ID 生成工具
- [ ] 创建 `JsonUtils` JSON 处理工具
- [ ] 创建 `TimeUtils` 时间处理工具
- [ ] 创建 `ValidationUtils` 验证工具
- [ ] 编写工具类单元测试

#### 任务 2.4.3：创建异常类
- [ ] 创建 `MentisException` 基础异常类
- [ ] 创建 `SessionNotFoundException`
- [ ] 创建 `TaskNotFoundException`
- [ ] 创建 `VmException`
- [ ] 创建 `ExecutionException`
- [ ] 创建异常处理文档

#### 任务 2.4.4：代码审查和文档
- [ ] 代码审查
- [ ] 性能优化
- [ ] 编写阶段二总结文档
- [ ] 更新 API 文档

### 交付物
- 配置类实现
- 工具类实现
- 异常类实现
- 完整的阶段二文档

---

## 验收标准

### 步骤 2.1 验收
- [ ] 数据库表结构完整
- [ ] 迁移脚本可执行
- [ ] 实体类字段完整
- [ ] Repository 查询方法完整

### 步骤 2.2 验收
- [ ] DTO 类完整
- [ ] SessionService 功能完整
- [ ] TaskService 功能完整
- [ ] MessageService 功能完整
- [ ] 单元测试通过率 > 80%

### 步骤 2.3 验收
- [ ] 意图识别功能正常
- [ ] 响应生成功能正常
- [ ] 智能体服务集成完整
- [ ] 集成测试通过

### 步骤 2.4 验收
- [ ] 配置类完整
- [ ] 工具类功能完整
- [ ] 异常处理完善
- [ ] 代码审查通过
- [ ] 文档完整

---

## 时间安排

- **第1周**：步骤 2.1（数据库与实体层）
- **第2周**：步骤 2.2（DTO 和基础服务）
- **第3周**：步骤 2.3（智能体核心组件）
- **第4周**：步骤 2.4（配置和工具类）

---

**下一步**：开始执行步骤 2.1
