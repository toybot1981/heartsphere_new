# 数据库字符编码使用指南

## 问题说明

MySQL 命令行客户端默认使用 `latin1` 字符集，这会导致查询中文数据时显示乱码（如 `????`）。

**重要**：数据本身是正确的 UTF-8 编码，这只是客户端显示问题，不影响应用正常运行。

## 解决方案

### 方案1：使用便捷脚本（推荐）

使用项目提供的便捷脚本，自动设置 UTF-8 字符集：

```bash
# 执行 SQL 语句
bash backend/scripts/query_with_utf8.sh "SELECT * FROM system_resources LIMIT 10;"

# 执行 SQL 文件
bash backend/scripts/query_with_utf8.sh backend/scripts/check_data_encoding.sql

# 进入交互模式
bash backend/scripts/query_with_utf8.sh
```

### 方案2：命令行参数

每次查询时指定字符集：

```bash
mysql -h localhost -u root -p123456 heartsphere --default-character-set=utf8mb4
```

### 方案3：配置文件

创建 `~/.my.cnf` 文件（用户级别）或 `/etc/my.cnf`（系统级别）：

```ini
[client]
default-character-set=utf8mb4

[mysql]
default-character-set=utf8mb4
```

参考 `backend/scripts/.my.cnf.example` 文件。

### 方案4：连接后设置

连接数据库后执行：

```sql
SET NAMES utf8mb4;
```

## 验证

使用 UTF-8 字符集连接后，应该可以正常显示中文：

```bash
bash backend/scripts/query_with_utf8.sh "SELECT name FROM system_resources WHERE category='general' LIMIT 5;"
```

预期输出：
```
name
山川河流
森林秘境
海边日落
星空夜晚
现代都市
```

## 应用配置

应用代码已经正确配置 UTF-8，无需修改：

- `application.yml`: `characterEncoding=UTF-8`
- `connectionCollation=utf8mb4_unicode_ci`

应用运行时不会出现乱码问题。

## 相关文件

- `backend/scripts/query_with_utf8.sh` - UTF-8 查询便捷脚本
- `backend/scripts/.my.cnf.example` - MySQL 客户端配置示例
- `backend/scripts/fix_database_encoding.sql` - 数据库字符集修复脚本
- `backend/scripts/check_data_encoding.sql` - 数据编码检查脚本
