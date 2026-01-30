# Design: 基于 Firecracker 构建 E2B 风格平台

## Context

E2B 是一个成功的云平台，提供基于 Firecracker 的沙箱服务。我们的目标是在 Firecracker 源码基础上，构建一个功能类似 E2B 的自主可控平台。

参考 [Firecracker GitHub 仓库](https://github.com/firecracker-microvm/firecracker)，Firecracker 是一个用 Rust 编写的轻量级 VMM，提供 HTTP API 来管理 microVM。E2B 在此基础上构建了完整的管理平台，包括：
- 沙箱管理服务
- 镜像和模板系统
- 网络管理
- VNC 集成
- 命令执行服务
- RESTful API

## Goals / Non-Goals

### Goals
- 实现与 E2B 相同的核心功能（沙箱管理、命令执行、VNC、截图）
- 提供 RESTful API，兼容 E2B API 设计（便于迁移）
- 完全自主可控，数据本地化
- 支持多租户和资源隔离
- 高性能（启动时间 < 200ms）

### Non-Goals
- 不实现完整的云平台功能（如计费、用户管理）
- 不实现 E2B 的所有高级功能（先实现核心功能）
- 不修改 Firecracker 核心代码（尽量通过扩展实现）

## Architecture

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                      │
│  (HeartSphere, CLI, Web UI, etc.)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│              Platform API Gateway (Go/Java)                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  RESTful API Endpoints                              │  │
│  │  - POST   /sandboxes        (创建沙箱)               │  │
│  │  - GET    /sandboxes/:id    (查询沙箱)               │  │
│  │  - DELETE /sandboxes/:id    (删除沙箱)               │  │
│  │  - POST   /sandboxes/:id/commands  (执行命令)        │  │
│  │  - GET    /sandboxes/:id/files     (文件操作)        │  │
│  │  - GET    /sandboxes/:id/vnc       (VNC 信息)        │  │
│  │  - GET    /sandboxes/:id/screenshot (截图)            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            Platform Management Services (Go)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Sandbox     │  │ Network     │  │ Image       │    │
│  │ Manager     │  │ Manager     │  │ Manager     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │            │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐    │
│  │ VNC         │  │ SSH          │  │ Template     │    │
│  │ Manager     │  │ Manager      │  │ Manager      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Firecracker Management Layer (Rust/Go)             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Firecracker API Client                               │  │
│  │  - VM Creation                                        │  │
│  │  - VM Lifecycle                                       │  │
│  │  - Resource Management                                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP API
┌─────────────────────────────────────────────────────────────┐
│         Firecracker VMM (Forked from Official)             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Firecracker Binary (Original)                       │  │
│  │  + Custom Extensions (if needed)                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ KVM
┌─────────────────────────────────────────────────────────────┐
│                    Linux Host + KVM                         │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件设计

#### 1. Platform API Gateway
**技术选型**: Go (推荐) 或 Java
**职责**:
- 提供 RESTful API
- 请求路由和负载均衡
- 认证和授权
- API 版本管理

**API 设计**（参照 E2B）:
```go
// 创建沙箱
POST /api/v1/sandboxes
{
  "template": "base",
  "timeout": 300,
  "metadata": {...}
}

// 查询沙箱
GET /api/v1/sandboxes/{id}

// 执行命令
POST /api/v1/sandboxes/{id}/commands
{
  "command": "ls -la",
  "cwd": "/home/user"
}

// 获取 VNC 信息
GET /api/v1/sandboxes/{id}/vnc

// 获取截图
GET /api/v1/sandboxes/{id}/screenshot
```

#### 2. Sandbox Manager
**职责**:
- 沙箱生命周期管理
- 状态跟踪和持久化
- 资源分配和限制
- 多租户隔离

**数据结构**:
```go
type Sandbox struct {
    ID          string
    Template    string
    Status      string  // creating, running, stopped, error
    CreatedAt   time.Time
    ExpiresAt   time.Time
    Resources   Resources
    Network     NetworkConfig
    VNC         VNCConfig
}
```

#### 3. Network Manager
**职责**:
- TAP 设备创建和管理
- IP 地址分配（DHCP 或静态）
- 网络隔离和路由
- 多租户网络隔离

**实现方式**:
- 使用 `ip` 命令创建 TAP 设备
- 使用 DHCP 服务器分配 IP
- 使用 iptables 实现网络隔离

#### 4. Image Manager
**职责**:
- 基础镜像构建
- 镜像模板管理
- 镜像版本控制
- 镜像缓存和分发

**镜像构建流程**:
1. 使用 debootstrap 创建基础系统
2. 安装 XFCE4、开发工具
3. 配置 VNC Server
4. 打包为 ext4 镜像
5. 压缩和存储

#### 5. VNC Manager
**职责**:
- VNC Server 配置
- VNC 连接管理
- 截图功能
- 屏幕共享

**实现方式**:
- 在镜像中预配置 x11vnc
- 自动生成 VNC 密码
- 通过 VNC 协议截图

#### 6. SSH Manager
**职责**:
- SSH 服务配置
- 密钥管理
- 命令执行
- 文件操作

**实现方式**:
- 在镜像中预配置 SSH Server
- 使用 SSH 密钥认证
- 通过 SSH 执行命令和文件操作

## Decisions

### Decision 1: Fork Firecracker 而非直接使用
**Rationale**: 
- 可能需要扩展 Firecracker 功能
- 可以定制化配置和优化
- 保持与上游同步的能力

**Alternatives considered**:
- 直接使用 Firecracker 二进制（更简单但定制能力有限）
- 完全重写（工作量太大）

### Decision 2: 管理服务使用 Go
**Rationale**:
- Go 性能好，并发能力强
- 部署简单（单二进制）
- 与 Firecracker 的 Rust 生态互补
- 适合构建 API 服务

**Alternatives considered**:
- Java（项目已有 Java 技术栈，但性能不如 Go）
- Rust（与 Firecracker 一致，但学习成本高）

### Decision 3: API 设计参照 E2B
**Rationale**:
- E2B API 设计成熟，已被验证
- 便于现有 E2B 用户迁移
- 减少 API 设计工作量

**Alternatives considered**:
- 完全自定义 API（需要更多设计工作）
- 使用 gRPC（性能更好但兼容性差）

### Decision 4: 镜像格式使用 ext4
**Rationale**:
- Firecracker 原生支持
- 性能好，兼容性强
- 易于构建和管理

**Alternatives considered**:
- squashfs（压缩率高但性能较差）
- raw（性能最好但文件大）

### Decision 5: 网络使用 TAP 设备
**Rationale**:
- Firecracker 推荐使用 TAP
- 性能好，隔离性强
- 支持动态 IP 分配

**Alternatives considered**:
- 使用 Docker 网络（需要额外依赖）
- 使用 macvtap（配置复杂）

## Implementation Strategy

### Phase 1: Firecracker Fork 和基础研究（1-2周）
1. Fork Firecracker 官方仓库
2. 研究 Firecracker 源码结构
3. 分析 E2B 的功能需求
4. 确定扩展点

### Phase 2: 核心服务开发（4-6周）
1. Platform API Gateway（Go）
2. Sandbox Manager
3. Firecracker API Client
4. 基础镜像构建

### Phase 3: 功能完善（3-4周）
1. Network Manager
2. VNC Manager
3. SSH Manager
4. Image Manager

### Phase 4: 高级功能（2-3周）
1. 多租户支持
2. 资源监控
3. 日志和告警
4. 性能优化

### Phase 5: 测试和文档（2周）
1. 单元测试和集成测试
2. 性能基准测试
3. API 文档
4. 部署文档

## Risks / Trade-offs

### Risk 1: Firecracker 源码复杂度高
**Risk**: Firecracker 使用 Rust，源码复杂，学习成本高
**Mitigation**: 
- 先使用 Firecracker 二进制，不修改核心代码
- 通过管理服务扩展功能
- 逐步深入理解源码

### Risk 2: 开发周期长
**Risk**: 完整平台开发需要 3-4 个月
**Mitigation**:
- 分阶段实施，先实现核心功能
- 参考 E2B 的实现，减少设计时间
- 使用成熟的开源组件

### Risk 3: 性能不如 E2B
**Risk**: 自建平台可能无法达到 E2B 的性能
**Mitigation**:
- 参考 E2B 的配置和优化
- 进行性能基准测试
- 持续优化

### Risk 4: 维护成本高
**Risk**: 需要持续维护和更新
**Mitigation**:
- 尽量使用 Firecracker 官方版本
- 建立完善的测试和 CI/CD
- 文档完善，便于团队协作

## Migration Plan

### 从 E2B 迁移到自建平台
1. **并行运行**：自建平台与 E2B 并行运行
2. **灰度切换**：逐步将流量切换到自建平台
3. **功能验证**：确保功能一致性
4. **完全切换**：所有流量切换到自建平台

### Rollback Plan
- 保留 E2B 配置
- 可以随时切换回 E2B
- 数据备份和恢复机制

## Open Questions

1. **项目组织**：作为 HeartSphere 的子项目还是独立项目？
2. **开源策略**：是否开源？使用什么许可证？
3. **部署方式**：Docker 容器化还是直接部署？
4. **监控方案**：使用什么监控系统（Prometheus、Grafana）？
5. **存储方案**：镜像存储使用本地存储还是对象存储？
