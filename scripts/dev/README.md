# 开发工具链

## 概述

开发工具链提供了一键环境设置、本地服务启动等开发工具。

## 快速开始

### 设置本地环境

```bash
./scripts/dev/setup-local-env.sh
```

### 检查环境

```bash
./scripts/dev/check-env.sh
```

### 启动本地服务

```bash
./scripts/dev/start-local-services.sh
```

## 功能特性

- ✅ 环境检查和设置
- ✅ 依赖验证
- ✅ 本地服务启动（Docker 支持）
- ✅ 与现有脚本系统兼容

## 与现有脚本的关系

- `scripts/dev/start-local-services.sh` 与 `scripts/start-all.sh` 并行存在
- `scripts/dev/start-local-services.sh` 用于启动本地开发服务（包括 Mock 服务等）
- `scripts/start-all.sh` 用于启动所有项目服务（生产模式）
