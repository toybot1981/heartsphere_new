# 手动执行数据库查询指南

由于自动脚本需要数据库密码，您可以选择以下方式之一执行查询：

## 方式一：使用 MySQL 命令行（需要密码）

```bash
# 1. 快速统计查询
mysql -u root -p heartsphere < backend/scripts/query_general_images_count.sql

# 2. 详细报告查询（保存到文件）
mysql -u root -p heartsphere < backend/scripts/generate_general_images_report.sql > migration_report.txt

# 3. 查看报告
cat migration_report.txt
```

## 方式二：使用数据库管理工具（推荐）

### 使用 MySQL Workbench、Navicat、DBeaver 等工具：

1. **打开数据库管理工具**
2. **连接到数据库** (heartsphere)
3. **执行统计查询**:
   - 打开文件: `backend/scripts/query_general_images_count.sql`
   - 执行查询
   - 查看结果

4. **执行详细报告查询**:
   - 打开文件: `backend/scripts/generate_general_images_report.sql`
   - 执行查询
   - 导出结果到 CSV 或保存查询结果

## 方式三：使用后端 API（如果已实现）

如果后端有管理 API，可以通过 API 查询。

## 查询结果解读

### 统计查询结果示例：
```
table_name          | condition                    | count
--------------------|------------------------------|------
system_resources    | category=general或url包含general | 10
characters          | avatar_url或background_url包含general | 5
journal_entries     | image_url包含general         | 3
...
```

### 详细报告结果包含：
- 每个记录的 ID、名称、URL
- 问题类型（如：路径包含general，应该迁移到journal）
- 创建时间

## 根据结果确定迁移方案

查看统计结果后：
1. **如果数量为 0**: 说明数据库中没有使用 general 的记录，可能只是文件系统中有文件
2. **如果数量 > 0**: 需要根据详细报告确定迁移规则

## 下一步

查询完成后：
1. 记录需要迁移的记录数量
2. 确认迁移规则
3. 准备执行迁移脚本（第三步）
