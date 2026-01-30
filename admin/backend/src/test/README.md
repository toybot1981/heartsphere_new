# 部署流程测试

本目录包含部署流程 API 的测试用例和相关文档。

## 快速开始

### 运行所有测试

```bash
# 使用 Maven
cd admin/backend
mvn test -Dtest=DeploymentPipeline*Test

# 或使用测试脚本
./src/test/run-pipeline-tests.sh
```

### 运行特定测试类

```bash
# 运行集成测试
mvn test -Dtest=DeploymentPipelineControllerTest

# 或使用脚本
./src/test/run-pipeline-tests.sh --class DeploymentPipelineControllerTest
```

### 运行特定测试方法

```bash
# 运行单个测试方法
mvn test -Dtest=DeploymentPipelineControllerTest#testGetAllPipelines_ShouldReturn200

# 或使用脚本
./src/test/run-pipeline-tests.sh --class DeploymentPipelineControllerTest --method testGetAllPipelines_ShouldReturn200
```

## 测试结构

```
src/test/
├── java/com/heartsphere/admin/
│   ├── controller/
│   │   ├── DeploymentPipelineControllerTest.java  # 集成测试
│   │   └── DeploymentPipelineE2ETest.java         # 端到端测试
│   └── util/
│       ├── PipelineTestDataBuilder.java           # 测试数据构建器
│       └── TestAuthHelper.java                    # 测试认证辅助类
├── resources/
│   └── application-test.yml                       # 测试环境配置
├── run-pipeline-tests.sh                          # 测试运行脚本
├── TESTING_GUIDE.md                               # 测试指南
└── README.md                                      # 本文件
```

## 测试用例统计

- **总测试用例数**: 28+ 个
- **测试代码行数**: 1000+ 行

### 分类统计

- 流程模板管理: 9 个测试用例
- 流程执行: 6 个测试用例
- 日志下载: 3 个测试用例
- 认证测试: 2 个测试用例
- 端到端测试: 3 个测试用例
- 其他: 5+ 个测试用例

## API 端点覆盖

### 已测试的端点 (12 个)

- ✅ GET  /api/admin/devops/pipelines
- ✅ GET  /api/admin/devops/pipelines/projects
- ✅ GET  /api/admin/devops/pipelines/{pipelineId}
- ✅ POST /api/admin/devops/pipelines
- ✅ PUT  /api/admin/devops/pipelines/{pipelineId}
- ✅ DELETE /api/admin/devops/pipelines/{pipelineId}
- ✅ POST /api/admin/devops/pipelines/{pipelineId}/execute
- ✅ GET  /api/admin/devops/pipelines/executions/{executionId}
- ✅ GET  /api/admin/devops/pipelines/executions/{executionId}/detail
- ✅ POST /api/admin/devops/pipelines/executions/{executionId}/cancel
- ✅ GET  /api/admin/devops/pipelines/executions
- ✅ GET  /api/admin/devops/pipelines/executions/{executionId}/log/download

### 待测试的端点 (1 个)

- ⏳ GET  /api/admin/devops/pipelines/executions/{executionId}/stream (SSE)

## 测试工具

### PipelineTestDataBuilder

测试数据构建器，提供快速创建测试数据的方法：

```java
// 创建测试管理员
SystemAdmin admin = PipelineTestDataBuilder.createTestAdmin();

// 创建测试流程
DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipeline();

// 创建包含步骤的测试流程
DeploymentPipeline pipeline = PipelineTestDataBuilder.createTestPipelineWithSteps();
```

### TestAuthHelper

测试认证辅助类，用于生成测试 Token：

```java
@Autowired
private TestAuthHelper testAuthHelper;

String token = testAuthHelper.generateTokenForAdmin(admin);
String authHeader = testAuthHelper.getAuthHeader(token);
```

## 测试脚本

### run-pipeline-tests.sh

测试运行脚本，提供便捷的测试执行方式：

```bash
# 运行所有测试
./src/test/run-pipeline-tests.sh

# 运行指定测试类
./src/test/run-pipeline-tests.sh --class DeploymentPipelineControllerTest

# 运行指定测试方法
./src/test/run-pipeline-tests.sh --class DeploymentPipelineControllerTest --method testGetAllPipelines_ShouldReturn200

# 生成覆盖率报告
./src/test/run-pipeline-tests.sh --coverage

# 显示详细输出
./src/test/run-pipeline-tests.sh --verbose
```

## 故障排查

### 常见问题

1. **外键约束错误**
   - 原因: 数据清理顺序不正确
   - 解决: 确保按正确顺序清理数据（先子表后父表）

2. **SQL 语法错误**
   - 原因: 使用了 MySQL 保留关键字
   - 解决: 已在实体类中使用反引号转义

3. **认证失败**
   - 原因: Token 生成或验证问题
   - 解决: 确保测试管理员已正确创建，Token 格式正确

更多故障排查信息，请参考 [TESTING_GUIDE.md](./TESTING_GUIDE.md)。

## 文档

- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 详细的测试指南
- [../openspec/changes/comprehensive-deployment-pipeline-testing/IMPLEMENTATION_SUMMARY.md](../../../openspec/changes/comprehensive-deployment-pipeline-testing/IMPLEMENTATION_SUMMARY.md) - 实施总结

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
