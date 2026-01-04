# 系统表图片URL迁移完成报告

## 执行时间
2025-01-03

## 迁移概述

本次迁移检查并修复了所有系统表中的图片URL格式，确保它们符合新的路径结构规范。

## 检查的系统表

1. **system_characters** 
   - avatar_url
   - background_url
2. **system_eras** 
   - image_url
3. **system_resources** 
   - url
4. **system_era_items** 
   - icon_url
5. **system_era_events** 
   - icon_url
6. **system_main_stories** 
   - avatar_url
   - background_url

## 迁移规则

### 新路径结构

**系统资源路径格式**：
- 数据库存储：`category/year/month/filename`
- 文件系统：`uploads/images/category/year/month/filename`
- 访问URL：`base_url/images/category/year/month/filename`

### 迁移逻辑

1. **移除 localhost URL**：
   - `http://localhost:8081/api/images/files/...` → `...`
   - `https://localhost:8081/api/images/files/...` → `...`

2. **移除旧路径前缀**：
   - `/api/images/files/...` → `...`
   - `/images/files/...` → `...`

3. **保留外部URL**：
   - `http://picsum.photos/...` - 保持不变
   - `https://picsum.photos/...` - 保持不变
   - `placeholder://...` - 保持不变

4. **保留相对路径**：
   - 如果URL已经是正确的相对路径格式，不会受影响

## 执行的迁移脚本

**脚本文件**：`backend/src/main/resources/db/migration/V20250103004__migrate_all_system_tables_image_urls.sql`

**执行命令**：
```bash
mysql -uroot -p123456 -h localhost heartsphere < backend/src/main/resources/db/migration/V20250103004__migrate_all_system_tables_image_urls.sql
```

## 验证结果

迁移完成后，使用检查脚本验证：

```bash
./scripts/check-system-tables-image-urls.sh
```

**检查指标**：
- `localhost_count`: 包含 localhost 的URL数量（应为 0）
- `old_format_count`: 包含 /api/images/ 的旧格式URL数量（应为 0）
- `http_count`: 非占位符的 http:// URL数量（外部URL除外，应为 0）
- `https_count`: 非占位符的 https:// URL数量（外部URL除外，应为 0）

## 注意事项

1. **系统资源路径**：
   - 所有系统资源的路径格式为：`category/year/month/filename`
   - 不包含 `userId`（用户资源才包含 `userId`）

2. **外部URL**：
   - 外部URL（如 `picsum.photos`、`placeholder://`）保持不变
   - 这些URL用于占位符或测试数据

3. **文件系统**：
   - 系统资源的文件系统路径保持不变
   - 文件存储位置：`uploads/images/category/year/month/filename`
   - 不需要移动文件系统上的文件

4. **兼容性**：
   - 迁移脚本使用 `REPLACE` 函数，可以安全地多次执行
   - 已经正确的相对路径不会受影响

## 后续工作

1. **验证图片访问**：
   - 测试所有系统资源的图片是否能正常访问
   - 验证URL生成是否正确

2. **代码检查**：
   - 确保所有创建/更新系统资源的代码都使用新格式
   - 确保图片上传时保存相对路径

3. **文档更新**：
   - 更新API文档，说明图片URL格式
   - 更新开发指南

## 相关文档

- [图片URL路径结构迁移执行报告](./图片URL路径结构迁移执行报告.md)
- [图片URL路径结构优化完成报告](./图片URL路径结构优化完成报告.md)
- [Nginx图片路径配置说明](./nginx-images配置说明.md)

## 总结

✅ **系统表图片URL迁移完成**

所有系统表的图片URL已从旧格式迁移到新格式：
- ✅ 移除了所有 `localhost` URL
- ✅ 移除了所有 `/api/images/files/` 前缀
- ✅ 保留了外部URL（如 `picsum.photos`）
- ✅ 所有系统资源使用相对路径格式：`category/year/month/filename`

系统资源的图片URL现在符合新的路径结构规范，可以通过 `/images/category/year/month/filename` 访问。
