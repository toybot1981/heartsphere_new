# 基于 Firecracker 构建 E2B 风格平台提案

## 概述

本提案旨在基于 Firecracker 源码进行二次开发，构建一个功能类似 E2B 的自主可控虚拟机管理平台。

## 提案状态

✅ **提案已创建并通过验证**

- Proposal: `proposal.md` - 说明为什么和做什么
- Design: `design.md` - 技术决策和架构设计
- Tasks: `tasks.md` - 实施任务清单（6个阶段）
- Specs: `specs/firecracker-platform/spec.md` - 需求规范

## 核心目标

1. **Fork Firecracker 源码**：基于官方仓库进行二次开发
2. **构建管理平台**：开发类似 E2B 的完整管理平台
3. **提供 RESTful API**：参照 E2B API 设计，便于迁移
4. **完全自主可控**：数据本地化，支持深度定制

## 项目范围

这是一个**独立的新项目**，不是对现有 HeartSphere 项目的修改：
- 项目名称：`firecracker-platform`（待定）
- 技术栈：Firecracker (Rust) + 管理服务 (Go/Java)
- 部署方式：独立部署，通过 API 提供服务
- 集成方式：HeartSphere 通过 API 调用使用该平台

## 实施计划

- **Phase 1**: Firecracker Fork 和基础研究（1-2周）
- **Phase 2**: 核心服务开发（4-6周）
- **Phase 3**: 功能完善（3-4周）
- **Phase 4**: 高级功能（2-3周）
- **Phase 5**: 测试和文档（2周）
- **Phase 6**: 与 HeartSphere 集成（1-2周）

**总计**: 13-19 周（3-4个月，1-2名全栈开发）

## 核心功能

### 已规划的功能
- ✅ 沙箱管理（创建、删除、状态查询）
- ✅ 命令执行（通过 SSH）
- ✅ 文件系统操作（读写、列表、删除）
- ✅ VNC 远程桌面
- ✅ 截图功能
- ✅ 镜像和模板管理
- ✅ 网络管理（TAP 设备、IP 分配）
- ✅ 多租户支持
- ✅ 资源监控

### 技术特点
- RESTful API（参照 E2B 设计）
- 高性能（启动时间 < 200ms）
- 完全自主可控
- 支持多租户和资源隔离

## 架构设计

```
Client Applications
    ↓ HTTP/REST
Platform API Gateway (Go/Java)
    ↓
Platform Management Services
    ↓
Firecracker Management Layer
    ↓ HTTP API
Firecracker VMM (Forked)
    ↓ KVM
Linux Host
```

## 相关文档

- 可行性评估: `docs/FIRECRACKER_INTEGRATION_EVALUATION.md`
- E2B 分析: `docs/MANUS_ANALYSIS_REPORT.md`
- Firecracker 官方: https://github.com/firecracker-microvm/firecracker

## 下一步

1. 审查提案内容
2. 确认技术方案和架构设计
3. Fork Firecracker 仓库
4. 批准后开始 Phase 1 实施
5. 按照 `tasks.md` 逐步完成

## 注意事项

- 这是一个大型项目，需要 3-4 个月开发时间
- 建议分阶段实施，先实现核心功能
- 可以参考 E2B 的实现，但需要避免直接复制代码
- 项目可以作为开源项目发布
