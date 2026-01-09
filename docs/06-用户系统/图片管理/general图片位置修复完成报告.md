# General 图片位置修复完成报告

## 修复时间
2025-01-05

## 问题描述
General 图片被错误地存储到了 `character` 目录中，需要移动到正确的 `general` 目录。

## 修复步骤

### 1. 检查问题
执行 `backend/scripts/check_general_images_location.sql` 检查数据库中的 general 图片位置。

**检查结果：**
- 数据库中的 URL 已经正确指向 `general/...` 目录
- 但物理文件可能还在 `character` 目录中

### 2. 修复数据库 URL
执行 `backend/scripts/fix_general_images_location.sql` 修复数据库中的 URL。

**修复内容：**
- 将 `resource_general/` 改为 `general/`
- 将错误位置的 `character/` 改为 `general/`
- 将错误位置的 `era/` 改为 `general/`
- 将 `resource_character/` 改为 `general/`（当 category='general' 时）

**修复结果：**
- ✅ 所有 general 相关的 URL 都已正确指向 `general/...` 目录
- ✅ 剩余问题数：0

### 3. 移动物理文件
执行 `backend/scripts/move_general_files_from_character.sh` 将物理文件从 `character` 目录移动到 `general` 目录。

**移动结果：**
- ✅ 成功移动了 21 个 general 图片文件
- ✅ 所有文件都已从 `character/2025/12/` 移动到 `general/2025/12/`

## 验证结果

### 数据库验证
- ✅ 所有 `system_resources` (category='general') 的 URL 都正确指向 `general/...` 目录
- ✅ 没有剩余问题

### 文件系统验证
- ✅ General 图片文件已正确存储在 `general/` 目录下
- ✅ Character 目录中不再有 general 相关的文件

## 相关文件

### SQL 脚本
- `backend/scripts/check_general_images_location.sql` - 检查 general 图片位置
- `backend/scripts/fix_general_images_location.sql` - 修复数据库 URL

### Shell 脚本
- `backend/scripts/move_general_files_from_character.sh` - 移动物理文件

## 总结

✅ **修复完成**
- 数据库 URL 已全部修复为 `general/...` 格式
- 物理文件已从 `character` 目录移动到 `general` 目录
- 文件系统结构与数据库 URL 完全匹配

现在所有 general 图片都存储在正确的 `general` 目录下，可以正常访问。
