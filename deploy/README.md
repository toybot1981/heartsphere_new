# 心域系统部署文档

本目录包含完整的前后端部署脚本、环境变量配置和数据库导入导出工具。

## 📁 文件说明

### 部署脚本
- `deploy-all.sh` - 一键部署前后端（推荐）
- `deploy-backend.sh` - 仅部署后端服务
- `deploy-frontend.sh` - 仅部署前端服务

### 数据库脚本
- `export-database.sh` - 导出数据库到本地文件
- `import-database.sh` - 从备份文件导入数据库（支持远程MySQL）

### 配置文件
- `env.template` - 环境变量配置模板

## 🚀 快速开始

### 1. 准备工作

#### 1.1 配置环境变量
```bash
# 复制环境变量模板
cp deploy/env.template /opt/heartsphere/.env

# 编辑环境变量文件
vi /opt/heartsphere/.env
```

**必须配置的项：**
- `DB_NAME` - 数据库名
- `DB_USER` - 数据库用户
- `DB_PASSWORD` - 数据库密码
- `DB_HOST` - 数据库主机（本地使用 localhost，远程使用IP或域名）
- `DB_PORT` - 数据库端口（默认 3306）
- `JWT_SECRET` - JWT密钥（使用 `openssl rand -base64 32` 生成）

**可选配置的项：**
- 大模型 API Key（Gemini、OpenAI、Qwen、Doubao）
- 微信登录配置
- 图片存储路径

#### 1.2 确保有 root 权限
所有部署脚本需要 root 权限运行。

### 2. 一键部署（推荐）

```bash
cd deploy
./deploy-all.sh
```

这个脚本会：
1. 检查环境变量配置
2. 创建应用用户和目录
3. 部署后端服务（自动安装 Java、Maven）
4. 部署前端服务（自动安装 Node.js、Nginx）
5. 可选：导入数据库
6. 检查服务状态

### 3. 分步部署

#### 3.1 仅部署后端
```bash
./deploy-backend.sh
```

#### 3.2 仅部署前端
```bash
./deploy-frontend.sh
```

## 💾 数据库管理

### 导出数据库

#### 导出本地数据库
```bash
# 使用环境变量中的配置
./export-database.sh

# 或指定参数
./export-database.sh heartsphere /tmp/db_backup
```

#### 导出远程数据库
```bash
# 先配置环境变量中的数据库信息，或使用参数
DB_HOST=remote-host.com DB_USER=root DB_PASSWORD=password ./export-database.sh heartsphere /tmp/db_backup
```

**导出内容：**
- 数据库结构（表、索引、约束）
- 所有表的数据
- 存储过程和函数
- 自动生成的导入脚本

**输出位置：**
- 默认：`deploy/database_backup/heartsphere_YYYYMMDD_HHMMSS/`
- 包含压缩文件：`heartsphere_YYYYMMDD_HHMMSS.tar.gz`

### 导入数据库

#### 导入到本地数据库
```bash
# 使用最新备份
./import-database.sh

# 或指定备份目录
./import-database.sh /tmp/db_backup/heartsphere_20241224_120000
```

#### 导入到远程数据库
```bash
./import-database.sh \
  /tmp/db_backup/heartsphere_20241224_120000 \
  heartsphere \
  remote-host.com \
  root \
  password \
  3306
```

**参数说明：**
1. 备份目录（可选，默认使用最新备份）
2. 数据库名（默认：heartsphere）
3. 数据库主机（默认：localhost）
4. 数据库用户（默认：root）
5. 数据库密码（默认：从环境变量读取）
6. 数据库端口（默认：3306）

**导入过程：**
1. 测试数据库连接
2. 创建数据库（如果不存在）
3. 导入数据库结构
4. 导入所有表数据
5. 导入存储过程和函数
6. 验证导入结果

### 使用备份目录中的导入脚本

每个备份目录都包含一个 `import.sh` 脚本，可以直接使用：

```bash
cd /tmp/db_backup/heartsphere_20241224_120000
./import.sh heartsphere localhost root password 3306
```

## 🔧 服务管理

### 后端服务
```bash
# 启动
systemctl start heartsphere-backend

# 停止
systemctl stop heartsphere-backend

# 重启
systemctl restart heartsphere-backend

# 查看状态
systemctl status heartsphere-backend

# 查看日志
journalctl -u heartsphere-backend -f
```

### 前端服务（Nginx）
```bash
# 启动
systemctl start nginx

# 停止
systemctl stop nginx

# 重启
systemctl restart nginx

# 查看状态
systemctl status nginx

# 查看日志
journalctl -u nginx -f
# 或
tail -f /var/log/nginx/heartsphere-access.log
tail -f /var/log/nginx/heartsphere-error.log
```

## 📋 系统要求

### 后端
- **操作系统**: CentOS 7+, Ubuntu 18.04+, 或其他 Linux 发行版
- **Java**: OpenJDK 17+
- **Maven**: 3.6+
- **MySQL**: 8.0+（本地或远程）

### 前端
- **Node.js**: 18+
- **Nginx**: 1.18+

### 系统资源
- **内存**: 至少 2GB RAM
- **磁盘**: 至少 10GB 可用空间
- **CPU**: 2 核心以上推荐

## 🔍 故障排查

### 后端服务无法启动

1. **检查 Java 环境**
   ```bash
   java -version
   ```

2. **检查日志**
   ```bash
   journalctl -u heartsphere-backend -n 50
   ```

3. **检查数据库连接**
   ```bash
   mysql -h${DB_HOST} -u${DB_USER} -p${DB_PASSWORD} -e "SELECT 1;"
   ```

4. **检查端口占用**
   ```bash
   netstat -tlnp | grep 8081
   ```

### 前端服务无法访问

1. **检查 Nginx 状态**
   ```bash
   systemctl status nginx
   ```

2. **检查 Nginx 配置**
   ```bash
   nginx -t
   ```

3. **检查端口占用**
   ```bash
   netstat -tlnp | grep 80
   ```

4. **检查防火墙**
   ```bash
   # CentOS/RHEL
   firewall-cmd --list-ports
   firewall-cmd --add-port=80/tcp --permanent
   firewall-cmd --reload
   
   # Ubuntu
   ufw status
   ufw allow 80/tcp
   ```

### 数据库连接失败

1. **检查 MySQL 服务**
   ```bash
   systemctl status mysqld  # CentOS/RHEL
   systemctl status mysql   # Ubuntu
   ```

2. **测试连接**
   ```bash
   mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER} -p${DB_PASSWORD} -e "SELECT 1;"
   ```

3. **检查远程访问权限**
   ```sql
   -- 在 MySQL 中执行
   GRANT ALL PRIVILEGES ON *.* TO '用户名'@'%' IDENTIFIED BY '密码';
   FLUSH PRIVILEGES;
   ```

4. **检查防火墙**
   ```bash
   # 确保 MySQL 端口（3306）已开放
   firewall-cmd --list-ports
   firewall-cmd --add-port=3306/tcp --permanent
   firewall-cmd --reload
   ```

## 📝 注意事项

1. **首次部署前必须配置环境变量**
   - 复制 `env.template` 到 `/opt/heartsphere/.env`
   - 修改数据库配置和 API Key

2. **数据库导入前建议备份**
   - 导入会覆盖现有数据
   - 建议先导出现有数据库

3. **生产环境安全建议**
   - 使用强密码
   - 定期更新 JWT_SECRET
   - 配置防火墙规则
   - 使用 HTTPS（配置 SSL 证书）
   - 定期备份数据库

4. **性能优化**
   - 根据实际负载调整 JVM 内存参数
   - 配置 Nginx 缓存
   - 使用 CDN 加速静态资源

## 📞 支持

如遇到问题，请检查：
1. 系统日志：`journalctl -u heartsphere-backend -n 100`
2. Nginx 日志：`/var/log/nginx/heartsphere-error.log`
3. 应用日志：`/opt/heartsphere/logs/backend.log`

## 📄 许可证

本项目遵循相应的开源许可证。




