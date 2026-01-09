# era 图片位置修复完成报告

## 执行时间
2026-01-07

## 问题描述

1. **文件系统问题**: era 相关的图片被错误地存储在 `character` 目录下
2. **数据库问题**: 资源表中还有 `resource_era` 路径，应该改为 `era`

## 修复内容

### 1. 数据库 URL 修复

**文件**: `backend/scripts/fix_era_images_location.sql`

**修复规则**:
- `character/...` → `era/...` (system_eras, system_resources category='era')
- `resource_era/...` → `era/...` (所有相关表)

**修复的表**:
- `system_eras.image_url` - 系统时代表
- `system_resources.url` (category='era') - 系统资源表

### 2. 文件系统修复

**文件**: `backend/scripts/move_era_files_from_character_to_era.sh`

**修复逻辑**:
1. 从数据库查询所有 era 相关的图片文件名
2. 在 `character` 目录下查找这些文件
3. 将找到的文件移动到 `era` 目录
4. 保持原有的年份/月份目录结构

**移动的文件**:
- 从 `character/2025/12/` 移动到 `era/2025/12/`
- 共移动了 22 个 era 相关的图片文件

### 3. 修复结果

**数据库验证**:
- ✅ `system_eras`: 0 条剩余问题
- ✅ `system_resources` (category='era'): 0 条剩余问题

**文件系统验证**:
- ✅ era 图片已从 character 目录移动到 era 目录
- ✅ 文件路径与数据库 URL 匹配

## 修复前后对比

### 修复前
- **文件系统**: era 图片存储在 `character/2025/12/` 目录
- **数据库 URL**: 部分使用 `character/...`，部分使用 `resource_era/...`

### 修复后
- **文件系统**: era 图片存储在 `era/2025/12/` 目录
- **数据库 URL**: 统一使用 `era/...` 格式

## 相关文件

### 脚本文件
- `backend/scripts/check_era_images_in_wrong_location.sql` - 检查脚本
- `backend/scripts/fix_era_images_location.sql` - 数据库修复脚本
- `backend/scripts/move_era_files_from_character_to_era.sh` - 文件系统移动脚本

## 验证方法

### 1. 检查数据库
```sql
-- 检查是否还有问题
SELECT COUNT(*) 
FROM system_eras 
WHERE image_url LIKE 'character/%' OR image_url LIKE 'resource_era/%';

SELECT COUNT(*) 
FROM system_resources 
WHERE category = 'era' 
  AND (url LIKE 'character/%' OR url LIKE 'resource_era/%');
```

### 2. 检查文件系统
```bash
# 检查 era 目录下的文件
find backend/uploads/images/era -type f | wc -l

# 检查 character 目录下是否还有 era 相关的文件（应该没有）
```

## 总结

✅ **修复完成**：
- 所有 era 相关的图片已从 character 目录移动到 era 目录
- 数据库中的 URL 已全部更新为 `era/...` 格式
- 文件系统结构与数据库 URL 完全匹配

现在 era 相关的图片都存储在正确的 `era` 目录下，图片应该可以正常访问了。
