# 部署流程全面测试设计文档

## 测试架构设计

### 测试分层

```
┌─────────────────────────────────────┐
│     端到端测试 (E2E Tests)          │
│  - 完整流程执行                     │
│  - 错误处理和恢复                   │
│  - 并发执行                         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   集成测试 (Integration Tests)      │
│  - API 端点测试                     │
│  - 数据库交互测试                   │
│  - SSE 流式传输测试                 │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   单元测试 (Unit Tests)              │
│  - Service 层测试                   │
│  - Repository 层测试                │
│  - 工具类测试                       │
└─────────────────────────────────────┘
```

### 测试框架选择

#### 后端测试框架
- **JUnit 5**: 测试框架
- **Mockito**: Mock 框架
- **Spring Boot Test**: 集成测试支持
- **TestContainers**: 数据库容器化测试（可选）
- **AssertJ**: 断言库

#### 测试类型
1. **单元测试**: 测试单个组件，使用 Mock 隔离依赖
2. **集成测试**: 测试组件间交互，使用真实数据库
3. **端到端测试**: 测试完整流程，使用真实环境

## 测试数据管理

### 测试数据策略

#### 1. 测试数据库
- 使用独立的测试数据库（H2 内存数据库或 TestContainers MySQL）
- 每个测试类使用 `@Transactional` 和 `@Rollback` 确保数据隔离
- 使用 `@Sql` 注解加载初始测试数据

#### 2. 测试数据构建器
```java
public class PipelineTestDataBuilder {
    public static DeploymentPipeline createTestPipeline() {
        DeploymentPipeline pipeline = new DeploymentPipeline();
        pipeline.setName("测试流程");
        pipeline.setEnvironment("test");
        pipeline.setProject("main");
        // ... 设置其他字段
        return pipeline;
    }
    
    public static PipelineStep createTestStep(String scriptId) {
        PipelineStep step = new PipelineStep();
        step.setName("测试步骤");
        step.setScriptId(scriptId);
        step.setOrder(1);
        // ... 设置其他字段
        return step;
    }
}
```

#### 3. 测试数据清理
- 使用 `@DirtiesContext` 标记需要清理上下文的测试
- 使用 `@Sql(scripts = "cleanup.sql", executionPhase = AFTER_TEST_METHOD)` 清理数据
- 在 `@AfterEach` 方法中手动清理

## 测试用例设计模式

### 1. Given-When-Then 模式

```java
@Test
void testExecutePipeline_WithValidPipeline_ShouldCreateExecution() {
    // Given: 准备测试数据
    DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipeline();
    pipeline = pipelineRepository.save(pipeline);
    
    // When: 执行被测试的方法
    PipelineExecutionResponse response = pipelineService.executePipeline(
        pipeline.getId(), 
        Collections.emptyMap(), 
        admin
    );
    
    // Then: 验证结果
    assertThat(response).isNotNull();
    assertThat(response.getExecutionId()).isNotNull();
    assertThat(response.getStatus()).isEqualTo("RUNNING");
}
```

### 2. 参数化测试

```java
@ParameterizedTest
@ValueSource(strings = {"test", "dev", "prod"})
void testGetPipelines_ByEnvironment_ShouldReturnFilteredResults(String environment) {
    // 测试不同环境的过滤
}
```

### 3. 异常测试

```java
@Test
void testExecutePipeline_WithNonExistentPipeline_ShouldThrowException() {
    // Given: 不存在的流程 ID
    Long nonExistentId = 99999L;
    
    // When & Then: 验证抛出异常
    assertThatThrownBy(() -> 
        pipelineService.executePipeline(nonExistentId, Collections.emptyMap(), admin)
    ).isInstanceOf(EntityNotFoundException.class)
     .hasMessageContaining("流程不存在");
}
```

## API 测试设计

### 1. Controller 层测试

使用 `@WebMvcTest` 进行 Controller 层测试：

```java
@WebMvcTest(DeploymentPipelineController.class)
class DeploymentPipelineControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private DeploymentPipelineService pipelineService;
    
    @Test
    void testGetAllPipelines_ShouldReturn200() throws Exception {
        // Given
        when(pipelineService.getAllPipelines()).thenReturn(Collections.emptyList());
        
        // When & Then
        mockMvc.perform(get("/api/admin/devops/pipelines")
                .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
```

### 2. 集成测试

使用 `@SpringBootTest` 进行集成测试：

```java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class DeploymentPipelineIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private DeploymentPipelineRepository pipelineRepository;
    
    @Test
    void testCreateAndExecutePipeline_EndToEnd() throws Exception {
        // 创建流程
        // 执行流程
        // 验证执行结果
    }
}
```

## 流程执行测试设计

### 1. 步骤执行测试

测试各种步骤类型的执行：

```java
@Test
void testExecuteStep_CodeScan_ShouldParseResults() {
    // 测试代码扫描步骤
}

@Test
void testExecuteStep_Build_ShouldCompileProject() {
    // 测试构建步骤
}

@Test
void testExecuteStep_Deploy_ShouldDeployApplication() {
    // 测试部署步骤
}
```

### 2. 错误处理测试

```java
@Test
void testExecuteStep_WithScriptFailure_ShouldMarkStepAsFailed() {
    // 测试脚本执行失败时的处理
}

@Test
void testExecuteStep_RequiredStepFailure_ShouldStopPipeline() {
    // 测试必需步骤失败时的流程终止
}
```

### 3. 并发执行测试

```java
@Test
void testConcurrentExecution_ShouldHandleCorrectly() throws InterruptedException {
    // 测试并发执行
    ExecutorService executor = Executors.newFixedThreadPool(5);
    List<Future<PipelineExecutionResponse>> futures = new ArrayList<>();
    
    for (int i = 0; i < 5; i++) {
        futures.add(executor.submit(() -> 
            pipelineService.executePipeline(pipelineId, params, admin)
        ));
    }
    
    // 验证所有执行都成功
    for (Future<PipelineExecutionResponse> future : futures) {
        assertThat(future.get()).isNotNull();
    }
}
```

## SSE 流式传输测试

### 1. SSE 连接测试

```java
@Test
void testSseStream_ShouldReceiveStatusUpdates() throws Exception {
    // 建立 SSE 连接
    // 执行流程
    // 验证接收到状态更新事件
}
```

### 2. SSE 事件验证

```java
@Test
void testSseStream_ShouldReceiveStepStatusUpdates() throws Exception {
    // 验证接收到步骤状态更新
    // 验证事件格式正确
}
```

## 测试覆盖率目标

- **Controller 层**: 100% 方法覆盖
- **Service 层**: > 90% 代码覆盖
- **Repository 层**: > 80% 代码覆盖
- **整体覆盖率**: > 80%

## 测试执行策略

### 1. 本地开发
- 快速反馈：运行单元测试和关键集成测试
- 完整验证：运行所有测试

### 2. CI/CD 流水线
- 提交时：运行快速测试套件
- 合并前：运行完整测试套件
- 发布前：运行端到端测试

### 3. 测试隔离
- 每个测试独立运行，不依赖其他测试
- 使用事务回滚确保数据隔离
- 使用独立的测试数据

## 性能测试考虑

### 1. 测试执行时间
- 单元测试：< 1 秒/测试
- 集成测试：< 5 秒/测试
- 端到端测试：< 30 秒/测试

### 2. 测试数据量
- 小数据集：快速测试
- 大数据集：压力测试（可选）

## 持续改进

### 1. 测试维护
- 定期审查测试用例
- 更新测试数据
- 优化慢速测试

### 2. 测试文档
- 维护测试用例文档
- 记录测试执行指南
- 更新问题排查文档
