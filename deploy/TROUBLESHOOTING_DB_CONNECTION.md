# 数据库连接问题排查指南

## 错误现象

```
Unable to open JDBC Connection for DDL execution
Communications link failure
The last packet sent successfully to the server was 0 milliseconds ago.
```

## 排查步骤

### 1. 测试数据库连接

在远程服务器上运行：

```bash
cd /opt/heartsphere/deploy
./test-db-connection.sh
```

或指定.env文件路径：

```bash
./test-db-connection.sh /opt/heartsphere/.env
```

### 2. 检查环境变量配置

确保 `.env` 文件存在且包含正确的数据库配置：

```bash
# 查看.env文件位置
ls -la /opt/heartsphere/.env
ls -la /opt/heartsphere/backend/.env

# 检查环境变量（密码会被隐藏）
cat /opt/heartsphere/.env | grep DB_
```

必需的变量：
- `DB_HOST` - 数据库主机地址
- `DB_PORT` - 数据库端口（默认3306）
- `DB_NAME` - 数据库名称
- `DB_USER` - 数据库用户名
- `DB_PASSWORD` - 数据库密码

### 3. 检查数据库服务状态

```bash
# MySQL/MariaDB
sudo systemctl status mysql
# 或
sudo systemctl status mariadb

# 如果服务未运行，启动它
sudo systemctl start mysql
```

### 4. 检查网络连接

测试端口是否可达：

```bash
# 使用nc (netcat)
nc -zv <DB_HOST> 3306

# 或使用telnet
telnet <DB_HOST> 3306

# 或使用bash内置功能
timeout 5 bash -c "echo > /dev/tcp/<DB_HOST>/3306" && echo "连接成功" || echo "连接失败"
```

### 5. 检查MySQL远程连接配置

#### 5.1 检查bind-address设置

```bash
sudo grep bind-address /etc/mysql/mysql.conf.d/mysqld.cnf
sudo grep bind-address /etc/my.cnf
```

如果看到 `bind-address = 127.0.0.1`，需要修改为 `0.0.0.0` 或注释掉：

```bash
sudo sed -i 's/bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
sudo systemctl restart mysql
```

#### 5.2 检查用户权限

登录MySQL：

```bash
mysql -u root -p
```

检查用户是否存在并有权限：

```sql
-- 查看所有用户
SELECT user, host FROM mysql.user;

-- 检查特定用户的权限
SHOW GRANTS FOR 'your_db_user'@'%';

-- 如果用户不存在或权限不足，创建/授权
CREATE USER IF NOT EXISTS 'your_db_user'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON your_db_name.* TO 'your_db_user'@'%';
FLUSH PRIVILEGES;
```

### 6. 检查防火墙设置

#### CentOS/RHEL (firewalld):

```bash
# 查看防火墙状态
sudo firewall-cmd --list-all

# 允许MySQL端口
sudo firewall-cmd --permanent --add-service=mysql
sudo firewall-cmd --reload

# 或直接开放端口
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
```

#### Ubuntu/Debian (ufw):

```bash
# 查看防火墙状态
sudo ufw status

# 允许MySQL端口
sudo ufw allow 3306/tcp
```

#### 使用iptables:

```bash
# 查看规则
sudo iptables -L -n

# 添加规则（如果需要）
sudo iptables -A INPUT -p tcp --dport 3306 -j ACCEPT
sudo iptables-save
```

### 7. 检查systemd服务配置

确认服务文件正确加载了.env文件：

```bash
# 查看服务文件
cat /etc/systemd/system/heartsphere-backend.service

# 应该包含：
# EnvironmentFile=/opt/heartsphere/.env
```

如果没有，运行：

```bash
cd /opt/heartsphere/deploy
./start-backend-prod.sh
```

### 8. 验证环境变量是否正确加载

在服务运行时检查环境变量：

```bash
# 查看服务的环境变量（需要root权限）
sudo systemctl show heartsphere-backend --property=Environment
sudo systemctl show heartsphere-backend --property=EnvironmentFile
```

### 9. 查看详细日志

```bash
# 查看后端服务日志
sudo journalctl -u heartsphere-backend -f

# 查看最近的错误
sudo journalctl -u heartsphere-backend -n 100 --no-pager

# 查看MySQL错误日志
sudo tail -f /var/log/mysql/error.log
# 或
sudo tail -f /var/log/mariadb/mariadb.log
```

## 常见问题

### Q: 本地localhost可以连接，但远程IP不能连接

**A:** 这是典型的MySQL bind-address问题。

1. 检查 `bind-address` 设置（见步骤5.1）
2. 确保MySQL监听所有接口：`0.0.0.0`
3. 重启MySQL服务

### Q: 用户权限不足

**A:** MySQL用户需要正确的host权限。

```sql
-- 允许从任何IP连接
GRANT ALL PRIVILEGES ON database_name.* TO 'username'@'%' IDENTIFIED BY 'password';

-- 允许从特定IP连接
GRANT ALL PRIVILEGES ON database_name.* TO 'username'@'192.168.1.%' IDENTIFIED BY 'password';

-- 刷新权限
FLUSH PRIVILEGES;
```

### Q: 防火墙阻止连接

**A:** 确保防火墙允许3306端口（见步骤6）

### Q: 数据库不存在

**A:** 创建数据库：

```sql
CREATE DATABASE IF NOT EXISTS heartsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Q: .env文件存在但环境变量未生效

**A:** 检查以下几点：

1. .env文件路径是否正确
2. systemd服务文件是否包含 `EnvironmentFile`
3. 文件权限是否正确（chmod 600）
4. 重启服务：`sudo systemctl restart heartsphere-backend`

## 快速修复命令

如果确定是配置问题，可以使用以下命令快速修复：

```bash
# 1. 创建/更新.env文件
cd /opt/heartsphere/deploy
./create-env-file.sh

# 2. 测试数据库连接
./test-db-connection.sh

# 3. 更新systemd服务（如果需要）
./start-backend-prod.sh

# 4. 重启服务
sudo systemctl restart heartsphere-backend

# 5. 查看日志确认
sudo journalctl -u heartsphere-backend -f
```

## 联系支持

如果以上步骤都无法解决问题，请提供以下信息：

1. `test-db-connection.sh` 的完整输出
2. `sudo journalctl -u heartsphere-backend -n 50` 的输出
3. MySQL错误日志
4. `cat /opt/heartsphere/.env` 的输出（隐藏敏感信息）
