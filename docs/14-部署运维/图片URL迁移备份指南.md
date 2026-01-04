# 图片URL迁移备份指南

## 概述

在执行图片URL迁移（将 localhost URL 转换为相对路径）之前，**强烈建议**先备份相关数据，以便在需要时可以恢复。

## 备份脚本

### 1. backup-image-urls-before-migration.sh

**功能**: 备份所有包含 localhost URL 的数据

**位置**: `scripts/backup-image-urls-before-migration.sh`

**备份的表**:
- `system_resources` (url)
- `system_eras` (image_url)
- `system_characters` (avatar_url)
- `characters` (avatar_url, background_url)
- `eras` (image_url)
- `journal_entries` (image_url)
- `users` (avatar)
- `user_main_stories` (avatar_url, background_url)

**备份方式**:
- 在数据库中创建备份表（`*_url_backup`）
- 导出备份表数据到SQL文件

**使用方法**:
```bash
cd /Users/admin/Workspace/heartsphere_new
./scripts/backup-image-urls-before-migration.sh
```

**环境变量**（可选）:
```bash
export DB_USER=root
export DB_PASSWORD=yourpassword
export DB_NAME=heartsphere
export DB_HOST=localhost
export DB_PORT=3306
```

### 2. restore-image-urls-from-backup.sh

**功能**: 从备份恢复数据

**位置**: `scripts/restore-image-urls-from-backup.sh`

**使用方法**:
```bash
cd /Users/admin/Workspace/heartsphere_new
./scripts/restore-image-urls-from-backup.sh
```

**注意**: 此操作会覆盖当前数据，执行前会要求确认。

## 完整迁移流程

### 步骤 1: 备份数据

```bash
# 备份包含 localhost URL 的数据
./scripts/backup-image-urls-before-migration.sh
```

**输出**:
- 备份表保存在数据库中（`*_url_backup`）
- SQL文件保存在 `database_backup/image_urls_backup_YYYYMMDD_HHMMSS.sql`

### 步骤 2: 检查数据

```bash
# 检查当前状态
./scripts/check-database-image-urls.sh
./scripts/check-system-resources-urls.sh
```

### 步骤 3: 执行迁移

**方式1: 使用 Flyway（推荐）**

迁移脚本会在应用启动时自动执行：
- `V20250103001__convert_localhost_image_urls_to_relative.sql`
- `V20250103002__convert_system_resources_localhost_urls_to_relative.sql`

**方式2: 手动执行SQL**

```bash
mysql -u root -p heartsphere < backend/src/main/resources/db/migration/V20250103001__convert_localhost_image_urls_to_relative.sql
mysql -u root -p heartsphere < backend/src/main/resources/db/migration/V20250103002__convert_system_resources_localhost_urls_to_relative.sql
```

### 步骤 4: 验证迁移结果

```bash
# 再次检查，确认 localhost_count 为 0
./scripts/check-database-image-urls.sh
./scripts/check-system-resources-urls.sh
```

### 步骤 5: 测试应用

1. 启动后端服务
2. 测试图片上传
3. 测试图片查询
4. 验证图片URL格式

### 步骤 6: 清理备份（可选）

确认迁移成功后，可以删除备份表：

```sql
DROP TABLE IF EXISTS system_resources_url_backup;
DROP TABLE IF EXISTS system_eras_url_backup;
DROP TABLE IF EXISTS system_characters_url_backup;
DROP TABLE IF EXISTS characters_url_backup;
DROP TABLE IF EXISTS eras_url_backup;
DROP TABLE IF EXISTS journal_entries_url_backup;
DROP TABLE IF EXISTS users_url_backup;
DROP TABLE IF EXISTS user_main_stories_url_backup;
```

## 恢复数据

如果迁移失败或需要回滚，可以使用恢复脚本：

```bash
./scripts/restore-image-urls-from-backup.sh
```

或者手动执行SQL：

```sql
-- 恢复 system_resources
UPDATE system_resources sr
INNER JOIN system_resources_url_backup b ON sr.id = b.id
SET sr.url = b.url;

-- 恢复 system_eras
UPDATE system_eras se
INNER JOIN system_eras_url_backup b ON se.id = b.id
SET se.image_url = b.image_url;

-- ... 其他表的恢复SQL见备份文件
```

## 完整数据库备份（可选）

如果需要完整的数据库备份（不仅仅是URL数据），可以使用：

```bash
./deploy/export-database.sh heartsphere /path/to/backup
```

这会备份整个数据库，包括结构、数据、存储过程等。

## 注意事项

1. **备份时机**: 在执行任何数据迁移之前，必须先备份
2. **备份验证**: 备份后，检查备份表和SQL文件是否生成
3. **测试环境**: 建议先在测试环境执行迁移，验证无误后再在生产环境执行
4. **备份保留**: 建议保留备份至少1周，确认迁移成功后再删除
5. **权限检查**: 确保数据库用户有足够的权限（CREATE, INSERT, UPDATE, DELETE）

## 相关文件

- `scripts/backup-image-urls-before-migration.sh` - 备份脚本
- `scripts/restore-image-urls-from-backup.sh` - 恢复脚本
- `scripts/check-database-image-urls.sh` - 检查脚本
- `scripts/check-system-resources-urls.sh` - 检查脚本
- `deploy/export-database.sh` - 完整数据库备份脚本
- `backend/src/main/resources/db/migration/V20250103001__convert_localhost_image_urls_to_relative.sql` - 迁移脚本1
- `backend/src/main/resources/db/migration/V20250103002__convert_system_resources_localhost_urls_to_relative.sql` - 迁移脚本2
