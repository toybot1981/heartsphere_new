# Mentis 详细测试说明

**日期**：2025-01-07  
**版本**：1.0

---

## 一、测试概述

本文档描述了 Mentis 超级智能体模块的完整测试套件，包括单元测试、集成测试、性能测试和端到端测试。

---

## 二、测试文件列表

### 1. 单元测试（Unit Tests）

#### Service 层
- ✅ `MentisSessionServiceTest.java` - 会话服务测试（8个测试方法）
- ✅ `MentisTaskServiceTest.java` - 任务服务测试（9个测试方法）
- ✅ `MentisMessageServiceTest.java` - 消息服务测试（4个测试方法）

#### Agent 层
- ✅ `LLMIntentRecognizerTest.java` - 意图识别器测试（4个测试方法）
- ✅ `LLMTaskDecomposerTest.java` - 任务分解器测试（5个测试方法）

#### Executor 层
- ✅ `ExecutionEngineImplTest.java` - 执行引擎测试（5个测试方法）
- ✅ `ShellCommandExecutorTest.java` - Shell命令执行器测试（3个测试方法）
- ✅ `CommandSecurityValidatorTest.java` - 命令安全验证器测试（7个测试方法）

#### Controller 层
- ✅ `MentisChatControllerTest.java` - 聊天控制器测试（2个测试方法）

#### Util 工具类
- ✅ `LLMResponseParserTest.java` - LLM响应解析器测试（8个测试方法）
- ✅ `IdGeneratorTest.java` - ID生成器测试（6个测试方法）

#### VM 层
- ✅ `VmManagerImplTest.java` - 虚拟机管理器测试（5个测试方法）

### 2. 集成测试（Integration Tests）

#### 完整功能测试
- ✅ `MentisFullIntegrationTest.java` - **完整集成测试**（15+个测试方法）
  - 会话创建、获取、更新、删除
  - 消息发送
  - 权限验证
  - 并发测试
  - 边界条件测试

- ✅ `MentisControllerIntegrationTest.java` - **普通用户接口集成测试**（4个测试方法）
  - 用户会话管理
  - 权限隔离测试

- ✅ `MentisStreamingTest.java` - **流式响应测试**（3个测试方法）
  - SSE 流式消息测试
  - 超时处理测试
  - 并发流式连接测试

### 3. 性能测试（Performance Tests）

- ✅ `MentisPerformanceTest.java` - **性能测试**（4个测试方法）
  - 批量操作性能
  - 并发请求处理能力
  - 大量数据查询性能
  - 内存使用测试

---

## 三、测试覆盖

### 功能覆盖

#### 会话管理
- ✅ 创建会话（有标题/无标题）
- ✅ 获取会话列表
- ✅ 获取会话详情
- ✅ 更新会话状态
- ✅ 删除会话
- ✅ 会话权限隔离
- ✅ 并发创建会话

#### 消息处理
- ✅ 同步消息发送
- ✅ 流式消息发送（SSE）
- ✅ 空消息处理
- ✅ 无效会话处理

#### 管理员接口
- ✅ 管理员认证
- ✅ 管理员会话管理
- ✅ 管理员消息发送

#### 普通用户接口
- ✅ 用户认证
- ✅ 用户会话管理
- ✅ 用户权限隔离

### 边界条件覆盖

- ✅ 空标题处理
- ✅ 超长标题处理（500+字符）
- ✅ 无效JSON请求
- ✅ 无效会话ID
- ✅ 未认证请求
- ✅ 并发请求处理
- ✅ 大量数据查询

### 性能覆盖

- ✅ 批量操作（50个会话）
- ✅ 并发请求（20线程 × 5请求）
- ✅ 大量数据查询（100个会话）
- ✅ 内存使用监控

---

## 四、运行测试

### 运行所有 Mentis 测试

```bash
cd backend
mvn test -Dtest="com.heartsphere.mentis.**.*Test"
```

### 运行特定测试类

```bash
# 运行完整集成测试
mvn test -Dtest=MentisFullIntegrationTest

# 运行流式响应测试
mvn test -Dtest=MentisStreamingTest

# 运行性能测试
mvn test -Dtest=MentisPerformanceTest

# 运行普通用户接口测试
mvn test -Dtest=MentisControllerIntegrationTest
```

### 运行单个测试方法

```bash
mvn test -Dtest=MentisFullIntegrationTest#testCreateSession
```

### 运行单元测试（不包含集成测试）

```bash
mvn test -Dtest="com.heartsphere.mentis.*.*Test" -DexcludeTags="integration"
```

---

## 五、测试数据准备

### 测试账号

#### 管理员账号
- **用户名**: `admin`
- **密码**: `admin123`
- **备用**: `testadmin` / `test123`

#### 普通用户账号
测试使用模拟用户，在测试中自动创建认证上下文。

### 数据库要求

测试使用真实的 MySQL 数据库（test profile）：
- 数据库：`heartsphere`
- 表：`mentis_sessions`, `mentis_tasks`, `mentis_messages`, `mentis_vm_states`

所有集成测试使用 `@Transactional`，测试后自动回滚，不会污染数据库。

---

## 六、测试场景详解

### 场景1：完整会话生命周期

1. 创建会话
2. 获取会话详情
3. 发送消息
4. 更新会话状态
5. 删除会话

### 场景2：并发处理

1. 多线程同时创建会话
2. 多线程同时发送消息
3. 验证数据一致性

### 场景3：流式响应

1. 建立SSE连接
2. 接收流式消息
3. 验证消息格式
4. 测试连接超时

### 场景4：权限隔离

1. 用户A创建会话
2. 用户B创建会话
3. 验证用户只能访问自己的会话

### 场景5：性能测试

1. 批量创建会话（50个）
2. 并发请求（100个请求）
3. 大量数据查询（100个会话）
4. 内存使用监控

---

## 七、测试结果验证

### 成功标准

- ✅ 所有单元测试通过
- ✅ 所有集成测试通过
- ✅ 性能测试满足指标：
  - 批量创建：平均 < 200ms/个
  - 并发请求：成功率 ≥ 90%
  - 大量查询：< 2秒

### 失败处理

如果测试失败：
1. 检查数据库连接
2. 检查测试账号是否存在
3. 查看详细错误日志
4. 验证测试数据是否清理

---

## 八、测试最佳实践

### 1. 测试隔离

- 每个测试方法独立
- 使用 `@BeforeEach` 准备数据
- 使用 `@Transactional` 自动回滚

### 2. 断言完整性

- 验证返回状态码
- 验证响应数据结构
- 验证数据库状态

### 3. 异常测试

- 测试正常流程
- 测试异常情况
- 测试边界条件

### 4. 性能监控

- 记录执行时间
- 监控内存使用
- 验证并发能力

---

## 九、持续集成

建议在 CI/CD 流程中包含：

```yaml
# 示例 CI 配置
test:
  - mvn test -Dtest="com.heartsphere.mentis.**.*Test"
  - 生成测试报告
  - 检查测试覆盖率（目标：> 80%）
```

---

## 十、测试覆盖率目标

- **Service 层**：85%+
- **Controller 层**：80%+
- **Agent 层**：75%+
- **Executor 层**：75%+
- **工具类**：90%+
- **整体覆盖率**：80%+

---

## 十一、待补充的测试

- [ ] VM 虚拟机功能完整测试
- [ ] GUI 自动化功能测试
- [ ] 任务执行流程完整测试
- [ ] 错误恢复机制测试
- [ ] 安全性渗透测试

---

**创建时间**：2025-01-07  
**最后更新**：2025-01-07
