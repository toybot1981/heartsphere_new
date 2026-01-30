# Database Migration Scripts Design

## Context

需要实现一个数据库迁移工具，将本地开发环境的数据库变更同步到生产环境。本地环境使用 MySQL (localhost:3306, root/123456)，生产环境使用阿里云 RDS MySQL (rm-bp1bg7xxnka508amyvo.mysql.rds.aliyuncs.com:3306, heartsphere/Tyx@19811009)。

## Goals / Non-Goals

### Goals
- 安全地将本地数据库结构变更同步到生产环境
- 同步系统配置数据（system_* 表）
- 部分更新用户图片相关数据
- 不删除生产环境的数据
- 支持回滚和备份

### Non-Goals
- 不支持删除表和字段（仅增量添加）
- 不全面同步用户数据（仅图片相关字段）
- 不处理数据库版本回退

## Decisions

### Decision 1: 使用 Shell 脚本 + MySQL 命令行工具
- **Rationale**: 
  - 简单直接，无需额外依赖
  - MySQL 命令行工具功能完善（mysqldump, mysql）
  - 易于调试和维护
- **Alternatives considered**:
  - Python 脚本 + mysql-connector：需要 Python 环境，增加依赖
  - Node.js 脚本：不适合数据库迁移场景
  - Flyway：已经在开发环境使用，但生产环境需要手动执行

### Decision 2: 表结构对比方式
- **Approach**: 使用 `mysqldump --no-data` 导出表结构，然后使用 `diff` 对比
- **Rationale**: 
  - mysqldump 是 MySQL 标准工具，稳定可靠
  - 导出的 SQL 可以直接执行
  - 便于人工审查变更
- **Alternatives considered**:
  - INFORMATION_SCHEMA 查询：需要复杂的 SQL 查询和对比逻辑
  - 使用第三方工具（如 pt-online-schema-change）：功能过重，不适合简单场景

### Decision 3: 数据同步策略
- **系统数据表**: 使用 `INSERT ... ON DUPLICATE KEY UPDATE` 完全同步
- **用户数据表**: 仅更新图片相关字段（avatar_url, image_url, background_url 等）
- **Rationale**:
  - 系统数据需要保持一致，完全同步
  - 用户数据量大，且不应被本地测试数据覆盖
  - 图片相关字段可能需要更新路径或格式

### Decision 4: 配置文件位置和格式
- **Location**: `deploy/db-migration.config`
- **Format**: Shell 脚本配置文件（KEY=VALUE 格式）
- **Sensitive Data**: 密码使用环境变量或交互式输入，不写入配置文件
- **Rationale**:
  - 与现有 deploy 目录结构一致
  - 易于 Shell 脚本读取
  - 符合安全最佳实践

## Risks / Trade-offs

### Risk 1: 数据丢失风险
- **Mitigation**: 
  - 迁移前自动备份远程数据库
  - 支持干运行模式（--dry-run）
  - 提供回滚脚本

### Risk 2: 表结构变更冲突
- **Risk**: 本地和远程表结构可能存在不兼容的变更
- **Mitigation**:
  - 仅支持增量变更（添加字段、索引）
  - 不删除字段和表
  - 人工审查差异报告

### Risk 3: 网络连接中断
- **Risk**: 迁移过程中网络中断导致部分迁移失败
- **Mitigation**:
  - 使用事务确保原子性
  - 记录迁移日志，支持断点续传
  - 提供迁移状态检查脚本

### Risk 4: 数据同步性能
- **Risk**: 系统数据同步可能较慢
- **Trade-off**: 优先保证数据一致性，性能次要
- **Mitigation**: 
  - 分批同步大数据表
  - 显示进度信息

## Migration Plan

### Phase 1: 工具开发
1. 创建主迁移脚本框架
2. 实现表结构对比功能
3. 实现表结构同步功能
4. 实现数据同步功能

### Phase 2: 测试验证
1. 在测试环境验证迁移流程
2. 验证表结构同步准确性
3. 验证数据同步正确性
4. 性能测试

### Phase 3: 生产部署
1. 在维护窗口期间执行首次迁移
2. 验证迁移结果
3. 监控系统运行状态

### Rollback Plan
1. 使用备份恢复数据库
2. 检查数据完整性
3. 修复问题后重新迁移

## Open Questions

1. 是否需要支持多个数据库的迁移？（当前仅 heartsphere）
2. 是否需要支持增量迁移（仅迁移最近变更）？
3. 如何处理外键约束和依赖关系？
