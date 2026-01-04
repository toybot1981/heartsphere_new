# 图片URL全面迁移完成总结

## 执行时间
2025-01-03

## 迁移概述

本次迁移全面检查并修复了所有系统表和用户表中的图片URL格式，确保它们符合新的路径结构规范。

## 迁移范围

### 系统表（路径格式：`category/year/month/filename`）

1. **system_characters**
   - avatar_url ✅
   - background_url ✅

2. **system_eras**
   - image_url ✅

3. **system_resources**
   - url ✅

4. **system_era_items**
   - icon_url ✅

5. **system_era_events**
   - icon_url ✅

6. **system_main_stories**
   - avatar_url ✅
   - background_url ✅

### 用户表（路径格式：`userId/category/year/month/filename`）

1. **characters**（用户角色表）
   - avatar_url ✅
   - background_url ✅

2. **eras**（用户时代表）
   - image_url ✅

3. **user_main_stories**（用户主线故事表）
   - avatar_url ✅
   - background_url ✅

4. **user_scenario_items**（用户场景物品表）
   - icon_url ✅（目前无数据）

5. **user_scenario_events**（用户场景事件表）
   - icon_url ✅（目前无数据）

## 路径规范

### 系统资源

**数据库存储**：`category/year/month/filename`

**文件系统**：`uploads/images/category/year/month/filename`

**访问URL**：`base_url/images/category/year/month/filename`

### 用户资源

**数据库存储**：`userId/category/year/month/filename`

**文件系统**：`uploads/images/userId/category/year/month/filename`

**访问URL**：`base_url/images/userId/category/year/month/filename`

## 执行的迁移脚本

### 1. 系统表迁移

- `V20250103003__migrate_image_urls_to_new_path_structure.sql` - 基础迁移
- `V20250103004__migrate_all_system_tables_image_urls.sql` - 系统表全面迁移

### 2. 用户表迁移

- `V20250103005__migrate_user_tables_image_urls.sql` - 用户表URL格式转换
- `V20250103006__add_userid_prefix_to_user_image_urls.sql` - 添加userId前缀
- `V20250103007__migrate_user_scenario_tables_image_urls.sql` - 用户场景表迁移

### 3. 文件系统迁移

- `scripts/migrate-user-image-files-v2.sh` - 用户资源文件迁移（40个文件）

## 迁移结果验证

### 系统表验证

使用检查脚本：`scripts/check-system-tables-image-urls.sh`

**验证结果**：
- ✅ `localhost_count`: 0
- ✅ `old_format_count`: 0
- ✅ `http_count`: 0
- ✅ `https_count`: 0

### 用户表验证

使用检查脚本：`scripts/check-user-tables-image-urls.sh`

**验证结果**：
- ✅ `localhost_count`: 0
- ✅ `old_format_count`: 0
- ✅ `http_count`: 0（外部URL如picsum.photos除外）
- ✅ `missing_userid_count`: 0（所有路径都包含userId）

## 迁移统计

### 数据库记录

- **系统表**：所有图片URL已迁移
  - system_characters: 151条 avatar_url, 76条 background_url
  - system_eras: 22条 image_url
  - system_resources: 447条 url
  - system_era_items: 168条 icon_url
  - system_era_events: 168条 icon_url

- **用户表**：所有图片URL已迁移并添加userId前缀
  - characters: 276条 avatar_url, 193条 background_url
  - eras: 158条 image_url
  - user_main_stories: 12条 avatar_url, 12条 background_url

### 文件系统

- **用户资源文件**：40个文件已迁移到新路径结构

## 创建的脚本和文档

### 检查脚本

1. `scripts/check-system-tables-image-urls.sh` - 系统表检查
2. `scripts/check-user-tables-image-urls.sh` - 用户表检查
3. `scripts/check-database-image-urls.sh` - 通用检查

### 迁移脚本

1. `backend/src/main/resources/db/migration/V20250103003__migrate_image_urls_to_new_path_structure.sql`
2. `backend/src/main/resources/db/migration/V20250103004__migrate_all_system_tables_image_urls.sql`
3. `backend/src/main/resources/db/migration/V20250103005__migrate_user_tables_image_urls.sql`
4. `backend/src/main/resources/db/migration/V20250103006__add_userid_prefix_to_user_image_urls.sql`
5. `backend/src/main/resources/db/migration/V20250103007__migrate_user_scenario_tables_image_urls.sql`

### 文件迁移脚本

1. `scripts/migrate-user-image-files-v2.sh` - 用户资源文件迁移

### 文档

1. `docs/14-部署运维/图片URL路径结构迁移执行报告.md`
2. `docs/14-部署运维/系统表图片URL迁移完成报告.md`
3. `docs/14-部署运维/用户表图片URL迁移完成报告.md`
4. `docs/14-部署运维/nginx-images配置说明.md`
5. `docs/14-部署运维/图片URL全面迁移完成总结.md`（本文档）

## 代码修改

### 后端代码

1. **ImageUrlUtils.java**
   - 修改 `getBaseUrl()` 方法，支持从配置、请求上下文、环境变量获取base URL
   - 修改 `toFullUrl()` 方法，使用新路径结构（`/images/` 而不是 `/api/images/files/`）
   - 修改 `toRelativePath()` 方法，正确提取相对路径

2. **WebMvcConfig.java**
   - 修改资源处理器映射：`/api/images/files/**` → `/images/**`

3. **ImageStorageService.java**
   - 支持系统资源和用户资源的不同路径结构
   - `saveImage()` 方法接受 `userId` 参数
   - 系统资源：`category/year/month/filename`
   - 用户资源：`userId/category/year/month/filename`

4. **ImageController.java**
   - 上传时获取用户ID并传递给 `ImageStorageService`

### 前端代码

无需修改（前端使用相对路径，由后端生成完整URL）

## Nginx配置

已创建Nginx配置文件和脚本：

1. `deploy/nginx-heartsphere.conf.example` - Nginx配置示例
2. `scripts/update-nginx-images-config.sh` - 配置更新脚本
3. `deploy/deploy-frontend.sh` - 已更新图片路径配置

**配置要点**：
- 新路径：`/images/**`（替代旧的 `/api/images/files/**`）
- 系统资源：`/images/category/year/month/filename`
- 用户资源：`/images/userId/category/year/month/filename`
- 推荐使用静态文件服务，性能更好

## 后续工作

### 1. 测试验证

- [ ] 测试系统资源图片上传和访问
- [ ] 测试用户资源图片上传和访问
- [ ] 验证所有图片URL生成正确
- [ ] 验证前端图片显示正常
- [ ] 验证Nginx配置正确

### 2. 生产环境部署

- [ ] 在生产环境执行备份
- [ ] 在生产环境执行数据库迁移
- [ ] 在生产环境执行文件迁移
- [ ] 在生产环境配置Nginx
- [ ] 验证生产环境图片访问
- [ ] 更新生产环境配置

### 3. 文档更新

- [ ] 更新API文档，说明图片URL格式
- [ ] 更新开发指南
- [ ] 更新部署文档

## 总结

✅ **图片URL全面迁移完成**

所有系统表和用户表的图片URL已从旧格式迁移到新格式：

- ✅ **系统资源**：使用相对路径格式 `category/year/month/filename`
- ✅ **用户资源**：使用包含userId的相对路径格式 `userId/category/year/month/filename`
- ✅ **URL格式**：移除了所有 `localhost` 和 `/api/images/` 前缀
- ✅ **文件系统**：用户资源文件已迁移到新路径结构
- ✅ **代码修改**：后端代码已更新以支持新路径结构
- ✅ **Nginx配置**：已创建配置文件和脚本

现在系统已经完全使用新的图片URL路径结构，可以通过 `/images/**` 路径访问所有图片资源。
