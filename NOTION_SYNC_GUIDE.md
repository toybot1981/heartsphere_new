# Notion 日记同步使用指南

## 功能概述

本功能允许将心域（HeartSphere）中的日记条目同步到 Notion，方便您在 Notion 中管理和查看日记。

## 前置条件

1. **已完成 Notion OAuth 授权**
   - 在应用中完成 Notion 授权
   - 确保授权状态为"已授权"

2. **在 Notion 中创建数据库或页面**
   - 登录 Notion
   - 创建一个新的数据库（Database）或页面（Page）
   - 记录数据库或页面的 ID

## 如何获取 Notion 数据库/页面 ID

### 方法 1: 从 URL 获取

1. 在 Notion 中打开您的数据库或页面
2. 查看浏览器地址栏的 URL
3. URL 格式类似：`https://www.notion.so/your-workspace/DATABASE_ID?v=...`
4. 复制 `DATABASE_ID` 部分（32 位字符，包含连字符）

### 方法 2: 使用 Notion API 查询

可以通过 API 查询您的工作区和数据库列表（需要开发工具）。

## 配置步骤

### 步骤 1: 在 Notion 中创建数据库（推荐）

1. 在 Notion 中创建一个新的数据库
2. 建议的数据库结构：
   - **标题** (Title): 日记标题
   - **日期** (Date): 日记日期
   - **标签** (Multi-select): 日记标签
   - **内容** (Text): 日记内容（可选，因为内容会在页面中）

3. 记录数据库 ID

### 步骤 2: 配置数据库 ID（待实现）

目前需要在代码中配置数据库 ID，或者通过管理后台配置。

**临时方案**：数据库 ID 会存储在 `NoteSync.refreshToken` 字段中（当前存储的是 workspace_id）。

**未来改进**：在管理后台添加数据库 ID 配置选项。

## 使用方法

### 通过 API 同步

1. **获取授权状态**
   ```bash
   GET /api/notes/syncs/notion/status
   Authorization: Bearer {your_token}
   ```

2. **开始同步**
   ```bash
   POST /api/notes/syncs/notion/sync
   Authorization: Bearer {your_token}
   ```

3. **查看同步结果**
   响应示例：
   ```json
   {
     "code": 200,
     "message": "同步完成",
     "data": {
       "success": true,
       "syncedCount": 10,
       "error": null
     }
   }
   ```

### 通过前端界面同步

1. 打开应用
2. 进入笔记同步设置
3. 点击"同步到 Notion"按钮
4. 等待同步完成

## 同步内容说明

同步到 Notion 的日记包含以下信息：

- **标题**: 日记的标题
- **日期**: 日记的创建日期
- **标签**: 日记的标签（如果有）
- **关联信息**:
  - 世界（World）
  - 时代（Era）
  - 角色（Character）
- **内容**: 日记的完整内容

## 注意事项

1. **API 限流**
   - Notion API 有速率限制
   - 同步时会自动添加延迟（300ms/条）
   - 大量日记同步可能需要较长时间

2. **数据库 ID 配置**
   - 确保数据库 ID 正确
   - 数据库必须对您的集成可见
   - 集成必须有权限在该数据库中创建页面

3. **权限要求**
   - Notion 集成需要有"插入内容"权限
   - 数据库必须对集成开放访问

4. **同步策略**
   - 当前实现：每次同步都会创建新页面
   - 未来改进：支持增量同步（只同步新日记）
   - 未来改进：支持更新已同步的日记

## 故障排查

### 错误：未配置 Notion 父页面/数据库 ID

**解决方案**：
1. 在 Notion 中创建数据库或页面
2. 获取数据库/页面 ID
3. 配置到系统中（当前需要修改数据库或通过管理后台）

### 错误：权限不足

**解决方案**：
1. 检查 Notion 集成的权限设置
2. 确保集成有"插入内容"权限
3. 确保数据库对集成可见

### 错误：API 限流

**解决方案**：
1. 等待一段时间后重试
2. 减少单次同步的日记数量
3. 分批同步

### 同步失败但部分成功

- 系统会继续同步其他日记
- 查看日志了解具体失败原因
- 可以重新同步失败的日记

## 未来改进计划

1. **增量同步**
   - 只同步新增或修改的日记
   - 避免重复创建页面

2. **双向同步**
   - 支持从 Notion 同步回心域
   - 支持在 Notion 中编辑后同步回心域

3. **配置界面**
   - 在管理后台配置数据库 ID
   - 在用户界面选择同步目标数据库

4. **同步历史**
   - 记录同步历史
   - 显示同步状态和错误信息

5. **批量操作**
   - 支持选择特定日记同步
   - 支持按标签、日期筛选同步

## API 参考

### 同步日记

```http
POST /api/notes/syncs/notion/sync
Authorization: Bearer {token}
```

**响应**:
```json
{
  "code": 200,
  "message": "同步完成",
  "data": {
    "success": true,
    "syncedCount": 10,
    "error": null
  }
}
```

### 获取同步状态

```http
GET /api/notes/syncs/notion/status
Authorization: Bearer {token}
```

**响应**:
```json
{
  "code": 200,
  "message": "获取状态成功",
  "data": {
    "authorized": true,
    "lastSyncAt": "2025-12-18T22:00:00",
    "syncStatus": "success"
  }
}
```

## 技术支持

如遇到问题，请：
1. 查看后端日志：`tail -f /tmp/backend.log`
2. 检查 Notion API 响应
3. 确认配置是否正确
