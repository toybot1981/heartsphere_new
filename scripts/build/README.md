# 统一构建系统

## 概述

统一构建系统提供了统一的构建脚本和工具链，支持多模块并行构建、构建缓存和离线构建。

## 快速开始

### 全量构建

```bash
./scripts/build/build-all.sh
```

### 构建单个模块

```bash
./scripts/build/build-module.sh main
```

### 检查依赖

```bash
./scripts/build/check-dependencies.sh
```

## 功能特性

- ✅ 统一构建入口
- ✅ 多模块并行构建
- ✅ 构建缓存（减少重复构建）
- ✅ 依赖检查
- ✅ 依赖缓存管理
- ✅ 缓存统计和清理
- ✅ 与现有构建脚本兼容

## 配置

构建配置在 `scripts/build/build-config.yml` 中定义。

## 缓存

构建缓存存储在 `.build-cache/` 目录中，默认 TTL 为 7 天。

清理缓存：
```bash
rm -rf .build-cache/
```
