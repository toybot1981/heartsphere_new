# 部署文件总览

本目录包含所有部署相关的脚本和配置文件。

## 前端部署

### 开发环境部署
- **`deploy-frontend-dev.sh`** - 开发环境前端部署脚本
  - 本地构建
  - 本地启动开发服务器

### 生产环境部署
- **`deploy-frontend-prod.sh`** - 生产环境前端部署脚本
  - 构建生产版本
  - 部署到服务器

### SCP部署脚本
- **`deploy-frontend-scp.sh`** - 使用SCP/RSYNC部署前端到远程服务器
  - 支持增量同步
  - 自动备份
  - 配置保存

**相关文档**: `deploy-frontend-scp-README.md`

## 后端部署

### 开发环境部署
- **`deploy-backend-dev.sh`** - 开发环境后端部署脚本
  - 本地构建Maven项目
  - 本地启动服务
  - 监听端口: 可自定义（默认8080）

### 生产环境部署
- **`deploy-backend-prod.sh`** - 生产环境后端部署脚本
  - 本地构建JAR文件
  - 通过SCP上传到服务器
  - 远程启动服务
  - 自动备份

**相关文档**: `deploy-backend-README.md`

**配置文件**: `.deploy-backend-config.example`

## Nginx配置

### 配置文件
- **`nginx-heartsphere-local.conf`** - 本地开发环境配置
  - 路径: `/Users/admin/Workspace/heartsphere_new`
  - 监听端口: 8080
  - 后端API: http://localhost:8081

- **`nginx-heartsphere-production.conf`** - 生产环境配置
  - 路径: `/opt/heartsphere`
  - 监听端口: 80
  - 后端API: http://localhost:8080
  - 域名: heartsphere.cn（需修改）

### 安装工具
- **`install-nginx-config-dev.sh`** - 本地开发环境Nginx配置安装脚本
  - 自动备份现有配置
  - 自动测试和重载
  - 目标: `/usr/local/etc/nginx/servers/heartsphere.conf`

- **`install-nginx-config-prod.sh`** - 生产环境Nginx配置安装脚本
  - 自动备份现有配置
  - 支持修改域名
  - 自动测试和重载
  - 目标: `/etc/nginx/conf.d/heartsphere.conf`

**相关文档**: 
- `nginx-config-README.md` - 详细说明
- `nginx-deploy-guide.md` - 快速部署指南

## 快速使用

### 前端开发环境
```bash
cd deploy
./deploy-frontend-dev.sh
```

### 前端生产环境
```bash
cd deploy
./deploy-frontend-prod.sh
```

### 后端开发环境
```bash
cd deploy
./deploy-backend-dev.sh
# 输入端口（默认8080）
```

### 后端生产环境
```bash
cd deploy
./deploy-backend-prod.sh
# 首次运行需要配置服务器信息
```

### Nginx配置安装
```bash
cd deploy

# 本地环境
./install-nginx-config-dev.sh

# 生产环境
sudo ./install-nginx-config-prod.sh
```

## 配置文件位置

### 开发环境
- 前端目录: `/Users/admin/Workspace/heartsphere_new/frontend/dist`
- 后端目录: `/Users/admin/Workspace/heartsphere_new/backend`
- 图片目录: `/Users/admin/Workspace/heartsphere_new/backend/uploads/images/`
- Nginx配置: `/usr/local/etc/nginx/servers/heartsphere.conf` (macOS)

### 生产环境
- 前端目录: `/opt/heartsphere/frontend`
- 后端目录: `/opt/heartsphere/backend`
- 图片目录: `/opt/heartsphere/backend/uploads/images/`
- Nginx配置: `/etc/nginx/conf.d/heartsphere.conf` (Linux)

## 端口配置

| 环境 | Nginx | 后端API | 说明 |
|------|-------|---------|------|
| 开发环境 | 8080 | 8081 | 本地开发 |
| 生产环境 | 80 | 8080 | 生产服务器 |

## 常用命令

### 检查服务状态
```bash
# 检查前端进程
ps aux | grep vite

# 检查后端进程
ps aux | grep heartsphere-service

# 检查Nginx
nginx -t
sudo systemctl status nginx  # Linux
```

### 查看日志
```bash
# 前端日志
tail -f frontend.log

# 后端日志（开发）
tail -f backend/backend.log

# 后端日志（生产）
ssh user@host 'tail -f /opt/heartsphere/backend/logs/backend.log'

# Nginx日志
tail -f /usr/local/var/log/nginx/heartsphere_access.log  # macOS
tail -f /var/log/nginx/heartsphere-access.log  # Linux
```

### 停止服务
```bash
# 停止前端
pkill -f vite

# 停止后端（开发）
kill $(cat backend/backend.pid)

# 停止后端（生产）
ssh user@host 'kill $(cat /opt/heartsphere/backend/backend.pid)'
```

## 配置文件模板

### 后端部署配置
创建 `.deploy-backend-config`:
```bash
REMOTE_HOST="heartsphere.cn"
REMOTE_PORT="22"
REMOTE_USER="root"
REMOTE_PATH="/opt/heartsphere/backend"
SSH_KEY="~/.ssh/id_rsa"
BACKEND_PORT="8080"
```

## 注意事项

1. ⚠️ 配置文件包含敏感信息，不要提交到版本控制
2. ⚠️ 生产环境部署需要SSH访问权限
3. ⚠️ Nginx配置修改后需要重载才能生效
4. ⚠️ 确保目录权限正确（Nginx需要读取权限）
