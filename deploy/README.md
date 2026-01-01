# HeartSphere 部署指南

本目录包含用于在阿里云 ECS 上部署 HeartSphere 应用的完整脚本。

## 脚本说明

### 1. 前端部署脚本 (`deploy-frontend.sh`)

用于部署前端 React 应用。

**功能：**
- 交互式配置部署环境（开发/生产/自定义路径）
- 自动安装 Node.js 和 Nginx
- 构建前端项目
- 配置 Nginx 反向代理
- API 使用相对地址，支持不同根路径

**使用方法：**
```bash
sudo ./deploy-frontend.sh
```

**配置项：**
- 部署环境选择（开发/生产/自定义）
- 根路径配置（默认为 `/`）
- 域名配置
- 前端端口（默认 80）
- 后端端口（默认 8081）

### 2. 后端部署脚本 (`deploy-backend.sh`)

用于部署后端 Spring Boot 应用。

**功能：**
- 交互式配置数据库连接参数
- 自动安装 Java 17 和 Maven
- 构建后端项目
- 配置 systemd 服务
- 配置 Nginx 反向代理

**使用方法：**
```bash
sudo ./deploy-backend.sh
```

**配置项：**
- 数据库主机地址
- 数据库端口（默认 3306）
- 数据库名称（默认 heartsphere）
- 数据库用户名（默认 heartsphere）
- 数据库密码
- 后端端口（默认 8081）
- 域名配置
- JWT 密钥（自动生成或手动输入）

### 3. Nginx 配置脚本 (`setup-nginx.sh`)

用于单独配置 Nginx 反向代理。

**使用方法：**
```bash
sudo ./setup-nginx.sh
```

### 4. 启动服务脚本 (`start-services.sh`)

启动所有服务（后端和 Nginx）。

**使用方法：**
```bash
sudo ./start-services.sh
```

### 5. 停止服务脚本 (`stop-services.sh`)

停止所有服务。

**使用方法：**
```bash
sudo ./stop-services.sh
```

### 6. 修复服务脚本 (`fix-backend-service.sh`)

诊断和修复后端服务启动问题。

**使用方法：**
```bash
sudo ./fix-backend-service.sh
```

### 7. 检查服务脚本 (`check-backend-service.sh`)

快速诊断后端服务问题。

**使用方法：**
```bash
sudo ./check-backend-service.sh
```

## 完整部署流程

### 第一步：准备服务器

1. 确保服务器已安装必要的系统工具
2. 确保有 root 权限
3. 确保网络连接正常

### 第二步：上传代码

将项目代码上传到服务器，例如：
```bash
# 在本地打包
tar -czf heartsphere_new.tar.gz heartsphere_new/

# 上传到服务器
scp heartsphere_new.tar.gz root@your-server-ip:/root/

# 在服务器上解压
ssh root@your-server-ip
cd /root
tar -xzf heartsphere_new.tar.gz
```

### 第三步：部署后端

```bash
cd /root/heartsphere_new/deploy
sudo ./deploy-backend.sh
```

脚本会提示输入：
- 数据库主机地址（阿里云 RDS 地址）
- 数据库端口
- 数据库名称
- 数据库用户名
- 数据库密码
- 后端端口
- 域名
- JWT 密钥（建议选择自动生成）

### 第四步：部署前端

```bash
cd /root/heartsphere_new/deploy
sudo ./deploy-frontend.sh
```

脚本会提示输入：
- 部署环境（选择生产环境）
- 根路径（默认为 `/`）
- 域名
- 前端端口（默认 80）
- 后端端口（默认 8081）

### 第五步：验证部署

```bash
# 检查后端服务
sudo systemctl status heartsphere-backend

# 检查 Nginx
sudo systemctl status nginx

# 查看后端日志
sudo journalctl -u heartsphere-backend -f

# 查看 Nginx 日志
sudo journalctl -u nginx -f
```

## 配置说明

### 环境变量文件

部署后，环境变量文件位于：`/opt/heartsphere/.env`

可以手动编辑此文件来修改配置：
```bash
sudo vi /opt/heartsphere/.env
sudo systemctl restart heartsphere-backend
```

### Nginx 配置

- 前端配置：`/etc/nginx/conf.d/heartsphere-frontend.conf`
- 后端配置：`/etc/nginx/conf.d/heartsphere-backend.conf`

修改配置后需要重新加载：
```bash
sudo nginx -t  # 测试配置
sudo systemctl reload nginx  # 重新加载配置
```

### 服务管理

```bash
# 后端服务
sudo systemctl start heartsphere-backend    # 启动
sudo systemctl stop heartsphere-backend     # 停止
sudo systemctl restart heartsphere-backend  # 重启
sudo systemctl status heartsphere-backend   # 状态
sudo journalctl -u heartsphere-backend -f   # 日志

# Nginx 服务
sudo systemctl start nginx                  # 启动
sudo systemctl stop nginx                   # 停止
sudo systemctl restart nginx                # 重启
sudo systemctl status nginx                 # 状态
sudo journalctl -u nginx -f                 # 日志
```

## 目录结构

部署后的目录结构：
```
/opt/heartsphere/
├── backend/
│   ├── app.jar                          # 后端 JAR 文件
│   └── application-prod.yml             # 生产环境配置
├── frontend/                            # 前端静态文件
├── logs/
│   └── backend.log                      # 后端日志
├── uploads/
│   └── images/                          # 上传的图片
└── .env                                 # 环境变量文件
```

## 常见问题

### 1. 后端服务启动失败

运行诊断脚本：
```bash
sudo ./check-backend-service.sh
sudo ./fix-backend-service.sh
```

查看详细日志：
```bash
sudo journalctl -u heartsphere-backend -n 100
```

### 2. Nginx 配置错误

测试配置：
```bash
sudo nginx -t
```

查看错误日志：
```bash
sudo tail -f /var/log/nginx/error.log
```

### 3. 数据库连接失败

检查数据库配置：
```bash
sudo cat /opt/heartsphere/.env | grep DB_
```

测试数据库连接：
```bash
mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p <DB_NAME>
```

### 4. 端口被占用

检查端口占用：
```bash
sudo netstat -tlnp | grep 8081
sudo netstat -tlnp | grep 80
```

## 安全建议

1. **修改默认密码**：确保数据库密码足够复杂
2. **配置防火墙**：只开放必要的端口（80, 443, 22）
3. **使用 HTTPS**：建议配置 SSL 证书
4. **定期备份**：备份数据库和重要文件
5. **更新系统**：定期更新系统和依赖包

## 更新部署

### 更新后端

```bash
cd /root/heartsphere_new
git pull  # 或重新上传新版本

cd deploy
sudo ./deploy-backend.sh
```

### 更新前端

```bash
cd /root/heartsphere_new
git pull  # 或重新上传新版本

cd deploy
sudo ./deploy-frontend.sh
```

## 支持

如遇到问题，请查看：
- 后端日志：`journalctl -u heartsphere-backend -n 100`
- Nginx 日志：`journalctl -u nginx -n 100`
- 系统日志：`dmesg | tail`
