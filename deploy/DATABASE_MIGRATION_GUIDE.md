# 数据库迁移指南

本文档说明如何使用数据库迁移脚本将本地开发环境的数据库变更同步到生产环境。

## 目录

- [概述](#概述)
- [前置要求](#前置要求)
- [配置文件](#配置文件)
- [使用方法](#使用方法)
- [迁移流程](#迁移流程)
- [注意事项](#注意事项)
- [故障处理](#故障处理)

## 概述

数据库迁移脚本系统用于将本地开发环境的数据库变更（包括表结构变更和系统数据更新）安全地同步到生产环境，同时保护生产环境中的用户数据。

### 核心功能

1. **表结构同步**: 自动创建缺失的表、添加缺失的字段和索引
2. **系统数据同步**: 完全同步系统配置数据（system_* 表）
3. **用户数据部分同步**: 仅更新用户图片相关字段
4. **安全保障**: 自动备份、干运行模式、详细日志

### 迁移原则

1. **不删除远程数据库**: 迁移过程中绝不删除生产环境的数据库或表
2. **表结构增量更新**: 只添加缺失的表和字段，不删除现有字段
3. **系统数据完全同步**: 系统相关数据完全按照本地数据更新
4. **用户数据部分更新**: 普通用户相关数据仅更新图片相关字段
5. **安全第一**: 所有操作前进行备份检查，支持回滚机制

## 前置要求

### 系统要求

- **操作系统**: Linux / macOS
- **MySQL 客户端**: 需要安装 `mysql` 和 `mysqldump` 命令
- **Shell**: Bash 4.0+

### 数据库要求

- 本地和远程数据库都必须是 MySQL 8.0+
- 需要具有以下权限：
  - SELECT（查询表结构）
  - CREATE（创建表）
  - ALTER（修改表结构）
  - INSERT（插入数据）
  - UPDATE（更新数据）
  - LOCK TABLES（备份时需要）

### 连接测试

在运行迁移脚本前，确保可以连接到远程数据库：

```bash
# 测试本地数据库连接
mysql -h localhost -P 3306 -u root -p123456 heartsphere -e "SELECT 1"

# 测试生产数据库连接（替换为实际密码）
mysql -h rm-bp1bg7xxnka508amyvo.mysql.rds.aliyuncs.com -P 3306 -u heartsphere -p heartsphere -e "SELECT 1"
```

## 配置文件

配置文件位于 `deploy/db-migration.config`，包含数据库连接信息。

### 配置文件格式

```bash
# 本地数据库配置
LOCAL_DB_HOST=localhost
LOCAL_DB_PORT=3306
LOCAL_DB_USER=root
LOCAL_DB_NAME=heartsphere

# 生产数据库配置
PROD_DB_HOST=rm-bp1bg7xxnka508amyvo.mysql.rds.aliyuncs.com
PROD_DB_PORT=3306
PROD_DB_USER=heartsphere
PROD_DB_NAME=heartsphere

# 备份配置
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=7

# 日志配置
LOG_DIR=./logs
LOG_LEVEL=INFO
```

### 密码配置

**重要**: 出于安全考虑，密码不应直接写入配置文件。可以通过以下方式提供：

1. **环境变量**（推荐）:
   ```bash
   export LOCAL_DB_PASSWORD=your_local_password
   export PROD_DB_PASSWORD=your_prod_password
   ```

2. **交互式输入**: 如果不提供环境变量，脚本会提示输入密码

## 使用方法

### 基本用法

```bash
cd deploy
./migrate-database.sh
```

### 命令行选项

```bash
./migrate-database.sh [options]
```

**选项说明**:

- `--env local|prod`: 指定目标环境（默认: prod）
- `--dry-run`: 干运行模式，只显示将要执行的操作，不实际执行
- `--generate-sql`: 生成 SQL 脚本文件而不是直接执行（推荐首次使用）
- `--sql-output-dir DIR`: 指定 SQL 脚本输出目录（默认: ./sql）
- `--skip-backup`: 跳过备份步骤（不推荐）
- `--skip-schema`: 跳过表结构同步
- `--skip-data`: 跳过数据同步
- `--config FILE`: 指定配置文件路径（默认: ./db-migration.config）
- `--help`: 显示帮助信息

### 使用示例

#### 1. 生成 SQL 脚本（推荐首次使用）⭐

在执行实际迁移前，先生成 SQL 脚本以便审查：

```bash
# 生成完整的 SQL 脚本（表结构 + 数据）
./migrate-database.sh --generate-sql

# 仅生成表结构 SQL 脚本
./migrate-database.sh --generate-sql --skip-data

# 仅生成数据同步 SQL 脚本
./migrate-database.sh --generate-sql --skip-schema
```

生成的 SQL 脚本将保存在 `sql/` 目录中，可以手动审查后执行。

#### 2. 直接执行迁移

如果已经审查过 SQL 脚本，可以直接执行迁移：

```bash
./migrate-database.sh
```

#### 3. 干运行模式

在执行实际迁移前，先进行干运行以查看将要执行的操作：

```bash
./migrate-database.sh --dry-run
```

#### 4. 仅同步表结构

如果只需要同步表结构，不更新数据：

```bash
./migrate-database.sh --skip-data
```

#### 5. 仅同步数据

如果只需要同步数据，不修改表结构：

```bash
./migrate-database.sh --skip-schema
```

#### 6. 指定配置文件

使用自定义配置文件：

```bash
./migrate-database.sh --config /path/to/custom.config
```

## 迁移流程

### 推荐流程（使用 SQL 脚本）

1. **生成 SQL 脚本**
   ```bash
   ./migrate-database.sh --generate-sql --env prod
   ```

2. **审查 SQL 脚本**
   ```bash
   # 查看生成的 SQL 脚本
   cat sql/schema_sync_prod_*.sql
   cat sql/data_sync_prod_*.sql
   ```

3. **执行 SQL 脚本**
   ```bash
   # 执行表结构同步
   mysql -h <host> -u <user> -p <database> < sql/schema_sync_prod_*.sql
   
   # 执行数据同步
   mysql -h <host> -u <user> -p <database> < sql/data_sync_prod_*.sql
   ```

4. **验证迁移结果**
   ```bash
   ./scripts/verify-migration.sh --env prod
   ```

### 完整迁移流程（直接执行模式）

1. **准备阶段**
   - 检查必需的命令（mysql, mysqldump）
   - 加载配置文件
   - 测试数据库连接

2. **备份阶段**
   - 自动备份远程数据库
   - 压缩备份文件
   - 清理旧备份

3. **表结构同步**
   - 对比本地和远程数据库的表结构
   - 创建缺失的表
   - 添加缺失的字段和索引

4. **数据同步**
   - 同步系统数据表（system_* 前缀）
   - 更新用户图片相关数据

5. **验证阶段**
   - 检查迁移结果
   - 生成迁移日志

### 迁移脚本执行顺序

```
migrate-database.sh (主脚本)
├── compare-schema.sh (结构对比)
├── sync-schema.sh (表结构同步)
└── sync-data.sh (数据同步)
```

## 注意事项

### 1. 备份重要性

- **强烈建议**: 在执行迁移前，确保备份功能正常工作
- 备份文件保存在 `backups/` 目录
- 默认保留 7 天的备份文件

### 2. 表结构变更限制

- **仅支持增量变更**: 只添加表和字段，不删除
- **不修改现有字段**: 不会修改现有字段的类型或约束
- **索引处理**: 只添加缺失的索引，不删除现有索引

### 3. 数据同步策略

- **系统数据**: 完全同步（使用 INSERT ... ON DUPLICATE KEY UPDATE）
- **用户数据**: 仅更新图片相关字段（avatar_url, image_url 等）
- **不删除数据**: 不会删除远程数据库中的任何数据

### 4. 网络稳定性

- 迁移过程中需要稳定的网络连接
- 如果网络中断，迁移可能会失败
- 建议在维护窗口期间执行迁移

### 5. 执行时间

- 表结构同步: 通常很快（几秒到几分钟）
- 数据同步: 取决于数据量（可能需要数分钟到数小时）
- 备份时间: 取决于数据库大小

## 故障处理

### 常见问题

#### 1. 连接失败

**问题**: 无法连接到数据库

**解决方案**:
- 检查网络连接
- 验证数据库连接信息
- 确认防火墙设置
- 检查数据库服务状态

#### 2. 权限不足

**问题**: 执行操作时提示权限不足

**解决方案**:
- 确认数据库用户具有足够的权限
- 检查远程数据库的权限设置
- 联系数据库管理员

#### 3. 表创建失败

**问题**: 创建表时失败

**可能原因**:
- 表名冲突
- 字段定义不兼容
- 外键约束问题

**解决方案**:
- 查看详细错误日志
- 手动检查表定义
- 可能需要手动修复

#### 4. 数据同步失败

**问题**: 数据同步过程中失败

**解决方案**:
- 检查数据格式是否兼容
- 验证主键约束
- 查看错误日志获取详细信息
- 可能需要手动修复数据

### 回滚操作

如果迁移失败，可以使用备份恢复：

```bash
# 查找备份文件
ls -lh backups/

# 恢复备份（示例）
mysql -h <host> -u <user> -p <database> < backup_<timestamp>.sql.gz
```

### 日志分析

迁移日志保存在 `logs/` 目录，文件名格式: `migration_YYYYMMDD_HHMMSS.log`

查看日志：

```bash
tail -f logs/migration_*.log
```

### 获取帮助

如果遇到问题，可以：

1. 查看迁移日志
2. 使用 `--dry-run` 模式查看将要执行的操作
3. 联系开发团队

## 最佳实践

1. **首次使用**: 先在测试环境验证迁移流程
2. **定期迁移**: 建议定期执行迁移，避免累积大量变更
3. **维护窗口**: 在维护窗口期间执行生产环境迁移
4. **监控日志**: 迁移过程中监控日志输出
5. **验证结果**: 迁移后验证关键数据和功能
6. **保留备份**: 长期保留重要迁移的备份文件

## 相关文件

- 主迁移脚本: `deploy/migrate-database.sh`
- 配置文件: `deploy/db-migration.config`
- 结构对比脚本: `deploy/scripts/compare-schema.sh`
- 表结构同步脚本: `deploy/scripts/sync-schema.sh`
- 数据同步脚本: `deploy/scripts/sync-data.sh`
- **SQL 脚本生成**: 
  - 表结构 SQL 生成: `deploy/scripts/generate-schema-sql.sh`
  - 数据同步 SQL 生成: `deploy/scripts/generate-data-sql.sh`
- 迁移日志: `deploy/logs/`
- 备份文件: `deploy/backups/`
- **SQL 脚本目录**: `deploy/sql/` (生成的 SQL 脚本存储位置)

---

**最后更新**: 2025-01-12  
**维护者**: HeartSphere 开发团队
