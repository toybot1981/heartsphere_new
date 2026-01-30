# Design: Firecracker Platform Java 迁移架构设计

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Web/API)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Spring Boot Application                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              REST Controllers                         │  │
│  │  SandboxController │ CommandController │ FileController│  │
│  └──────────┬───────────────────────────────────────────┘  │
│             │                                                │
│             ▼                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Service Layer                            │  │
│  │  SandboxService │ NetworkService │ ImageService       │  │
│  │  VNCService │ SSHService                              │  │
│  └──────────┬───────────────────────────────────────────┘  │
│             │                                                │
│             ▼                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         FirecrackerClient (HTTP over Unix Socket)    │  │
│  └──────────┬───────────────────────────────────────────┘  │
│             │                                                │
│             ▼                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Repository Layer (Spring Data JPA)          │  │
│  └──────────┬───────────────────────────────────────────┘  │
│             │                                                │
└─────────────┼────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MySQL Database                           │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│         Firecracker VMM (via Unix Socket)                   │
│         Linux Host + KVM                                     │
└─────────────────────────────────────────────────────────────┘
```

## 技术选型

### 核心框架
- **Spring Boot 3.2.0**: 主框架
- **Java 17**: 编程语言
- **Maven**: 构建工具

### 数据层
- **Spring Data JPA**: ORM 框架
- **Hibernate**: JPA 实现
- **MySQL 8.0+**: 数据库
- **Flyway**: 数据库迁移工具

### HTTP 客户端
- **OkHttp** 或 **Spring WebClient**: 用于 Firecracker Unix Socket HTTP 通信
- 需要自定义 Transport 支持 Unix Socket

### SSH 客户端
- **JSch**: Java SSH 客户端库
- 或 **Apache MINA SSHD**: 更现代的 SSH 库

### VNC 客户端
- **系统命令调用**: 使用 `vncviewer` 或 `vncsnapshot` 命令
- 或 **Java VNC 库**: 如 `com.github.kward.go-vnc` 的 Java 版本

## 项目结构

```
firecracker-platform/
├── backend/
│   ├── pom.xml
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── heartsphere/
│   │   │   │           └── firecracker/
│   │   │   │               ├── FirecrackerPlatformApplication.java
│   │   │   │               ├── config/
│   │   │   │               │   ├── FirecrackerConfig.java
│   │   │   │               │   ├── NetworkConfig.java
│   │   │   │               │   └── SecurityConfig.java
│   │   │   │               ├── controller/
│   │   │   │               │   ├── SandboxController.java
│   │   │   │               │   ├── CommandController.java
│   │   │   │               │   ├── FileController.java
│   │   │   │               │   └── VNCController.java
│   │   │   │               ├── service/
│   │   │   │               │   ├── SandboxService.java
│   │   │   │               │   ├── NetworkService.java
│   │   │   │               │   ├── ImageService.java
│   │   │   │               │   ├── VNCService.java
│   │   │   │               │   └── SSHService.java
│   │   │   │               ├── repository/
│   │   │   │               │   └── SandboxRepository.java
│   │   │   │               ├── entity/
│   │   │   │               │   └── Sandbox.java
│   │   │   │               ├── dto/
│   │   │   │               │   ├── CreateSandboxRequest.java
│   │   │   │               │   └── SandboxResponse.java
│   │   │   │               ├── client/
│   │   │   │               │   └── FirecrackerClient.java
│   │   │   │               ├── exception/
│   │   │   │               │   └── GlobalExceptionHandler.java
│   │   │   │               └── util/
│   │   │   │                   └── UnixSocketHttpClient.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       ├── application-prod.yml
│   │   │       └── db/
│   │   │           └── migration/
│   │   │               └── V1__create_sandboxes_table.sql
│   │   └── test/
│   └── target/
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 关键设计决策

### 1. Unix Socket HTTP 客户端

**问题**: Firecracker API 通过 Unix Socket 通信，标准 HTTP 客户端不支持。

**解决方案**: 
- 使用 OkHttp 的自定义 SocketFactory 或
- 使用 Java NIO 的 UnixDomainSocketAddress（Java 16+）或
- 使用第三方库如 `jabstractsocket` 或 `junixsocket`

**推荐**: 使用 `junixsocket` 库，它提供了完整的 Unix Socket 支持。

### 2. 系统命令执行

**问题**: Network Service 需要执行系统命令（创建 TAP 设备、配置 IP）。

**解决方案**: 
- 使用 `ProcessBuilder` 或 `Runtime.exec()`
- 需要 root 权限或使用 `sudo`
- 在 Docker 容器中需要 `NET_ADMIN` 和 `SYS_ADMIN` 权限

### 3. SSH 连接管理

**问题**: 需要管理多个 SSH 连接到不同的 VM。

**解决方案**:
- 使用连接池管理 SSH 会话
- 每个沙箱维护独立的 SSH 连接
- 实现连接超时和重试机制

### 4. VNC 截图

**问题**: 需要从 VNC 服务器获取截图。

**解决方案**:
- 使用系统命令 `vncsnapshot` 或 `vnc2png`
- 或使用 Java VNC 库直接连接 VNC 服务器

### 5. 配置管理

**问题**: 需要管理 Firecracker、网络、镜像等配置。

**解决方案**:
- 使用 Spring Boot 的 `@ConfigurationProperties`
- 支持环境变量覆盖
- 配置验证和默认值

## 数据模型设计

### Sandbox Entity

```java
@Entity
@Table(name = "sandboxes")
public class Sandbox {
    @Id
    private String id;
    
    private String template;
    
    @Enumerated(EnumType.STRING)
    private SandboxStatus status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Embedded
    private ResourceConfig resources;
    
    @Embedded
    private NetworkConfig network;
    
    @Embedded
    private VNCConfig vnc;
    
    @Column(name = "socket_path")
    private String socketPath;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private Map<String, String> metadata;
}
```

### 嵌入类

```java
@Embeddable
public class ResourceConfig {
    private Integer cpu;
    private Integer memory;
    private Integer disk;
}

@Embeddable
public class NetworkConfig {
    private String tapDevice;
    private String ipAddress;
    private String gateway;
    private String subnet;
}

@Embeddable
public class VNCConfig {
    private String host;
    private Integer port;
    private String password;
}
```

## API 设计

保持与 Go 版本相同的 RESTful API：

- `POST /api/v1/sandboxes` - 创建沙箱
- `GET /api/v1/sandboxes/{id}` - 获取沙箱信息
- `DELETE /api/v1/sandboxes/{id}` - 删除沙箱
- `POST /api/v1/sandboxes/{id}/start` - 启动沙箱
- `POST /api/v1/sandboxes/{id}/stop` - 停止沙箱
- `GET /api/v1/sandboxes/{id}/status` - 获取状态
- `POST /api/v1/sandboxes/{id}/commands` - 执行命令
- `GET /api/v1/sandboxes/{id}/files/**` - 读取文件
- `PUT /api/v1/sandboxes/{id}/files/**` - 写入文件
- `DELETE /api/v1/sandboxes/{id}/files/**` - 删除文件
- `GET /api/v1/sandboxes/{id}/vnc` - 获取 VNC 信息
- `GET /api/v1/sandboxes/{id}/vnc/screenshot` - 获取截图

## 部署设计

### Dockerfile

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/ .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
RUN apk add --no-cache iproute2 iptables
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  firecracker-platform:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=postgres
    volumes:
      - /dev/kvm:/dev/kvm
      - /opt/firecracker:/opt/firecracker
    cap_add:
      - NET_ADMIN
      - SYS_ADMIN
    privileged: true
```

## 迁移策略

1. **并行开发**: 在迁移期间保持 Go 版本运行
2. **API 兼容**: 确保 Java 版本的 API 与 Go 版本完全兼容
3. **分阶段迁移**: 先迁移核心功能，再迁移辅助功能
4. **测试验证**: 每个阶段完成后进行完整测试
5. **文档更新**: 及时更新文档和部署指南

## 性能考虑

- **连接池**: 使用连接池管理 SSH 和 HTTP 连接
- **异步处理**: 对于耗时操作使用 `@Async`
- **缓存**: 对镜像路径等静态信息使用缓存
- **事务管理**: 合理使用 `@Transactional` 避免长事务

## 安全考虑

- **权限控制**: 使用 Spring Security 进行 API 认证
- **输入验证**: 使用 Bean Validation 验证输入
- **SQL 注入防护**: 使用 JPA 参数化查询
- **命令注入防护**: 对系统命令参数进行严格验证和转义
