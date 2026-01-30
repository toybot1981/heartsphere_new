# 部署流程测试指南

## 概述

本文档描述了部署流程 API 的测试实施情况和使用指南。

## 测试结构

### 测试基础设施

1. **PipelineTestDataBuilder** (`util/PipelineTestDataBuilder.java`)
   - 提供快速创建测试数据的方法
   - 支持创建测试管理员、流程模板、步骤、执行记录等

2. **TestAuthHelper** (`util/TestAuthHelper.java`)
   - 提供生成测试认证 Token 的方法
   - 简化测试中的认证流程

3. **application-test.yml** (`resources/application-test.yml`)
   - 测试环境配置
   - 使用 H2 内存数据库
   - 配置了测试日志级别

### 测试类

1. **DeploymentPipelineControllerTest** (`controller/DeploymentPipelineControllerTest.java`)
   - 集成测试类
   - 包含 25+ 个测试用例
   - 覆盖主要 API 端点

2. **DeploymentPipelineE2ETest** (`controller/DeploymentPipelineE2ETest.java`)
   - 端到端测试类
   - 包含完整流程执行生命周期测试
   - 包含并发执行测试

## 测试用例覆盖

### 流程模板管理 API (9 个测试用例)

- ✅ 获取所有流程模板列表
- ✅ 按环境过滤流程模板
- ✅ 按项目过滤流程模板
- ✅ 组合过滤（环境和项目）
- ✅ 获取流程模板详情（存在/不存在）
- ✅ 创建流程模板（基本/带步骤）
- ✅ 更新流程模板
- ✅ 删除流程模板
- ✅ 获取项目列表

### 流程执行 API (6 个测试用例)

- ✅ 执行流程（有效/不存在）
- ✅ 获取执行状态（存在/不存在）
- ✅ 获取执行详情
- ✅ 取消执行（运行中/不存在）
- ✅ 获取执行列表（分页/过滤）

### 日志下载 API (3 个测试用例)

- ✅ 下载有步骤执行的日志
- ✅ 下载无步骤执行的日志
- ✅ 下载不存在的执行日志（404）

### 认证测试 (2 个测试用例)

- ✅ 不带认证头（401）
- ✅ 无效 Token（401）

### 端到端测试 (3 个测试用例)

- ✅ 完整流程执行生命周期
- ✅ 并发执行多个流程
- ✅ 执行无步骤的流程

## 运行测试

### 运行所有测试

```bash
cd admin/backend
mvn test -Dtest=DeploymentPipeline*Test
```

### 运行特定测试类

```bash
# 运行集成测试
mvn test -Dtest=DeploymentPipelineControllerTest

# 运行端到端测试
mvn test -Dtest=DeploymentPipelineE2ETest
```

### 运行特定测试方法

```bash
# 运行单个测试方法
mvn test -Dtest=DeploymentPipelineControllerTest#testGetAllPipelines_ShouldReturn200
```

## 已知问题和修复

### 1. SQL 保留关键字问题

**问题**: `PipelineStep` 实体中的 `order` 和 `condition` 字段是 MySQL 保留关键字。

**修复**: 在 `@Column` 注解中使用反引号转义：
```java
@Column(name = "`order`", nullable = false)
private Integer order;

@Column(name = "`condition`", length = 200)
private String condition;
```

### 2. 测试数据清理顺序问题

**问题**: 外键约束导致删除失败。

**修复**: 按正确顺序清理数据：
1. 步骤执行记录 (`stepExecutionRepository.deleteAll()`)
2. 脚本执行记录 (`scriptExecutionRepository.deleteAll()`)
3. 流程执行记录 (`executionRepository.deleteAll()`)
4. 步骤 (`stepRepository.deleteAll()`)
5. 流程 (`pipelineRepository.deleteAll()`)
6. 管理员 (`adminRepository.deleteAll()`)

## 测试覆盖率目标

- Controller 层: 100% 方法覆盖
- Service 层: > 90% 代码覆盖
- Repository 层: > 80% 代码覆盖
- 整体覆盖率: > 80%

## 待完成的测试

### SSE 流式传输测试

SSE (Server-Sent Events) 测试需要特殊的方法，因为 `MockMvc` 对 SSE 的支持有限。建议使用以下方法之一：

1. **使用 WebTestClient** (推荐)
   ```java
   @Autowired
   private WebTestClient webTestClient;
   
   @Test
   void testSseStream() {
       webTestClient.get()
           .uri("/api/admin/devops/pipelines/executions/{executionId}/stream", executionId)
           .header("Authorization", authToken)
           .exchange()
           .expectStatus().isOk()
           .expectHeader().contentType(MediaType.TEXT_EVENT_STREAM)
           .returnResult(String.class)
           .getResponseBody()
           .take(1)
           .blockFirst();
   }
   ```

2. **使用手动 SSE 客户端**
   - 使用 `EventSource` 或类似的 SSE 客户端库
   - 在测试中建立真实的 SSE 连接

### 更多边界情况测试

- 测试大量数据的分页
- 测试并发更新冲突
- 测试网络超时场景
- 测试数据库连接失败场景

## 测试最佳实践

1. **使用 @Transactional 和 @Rollback**
   - 确保每个测试独立运行
   - 测试结束后自动回滚数据

2. **使用测试数据构建器**
   - 使用 `PipelineTestDataBuilder` 创建测试数据
   - 保持测试代码简洁

3. **清理测试数据**
   - 在 `@BeforeEach` 中清理数据
   - 按正确顺序清理（先子表后父表）

4. **验证响应**
   - 验证 HTTP 状态码
   - 验证响应体结构
   - 验证数据库状态

## 故障排查

### 测试失败：外键约束错误

**原因**: 数据清理顺序不正确。

**解决**: 确保按正确顺序清理数据（见"已知问题和修复"部分）。

### 测试失败：认证失败

**原因**: Token 生成或验证问题。

**解决**: 
1. 确保测试管理员已正确创建
2. 确保 Token 使用正确的格式（`Bearer <token>`）
3. 检查 `JwtUtils` 配置

### 测试失败：SQL 语法错误

**原因**: 使用了 MySQL 保留关键字。

**解决**: 在实体类中使用反引号转义保留关键字。

## 贡献指南

添加新测试时，请遵循以下规范：

1. 使用 `PipelineTestDataBuilder` 创建测试数据
2. 使用 Given-When-Then 模式组织测试代码
3. 为测试方法使用描述性名称
4. 添加必要的注释说明测试意图
5. 确保测试独立运行，不依赖其他测试

## 参考资源

- [Spring Boot Test Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [MockMvc Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/testing.html#spring-mvc-test-framework)
