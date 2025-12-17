# 部署说明文档

## 数字生命体交互系统（心域）阿里云 ECS 部署指南

### 系统要求

- **操作系统**: Aliyun Cloud Linux 2/3
- **内存**: 至少 2GB RAM
- **磁盘**: 至少 20GB 可用空间
- **网络**: 需要开放端口 80 和 8081

### 快速部署

#### 1. 上传项目文件到服务器

```bash
# 在本地打包项目
tar -czf heartsphere.tar.gz heartsphere_new/

# 上传到服务器（使用 scp）
scp heartsphere.tar.gz root@your-server-ip:/root/

# 在服务器上解压
ssh root@your-server-ip
cd /root
tar -xzf heartsphere.tar.gz
cd heartsphere_new
```

#### 2. 执行部署脚本

```bash
# 赋予执行权限
chmod +x deploy.sh deploy-backend.sh deploy-frontend.sh

# 执行主部署脚本（会自动执行后端和前端部署）
./deploy.sh
```

#### 3. 配置数据库

部署脚本会自动安装 MySQL，但需要手动设置 root 密码：

```bash
# 运行 MySQL 安全配置
mysql_secure_installation

# 或者手动设置密码
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your-strong-password';
```

#### 4. 配置环境变量

编辑环境配置文件：

```bash
vi /opt/heartsphere/.env
```

配置以下内容：

```bash
# 数据库配置
DB_NAME=heartsphere
DB_USER=heartsphere
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=3306

# JWT 密钥（已自动生成）
JWT_SECRET=...

# 微信配置（可选）
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
WECHAT_REDIRECT_URI=http://your-domain.com/api/wechat/callback

# 图片存储配置
IMAGE_STORAGE_PATH=/opt/heartsphere/uploads/images
IMAGE_BASE_URL=http://your-domain.com/api/images

# ==================== 大模型 API Key 配置（重要！）====================
# Gemini (Google) - 推荐使用
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL_NAME=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
GEMINI_VIDEO_MODEL=veo-3.1-fast-generate-preview

# OpenAI (ChatGPT)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL_NAME=gpt-4o
OPENAI_IMAGE_MODEL=dall-e-3

# 通义千问 (Qwen)
QWEN_API_KEY=your-qwen-api-key-here
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL_NAME=qwen-max
QWEN_IMAGE_MODEL=qwen-image-plus
QWEN_VIDEO_MODEL=wanx-video

# 豆包 (Doubao)
DOUBAO_API_KEY=your-doubao-api-key-here
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL_NAME=ep-2024...
DOUBAO_IMAGE_MODEL=doubao-image-v1
DOUBAO_VIDEO_MODEL=doubao-video-v1

# 路由策略配置
TEXT_PROVIDER=gemini      # 文本生成首选提供商
IMAGE_PROVIDER=gemini     # 图片生成首选提供商
VIDEO_PROVIDER=gemini     # 视频生成首选提供商
AUDIO_PROVIDER=gemini     # 音频生成首选提供商
ENABLE_FALLBACK=true      # 是否启用自动降级
```

**或者使用交互式配置脚本：**

```bash
chmod +x configure-api-keys.sh
./configure-api-keys.sh
```

#### 5. 重启服务

```bash
# 重启后端服务
systemctl restart heartsphere-backend

# 重启前端服务（Nginx）
systemctl restart nginx
```

### 服务管理

#### 后端服务

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

#### 前端服务（Nginx）

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
tail -f /var/log/nginx/heartsphere-access.log
tail -f /var/log/nginx/heartsphere-error.log
```

### 更新部署

#### 更新后端

```bash
cd /root/heartsphere_new/backend
git pull  # 如果有使用 git
mvn clean package -DskipTests
cp target/*.jar /opt/heartsphere/backend/app.jar
systemctl restart heartsphere-backend
```

#### 更新前端

```bash
cd /root/heartsphere_new/frontend
git pull  # 如果有使用 git
npm install
npm run build
rm -rf /opt/heartsphere/frontend/*
cp -r dist/* /opt/heartsphere/frontend/
systemctl restart nginx
```

### 防火墙配置

#### 使用 firewalld（推荐）

```bash
# 开放端口
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=8081/tcp
firewall-cmd --reload

# 查看开放端口
firewall-cmd --list-ports
```

#### 使用 iptables

```bash
# 开放端口
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 8081 -j ACCEPT
iptables-save > /etc/sysconfig/iptables
```

### 阿里云安全组配置

在阿里云控制台配置安全组规则：

1. 登录阿里云控制台
2. 进入 ECS 实例管理
3. 选择安全组 -> 配置规则
4. 添加入站规则：
   - 端口 80（HTTP）
   - 端口 8081（后端 API，可选，如果只通过 Nginx 访问）

### 域名配置（可选）

如果需要使用域名访问：

1. 在 Nginx 配置中修改 `server_name`：

```bash
vi /etc/nginx/conf.d/heartsphere.conf
```

修改为：

```nginx
server_name your-domain.com www.your-domain.com;
```

2. 配置 SSL 证书（使用 Let's Encrypt）：

```bash
# 安装 certbot
yum install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
certbot renew --dry-run
```

### 故障排查

#### 后端服务无法启动

```bash
# 查看日志
journalctl -u heartsphere-backend -n 100

# 检查 Java 版本
java -version

# 检查端口占用
netstat -tlnp | grep 8081

# 检查数据库连接
mysql -u heartsphere -p -h localhost heartsphere
```

#### 前端无法访问

```bash
# 检查 Nginx 状态
systemctl status nginx

# 检查 Nginx 配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/heartsphere-error.log

# 检查文件权限
ls -la /opt/heartsphere/frontend/
```

#### 数据库连接失败

```bash
# 检查 MySQL 服务
systemctl status mysqld

# 检查数据库用户权限
mysql -u root -p
SHOW GRANTS FOR 'heartsphere'@'localhost';

# 测试连接
mysql -u heartsphere -p -h localhost heartsphere
```

### 性能优化

#### 后端 JVM 参数调整

编辑 systemd 服务文件：

```bash
vi /etc/systemd/system/heartsphere-backend.service
```

修改 JVM 参数：

```ini
ExecStart=/usr/bin/java -jar -Xms1g -Xmx2g -XX:+UseG1GC ${BACKEND_DIR}/app.jar
```

#### Nginx 性能优化

在 `/etc/nginx/nginx.conf` 中添加：

```nginx
worker_processes auto;
worker_connections 1024;

# 启用缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;
```

### 备份与恢复

#### 数据库备份

```bash
# 创建备份脚本
cat > /opt/heartsphere/backup-db.sh <<EOF
#!/bin/bash
BACKUP_DIR="/opt/heartsphere/backups"
mkdir -p $BACKUP_DIR
mysqldump -u heartsphere -p heartsphere > $BACKUP_DIR/heartsphere_$(date +%Y%m%d_%H%M%S).sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
EOF

chmod +x /opt/heartsphere/backup-db.sh

# 添加到 crontab（每天凌晨 2 点备份）
crontab -e
0 2 * * * /opt/heartsphere/backup-db.sh
```

#### 文件备份

```bash
# 备份上传的图片
tar -czf /opt/heartsphere/backups/images_$(date +%Y%m%d).tar.gz /opt/heartsphere/uploads/images/
```

### 监控

#### 使用 systemd 监控

```bash
# 设置自动重启
systemctl edit heartsphere-backend
```

添加：

```ini
[Service]
Restart=always
RestartSec=10
```

#### 日志轮转

创建日志轮转配置：

```bash
cat > /etc/logrotate.d/heartsphere <<EOF
/opt/heartsphere/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 heartsphere heartsphere
}
EOF
```

### 联系支持

如遇到问题，请查看：
- 后端日志：`journalctl -u heartsphere-backend -f`
- 前端日志：`tail -f /var/log/nginx/heartsphere-error.log`
- 系统日志：`dmesg | tail`





