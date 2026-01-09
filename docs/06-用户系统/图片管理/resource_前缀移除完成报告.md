# resource_ 前缀移除完成报告

## 执行时间
2026-01-07

## 问题描述

文件系统中实际使用的是 `character/`、`era/` 等目录，而不是 `resource_character/`、`resource_era/`。但数据库中的 URL 使用了 `resource_` 前缀，导致图片无法正常访问。

## 修复内容

### 1. 数据库修复

**文件**: `backend/scripts/fix_resource_prefix_to_category.sql`

**修复规则**:
- `resource_character` → `character`
- `resource_era` → `era`
- `resource_journal` → `journal`
- `resource_avatar` → `character`（avatar 存储在 character 目录）
- `resource_scenario` → `character`（scenario 存储在 character 目录）
- `resource_item` → `item`
- `resource_general` → `general`

**修复的表**:
- `system_resources` - 系统资源表
- `system_characters` - 系统角色表
- `system_eras` - 系统时代表
- `system_main_stories` - 系统主线故事表

### 2. 后端代码修复

**文件**: `backend/src/main/java/com/heartsphere/admin/service/SystemResourceService.java`

**修改前**:
```java
String imageUrl = imageStorageService.saveImage(file, "resource_" + category);
```

**修改后**:
```java
String imageUrl = imageStorageService.saveImage(file, category);
```

### 3. 前端代码修复

**文件**: `frontend/admin/components/ResourcesManagement.tsx`

**修改前**:
```typescript
const baseCategory = editingResource?.category || ...;
const category = 'resource_' + baseCategory;
```

**修改后**:
```typescript
const category = editingResource?.category || ...;
```

## 修复结果

### 数据库验证

所有表的 `resource_` 前缀已全部移除：
- ✅ `system_resources`: 0 条剩余
- ✅ `system_characters`: 0 条剩余
- ✅ `system_eras`: 0 条剩余
- ✅ `system_main_stories`: 0 条剩余

### 文件系统结构

实际的文件系统结构：
```
uploads/images/
  ├── character/     # 角色相关图片
  ├── era/           # 时代相关图片
  ├── journal/       # 日记相关图片
  └── general/       # 通用图片
```

### URL 格式

**修复后的 URL 格式**:
- `character/2025/12/filename.png`
- `era/2025/12/filename.png`
- `journal/2025/12/filename.png`

**不再使用**:
- ~~`resource_character/2025/12/filename.png`~~
- ~~`resource_era/2025/12/filename.png`~~

## 相关文件

### 脚本文件
- `backend/scripts/fix_resource_prefix_to_category.sql` - 修复脚本

### 代码文件
- `backend/src/main/java/com/heartsphere/admin/service/SystemResourceService.java` - 后端服务
- `frontend/admin/components/ResourcesManagement.tsx` - 前端组件

## 后续影响

### 新上传的资源

新创建的系统资源将直接使用 `category` 作为存储路径，不再添加 `resource_` 前缀：
- 创建资源时：`category = "character"` → 存储路径：`character/2025/12/filename.png`
- 编辑资源时：同样使用 `category`，不添加前缀

### 现有资源

所有现有资源的 URL 已更新为正确的格式，与文件系统结构匹配。

## 验证方法

可以执行以下查询验证：

```sql
-- 检查是否还有 resource_ 前缀
SELECT 
    'system_resources' as table_name,
    COUNT(*) as still_has_resource_prefix
FROM system_resources
WHERE url LIKE '%/resource_%' OR url LIKE 'resource_%';
```

所有表的 `still_has_resource_prefix` 应该为 0。

## 总结

✅ **修复完成**：
- 所有数据库中的 `resource_` 前缀已移除
- 后端代码已修复，新上传的资源不再使用 `resource_` 前缀
- 前端代码已修复，编辑资源时不再使用 `resource_` 前缀
- URL 格式与文件系统结构完全匹配

现在所有图片 URL 都与实际的文件系统结构一致，图片应该可以正常访问了。
