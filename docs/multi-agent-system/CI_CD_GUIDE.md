# CI/CD 集成指南

## 概述

本文档说明如何将多智能体框架的测试集成到 CI/CD 流程中。

## GitHub Actions 配置

### 工作流文件

已创建 `.github/workflows/multi-agent-tests.yml`，包含以下功能：

1. **触发条件**
   - Push 到 main/develop 分支
   - Pull Request 到 main/develop 分支
   - 仅当多智能体相关文件变更时触发

2. **执行步骤**
   - 设置 JDK 17
   - 运行多智能体框架测试
   - 生成测试报告
   - 上传测试报告作为 Artifact

### 使用方式

1. **自动触发**
   - 当推送代码到 main/develop 分支时自动运行
   - 当创建 Pull Request 时自动运行

2. **手动触发**
   ```bash
   # 在 GitHub Actions 页面点击 "Run workflow"
   ```

3. **查看结果**
   - 在 GitHub Actions 页面查看运行结果
   - 下载测试报告 Artifact

## 测试覆盖率配置

### JaCoCo 配置

在 `pom.xml` 中添加 JaCoCo 插件配置（参考 `pom.xml.jacoco`）：

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <!-- 配置见 pom.xml.jacoco -->
</plugin>
```

### 生成覆盖率报告

```bash
# 运行测试并生成覆盖率报告
mvn clean test jacoco:report

# 查看报告
open target/site/jacoco/index.html
```

### 覆盖率检查

```bash
# 运行覆盖率检查（要求 >80%）
mvn clean test jacoco:check
```

## 本地测试

### 运行所有多智能体测试

```bash
cd main/backend
mvn test -Dtest=com.heartsphere.multiagent.*,com.heartsphere.character.multiagent.*
```

### 运行特定测试

```bash
# 运行单元测试
mvn test -Dtest=AgentRegistryImplTest

# 运行集成测试
mvn test -Dtest=MultiAgentCollaborationIntegrationTest

# 运行性能测试
mvn test -Dtest=CollaborationPerformanceTest
```

## 测试报告

### Surefire 报告

```bash
# 生成 Surefire 报告
mvn surefire-report:report

# 查看报告
open target/site/surefire-report.html
```

### JaCoCo 覆盖率报告

```bash
# 生成 JaCoCo 报告
mvn jacoco:report

# 查看报告
open target/site/jacoco/index.html
```

## 最佳实践

### 1. 提交前检查

```bash
# 运行所有测试
mvn test

# 检查覆盖率
mvn jacoco:check

# 生成报告
mvn surefire-report:report jacoco:report
```

### 2. CI/CD 集成

- 确保所有测试通过
- 覆盖率 >80%
- 无编译错误
- 无 linter 错误

### 3. 持续监控

- 定期查看 CI/CD 运行结果
- 监控测试覆盖率趋势
- 及时修复失败的测试

## 故障排除

### 测试失败

1. 检查测试日志
2. 查看测试报告
3. 本地复现问题
4. 修复并重新提交

### 覆盖率不足

1. 查看覆盖率报告
2. 识别未覆盖的代码
3. 添加测试用例
4. 重新运行检查

## 参考

- [JaCoCo 文档](https://www.jacoco.org/jacoco/trunk/doc/)
- [Maven Surefire 插件](https://maven.apache.org/surefire/maven-surefire-plugin/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
