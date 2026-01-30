# Firecracker Platform Java Implementation Specification

## ADDED Requirements

### Requirement: Java Spring Boot Application Structure
Firecracker Platform SHALL use Java + Spring Boot implementation and follow project standard structure.

#### Scenario: Application Startup
应用启动时，应使用 Spring Boot 3.2.0 和 Java 17，项目结构应包含标准的 controller, service, repository, entity, dto, config 包，应使用 Maven 作为构建工具，pom.xml 配置正确，应集成 `heartsphere-shared-backend` 共享模块。

### Requirement: RESTful API Implementation
The system SHALL implement RESTful API interfaces identical to the Go version.

#### Scenario: Sandbox Management APIs
`POST /api/v1/sandboxes` 应能创建新的沙箱，`GET /api/v1/sandboxes/{id}` 应能获取沙箱详细信息，`DELETE /api/v1/sandboxes/{id}` 应能删除沙箱并清理资源，`POST /api/v1/sandboxes/{id}/start` 应能启动已停止的沙箱，`POST /api/v1/sandboxes/{id}/stop` 应能停止运行中的沙箱，`GET /api/v1/sandboxes/{id}/status` 应能返回沙箱当前状态。

#### Scenario: Command and File APIs
`POST /api/v1/sandboxes/{id}/commands` 应能执行命令并返回结果，`GET /api/v1/sandboxes/{id}/files/**` 应能读取文件内容，`PUT /api/v1/sandboxes/{id}/files/**` 应能写入文件内容，`DELETE /api/v1/sandboxes/{id}/files/**` 应能删除文件。

#### Scenario: VNC APIs
`GET /api/v1/sandboxes/{id}/vnc` 应能返回 VNC 连接信息，`GET /api/v1/sandboxes/{id}/vnc/screenshot` 应能返回截图。

### Requirement: Firecracker Client Implementation
The system SHALL implement Firecracker HTTP API client supporting Unix Socket communication.

#### Scenario: Unix Socket Communication
客户端应能通过 Unix Socket 与 Firecracker VMM 通信，应能创建 Firecracker microVM 配置，应能启动、停止、删除 microVM，应能配置 BootSource、Drive、Network、Machine 参数，应能查询 VM 状态和信息。

### Requirement: Database Persistence
The system SHALL use Spring Data JPA for data persistence.

#### Scenario: Entity Mapping and Migration
Sandbox 实体应能正确映射到数据库表，应使用 Flyway 进行数据库迁移，应支持 Sandbox 的创建、查询、更新、删除操作，应支持软删除（deleted_at），嵌入类（ResourceConfig, NetworkConfig, VNCConfig）应正确序列化到 JSON 字段。

### Requirement: Service Layer Implementation
The system SHALL implement core business service layer.

#### Scenario: Core Services
SandboxService 应能管理沙箱完整生命周期，NetworkService 应能创建和管理 TAP 网络设备，ImageService 应能管理镜像路径和验证镜像存在性，VNCService 应能生成 VNC 密码和连接信息，SSHService 应能通过 SSH 执行命令和文件操作。

### Requirement: Configuration Management
The system SHALL use Spring Boot configuration management.

#### Scenario: Configuration Files
应使用 `application.yml` 进行配置，应支持多环境配置（dev, prod），应支持环境变量覆盖配置，配置应包含 Firecracker、网络、镜像、VNC、SSH 相关参数。

### Requirement: Error Handling
The system SHALL implement unified exception handling mechanism.

#### Scenario: Global Exception Handler
应使用 `@ControllerAdvice` 实现全局异常处理，API 错误响应应遵循统一格式，应正确处理业务异常和系统异常，应记录异常日志。

### Requirement: Docker Deployment
The system SHALL support Docker containerized deployment.

#### Scenario: Docker Configuration
Dockerfile 应使用 Java 基础镜像，应使用 Maven 多阶段构建，docker-compose.yml 应配置正确，容器应具有必要的权限（NET_ADMIN, SYS_ADMIN），应能挂载 KVM 设备（/dev/kvm）。

## MODIFIED Requirements

### Requirement: Technology Stack Change
The system SHALL migrate from Go technology stack to Java + Spring Boot technology stack.

#### Scenario: Migration Process
所有 Go 代码应迁移到 Java，构建工具从 Go modules 改为 Maven，ORM 从 GORM 改为 Spring Data JPA，HTTP 框架从 Gin 改为 Spring MVC。

## REMOVED Requirements

- Go 语言实现代码（`api/`, `internal/`, `services/` 目录）
- Go 相关的构建文件（go.mod, go.sum, Makefile）
- Go 相关的 Dockerfile 配置
