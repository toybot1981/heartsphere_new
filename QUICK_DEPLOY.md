# 快速部署指南

## 阿里云 ECS Aliyun Cloud Linux 一键部署

### 前置准备

1. **购买阿里云 ECS 实例**
   - 推荐配置：2核4GB，40GB SSD
   - 操作系统：Aliyun Cloud Linux 2/3

2. **配置安全组**
   - 开放端口 80（HTTP）
   - 开放端口 8081（后端 API，可选）
   - 开放端口 22（SSH）

3. **连接到服务器**
   ```bash
   ssh root@your-server-ip
   ```

### 一键部署步骤

#### 步骤 1: 上传项目文件

在本地执行：

```bash
# 打包项目（排除 node_modules 和 target 目录）
tar --exclude='node_modules' \
    --exclude='target' \
    --exclude='.git' \
    --exclude='*.log' \
    -czf heartsphere.tar.gz heartsphere_new/

# 上传到服务器
scp heartsphere.tar.gz root@your-server-ip:/root/
```

#### 步骤 2: 在服务器上解压并部署

```bash
# SSH 连接到服务器
ssh root@your-server-ip

# 解压项目
cd /root
tar -xzf heartsphere.tar.gz
cd heartsphere_new

# 执行部署脚本
chmod +x deploy.sh deploy-backend.sh deploy-frontend.sh
./deploy.sh
```

#### 步骤 3: 配置数据库密码

部署脚本会自动安装 MySQL，首次启动需要设置 root 密码：

```bash
# 获取临时密码
grep 'temporary password' /var/log/mysqld.log

# 使用临时密码登录并修改
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
FLUSH PRIVILEGES;
```

#### 步骤 4: 配置环境变量

```bash
# 编辑环境配置
vi /opt/heartsphere/.env

# 修改数据库密码
DB_PASSWORD=YourStrongPassword123!

# 生成 JWT 密钥（如果还没有）
JWT_SECRET=$(openssl rand -base64 32)
# 将生成的密钥填入 .env 文件

# 配置大模型 API Key（重要！）
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
QWEN_API_KEY=your-qwen-api-key
DOUBAO_API_KEY=your-doubao-api-key
```

或者使用配置脚本：

```bash
# 使用交互式配置脚本
chmod +x configure-api-keys.sh
./configure-api-keys.sh
```

#### 步骤 5: 重新构建前端（如果配置了 API Key）

如果修改了 API Key 配置，需要重新构建前端：

```bash
# 重新构建前端以应用 API Key 配置
cd /root/heartsphere_new
./deploy-frontend.sh
```

#### 步骤 6: 重启服务

```bash
# 重启后端服务
systemctl restart heartsphere-backend

# 重启前端服务（Nginx）
systemctl restart nginx

# 检查服务状态
systemctl status heartsphere-backend
systemctl status nginx

# 查看日志确认启动成功
journalctl -u heartsphere-backend -n 50
```

### 验证部署

1. **检查后端服务**
   ```bash
   curl http://localhost:8081/api/health
   # 或者
   curl http://your-server-ip:8081/api/health
   ```

2. **检查前端服务**
   ```bash
   curl http://localhost
   # 或者浏览器访问
   http://your-server-ip
   ```

3. **检查服务状态**
   ```bash
   systemctl status heartsphere-backend
   systemctl status nginx
   ```

### 常见问题

#### 问题 1: 后端服务启动失败

**解决方案：**
```bash
# 查看详细日志
journalctl -u heartsphere-backend -n 100

# 常见原因：
# 1. 数据库连接失败 - 检查 .env 中的数据库配置
# 2. 端口被占用 - netstat -tlnp | grep 8081
# 3. Java 版本不对 - java -version
```

#### 问题 2: 前端无法访问后端 API

**解决方案：**
```bash
# 检查 Nginx 配置
nginx -t

# 检查后端服务是否运行
systemctl status heartsphere-backend

# 检查防火墙
firewall-cmd --list-ports
```

#### 问题 3: 数据库连接失败

**解决方案：**
```bash
# 检查 MySQL 服务
systemctl status mysqld

# 检查数据库用户
mysql -u root -p
SELECT User, Host FROM mysql.user WHERE User='heartsphere';

# 重新创建数据库用户（如果需要）
CREATE USER 'heartsphere'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON heartsphere.* TO 'heartsphere'@'localhost';
FLUSH PRIVILEGES;
```

### 更新部署

#### 更新后端

```bash
cd /root/heartsphere_new/backend
# 如果有 git
git pull origin main
# 或者重新上传新版本

# 重新构建和部署
mvn clean package -DskipTests
cp target/*.jar /opt/heartsphere/backend/app.jar
systemctl restart heartsphere-backend
```

#### 更新前端

```bash
cd /root/heartsphere_new/frontend
# 如果有 git
git pull origin main
# 或者重新上传新版本

# 重新构建和部署
npm install
npm run build
rm -rf /opt/heartsphere/frontend/*
cp -r dist/* /opt/heartsphere/frontend/
systemctl restart nginx
```

### 服务管理命令

```bash
# 后端服务
systemctl start heartsphere-backend      # 启动
systemctl stop heartsphere-backend       # 停止
systemctl restart heartsphere-backend    # 重启
systemctl status heartsphere-backend     # 状态
journalctl -u heartsphere-backend -f     # 日志

# 前端服务（Nginx）
systemctl start nginx                    # 启动
systemctl stop nginx                     # 停止
systemctl restart nginx                  # 重启
systemctl status nginx                   # 状态
tail -f /var/log/nginx/heartsphere-error.log  # 错误日志
```

### 性能优化建议

1. **增加 JVM 内存**（如果服务器内存充足）
   ```bash
   vi /etc/systemd/system/heartsphere-backend.service
   # 修改 ExecStart 中的 -Xmx 参数
   ExecStart=/usr/bin/java -jar -Xms1g -Xmx2g ...
   systemctl daemon-reload
   systemctl restart heartsphere-backend
   ```

2. **启用 Nginx 缓存**
   ```bash
   # 编辑 Nginx 配置
   vi /etc/nginx/conf.d/heartsphere.conf
   # 添加缓存配置（参考 deploy/README.md）
   ```

3. **配置数据库连接池**
   ```bash
   # 在 application-prod.yml 中添加
   spring:
     datasource:
       hikari:
         maximum-pool-size: 20
         minimum-idle: 5
   ```

### 安全建议

1. **修改默认密码**
   - MySQL root 密码
   - 应用数据库用户密码
   - JWT 密钥

2. **配置防火墙**
   ```bash
   # 只开放必要端口
   firewall-cmd --permanent --remove-port=8081/tcp  # 如果不需要直接访问后端
   firewall-cmd --reload
   ```

3. **配置 SSL 证书**
   ```bash
   # 使用 Let's Encrypt
   yum install -y certbot python3-certbot-nginx
   certbot --nginx -d your-domain.com
   ```

4. **定期备份**
   ```bash
   # 设置自动备份（参考 deploy/README.md）
   ```

### 技术支持

如遇到问题，请提供以下信息：
- 系统版本：`cat /etc/os-release`
- Java 版本：`java -version`
- Node.js 版本：`node -v`
- 后端日志：`journalctl -u heartsphere-backend -n 100`
- 前端日志：`tail -100 /var/log/nginx/heartsphere-error.log`








