# 用户表图片URL迁移完成报告

## 执行时间
2025-01-03

## 迁移概述

本次迁移检查并修复了所有用户相关表中的图片URL格式，确保它们符合新的路径结构规范（包含userId）。

## 检查的用户表

1. **characters**（用户角色表）
   - avatar_url
   - background_url

2. **eras**（用户时代表）
   - image_url

3. **user_main_stories**（用户主线故事表）
   - avatar_url
   - background_url

## 路径规范

### 用户资源路径格式

**数据库存储**：`userId/category/year/month/filename`

**文件系统**：`uploads/images/userId/category/year/month/filename`

**访问URL**：`base_url/images/userId/category/year/month/filename`

### 示例

- 用户ID为 `114` 的角色头像：
  - 数据库：`114/character/2025/12/example.png`
  - 文件系统：`uploads/images/114/character/2025/12/example.png`
  - 访问URL：`http://your-domain.com/images/114/character/2025/12/example.png`

## 迁移规则

### 1. URL格式转换

移除以下前缀：
- `http://localhost:8081/api/images/files/`
- `https://localhost:8081/api/images/files/`
- `/api/images/files/`
- `/images/files/`

### 2. 保留外部URL

以下URL保持不变：
- `http://picsum.photos/...`
- `https://picsum.photos/...`
- `placeholder://...`

### 3. 添加userId前缀

如果路径中还没有userId（格式为 `category/year/month/filename`），需要通过文件迁移脚本添加userId前缀，转换为 `userId/category/year/month/filename`。

## 执行的迁移脚本

**数据库URL迁移脚本**：`backend/src/main/resources/db/migration/V20250103005__migrate_user_tables_image_urls.sql`

**文件迁移脚本**：`scripts/migrate-user-image-files-v2.sh`（已执行）

**执行命令**：
```bash
# 1. 数据库URL格式转换
mysql -uroot -p123456 -h localhost heartsphere < backend/src/main/resources/db/migration/V20250103005__migrate_user_tables_image_urls.sql

# 2. 文件系统迁移（添加userId前缀）
./scripts/migrate-user-image-files-v2.sh
```

## 验证结果

迁移完成后，使用检查脚本验证：

```bash
./scripts/check-user-tables-image-urls.sh
```

**检查指标**：
- `localhost_count`: 包含 localhost 的URL数量（应为 0）
- `old_format_count`: 包含 /api/images/ 的旧格式URL数量（应为 0）
- `http_count`: 非占位符的 http:// URL数量（应为 0）
- `https_count`: 非占位符的 https:// URL数量（应为 0）
- `missing_userid_count`: 路径中缺少userId的记录数（需要通过文件迁移添加）

## 注意事项

1. **用户资源路径必须包含userId**：
   - 格式：`userId/category/year/month/filename`
   - 如果路径中没有userId，需要通过文件迁移脚本添加

2. **文件系统迁移**：
   - 文件从 `uploads/images/category/year/month/filename` 移动到 `uploads/images/userId/category/year/month/filename`
   - 数据库路径同步更新

3. **外部URL**：
   - 外部URL（如 `picsum.photos`、`placeholder://`）保持不变
   - 这些URL用于占位符或测试数据

4. **兼容性**：
   - 迁移脚本使用 `REPLACE` 函数，可以安全地多次执行
   - 已经正确的相对路径（包含userId）不会受影响

## 后续工作

1. **验证图片访问**：
   - 测试所有用户资源的图片是否能正常访问
   - 验证URL生成是否正确
   - 确认路径中包含userId

2. **代码检查**：
   - 确保所有创建/更新用户资源的代码都使用新格式
   - 确保图片上传时保存包含userId的路径

3. **文档更新**：
   - 更新API文档，说明用户资源图片URL格式
   - 更新开发指南

## 相关文档

- [图片URL路径结构迁移执行报告](./图片URL路径结构迁移执行报告.md)
- [系统表图片URL迁移完成报告](./系统表图片URL迁移完成报告.md)
- [图片URL路径结构优化完成报告](./图片URL路径结构优化完成报告.md)

## 总结

✅ **用户表图片URL迁移完成**

所有用户表的图片URL已从旧格式迁移到新格式：
- ✅ 移除了所有 `localhost` URL
- ✅ 移除了所有 `/api/images/files/` 前缀
- ✅ 保留了外部URL（如 `picsum.photos`）
- ✅ 所有用户资源使用包含userId的相对路径格式：`userId/category/year/month/filename`
- ✅ 文件系统已迁移到新路径结构

用户资源的图片URL现在符合新的路径结构规范，可以通过 `/images/userId/category/year/month/filename` 访问。
