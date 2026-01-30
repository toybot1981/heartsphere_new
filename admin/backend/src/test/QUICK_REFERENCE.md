# 部署流程测试快速参考

## 快速命令

### 运行测试

```bash
# 运行所有部署流程测试
cd admin/backend
./src/test/run-pipeline-tests.sh

# 或使用 Maven
mvn test -Dtest=DeploymentPipeline*Test
```

### 运行特定测试

```bash
# 运行集成测试
./src/test/run-pipeline-tests.sh --class DeploymentPipelineControllerTest

# 运行端到端测试
./src/test/run-pipeline-tests.sh --class DeploymentPipelineE2ETest

# 运行单个测试方法
./src/test/run-pipeline-tests.sh --class DeploymentPipelineControllerTest --method testGetAllPipelines_ShouldReturn200
```

### 生成报告

```bash
# 生成测试覆盖率报告
./src/test/run-pipeline-tests.sh --coverage

# 查看报告
open target/site/jacoco/index.html  # macOS
# 或
xdg-open target/site/jacoco/index.html  # Linux
```

## 测试用例速查

### 流程模板管理 API

| 测试方法 | 描述 | API 端点 |
|---------|------|---------|
| `testGetAllPipelines_ShouldReturn200` | 获取所有流程模板 | GET `/api/admin/devops/pipelines` |
| `testGetAllPipelines_ByEnvironment_ShouldReturnFiltered` | 按环境过滤 | GET `/api/admin/devops/pipelines?environment=test` |
| `testGetAllPipelines_ByProject_ShouldReturnFiltered` | 按项目过滤 | GET `/api/admin/devops/pipelines?project=main` |
| `testGetPipeline_WithValidId_ShouldReturn200` | 获取流程详情 | GET `/api/admin/devops/pipelines/{id}` |
| `testCreatePipeline_WithValidData_ShouldReturn200` | 创建流程 | POST `/api/admin/devops/pipelines` |
| `testUpdatePipeline_WithValidData_ShouldReturn200` | 更新流程 | PUT `/api/admin/devops/pipelines/{id}` |
| `testDeletePipeline_WithValidId_ShouldReturn200` | 删除流程 | DELETE `/api/admin/devops/pipelines/{id}` |
| `testGetProjects_ShouldReturn200` | 获取项目列表 | GET `/api/admin/devops/pipelines/projects` |

### 流程执行 API

| 测试方法 | 描述 | API 端点 |
|---------|------|---------|
| `testExecutePipeline_WithValidPipeline_ShouldReturn200` | 执行流程 | POST `/api/admin/devops/pipelines/{id}/execute` |
| `testGetExecutionStatus_WithValidExecution_ShouldReturn200` | 获取执行状态 | GET `/api/admin/devops/pipelines/executions/{id}` |
| `testGetExecutionDetail_WithValidExecution_ShouldReturn200` | 获取执行详情 | GET `/api/admin/devops/pipelines/executions/{id}/detail` |
| `testCancelExecution_WithRunningExecution_ShouldReturn200` | 取消执行 | POST `/api/admin/devops/pipelines/executions/{id}/cancel` |
| `testGetExecutionHistory_ShouldReturn200` | 获取执行列表 | GET `/api/admin/devops/pipelines/executions` |

### 日志下载 API

| 测试方法 | 描述 | API 端点 |
|---------|------|---------|
| `testDownloadLog_WithStepExecutions_ShouldReturn200` | 下载日志 | GET `/api/admin/devops/pipelines/executions/{id}/log/download` |

### 认证测试

| 测试方法 | 描述 |
|---------|------|
| `testGetAllPipelines_WithoutAuth_ShouldReturn401` | 无认证头 |
| `testGetAllPipelines_WithInvalidToken_ShouldReturn401` | 无效 Token |

## 测试数据构建器

### 创建测试数据

```java
// 创建测试管理员
SystemAdmin admin = PipelineTestDataBuilder.createTestAdmin();

// 创建测试流程
DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipeline();

// 创建指定环境的流程
DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipeline("test");

// 创建指定项目和环境的流程
DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipeline("main", "test");

// 创建包含步骤的流程
DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipelineWithSteps();

// 创建测试步骤
PipelineStep step = PipelineTestDataBuilder.createTestStep(pipeline, "步骤名", "script-id", 1);
```

## 常见问题

### 问题 1: 测试失败 - 外键约束错误

**错误信息**:
```
Cannot delete or update a parent row: a foreign key constraint fails
```

**解决方案**: 
确保按正确顺序清理数据（已在测试类中实现）：
1. 步骤执行记录
2. 脚本执行记录
3. 流程执行记录
4. 步骤
5. 流程
6. 管理员

### 问题 2: 测试失败 - SQL 语法错误

**错误信息**:
```
SQLSyntaxErrorException: You have an error in your SQL syntax near 'order'
```

**解决方案**: 
已在 `PipelineStep` 实体中使用反引号转义保留关键字，无需额外操作。

### 问题 3: 测试失败 - 认证失败

**错误信息**:
```
Status expected:<200> but was:<401>
```

**解决方案**: 
1. 确保测试管理员已正确创建
2. 确保 Token 格式正确（`Bearer <token>`）
3. 检查 `JwtUtils` 配置

## 测试最佳实践

1. **使用测试数据构建器**
   ```java
   DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipelineWithSteps();
   ```

2. **使用 Given-When-Then 模式**
   ```java
   // Given: 准备测试数据
   DeploymentPipeline pipeline = createTestPipeline();
   
   // When: 执行被测试的方法
   PipelineExecutionResponse response = executePipeline(pipeline.getId());
   
   // Then: 验证结果
   assertThat(response).isNotNull();
   ```

3. **清理测试数据**
   - 使用 `@Transactional` 确保自动回滚
   - 在 `@BeforeEach` 中按正确顺序清理数据

4. **验证响应**
   - 验证 HTTP 状态码
   - 验证响应体结构
   - 验证数据库状态

## 文件位置

- 测试用例: `src/test/java/com/heartsphere/admin/controller/`
- 测试工具: `src/test/java/com/heartsphere/admin/util/`
- 测试配置: `src/test/resources/`
- 测试脚本: `src/test/run-pipeline-tests.sh`
- 测试文档: `src/test/*.md`

## 相关文档

- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 详细测试指南
- [README.md](./README.md) - 测试目录说明
- [../openspec/changes/comprehensive-deployment-pipeline-testing/IMPLEMENTATION_SUMMARY.md](../../../openspec/changes/comprehensive-deployment-pipeline-testing/IMPLEMENTATION_SUMMARY.md) - 实施总结
- [../openspec/changes/comprehensive-deployment-pipeline-testing/COMPLETION_REPORT.md](../../../openspec/changes/comprehensive-deployment-pipeline-testing/COMPLETION_REPORT.md) - 完成报告
