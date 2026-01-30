# Tasks: 将 Firecracker Platform 从 Go 迁移到 Java

## Phase 1: 项目初始化和结构搭建

- [x] 1.1 创建新的 Java Maven 项目结构
  - [x] 1.1.1 创建 `firecracker-platform/backend` 目录
  - [x] 1.1.2 创建 `pom.xml`，参照 `mentis/backend/pom.xml`
  - [x] 1.1.3 配置 Spring Boot 3.2.0 + Java 17
  - [x] 1.1.4 添加依赖：Spring Web, Spring Data JPA, MySQL Driver, Flyway
  - [x] 1.1.5 添加共享 backend 模块依赖
  - [x] 1.1.6 创建标准的包结构（controller, service, repository, entity, dto, config）

- [x] 1.2 创建主应用类
  - [x] 1.2.1 创建 `FirecrackerPlatformApplication.java`
  - [x] 1.2.2 配置 Spring Boot 注解和扫描路径
  - [x] 1.2.3 配置 JPA 和 Flyway

- [x] 1.3 配置文件迁移
  - [x] 1.3.1 创建 `application.yml`，迁移 Go 配置
  - [x] 1.3.2 创建 `application-dev.yml` 和 `application-prod.yml`
  - [x] 1.3.3 配置数据库连接
  - [x] 1.3.4 配置 Firecracker 相关参数

## Phase 2: 数据层迁移

- [x] 2.1 实体类迁移
  - [x] 2.1.1 创建 `Sandbox` Entity，迁移 Go 的 Sandbox 模型
  - [x] 2.1.2 创建 `ResourceConfig` 嵌入类
  - [x] 2.1.3 创建 `NetworkConfig` 嵌入类
  - [x] 2.1.4 创建 `VNCConfig` 嵌入类
  - [x] 2.1.5 配置 JPA 注解和 JSON 序列化

- [x] 2.2 Repository 层
  - [x] 2.2.1 创建 `SandboxRepository` 接口
  - [x] 2.2.2 实现自定义查询方法

- [x] 2.3 数据库迁移
  - [x] 2.3.1 创建 Flyway 迁移脚本 `V1__create_sandboxes_table.sql`
  - [x] 2.3.2 定义表结构和索引
  - [ ] 2.3.3 测试数据库迁移

## Phase 3: Firecracker 客户端迁移

- [x] 3.1 Firecracker HTTP 客户端
  - [x] 3.1.1 创建 `FirecrackerClient` 类
  - [x] 3.1.2 实现 Unix Socket HTTP 客户端（使用 Java NIO）
  - [x] 3.1.3 实现 VM 创建、启动、停止、删除方法
  - [x] 3.1.4 实现配置方法（BootSource, Drive, Network, Machine）
  - [x] 3.1.5 实现状态查询方法

- [x] 3.2 数据模型迁移
  - [x] 3.2.1 创建 Firecracker 配置 DTO 类
  - [x] 3.2.2 实现 JSON 序列化/反序列化

## Phase 4: 服务层迁移

- [x] 4.1 Sandbox Service
  - [x] 4.1.1 创建 `SandboxService` 接口和实现
  - [x] 4.1.2 实现创建沙箱逻辑
  - [x] 4.1.3 实现查询、删除、启动、停止逻辑
  - [x] 4.1.4 集成 Firecracker Client
  - [x] 4.1.5 集成 Network Service 和 Image Service

- [x] 4.2 Network Service
  - [x] 4.2.1 创建 `NetworkService` 接口和实现
  - [x] 4.2.2 实现 TAP 设备创建/删除（使用系统命令）
  - [x] 4.2.3 实现 IP 配置

- [x] 4.3 Image Service
  - [x] 4.3.1 创建 `ImageService` 接口和实现
  - [x] 4.3.2 实现镜像路径管理
  - [x] 4.3.3 实现镜像存在性检查

- [x] 4.4 VNC Service
  - [x] 4.4.1 创建 `VNCService` 接口和实现
  - [x] 4.4.2 实现 VNC 密码生成
  - [x] 4.4.3 实现 VNC 连接信息获取
  - [x] 4.4.4 实现截图功能（使用系统命令或 Java 库）

- [x] 4.5 SSH Service
  - [x] 4.5.1 创建 `SSHService` 接口和实现
  - [x] 4.5.2 实现 SSH 连接管理（使用 JSch）
  - [x] 4.5.3 实现命令执行
  - [x] 4.5.4 实现文件读写操作

## Phase 5: API 层迁移

- [x] 5.1 Controller 层
  - [x] 5.1.1 创建 `SandboxController`，迁移 Go 的 sandbox_handler
  - [x] 5.1.2 创建 `CommandController`，迁移 Go 的 command_handler
  - [x] 5.1.3 创建 `FileController`，迁移 Go 的 file_handler
  - [x] 5.1.4 创建 `VNCController`，迁移 Go 的 vnc_handler
  - [x] 5.1.5 实现健康检查端点

- [x] 5.2 DTO 类
  - [x] 5.2.1 创建请求/响应 DTO 类
  - [x] 5.2.2 实现验证注解

- [x] 5.3 异常处理
  - [x] 5.3.1 创建自定义异常类
  - [x] 5.3.2 实现全局异常处理器

- [x] 5.4 中间件迁移
  - [ ] 5.4.1 实现日志中间件（使用 Spring AOP 或 Filter）
  - [x] 5.4.2 实现 CORS 配置
  - [x] 5.4.3 实现错误处理中间件

## Phase 6: 配置和工具类

- [x] 6.1 配置类
  - [x] 6.1.1 创建 `FirecrackerConfig` 配置类
  - [x] 6.1.2 创建 `NetworkConfig` 配置类
  - [x] 6.1.3 创建 `ImageConfig` 配置类

- [x] 6.2 工具类
  - [x] 6.2.1 创建 ID 生成工具类
  - [x] 6.2.2 创建文件操作工具类
  - [x] 6.2.3 创建系统命令执行工具类

## Phase 7: 测试

- [x] 7.1 单元测试
  - [x] 7.1.1 为 Service 层编写单元测试
  - [x] 7.1.2 为 Controller 层编写单元测试
  - [ ] 7.1.3 为工具类编写单元测试（可选）

- [ ] 7.2 集成测试
  - [ ] 7.2.1 编写 API 集成测试（可选）
  - [ ] 7.2.2 编写数据库集成测试（可选）

## Phase 8: 部署和文档

- [x] 8.1 Docker 配置
  - [x] 8.1.1 更新 Dockerfile，使用 Java 基础镜像
  - [x] 8.1.2 更新 docker-compose.yml
  - [ ] 8.1.3 测试 Docker 构建和运行（需要实际环境）

- [x] 8.2 文档更新
  - [x] 8.2.1 更新 README.md
  - [ ] 8.2.2 更新 API 文档（Swagger 可选）
  - [x] 8.2.3 更新部署文档

- [ ] 8.3 清理
  - [ ] 8.3.1 删除 Go 代码目录（保留备份，由用户决定）
  - [x] 8.3.2 更新项目结构文档
