# Mentis 数据库表迁移说明

## 问题描述

如果遇到错误：`Table 'heartsphere.mentis_sessions' doesn't exist`，说明数据库迁移脚本还没有执行。

## 解决方法

### 方法一：自动迁移（推荐）

重启后端服务，Flyway 会自动执行迁移脚本：
- 迁移脚本位置：`src/main/resources/db/migration/V20250106__create_mentis_tables.sql`
- 脚本会在应用启动时自动执行

### 方法二：手动执行迁移

如果需要手动执行，可以使用以下方式：

#### 1. 使用 MySQL 命令行

```bash
mysql -u your_username -p heartsphere < src/main/resources/db/migration/V20250106__create_mentis_tables.sql
```

#### 2. 在 MySQL 客户端中执行

```sql
-- 连接到数据库
USE heartsphere;

-- 执行迁移脚本内容
-- 或者直接导入文件
SOURCE /path/to/V20250106__create_mentis_tables.sql;
```

### 方法三：检查 Flyway 迁移状态

如果后端正在运行，可以检查 Flyway 的迁移状态：

1. 查看后端日志，搜索 "Flyway" 相关日志
2. 检查数据库中是否存在 `flyway_schema_history` 表
3. 查询该表查看迁移历史：

```sql
SELECT * FROM flyway_schema_history WHERE script LIKE '%mentis%' ORDER BY installed_rank DESC;
```

## 创建的表

迁移脚本会创建以下表：

1. **mentis_sessions** - 会话表
2. **mentis_tasks** - 任务表
3. **mentis_messages** - 消息表
4. **mentis_vm_states** - 虚拟机状态表

## 验证迁移

执行以下 SQL 验证表是否已创建：

```sql
SHOW TABLES LIKE 'mentis%';
```

应该看到：
- mentis_sessions
- mentis_tasks
- mentis_messages
- mentis_vm_states

## 注意事项

- 确保数据库用户有足够的权限创建表和索引
- 迁移脚本使用 `CREATE TABLE IF NOT EXISTS`，可以安全地重复执行
- 如果表已存在，脚本不会覆盖现有数据
