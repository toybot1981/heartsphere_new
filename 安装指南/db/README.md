# 数据库导出文件

本目录用于存放从 MySQL 导出的 `heartsphere` 库，便于在新环境中导入。

## 文件说明

- **heartsphere.sql**：`heartsphere` 数据库全量导出（结构 + 数据），由 `mysqldump -u root -p heartsphere` 生成。

## 导入到新数据库

1. 创建数据库（若尚未创建）：
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS heartsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

2. 导入：
   ```bash
   mysql -u root -p heartsphere < heartsphere.sql
   ```
   或将本路径替换为项目内路径：`mysql -u root -p heartsphere < 安装指南/db/heartsphere.sql`

3. 确认 Main、Admin 的环境变量（如 `DB_NAME`、`DB_USER`、`DB_PASSWORD`）与新库一致。

## 重新导出（更新本目录中的备份）

在项目根目录执行：

```bash
mysqldump -u root -p123456 heartsphere > 安装指南/db/heartsphere.sql
```

请根据实际 MySQL 用户名和密码修改 `-u` 和 `-p` 参数；`-p` 与密码之间无空格。
