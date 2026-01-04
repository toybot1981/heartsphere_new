# 图片URL路径结构迁移指南

## 概述

本文档说明如何将数据库中的图片URL从旧路径结构迁移到新路径结构。

## 路径结构变化

### 旧路径结构
- 访问URL：`base_url/api/images/files/category/year/month/filename`
- 数据库存储：`category/year/month/filename` 或 `http://localhost:8081/api/images/files/...`

### 新路径结构
- **系统资源**：
  - 访问URL：`base_url/images/category/year/month/filename`
  - 数据库存储：`category/year/month/filename`
  
- **用户资源**：
  - 访问URL：`base_url/images/userId/category/year/month/filename`
  - 数据库存储：`userId/category/year/month/filename`

## 迁移步骤

### 步骤 1: 备份数据

**强烈建议在执行迁移前先备份数据！**

```bash
./scripts/backup-image-urls-before-migration.sh
```

备份脚本会：
- 在数据库中创建备份表（`*_url_backup`）
- 导出备份数据到SQL文件

### 步骤 2: 执行迁移

#### 方式1: 使用迁移脚本（推荐）

```bash
./scripts/migrate-image-urls-to-new-structure.sh
```

脚本会：
- 检查数据库连接
- 执行迁移SQL
- 验证迁移结果

#### 方式2: 使用 Flyway（自动执行）

如果使用 Flyway，迁移脚本会在应用启动时自动执行：
- `V20250103001__convert_localhost_image_urls_to_relative.sql`
- `V20250103002__convert_system_resources_localhost_urls_to_relative.sql`
- `V20250103003__migrate_image_urls_to_new_path_structure.sql`

#### 方式3: 手动执行SQL

```bash
mysql -u root -p heartsphere < backend/src/main/resources/db/migration/V20250103003__migrate_image_urls_to_new_path_structure.sql
```

### 步骤 3: 验证迁移结果

使用检查脚本验证：

```bash
# 检查所有表的图片URL格式
./scripts/check-database-image-urls.sh

# 检查 system_resources 表
./scripts/check-system-resources-urls.sh
```

确认：
- `localhost_count` 为 0
- `old_format_count`（包含 `/api/images/`）为 0
- 相对路径格式正确

### 步骤 4: 测试应用

1. 启动后端服务
2. 测试图片上传（系统资源和用户资源）
3. 测试图片访问（验证URL格式）
4. 检查日志，确认路径正确

## 迁移脚本说明

### V20250103003__migrate_image_urls_to_new_path_structure.sql

**功能**：
- 将所有包含 `localhost:8081/api/images/files/` 的URL转换为相对路径
- 将所有包含 `/api/images/files/` 的URL转换为相对路径
- 支持旧格式的兼容转换

**处理的表**：
1. `system_resources` (url)
2. `system_eras` (image_url)
3. `system_characters` (avatar_url)
4. `characters` (avatar_url, background_url)
5. `eras` (image_url)
6. `journal_entries` (image_url)
7. `users` (avatar)
8. `user_main_stories` (avatar_url, background_url)

**注意事项**：
- 系统资源的路径格式保持不变（`category/year/month/filename`）
- 用户资源的路径迁移需要根据实际情况处理
- 外部URL（如 `https://picsum.photos/...`）保持不变

## 用户资源路径迁移说明

用户资源的路径迁移比较复杂，因为：

1. **现有数据**：数据库中可能存储的是 `category/year/month/filename` 格式，没有包含 `userId`
2. **新格式要求**：新格式需要 `userId/category/year/month/filename`

### 处理方案

#### 方案1: 通过关联表查找 userId（推荐）

对于有用户关联的表（如 `characters`, `eras`, `journal_entries`），可以通过关联表查找 `userId`：

```sql
-- 示例：迁移 characters 表的路径（需要根据实际表结构调整）
UPDATE characters c
SET avatar_url = CONCAT(c.user_id, '/', c.avatar_url)
WHERE avatar_url NOT LIKE '%/%/%/%/%'  -- 如果不包含 userId
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%'
  AND c.user_id IS NOT NULL;
```

#### 方案2: 保持现有格式（临时方案）

如果暂时无法确定 `userId`，可以先保持现有格式：
- 数据库中存储：`category/year/month/filename`
- 后端代码会通过 `toFullUrl()` 转换为完整URL
- 新上传的资源会自动使用新格式（`userId/category/year/month/filename`）

#### 方案3: 手动迁移（小数据量）

如果数据量较小，可以手动处理，通过业务逻辑确定每个资源的 `userId`。

## 文件系统迁移（可选）

如果服务器上的文件也需要迁移到新路径结构，需要：

1. **系统资源**：保持现有路径（`uploads/images/category/year/month/`）
2. **用户资源**：移动到新路径（`uploads/images/userId/category/year/month/`）

**注意**：文件系统迁移需要额外处理，建议：
- 先完成数据库迁移
- 测试新代码是否能正确访问文件
- 如果文件访问正常，文件系统迁移可以延后

## 回滚方案

如果迁移失败，可以使用恢复脚本：

```bash
./scripts/restore-image-urls-from-backup.sh
```

或手动执行SQL恢复备份表中的数据。

## 相关文件

- `backend/src/main/resources/db/migration/V20250103003__migrate_image_urls_to_new_path_structure.sql` - 迁移脚本
- `scripts/migrate-image-urls-to-new-structure.sh` - 迁移执行脚本
- `scripts/backup-image-urls-before-migration.sh` - 备份脚本
- `scripts/restore-image-urls-from-backup.sh` - 恢复脚本
- `scripts/check-database-image-urls.sh` - 检查脚本
- `scripts/check-system-resources-urls.sh` - 检查脚本
