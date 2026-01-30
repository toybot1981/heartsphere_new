# Mentis 表迁移指南

## 概述

本指南说明如何将 `heartsphere` 数据库中的所有 mentis 相关表迁移到 `heartsphere_mentis` 数据库。

## 需要迁移的表

以下 8 个表需要从 `heartsphere` 迁移到 `heartsphere_mentis`：

1. **mcp_service_templates** - MCP 服务模板表
2. **mcp_server_configs** - MCP 服务器配置表
3. **tool_configs** - 工具配置表
4. **mentis_agent_configs** - Mentis Agent 配置表
5. **mentis_sessions** - Mentis 会话表
6. **mentis_messages** - Mentis 消息表
7. **mentis_tasks** - Mentis 任务表
8. **mentis_vm_states** - Mentis 虚拟机状态表

## 迁移步骤

### 1. 备份数据库（重要！）

在执行迁移之前，请先备份两个数据库：

```bash
# 备份 heartsphere 数据库
mysqldump -u root -p heartsphere > heartsphere_backup_$(date +%Y%m%d_%H%M%S).sql

# 备份 heartsphere_mentis 数据库（如果已存在）
mysqldump -u root -p heartsphere_mentis > heartsphere_mentis_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. 确保 heartsphere_mentis 数据库存在

```sql
CREATE DATABASE IF NOT EXISTS `heartsphere_mentis` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
```

### 3. 执行迁移脚本

```bash
mysql -u root -p < scripts/migrate-mentis-tables-to-heartsphere-mentis.sql
```

或者使用 MySQL 客户端：

```sql
SOURCE /path/to/scripts/migrate-mentis-tables-to-heartsphere-mentis.sql;
```

### 4. 验证迁移结果

执行脚本末尾的验证查询，确认所有表的数据都已正确迁移。

也可以手动检查：

```sql
USE heartsphere_mentis;

-- 检查表是否存在
SHOW TABLES LIKE 'mcp%';
SHOW TABLES LIKE 'tool%';
SHOW TABLES LIKE 'mentis%';

-- 检查每个表的记录数
SELECT COUNT(*) FROM mcp_service_templates;
SELECT COUNT(*) FROM mcp_server_configs;
SELECT COUNT(*) FROM tool_configs;
SELECT COUNT(*) FROM mentis_agent_configs;
SELECT COUNT(*) FROM mentis_sessions;
SELECT COUNT(*) FROM mentis_messages;
SELECT COUNT(*) FROM mentis_tasks;
SELECT COUNT(*) FROM mentis_vm_states;
```

### 5. 验证数据完整性

比较源数据库和目标数据库的记录数：

```sql
-- 在 heartsphere 数据库中
USE heartsphere;
SELECT 'mcp_service_templates' AS table_name, COUNT(*) AS count FROM mcp_service_templates
UNION ALL SELECT 'mcp_server_configs', COUNT(*) FROM mcp_server_configs
UNION ALL SELECT 'tool_configs', COUNT(*) FROM tool_configs
UNION ALL SELECT 'mentis_agent_configs', COUNT(*) FROM mentis_agent_configs
UNION ALL SELECT 'mentis_sessions', COUNT(*) FROM mentis_sessions
UNION ALL SELECT 'mentis_messages', COUNT(*) FROM mentis_messages
UNION ALL SELECT 'mentis_tasks', COUNT(*) FROM mentis_tasks
UNION ALL SELECT 'mentis_vm_states', COUNT(*) FROM mentis_vm_states;

-- 在 heartsphere_mentis 数据库中执行相同的查询，比较结果
```

### 6. 更新应用配置

确保以下配置已更新：

1. **admin/backend/src/main/resources/application.yml**
   - mentis 数据源的 URL 已设置为 `heartsphere_mentis`（已完成）

2. **mentis/backend/src/main/resources/application.yml**
   - 确保 mentis 后端使用 `heartsphere_mentis` 数据库

### 7. 测试应用

迁移完成后，重启相关服务并测试：

1. 重启 admin 后端服务
2. 重启 mentis 后端服务
3. 测试 Mentis 管理功能
4. 测试 MCP 配置管理
5. 测试工具管理
6. 测试 Agent 角色管理

### 8. 清理（可选）

如果迁移成功且应用运行正常，可以考虑从 `heartsphere` 数据库中删除这些表：

```sql
USE heartsphere;

-- 注意：删除前请确保已备份！
DROP TABLE IF EXISTS `mentis_vm_states`;
DROP TABLE IF EXISTS `mentis_tasks`;
DROP TABLE IF EXISTS `mentis_messages`;
DROP TABLE IF EXISTS `mentis_sessions`;
DROP TABLE IF EXISTS `mentis_agent_configs`;
DROP TABLE IF EXISTS `tool_configs`;
DROP TABLE IF EXISTS `mcp_server_configs`;
DROP TABLE IF EXISTS `mcp_service_templates`;
```

## 表依赖关系

迁移脚本已按正确的顺序创建表，以处理外键依赖：

1. `mcp_service_templates` （无依赖）
2. `mcp_server_configs` （依赖 `mcp_service_templates`）
3. `tool_configs` （无依赖）
4. `mentis_agent_configs` （无依赖）
5. `mentis_sessions` （无依赖，但被其他表引用）
6. `mentis_messages` （依赖 `mentis_sessions`）
7. `mentis_tasks` （依赖 `mentis_sessions`）
8. `mentis_vm_states` （依赖 `mentis_sessions`）

## 注意事项

1. **外键约束**：迁移脚本在开始时禁用了外键检查（`SET FOREIGN_KEY_CHECKS=0`），在结束时重新启用（`SET FOREIGN_KEY_CHECKS=1`），以确保数据迁移的顺利进行。

2. **数据冲突**：如果目标表中已存在数据，脚本使用 `ON DUPLICATE KEY UPDATE` 来处理冲突，会更新 `updated_at` 字段。

3. **字符集**：所有表都使用 `utf8mb4` 字符集和 `utf8mb4_unicode_ci` 排序规则。

4. **索引和约束**：迁移脚本会创建所有必要的索引和外键约束。

5. **AUTO_INCREMENT**：主键的 AUTO_INCREMENT 值会从源表继承。

## 回滚方案

如果迁移出现问题，可以使用备份恢复：

```bash
# 恢复 heartsphere 数据库
mysql -u root -p heartsphere < heartsphere_backup_YYYYMMDD_HHMMSS.sql

# 恢复 heartsphere_mentis 数据库（如果需要）
mysql -u root -p heartsphere_mentis < heartsphere_mentis_backup_YYYYMMDD_HHMMSS.sql
```

## 故障排查

### 问题 1: 表已存在错误

如果遇到 "Table already exists" 错误，可以：
- 先删除目标数据库中的表，然后重新执行迁移脚本
- 或者修改脚本，在创建表前先检查表是否存在

### 问题 2: 外键约束错误

如果遇到外键约束错误：
- 检查源数据库中的外键关系是否完整
- 确保按正确的顺序迁移数据（脚本已处理）

### 问题 3: 数据不匹配

如果迁移后的数据与源数据不匹配：
- 检查字符集和排序规则是否一致
- 检查是否有数据类型转换问题
- 比较源表和目标表的结构是否完全一致

## 联系支持

如果遇到问题，请检查：
1. 数据库连接配置
2. 用户权限
3. 数据库版本兼容性
4. 日志文件中的错误信息
