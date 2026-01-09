# avatar 图片位置修复完成报告

## 执行时间
2026-01-07

## 问题描述

avatar 图片应该存储在 `character` 目录下，但可能存在以下问题：
1. 数据库中的 URL 使用了 `resource_avatar` 或 `avatar` 路径
2. 文件系统中的文件可能被错误地存储在 `era` 或其他目录下

## 修复内容

### 1. 数据库 URL 修复

**文件**: `backend/scripts/fix_avatar_images_location.sql`

**修复规则**:
- `resource_avatar/...` → `character/...`
- `avatar/...` → `character/...`
- `era/...` → `character/...` (错误位置的图片)
- `general/...` → `character/...` (错误位置的图片)
- `resource_character/...` → `character/...`

**修复的表**:
- `system_resources.url` (category='avatar') - 系统资源表
- `system_characters.avatar_url` - 系统角色表
- `system_main_stories.avatar_url` - 系统主线故事表

### 2. 文件系统修复

**文件**: `backend/scripts/move_avatar_files_to_character.sh`

**修复逻辑**:
1. 从数据库查询所有 avatar 相关的图片文件名
2. 在 `era` 和 `general` 目录下查找这些文件
3. 将找到的文件移动到 `character` 目录
4. 保持原有的年份/月份目录结构

### 3. 修复结果

**数据库验证**:
- ✅ `system_resources` (category='avatar'): 0 条剩余问题
- ✅ `system_characters`: 0 条剩余问题
- ✅ `system_main_stories`: 0 条剩余问题

**文件系统验证**:
- ✅ avatar 图片已从错误目录移动到 character 目录
- ✅ 文件路径与数据库 URL 匹配

## 修复前后对比

### 修复前
- **数据库 URL**: 可能使用 `resource_avatar/...`、`avatar/...`、`era/...` 等
- **文件系统**: avatar 图片可能存储在 `era/` 或其他目录

### 修复后
- **数据库 URL**: 统一使用 `character/...` 格式
- **文件系统**: avatar 图片存储在 `character/` 目录

## 相关文件

### 脚本文件
- `backend/scripts/check_avatar_images_location.sql` - 检查脚本
- `backend/scripts/fix_avatar_images_location.sql` - 数据库修复脚本
- `backend/scripts/move_avatar_files_to_character.sh` - 文件系统移动脚本

## 验证方法

### 1. 检查数据库
```sql
-- 检查是否还有问题
SELECT COUNT(*) 
FROM system_resources 
WHERE category = 'avatar' 
  AND (url LIKE 'resource_avatar/%' OR url LIKE 'avatar/%' OR url LIKE 'era/%');
```

### 2. 检查文件系统
```bash
# 检查 character 目录下的 avatar 文件
find backend/uploads/images/character -type f | wc -l

# 检查 era 目录下是否还有 avatar 相关的文件（应该没有）
```

## 总结

✅ **修复完成**：
- 所有 avatar 相关的图片 URL 已更新为 `character/...` 格式
- 文件系统中的 avatar 图片已移动到正确的 `character` 目录
- 数据库 URL 与文件系统结构完全匹配

现在所有 avatar 图片都存储在正确的 `character` 目录下，图片应该可以正常访问了。
