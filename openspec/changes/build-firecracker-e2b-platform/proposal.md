# Change: 基于 Firecracker 源码构建 E2B 风格的平台

## Why

当前系统依赖 E2B 云平台提供虚拟机服务，虽然功能完善但存在以下限制：
1. **成本问题**：E2B 按使用量付费，长期使用成本高（年成本约 ¥60万+）
2. **依赖风险**：完全依赖第三方服务，存在服务中断、API 变更等风险
3. **定制限制**：无法深度定制功能，受限于 E2B 平台能力
4. **数据隐私**：数据在云端，无法完全自主控制

通过基于 Firecracker 源码进行二次开发，构建类似 E2B 的平台，可以：
- 实现完全自主可控的虚拟机管理平台
- 显著降低长期运营成本（年成本约 ¥3-4万）
- 支持深度定制和功能扩展
- 保持数据本地化，提升安全性
- 提供与 E2B 相同的性能和功能体验

参考 E2B 的成功实现（详见 `docs/MANUS_ANALYSIS_REPORT.md`），我们需要在 Firecracker 基础上构建：
- 沙箱管理服务（创建、删除、状态查询）
- 命令执行服务（SSH 或 API）
- 文件系统操作服务
- VNC 远程桌面服务
- 截图和屏幕共享功能
- 模板和镜像管理系统
- RESTful API 服务

## What Changes

### 核心能力新增

1. **Firecracker 源码 Fork 和定制** (`firecracker-fork`)
   - Fork Firecracker 官方仓库
   - 分析 E2B 的功能需求
   - 确定需要扩展的功能点
   - 制定二次开发计划

2. **平台管理服务** (`platform-management-service`)
   - 沙箱生命周期管理（创建、启动、停止、删除）
   - 沙箱状态查询和监控
   - 资源管理和限制
   - 多租户支持

3. **API 服务层** (`api-service-layer`)
   - RESTful API 设计（参照 E2B API）
   - 沙箱管理 API
   - 命令执行 API
   - 文件操作 API
   - VNC 连接 API
   - 截图 API

4. **镜像和模板系统** (`image-template-system`)
   - 基础镜像构建（Ubuntu + XFCE4 + 开发工具）
   - 镜像模板管理
   - 镜像版本控制
   - 镜像缓存和分发

5. **网络管理服务** (`network-management-service`)
   - TAP 设备管理
   - IP 地址分配
   - 网络隔离和路由
   - 多租户网络隔离

6. **VNC 和桌面服务** (`vnc-desktop-service`)
   - VNC Server 自动配置
   - VNC 连接管理
   - 桌面环境预配置
   - 截图和屏幕共享

7. **命令执行服务** (`command-execution-service`)
   - SSH 服务集成
   - 命令执行 API
   - 文件读写操作
   - 流式输出支持

8. **监控和日志系统** (`monitoring-logging`)
   - 资源使用监控
   - 性能指标收集
   - 日志聚合和分析
   - 告警机制

### 技术架构

```
┌─────────────────────────────────────────────────┐
│         E2B-Style Platform API (REST)          │
│  ┌───────────────────────────────────────────┐ │
│  │  Sandbox Management API                  │ │
│  │  Command Execution API                   │ │
│  │  File System API                         │ │
│  │  VNC Connection API                      │ │
│  │  Screenshot API                          │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│         Platform Management Service            │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ Sandbox Mgr │  │ Network Mgr  │          │
│  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ Image Mgr   │  │ VNC Mgr      │          │
│  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│         Firecracker (Forked & Extended)        │
│  ┌───────────────────────────────────────────┐ │
│  │  Firecracker VMM (Original)              │ │
│  │  + Custom Extensions                      │ │
│  │  + Management APIs                       │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│         KVM + Linux Host                       │
└─────────────────────────────────────────────────┘
```

## Impact

- **Affected specs**: 
  - 新增 `firecracker-platform` capability（完整的平台能力）
  - 可能修改 `virtual-computer-sandbox` capability（添加自建平台支持）

- **Affected code**:
  - 新建独立项目：`firecracker-platform/`（基于 Firecracker fork）
  - `firecracker-platform/api/` - RESTful API 服务
  - `firecracker-platform/services/` - 平台管理服务
  - `firecracker-platform/images/` - 镜像构建和管理
  - `firecracker-platform/docs/` - 平台文档

- **Breaking changes**: 无（新建独立项目，不影响现有代码）

- **Dependencies**:
  - **Firecracker 源码**：需要 Fork 官方仓库
  - **Rust 工具链**：Firecracker 使用 Rust 开发
  - **Go 或 Java**：管理服务可以使用 Go 或 Java（建议 Go，性能更好）
  - **KVM**：需要服务器支持 KVM 虚拟化
  - **网络工具**：iproute2、bridge-utils

- **Infrastructure requirements**:
  - Linux 服务器（CentOS 7+ / Ubuntu 18.04+）
  - KVM 支持（硬件虚拟化）
  - 至少 8GB 内存，4 CPU 核心（用于开发和测试）
  - 足够的磁盘空间（镜像存储、源码）

- **Project scope**:
  - 这是一个**独立的新项目**，不是对现有 HeartSphere 项目的修改
  - 项目完成后，HeartSphere 可以通过 API 调用使用该平台
  - 项目可以作为开源项目发布
