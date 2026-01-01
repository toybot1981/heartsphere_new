# HeartSphere 阿里云 ECS 部署指南

## 概述

本指南提供了在阿里云 ECS 上部署 HeartSphere 应用的完整步骤。

## 前置要求

1. **服务器环境**
   - 阿里云 ECS 实例（建议 2核4G 或更高配置）
   - CentOS 7+ 或 Ubuntu 18.04+
   - root 权限

2. **数据库**
   - 阿里云 RDS MySQL 实例
   - 已创建数据库和用户
   - 已配置白名单（允许 ECS 实例 IP 访问）

3. **域名**
   - 已备案的域名（如 heartsphere.cn）
   - 已解析到 ECS 公网 IP

## 部署步骤

### 1. 连接服务器

```bash
ssh root@your-server-ip
```

### 2. 上传项目代码

在本地机器上：

```bash
# 打包项目（排除 node_modules 和 target）
cd /path/to/heartsphere_new
tar --exclude='node_modules' --exclude='backend/target' \
    --exclude='frontend/dist' --exclude='.git' \
    -czf heartsphere_new.tar.gz .

# 上传到服务器
scp heartsphere_new.tar.gz root@your-server-ip:/root/
```

在服务器上：

```bash
cd /root
tar -xzf heartsphere_new.tar.gz
cd heartsphere_new
```

### 3. 部署后端服务

```bash
cd deploy
sudo ./deploy-backend.sh
```

**配置提示：**

1. **数据库主机地址**
   - 输入：阿里云 RDS 的内网地址（推荐）或公网地址
   - 示例：`rm-bp1bg7xxnka508amyvo.mysql.rds.aliyuncs.com`

2. **数据库端口**
   - 默认：`3306`
   - 回车使用默认值

3. **数据库名称**
   - 默认：`heartsphere`
   - 回车使用默认值

4. **数据库用户名**
   - 默认：`heartsphere`
   - 回车使用默认值

5. **数据库密码**
   - 输入：数据库用户密码
   - **注意：密码输入时不会显示**

6. **后端端口**
   - 默认：`8081`
   - 回车使用默认值

7. **域名**
   - 输入：您的域名
   - 示例：`heartsphere.cn`

8. **JWT 密钥**
   - 推荐选择：`1`（自动生成）
   - 或选择 `2` 手动输入（至少 32 位）

**部署完成后：**
- 后端服务会自动启动
- Nginx 反向代理会自动配置
- 环境变量文件保存在：`/opt/heartsphere/.env`

### 4. 部署前端服务

```bash
cd deploy
sudo ./deploy-frontend.sh
```

**配置提示：**

1. **部署环境**
   - 选择：`2`（生产环境）
   - 根路径：`/`（默认）

2. **域名**
   - 输入：您的域名
   - 示例：`heartsphere.cn`

3. **前端端口**
   - 默认：`80`
   - 回车使用默认值

4. **后端端口**
   - 默认：`8081`
   - 回车使用默认值

**重要说明：**
- 前端 API 使用相对路径（`/api`）
- Nginx 会自动将 `/api` 请求代理到后端服务
- 前端静态文件由 Nginx 直接提供

**部署完成后：**
- 前端静态文件部署到：`/opt/heartsphere/frontend`
- Nginx 配置保存在：`/etc/nginx/conf.d/heartsphere-frontend.conf`

### 5. 验证部署

```bash
# 检查后端服务
sudo systemctl status heartsphere-backend

# 检查 Nginx
sudo systemctl status nginx

# 测试前端
curl http://your-domain/

# 测试后端 API
curl http://your-domain/api/health
```

## 服务管理

### 启动所有服务

```bash
cd deploy
sudo ./start-services.sh
```

### 停止所有服务

```bash
cd deploy
sudo ./stop-services.sh
```

### 单独管理服务

```bash
# 后端服务
sudo systemctl start heartsphere-backend    # 启动
sudo systemctl stop heartsphere-backend     # 停止
sudo systemctl restart heartsphere-backend  # 重启
sudo systemctl status heartsphere-backend   # 状态

# Nginx 服务
sudo systemctl start nginx                  # 启动
sudo systemctl stop nginx                   # 停止
sudo systemctl restart nginx                # 重启
sudo systemctl status nginx                 # 状态
```

## 查看日志

```bash
# 后端日志
sudo journalctl -u heartsphere-backend -f

# Nginx 访问日志
sudo tail -f /var/log/nginx/heartsphere-frontend-access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/heartsphere-frontend-error.log
```

## 配置说明

### 环境变量文件

位置：`/opt/heartsphere/.env`

```bash
# 查看配置
sudo cat /opt/heartsphere/.env

# 编辑配置
sudo vi /opt/heartsphere/.env

# 修改后重启服务
sudo systemctl restart heartsphere-backend
```

### Nginx 配置

- 前端配置：`/etc/nginx/conf.d/heartsphere-frontend.conf`
- 后端配置：`/etc/nginx/conf.d/heartsphere-backend.conf`

```bash
# 测试配置
sudo nginx -t

# 重新加载配置（不中断服务）
sudo systemctl reload nginx

# 重启 Nginx
sudo systemctl restart nginx
```

## 故障排查

### 后端服务无法启动

```bash
# 运行诊断脚本
cd deploy
sudo ./check-backend-service.sh

# 运行修复脚本
sudo ./fix-backend-service.sh

# 查看详细日志
sudo journalctl -u heartsphere-backend -n 100
```

### Nginx 配置错误

```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 数据库连接失败

```bash
# 检查数据库配置
sudo cat /opt/heartsphere/.env | grep DB_

# 测试数据库连接
mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p <DB_NAME>
```

### 端口被占用

```bash
# 检查端口占用
sudo netstat -tlnp | grep 8081
sudo netstat -tlnp | grep 80

# 查看占用进程
sudo lsof -i :8081
sudo lsof -i :80
```

## 更新部署

### 更新后端

```bash
# 1. 上传新代码
cd /root/heartsphere_new
# git pull 或重新上传

# 2. 重新部署
cd deploy
sudo ./deploy-backend.sh
```

### 更新前端

```bash
# 1. 上传新代码
cd /root/heartsphere_new
# git pull 或重新上传

# 2. 重新部署
cd deploy
sudo ./deploy-frontend.sh
```

## 安全建议

1. **防火墙配置**
   ```bash
   # 只开放必要端口
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --permanent --add-service=https
   sudo firewall-cmd --permanent --add-service=ssh
   sudo firewall-cmd --reload
   ```

2. **使用 HTTPS**
   - 申请 SSL 证书（Let's Encrypt 免费证书）
   - 配置 Nginx SSL

3. **定期备份**
   - 数据库备份
   - 配置文件备份
   - 上传文件备份

4. **系统更新**
   ```bash
   # CentOS
   sudo yum update -y
   
   # Ubuntu
   sudo apt-get update && sudo apt-get upgrade -y
   ```

## 性能优化

1. **JVM 参数调整**（如果服务器内存充足）
   ```bash
   sudo vi /etc/systemd/system/heartsphere-backend.service
   # 修改 -Xmx 参数（例如：-Xmx2048m）
   sudo systemctl daemon-reload
   sudo systemctl restart heartsphere-backend
   ```

2. **Nginx 性能优化**
   - 启用 Gzip 压缩（已配置）
   - 配置静态资源缓存（已配置）
   - 调整 worker 进程数

## 联系支持

如遇到问题，请提供：
1. 诊断脚本输出：`sudo ./check-backend-service.sh`
2. 服务日志：`sudo journalctl -u heartsphere-backend -n 100`
3. Nginx 日志：`sudo tail -n 100 /var/log/nginx/error.log`
