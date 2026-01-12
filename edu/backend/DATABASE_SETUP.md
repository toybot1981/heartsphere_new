# HeartSphere Edu 数据库设置指南

本文档说明如何设置和初始化 HeartSphere Edu 数据库。

## 📋 前置要求

- **MySQL**: 8.0 或更高版本
- **MySQL 客户端**: 命令行工具或图形化工具
- **数据库权限**: 创建数据库和表的权限

## 🚀 快速开始

### 方法 1: 使用初始化脚本（推荐）

1. **设置环境变量（可选）**:
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=heartsphere_edu
```

2. **运行初始化脚本**:
```bash
cd edu/backend
./init-database.sh
```

### 方法 2: 手动创建数据库

1. **登录 MySQL**:
```bash
mysql -u root -p
```

2. **创建数据库**:
```sql
CREATE DATABASE IF NOT EXISTS heartsphere_edu 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
```

3. **验证数据库**:
```sql
USE heartsphere_edu;
SHOW TABLES;
```

## 📊 数据库迁移

数据库表的创建由 **Flyway** 自动完成。当后端服务启动时，Flyway 会自动执行 `src/main/resources/db/migration/` 目录下的迁移脚本。

### 迁移脚本列表

1. **V20260110__create_edu_characters_table.sql**
   - 创建 `edu_characters` 表（数字人角色表）

2. **V20260110_01__create_edu_character_interactions_table.sql**
   - 创建 `edu_character_interactions` 表（互动记录表）

### 查看迁移状态

后端服务启动后，Flyway 会自动创建 `flyway_schema_history` 表记录迁移历史。

查看迁移历史：
```sql
USE heartsphere_edu;
SELECT * FROM flyway_schema_history;
```

## ⚙️ 数据库配置

### application.yml 配置

```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:heartsphere_edu}?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai&connectionCollation=utf8mb4_unicode_ci
    username: ${DB_USER:root}
    password: ${DB_PASSWORD:123456}
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### 环境变量配置

可以通过环境变量自定义数据库配置：

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=heartsphere_edu
export DB_USER=root
export DB_PASSWORD=your_password
```

### 使用配置文件（不推荐）

直接在 `application.yml` 中配置（不推荐用于生产环境）：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/heartsphere_edu?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
```

## 🔍 验证数据库连接

### 1. 使用 MySQL 客户端

```bash
mysql -h localhost -P 3306 -u root -p heartsphere_edu
```

### 2. 查看表结构

```sql
USE heartsphere_edu;

-- 查看所有表
SHOW TABLES;

-- 查看表结构
DESCRIBE edu_characters;
DESCRIBE edu_character_interactions;
DESCRIBE flyway_schema_history;
```

### 3. 查看表数据

```sql
-- 查看数字人角色
SELECT * FROM edu_characters LIMIT 10;

-- 查看互动记录
SELECT * FROM edu_character_interactions LIMIT 10;

-- 查看迁移历史
SELECT * FROM flyway_schema_history;
```

## 🐛 故障排除

### 问题 1: 无法连接到数据库

**错误信息**: `Communications link failure` 或 `Access denied`

**解决方案**:
1. 检查 MySQL 服务是否运行：
```bash
# macOS/Linux
sudo systemctl status mysql
# 或
pgrep -x mysqld

# macOS (Homebrew)
brew services list | grep mysql
```

2. 检查数据库连接配置：
   - 主机地址 (`DB_HOST`)
   - 端口号 (`DB_PORT`)
   - 用户名 (`DB_USER`)
   - 密码 (`DB_PASSWORD`)

3. 检查用户权限：
```sql
SHOW GRANTS FOR 'root'@'localhost';
```

### 问题 2: 数据库不存在

**错误信息**: `Unknown database 'heartsphere_edu'`

**解决方案**:
1. 运行初始化脚本：
```bash
cd edu/backend
./init-database.sh
```

2. 或手动创建数据库（见"快速开始"部分）

### 问题 3: Flyway 迁移失败

**错误信息**: `Migration checksum mismatch` 或 `Migration failed`

**解决方案**:
1. 检查迁移脚本语法：
```bash
cd edu/backend/src/main/resources/db/migration
mysql -u root -p heartsphere_edu < V20260110__create_edu_characters_table.sql
```

2. 检查 `flyway_schema_history` 表：
```sql
USE heartsphere_edu;
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC;
```

3. 如果需要重置数据库（**警告**: 会删除所有数据）：
```sql
DROP DATABASE IF EXISTS heartsphere_edu;
CREATE DATABASE heartsphere_edu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题 4: 字符编码问题

**错误信息**: 中文乱码

**解决方案**:
1. 确保数据库使用 `utf8mb4` 字符集：
```sql
ALTER DATABASE heartsphere_edu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 确保连接 URL 包含正确的字符编码参数：
```
characterEncoding=UTF-8&connectionCollation=utf8mb4_unicode_ci
```

## 📝 数据库备份和恢复

### 备份数据库

```bash
mysqldump -u root -p heartsphere_edu > heartsphere_edu_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 恢复数据库

```bash
mysql -u root -p heartsphere_edu < heartsphere_edu_backup_YYYYMMDD_HHMMSS.sql
```

## 🔐 安全建议

1. **生产环境**:
   - 使用强密码
   - 限制数据库访问 IP
   - 使用 SSL 连接
   - 定期备份数据库

2. **开发环境**:
   - 使用环境变量存储敏感信息
   - 不要在代码中硬编码密码
   - 使用 `.env` 文件（不要提交到版本控制）

## 📚 相关文档

- [部署文档](./DEPLOYMENT.md)
- [README](../README.md)
- [Flyway 文档](https://flywaydb.org/documentation/)

---

**最后更新：2026-01-11**
