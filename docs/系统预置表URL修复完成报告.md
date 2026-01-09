# 系统预置表 URL 修复完成报告

## 执行时间
2026-01-07

## 问题描述

系统预置表（system_characters、system_eras、system_main_stories）中的图片 URL 路径与资源管理（system_resources）不一致：
1. 部分记录的 URL 还包含 `general` 路径
2. 部分记录的 URL 直接使用 `character/` 或 `era/`，没有使用 `resource_` 前缀

## 修复内容

### 1. 修复脚本

**文件**: `backend/scripts/fix_system_tables_urls.sql`

**修复逻辑**:
- 将 URL 中的 `general` 替换为 `resource_character` 或 `resource_era`
- 将直接使用 `character/` 的 URL 更新为 `resource_character/`
- 将直接使用 `era/` 的 URL 更新为 `resource_era/`
- 保留占位符和外部 URL（placeholder://、http://、https://）

### 2. 修复的表和字段

#### system_characters 表
- `avatar_url`: 角色头像URL
- `background_url`: 角色背景图URL
- 修复规则: `general/` → `resource_character/`，`character/` → `resource_character/`

#### system_eras 表
- `image_url`: 时代背景图URL
- 修复规则: `general/` → `resource_era/`，`era/` → `resource_era/`

#### system_main_stories 表
- `avatar_url`: 主线故事头像URL
- `background_url`: 主线故事背景图URL
- 修复规则: `general/` → `resource_character/`，`character/` → `resource_character/`

### 3. 执行结果

**修复前统计**:
- system_characters: 约 50+ 条记录需要修复
- system_eras: 约 20+ 条记录需要修复
- system_main_stories: 需要检查

**修复后验证**:
- ✅ `system_characters.avatar_url`: 0 条剩余问题
- ✅ `system_characters.background_url`: 0 条剩余问题
- ✅ `system_eras.image_url`: 0 条剩余问题
- ✅ `system_main_stories.avatar_url`: 0 条剩余问题
- ✅ `system_main_stories.background_url`: 0 条剩余问题

## 修复规则

### URL 路径转换规则

| 原路径格式 | 新路径格式 | 适用表 |
|-----------|-----------|--------|
| `general/...` | `resource_character/...` | system_characters, system_main_stories |
| `character/...` | `resource_character/...` | system_characters, system_main_stories |
| `general/...` | `resource_era/...` | system_eras |
| `era/...` | `resource_era/...` | system_eras |

### 保留的 URL 格式

以下格式的 URL 不会被修改（保持原样）：
- `placeholder://...` - 占位符图片
- `http://...` - 外部 HTTP URL
- `https://...` - 外部 HTTPS URL

## 相关文件

### 脚本文件
- `backend/scripts/check_system_tables_urls.sql` - 检查脚本
- `backend/scripts/fix_system_tables_urls.sql` - 修复脚本
- `backend/scripts/execute_fix_system_tables.sh` - 执行脚本

### 日志文件
- `backend/migration_logs/fix_system_tables_YYYYMMDD_HHMMSS.log` - 修复日志

## 验证方法

可以执行以下查询验证修复结果：

```sql
-- 检查是否还有问题
SELECT 
    'system_characters' as table_name,
    'avatar_url' as field_name,
    COUNT(*) as remaining_count
FROM system_characters
WHERE (avatar_url LIKE '%/general/%' OR avatar_url LIKE 'general/%')
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';
```

所有表的 `remaining_count` 应该为 0。

## 后续建议

1. **验证**: 在系统预置角色、场景、主线故事页面中验证图片是否能正常显示
2. **监控**: 监控新创建的预置数据，确保 URL 格式正确
3. **一致性**: 确保所有系统预置表都使用 `resource_` 前缀格式，与 `system_resources` 保持一致

## 总结

✅ **修复完成**：
- 所有系统预置表的图片 URL 已更新为 `resource_` 前缀格式
- 与 `system_resources` 表的格式保持一致
- 所有验证检查通过（remaining_count = 0）

系统预置角色、场景、主线故事现在应该能够正确显示图片了。
