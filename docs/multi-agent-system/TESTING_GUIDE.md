# 多智能体框架测试指南

## 概述

本文档提供多智能体框架的测试指南，包括测试策略、测试用例编写和测试执行方法。

## 测试层次

### 1. 单元测试

单元测试针对单个组件进行测试，使用 Mock 对象隔离依赖。

**测试范围**：
- AgentRegistry：注册、查找、能力索引
- BaseAgent：执行、上下文传递、状态管理
- CollaborationOrchestrator：创建、执行、状态管理
- TaskDecompositionService：任务分解、依赖管理
- LoadBalancer：负载均衡、智能体选择
- ResultQualityAssessor：质量评估、优化建议

**运行单元测试**：
```bash
mvn test -Dtest=AgentRegistryImplTest
mvn test -Dtest=BaseAgentTest
mvn test -Dtest=CollaborationOrchestratorImplTest
```

### 2. 集成测试

集成测试验证多个组件协同工作的完整流程。

**测试范围**：
- 单智能体协作流程
- 多智能体顺序协作
- 多智能体并行协作
- 上下文传递
- 协作失败和恢复

**运行集成测试**：
```bash
mvn test -Dtest=MultiAgentCollaborationIntegrationTest
```

### 3. 性能测试

性能测试评估系统性能和资源消耗。

**测试指标**：
- 协作延迟
- 吞吐量
- 资源消耗（CPU、内存）
- 并发能力

### 4. 端到端测试

端到端测试验证真实场景下的完整用户流程。

## 测试工具

### Mockito

用于创建 Mock 对象：

```java
@Mock
private Agent mockAgent;

@BeforeEach
void setUp() {
    MockitoAnnotations.openMocks(this);
    when(mockAgent.getId()).thenReturn("agent-1");
    when(mockAgent.execute(anyString(), anyMap()))
        .thenReturn(AgentResult.success("Result"));
}
```

### JUnit 5

测试框架：

```java
@Test
@DisplayName("测试描述")
void testMethod() {
    // 测试代码
    assertTrue(condition);
    assertEquals(expected, actual);
}
```

## 测试最佳实践

### 1. 测试命名

使用清晰的测试方法名和 `@DisplayName` 注解：

```java
@Test
@DisplayName("测试智能体注册")
void testRegisterAgent() {
    // ...
}
```

### 2. 测试隔离

每个测试应该独立，不依赖其他测试的执行顺序：

```java
@BeforeEach
void setUp() {
    // 每个测试前重置状态
    registry = new AgentRegistryImpl();
}
```

### 3. 测试覆盖

确保覆盖以下场景：
- 正常流程
- 边界条件
- 错误处理
- 异常情况

### 4. 断言清晰

使用清晰的断言消息：

```java
assertTrue(result.isSuccess(), "协作应该成功");
assertEquals(2, result.getAgentResults().size(), 
    "应该有2个智能体结果");
```

## 运行所有测试

```bash
# 运行所有测试
mvn test

# 运行特定包的测试
mvn test -Dtest=com.heartsphere.multiagent.*

# 运行特定测试类
mvn test -Dtest=AgentRegistryImplTest

# 生成测试报告
mvn surefire-report:report
```

## 测试覆盖率

使用 JaCoCo 生成测试覆盖率报告：

```bash
mvn clean test jacoco:report
```

查看报告：`target/site/jacoco/index.html`

## 持续集成

测试应该集成到 CI/CD 流程中：

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: mvn test

- name: Generate coverage report
  run: mvn jacoco:report
```

## 常见问题

### Q: 测试执行时间过长？

A: 使用 Mock 对象替代真实服务，减少外部依赖。

### Q: 测试不稳定？

A: 确保测试隔离，避免共享状态，使用 `@BeforeEach` 重置状态。

### Q: 如何测试异步代码？

A: 使用 `CompletableFuture.get(timeout, TimeUnit)` 等待结果。

## 总结

遵循这些测试指南可以确保多智能体框架的质量和稳定性。记住：

1. **测试覆盖全面**：覆盖正常流程、边界条件和错误情况
2. **测试独立**：每个测试应该独立，不依赖其他测试
3. **测试快速**：使用 Mock 对象，减少外部依赖
4. **测试清晰**：使用清晰的命名和断言消息
