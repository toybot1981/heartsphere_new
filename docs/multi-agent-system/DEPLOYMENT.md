# 多智能体框架部署指南

## 概述

本文档说明如何部署和运行多智能体框架。

## 前置要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0+（用于数据持久化）
- Spring Boot 3.2.0+

## 构建项目

### 1. 编译项目

```bash
cd main/backend
mvn clean compile
```

### 2. 运行测试

```bash
# 运行所有测试
mvn test

# 运行多智能体框架测试
mvn test -Dtest=com.heartsphere.multiagent.*,com.heartsphere.character.multiagent.*

# 生成测试覆盖率报告
mvn test jacoco:report
```

### 3. 打包项目

```bash
# 打包为 JAR
mvn clean package

# 跳过测试打包
mvn clean package -DskipTests
```

## 运行应用

### 开发环境

```bash
cd main/backend
mvn spring-boot:run
```

### 生产环境

```bash
# 使用打包的 JAR
java -jar target/heartsphere-service-0.0.1-SNAPSHOT.jar

# 指定配置文件
java -jar target/heartsphere-service-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## 配置

### 数据库配置

在 `application.yml` 或 `application.properties` 中配置数据库连接：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/heartsphere
    username: your_username
    password: your_password
```

### 多智能体配置

多智能体框架的配置位于 `application.yml`：

```yaml
multiagent:
  collaboration:
    timeout: 30000  # 协作超时时间（毫秒）
    max-agents: 10  # 最大智能体数量
```

## 验证部署

### 1. 检查应用状态

```bash
# 健康检查
curl http://localhost:8080/actuator/health
```

### 2. 检查多智能体功能

```bash
# 查看注册的智能体
curl http://localhost:8080/api/admin/multi-agent/agents
```

### 3. 查看日志

```bash
# 查看应用日志
tail -f logs/application.log
```

## 监控

### 应用监控

- Spring Boot Actuator 端点：`/actuator`
- 健康检查：`/actuator/health`
- 指标：`/actuator/metrics`

### 多智能体监控

- 智能体列表：`/api/admin/multi-agent/agents`
- 协作日志：`/api/admin/multi-agent/collaborations`
- 统计信息：`/api/admin/multi-agent/collaborations/statistics`

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库服务是否运行
   - 验证数据库配置是否正确
   - 检查网络连接

2. **智能体未注册**
   - 检查智能体是否正确实现
   - 验证 AgentRegistry 是否正常工作
   - 查看应用日志

3. **协作失败**
   - 检查智能体状态
   - 验证协作上下文配置
   - 查看错误日志

## 性能优化

参考 [PERFORMANCE.md](./PERFORMANCE.md) 了解性能优化建议。

## 安全考虑

1. **API 安全**
   - 使用 Spring Security 保护 API
   - 配置适当的权限控制

2. **数据安全**
   - 使用加密连接（HTTPS）
   - 保护敏感配置信息

## 参考

- [快速开始指南](./QUICKSTART.md)
- [性能优化指南](./PERFORMANCE.md)
- [最佳实践](./BEST_PRACTICES.md)
