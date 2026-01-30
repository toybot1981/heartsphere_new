# 数据库迁移脚本

数据库迁移脚本系统，用于将本地开发环境的数据库变更同步到生产环境。

## 快速开始

### 方式一：生成 SQL 脚本（推荐首次使用）

```bash
# 1. 配置数据库连接信息
# 编辑 deploy/db-migration.config 或使用环境变量设置密码

# 2. 生成 SQL 脚本
cd deploy
./migrate-database.sh --generate-sql

# 3. 审查生成的 SQL 脚本
cat sql/schema_sync_prod_*.sql
cat sql/data_sync_prod_*.sql

# 4. 执行 SQL 脚本
mysql -h <host> -u <user> -p <database> < sql/schema_sync_prod_*.sql
mysql -h <host> -u <user> -p <database> < sql/data_sync_prod_*.sql
```

### 方式二：直接执行迁移

```bash
# 1. 配置数据库连接信息
# 编辑 deploy/db-migration.config 或使用环境变量设置密码

# 2. 干运行（推荐首次使用）
cd deploy
./migrate-database.sh --dry-run

# 3. 执行迁移
./migrate-database.sh
```

## 文件结构

```
deploy/
├── migrate-database.sh          # 主迁移脚本
├── db-migration.config          # 配置文件
├── DATABASE_MIGRATION_GUIDE.md  # 详细使用文档
├── scripts/
│   ├── compare-schema.sh        # 数据库结构对比工具
│   ├── sync-schema.sh           # 表结构同步脚本
│   ├── sync-data.sh             # 数据同步脚本
│   ├── generate-schema-sql.sh   # 生成表结构同步 SQL 脚本 ⭐
│   ├── generate-data-sql.sh     # 生成数据同步 SQL 脚本 ⭐
│   ├── restore-backup.sh        # 备份恢复脚本
│   └── verify-migration.sh      # 迁移验证脚本
├── sql/                         # SQL 脚本目录（自动创建）⭐
│   └── README.md                # SQL 脚本使用说明
├── logs/                        # 日志目录（自动创建）
├── backups/                     # 备份目录（自动创建）
├── reports/                     # 报告目录（自动创建）
└── temp/                        # 临时文件目录（自动创建）
```

## 核心功能

1. **SQL 脚本生成** ⭐: 生成 SQL 脚本文件，便于审查后手动执行
2. **表结构同步**: 自动创建缺失的表、添加缺失的字段和索引
3. **系统数据同步**: 完全同步系统配置数据（system_* 表）
4. **用户数据部分同步**: 仅更新用户图片相关字段
5. **自动备份**: 迁移前自动备份远程数据库
6. **干运行模式**: 预览将要执行的操作
7. **详细日志**: 记录所有操作和错误

## 主要脚本说明

### migrate-database.sh
主迁移脚本，协调整个迁移过程。

**使用方法**:
```bash
./migrate-database.sh [options]
```

**常用选项**:
- `--generate-sql`: 生成 SQL 脚本文件而不是直接执行 ⭐
- `--dry-run`: 干运行模式
- `--skip-backup`: 跳过备份
- `--skip-schema`: 跳过表结构同步
- `--skip-data`: 跳过数据同步

### compare-schema.sh
对比本地和远程数据库的表结构差异。

**使用方法**:
```bash
./scripts/compare-schema.sh --env prod
```

### sync-schema.sh
同步表结构，创建缺失的表和字段。

**使用方法**:
```bash
./scripts/sync-schema.sh --env prod
```

### sync-data.sh
同步数据，包括系统数据和用户图片数据。

**使用方法**:
```bash
./scripts/sync-data.sh --env prod
```

### generate-schema-sql.sh ⭐
生成表结构同步 SQL 脚本文件。

**使用方法**:
```bash
./scripts/generate-schema-sql.sh --env prod
```

### generate-data-sql.sh ⭐
生成数据同步 SQL 脚本文件。

**使用方法**:
```bash
./scripts/generate-data-sql.sh --env prod
```

### restore-backup.sh
从备份文件恢复数据库。

**使用方法**:
```bash
./scripts/restore-backup.sh <backup_file> --env prod
```

### verify-migration.sh
验证迁移后的数据库一致性。

**使用方法**:
```bash
./scripts/verify-migration.sh --env prod
```

## 配置说明

配置文件: `deploy/db-migration.config`

**重要**: 密码不应直接写入配置文件，可以通过以下方式提供：

1. **环境变量**（推荐）:
   ```bash
   export LOCAL_DB_PASSWORD=your_local_password
   export PROD_DB_PASSWORD=your_prod_password
   ```

2. **交互式输入**: 脚本会提示输入密码

## 安全注意事项

1. ✅ 生成 SQL 脚本便于审查后再执行 ⭐
2. ✅ 迁移前自动备份远程数据库
3. ✅ 支持干运行模式预览操作
4. ✅ 密码通过环境变量或交互式输入，不写入配置文件
5. ✅ 详细的操作日志记录
6. ✅ 不删除远程数据库的任何数据
7. ✅ SQL 脚本使用事务，执行失败自动回滚

## 详细文档

请参阅 [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) 获取详细的使用说明。

---

**最后更新**: 2025-01-12
