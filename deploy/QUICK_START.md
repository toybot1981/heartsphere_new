# 快速部署指南

## 5分钟快速部署

### 步骤 1: 配置环境变量（2分钟）

```bash
# 1. 创建环境变量文件
sudo mkdir -p /opt/heartsphere
sudo cp deploy/env.template /opt/heartsphere/.env
sudo chmod 600 /opt/heartsphere/.env

# 2. 编辑环境变量（必须修改数据库配置）
sudo vi /opt/heartsphere/.env
```

**最小配置示例：**
```bash
# 数据库配置（必须修改）
DB_NAME=heartsphere
DB_USER=root
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=3306

# JWT密钥（使用命令生成：openssl rand -base64 32）
JWT_SECRET=your-generated-secret-key-here
```

### 步骤 2: 一键部署（3分钟）

```bash
cd deploy
sudo ./deploy-all.sh
```

脚本会自动：
- ✅ 安装 Java 17、Maven、Node.js 18、Nginx
- ✅ 构建前后端项目
- ✅ 配置并启动服务
- ✅ 检查服务状态

### 步骤 3: 验证部署

```bash
# 检查后端服务
curl http://localhost:8081/api/health

# 检查前端服务
curl http://localhost/

# 查看服务状态
systemctl status heartsphere-backend
systemctl status nginx
```

## 数据库导入（可选）

如果已有数据库备份，可以导入：

```bash
# 导入到本地数据库
sudo ./import-database.sh /path/to/backup/directory

# 导入到远程数据库
sudo ./import-database.sh /path/to/backup/directory heartsphere remote-host.com root password 3306
```

## 常见问题

### Q: 部署失败怎么办？
A: 查看日志：
```bash
journalctl -u heartsphere-backend -n 50
journalctl -u nginx -n 50
```

### Q: 如何修改配置？
A: 编辑环境变量后重启服务：
```bash
sudo vi /opt/heartsphere/.env
sudo systemctl restart heartsphere-backend
sudo systemctl restart nginx
```

### Q: 如何更新代码？
A: 重新运行部署脚本：
```bash
cd deploy
sudo ./deploy-all.sh
```

## 下一步

- 配置大模型 API Key（在 `.env` 文件中）
- 配置微信登录（可选）
- 配置 SSL 证书（生产环境）
- 设置自动备份（cron job）

详细文档请参考 [README.md](README.md)

