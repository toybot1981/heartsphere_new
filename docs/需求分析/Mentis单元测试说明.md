# Mentis 单元测试说明

**日期**：2025-01-06  
**状态**：基础测试完成

---

## 一、测试文件列表

### 1. Service 层测试

- ✅ `MentisSessionServiceTest.java` - 会话服务测试
- ✅ `MentisTaskServiceTest.java` - 任务服务测试
- ✅ `MentisMessageServiceTest.java` - 消息服务测试

### 2. Agent 层测试

- ✅ `LLMIntentRecognizerTest.java` - 意图识别器测试

### 3. Executor 层测试

- ✅ `ExecutionEngineImplTest.java` - 执行引擎测试
- ✅ `ShellCommandExecutorTest.java` - Shell命令执行器测试
- ✅ `CommandSecurityValidatorTest.java` - 命令安全验证器测试

### 4. Util 工具类测试

- ✅ `LLMResponseParserTest.java` - LLM响应解析器测试

### 5. Controller 层测试

- ✅ `MentisChatControllerTest.java` - 聊天控制器测试

---

## 二、测试覆盖

### Service 层测试覆盖

#### MentisSessionServiceTest
- ✅ 创建会话（带标题/无标题）
- ✅ 获取会话
- ✅ 会话不存在异常
- ✅ 更新会话状态
- ✅ 更新最后活跃时间
- ✅ 获取用户会话列表
- ✅ 删除会话

#### MentisTaskServiceTest
- ✅ 创建任务
- ✅ 获取任务
- ✅ 任务不存在异常
- ✅ 更新任务状态
- ✅ 更新任务结果
- ✅ 获取会话任务列表
- ✅ 取消任务
- ✅ 取消已完成任务

#### MentisMessageServiceTest
- ✅ 保存消息（带/不带任务ID）
- ✅ 获取会话消息列表
- ✅ 获取最近N条消息

### Agent 层测试覆盖

#### LLMIntentRecognizerTest
- ✅ 识别命令意图
- ✅ 识别对话意图（默认）
- ✅ LLM调用失败处理
- ✅ 无效JSON处理

### Executor 层测试覆盖

#### ExecutionEngineImplTest
- ✅ 执行命令步骤
- ✅ 执行脚本步骤
- ✅ 步骤执行失败
- ✅ 异常处理
- ✅ 获取执行状态

#### ShellCommandExecutorTest
- ✅ 执行成功命令
- ✅ 执行失败命令
- ✅ 安全验证失败

#### CommandSecurityValidatorTest
- ✅ 安全命令验证
- ✅ 危险命令拦截（rm -rf, format）
- ✅ 敏感路径拦截
- ✅ STRICT模式网络请求拦截
- ✅ NONE模式（允许所有）
- ✅ MODERATE模式

### Util 工具类测试覆盖

#### LLMResponseParserTest
- ✅ 从Markdown代码块提取JSON
- ✅ 从纯JSON提取
- ✅ 从文本中提取JSON
- ✅ 无效输入处理
- ✅ JSON解析
- ✅ 安全提取方法
- ✅ JSON验证
- ✅ JSON清理

### Controller 层测试覆盖

#### MentisChatControllerTest
- ✅ 发送消息接口
- ✅ 兼容接口测试
- ✅ 认证验证

---

## 三、测试框架和工具

### 使用框架

- **JUnit 5** - 测试框架
- **Mockito** - Mock框架
- **Spring Boot Test** - Spring Boot测试支持
- **Spring Security Test** - 安全测试支持

### 测试注解

- `@ExtendWith(MockitoExtension.class)` - Mockito扩展
- `@Mock` - Mock对象
- `@InjectMocks` - 注入Mock的对象
- `@BeforeEach` - 测试前准备
- `@WebMvcTest` - Web层测试
- `@WithMockUser` - Mock用户认证

---

## 四、运行测试

### 运行所有Mentis测试

```bash
cd backend
mvn test -Dtest="com.heartsphere.mentis.**.*Test"
```

### 运行特定测试类

```bash
# 运行Service层测试
mvn test -Dtest=MentisSessionServiceTest

# 运行Executor层测试
mvn test -Dtest=ExecutionEngineImplTest

# 运行工具类测试
mvn test -Dtest=LLMResponseParserTest
```

### 运行单个测试方法

```bash
mvn test -Dtest=MentisSessionServiceTest#testCreateSession
```

---

## 五、测试最佳实践

### 1. 测试结构

遵循 AAA 模式：
- **Arrange** - 准备测试数据
- **Act** - 执行被测试方法
- **Assert** - 验证结果

### 2. Mock 使用

- 使用 `@Mock` 注入依赖
- 使用 `when().thenReturn()` 设置Mock行为
- 使用 `verify()` 验证方法调用

### 3. 异常测试

- 使用 `assertThrows()` 测试异常
- 验证异常消息和类型

### 4. 边界测试

- 测试null值
- 测试空集合
- 测试边界值

---

## 六、待添加的测试

### Service 层
- [ ] `MentisVmServiceTest` - 虚拟机服务测试
- [ ] `MentisAgentServiceTest` - 智能体服务测试（需要更多Mock）

### Executor 层
- [ ] `TaskPlannerTest` - 任务规划器测试
- [ ] `LLMTaskDecomposerTest` - LLM任务分解器测试
- [ ] `PythonScriptExecutorTest` - Python脚本执行器测试
- [ ] `JavaScriptScriptExecutorTest` - JavaScript脚本执行器测试

### VM 层
- [ ] `DockerVmProviderImplTest` - Docker虚拟机提供者测试（需要Mock Docker客户端）
- [ ] `VmManagerImplTest` - 虚拟机管理器完整测试

### Controller 层
- [ ] `MentisSessionControllerTest` - 会话控制器完整测试
- [ ] `MentisTaskControllerTest` - 任务控制器测试
- [ ] `VmControllerTest` - 虚拟机控制器测试

### 集成测试
- [ ] `MentisIntegrationTest` - 端到端集成测试
- [ ] `ComputerUseFlowTest` - Computer-Use流程测试

---

## 七、测试覆盖率目标

- **Service 层**：80%+
- **Executor 层**：75%+
- **Controller 层**：70%+
- **工具类**：90%+

---

## 八、注意事项

### 1. Mock 依赖

某些测试需要Mock外部依赖：
- AIService（LLM调用）
- Docker客户端
- 数据库Repository

### 2. 异步测试

流式响应相关的测试需要特殊处理：
- 使用 `CompletableFuture` 或 `CountDownLatch`
- 设置合理的超时时间

### 3. 集成测试

集成测试需要：
- 真实数据库连接（测试环境）
- 真实的Docker环境（可选）
- 配置测试配置文件

---

## 九、总结

已创建基础单元测试覆盖：

1. ✅ Service 层核心功能
2. ✅ Executor 层核心功能
3. ✅ 工具类完整测试
4. ✅ Controller 层基础测试
5. ✅ 安全验证测试

后续需要：
- 完善集成测试
- 增加边界测试
- 提高测试覆盖率
- 添加性能测试

---

**创建时间**：2025-01-06
