# Change: 将 Firecracker Platform 从 Go 迁移到 Java

## Why

当前 Firecracker Platform 项目使用 Go 语言实现，但存在以下问题：
1. **技术栈不一致**：项目其他 backend 服务均使用 Java + Spring Boot，Go 项目增加了技术栈复杂度
2. **维护成本高**：需要维护两套技术栈（Go 和 Java），增加开发和运维成本
3. **集成困难**：Go 服务与现有 Java 服务集成需要额外的适配层
4. **团队熟悉度**：团队更熟悉 Java/Spring Boot 技术栈，Go 项目学习成本高
5. **依赖管理问题**：Go 模块依赖管理在 Docker 构建中遇到网络问题，影响部署效率

通过迁移到 Java + Spring Boot，可以：
- 统一技术栈，降低维护成本
- 复用现有的共享模块（heartsphere-shared-backend）
- 与现有服务无缝集成
- 利用团队熟悉的 Spring Boot 生态
- 简化部署流程，使用统一的 Maven 构建

## What Changes

### 核心能力迁移

1. **项目结构重构** (`project-restructure`)
   - 创建新的 Java Maven 项目结构
   - 参照 `mentis/backend` 的项目结构
   - 使用 Spring Boot 3.2.0 + Java 17
   - 集成共享 backend 模块

2. **API 层迁移** (`api-layer-migration`)
   - 将 Go 的 Gin 路由迁移到 Spring Boot REST Controller
   - 实现相同的 RESTful API 接口
   - 保持 API 兼容性

3. **服务层迁移** (`service-layer-migration`)
   - Sandbox Service：沙箱生命周期管理
   - Network Service：网络管理（TAP 设备）
   - Image Service：镜像管理
   - VNC Service：VNC 远程桌面
   - SSH Service：SSH 命令执行
   - Firecracker Client：Firecracker API 客户端

4. **数据层迁移** (`data-layer-migration`)
   - 使用 Spring Data JPA 替代 GORM
   - 使用 Flyway 进行数据库迁移
   - 实体类迁移到 JPA Entity

5. **配置管理** (`config-migration`)
   - 使用 Spring Boot 的 `application.yml` 配置
   - 支持多环境配置（dev, prod）
   - 配置验证和默认值

6. **部署和构建** (`deployment-migration`)
   - 使用 Maven 构建替代 Go 构建
   - 更新 Dockerfile 使用 Java 基础镜像
   - 更新 docker-compose 配置

### 技术选型

- **框架**: Spring Boot 3.2.0
- **语言**: Java 17
- **构建工具**: Maven 3.9+
- **ORM**: Spring Data JPA + Hibernate
- **数据库**: MySQL 8.0+（与现有服务一致）
- **数据库迁移**: Flyway
- **HTTP 客户端**: Spring WebClient（用于 Firecracker API 调用）
- **SSH 客户端**: JSch 或 Apache MINA SSHD
- **VNC 客户端**: 使用 Java VNC 库或通过系统命令调用

## Impact

### 正面影响
- ✅ 技术栈统一，降低维护成本
- ✅ 与现有服务无缝集成
- ✅ 复用共享模块和工具类
- ✅ 团队熟悉度高，开发效率提升
- ✅ 构建和部署流程简化

### 负面影响
- ⚠️ 需要重写所有代码（但可以复用业务逻辑）
- ⚠️ 需要重新测试所有功能
- ⚠️ 迁移期间需要维护两套代码

### 风险评估
- **低风险**：技术栈成熟，团队熟悉
- **中风险**：需要确保 API 兼容性
- **缓解措施**：分阶段迁移，保持 API 接口不变

## Dependencies

- 依赖现有的 `heartsphere-shared-backend` 模块
- 需要 Firecracker 二进制文件（保持不变）
- 需要 Linux 环境支持 KVM（保持不变）

## Success Criteria

1. ✅ 所有 API 接口功能与 Go 版本一致
2. ✅ 能够成功创建和管理 Firecracker microVM
3. ✅ 支持 SSH 命令执行和文件操作
4. ✅ 支持 VNC 远程桌面连接
5. ✅ 数据库迁移和持久化正常
6. ✅ Docker 部署成功
7. ✅ 性能指标与 Go 版本相当或更好
