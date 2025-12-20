# Notion 数据库 ID 配置指南

## 问题说明

同步失败的错误信息：
```
404 Not Found: Could not find page with ID: 8c916df3-7fc1-81b5-b59f-0003c2b3777d
Make sure the relevant pages and databases are shared with your integration.
```

这是因为系统使用了错误的 ID（workspace_id）作为数据库 ID。

## 解决步骤

### 步骤 1: 在 Notion 中创建数据库

1. 登录 Notion
2. 创建一个新的数据库（Database）
   - 点击左侧菜单的 "+" 号
   - 选择 "Table" 或 "Database"
   - 或者使用模板创建

3. **重要**：配置数据库结构（可选但推荐）
   - **标题** (Title): 用于显示日记标题
   - **日期** (Date): 用于显示日记日期
   - **标签** (Multi-select): 用于显示日记标签

### 步骤 2: 将数据库分享给集成

1. 打开您创建的数据库
2. 点击右上角的 "Share" 或 "分享" 按钮
3. 在搜索框中输入您的集成名称（在 Notion 开发者门户中创建的名称）
4. 选择您的集成，并确保它有访问权限
5. 点击 "Invite" 或 "邀请"

### 步骤 3: 获取数据库 ID

1. 在 Notion 中打开您的数据库
2. 查看浏览器地址栏的 URL
3. URL 格式类似：
   ```
   https://www.notion.so/your-workspace/DATABASE_ID?v=...
   ```
4. 复制 `DATABASE_ID` 部分（32 位字符，包含连字符）
   - 例如：`8c916df3-7fc1-81b5-b59f-0003c2b3777d`
   - **注意**：不要包含 URL 中的其他部分，只复制 ID

### 步骤 4: 在应用中配置数据库 ID

1. 打开应用，进入笔记同步设置
2. 找到 "Notion 数据库 ID" 配置区域
3. 粘贴您复制的数据库 ID
4. 点击 "更新" 按钮
5. 等待更新成功提示

### 步骤 5: 测试同步

1. 配置完成后，点击 "立即同步" 按钮
2. 查看同步结果
3. 如果成功，您的日记将出现在 Notion 数据库中

## 常见问题

### Q: 如何确认数据库 ID 是否正确？

A: 数据库 ID 应该是：
- 32 位字符
- 包含连字符（-）
- 格式类似：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Q: 同步仍然失败，提示 404 错误

A: 请检查：
1. 数据库 ID 是否正确（没有多余的空格或字符）
2. 数据库是否已分享给您的集成
3. 集成是否有访问数据库的权限

### Q: 如何找到我的集成名称？

A: 
1. 访问：https://www.notion.so/my-integrations
2. 找到您创建的集成
3. 集成名称就是您在创建时设置的名字

### Q: 可以在同一个数据库中同步多个用户的日记吗？

A: 可以，但建议为每个用户创建单独的数据库，或者使用数据库的属性来区分不同用户的日记。

## API 使用

如果您想通过 API 直接更新数据库 ID：

```bash
PUT /api/notes/syncs/notion/database-id
Authorization: Bearer {token}
Content-Type: application/json

{
  "databaseId": "your-database-id-here"
}
```

## 注意事项

1. **数据库必须与集成共享**：这是最重要的步骤，否则会一直报 404 错误
2. **数据库 ID 会变化**：如果您删除并重新创建数据库，ID 会改变，需要重新配置
3. **权限要求**：集成需要有"插入内容"权限才能创建页面
4. **数据库结构**：虽然系统会自动创建页面，但建议在数据库中配置合适的属性（标题、日期、标签等）

## 下一步

配置完成后，您可以：
- 立即同步现有日记到 Notion
- 设置自动同步（未来功能）
- 在 Notion 中查看和管理您的日记
