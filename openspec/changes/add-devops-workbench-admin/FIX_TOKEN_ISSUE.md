# DevOps 工作台 Token 获取问题修复

## 问题描述

前端控制台显示错误：
```
DevOpsWorkbench.tsx:52 No admin token found
```

但用户已经登录（AdminSidebar 显示 `adminRole: SUPER_ADMIN`），说明 token 已存储，但 DevOps 组件无法获取。

## 问题原因

**Token Key 名称不一致**：
- `AdminAuthContext` 和 `useAdminAuth` 使用 `'admin_token'` 作为 localStorage key
- DevOps 工作台组件使用 `'adminToken'` 作为 localStorage key
- 导致 DevOps 组件无法获取已存储的 token

## 修复方案

统一使用 `'admin_token'` 作为 token 存储 key，修复所有 DevOps 相关组件。

## 修复的文件

### 1. DevOpsWorkbench.tsx
- 修复了 4 处 `localStorage.getItem('adminToken')` → `localStorage.getItem('admin_token')`
- 位置：
  - `loadStatistics()` 方法
  - `loadScripts()` 方法
  - `loadExecutionHistory()` 方法
  - `handleDownloadLog()` 方法

### 2. ScheduledTasks.tsx
- 修复了 5 处 token 获取
- 位置：
  - `loadTasks()` 方法
  - `loadScripts()` 方法
  - `handleDelete()` 方法
  - `handleToggle()` 方法
  - `handleSave()` 方法

### 3. ExecutionDetail.tsx
- 修复了 3 处 token 获取
- 位置：
  - `loadDetail()` 方法
  - `handleCancel()` 方法
  - 日志下载功能

### 4. ScriptExecutor.tsx
- 修复了 1 处 token 获取
- 位置：
  - `handleExecute()` 方法

## 修复统计

- **修复文件数**: 4 个
- **修复位置数**: 13 处
- **统一 Key**: `'admin_token'`

## 验证

修复后，所有 DevOps 组件现在都使用统一的 token key：
```typescript
const token = localStorage.getItem('admin_token');
```

这与 `AdminAuthContext` 和 `useAdminAuth` 使用的 key 一致，确保可以正确获取已存储的 token。

## 测试建议

1. 刷新页面
2. 检查浏览器控制台，应该不再有 "No admin token found" 警告
3. 验证脚本列表可以正常加载
4. 验证脚本执行功能正常
5. 验证执行历史可以正常加载

## 相关文件

- `admin/frontend/src/contexts/AdminAuthContext.tsx` - 定义 token key 为 `'admin_token'`
- `admin/frontend/src/hooks/useAdminAuth.ts` - 使用 token key 为 `'admin_token'`
- `admin/frontend/src/components/DevOpsWorkbench/*.tsx` - 已修复为使用 `'admin_token'`
