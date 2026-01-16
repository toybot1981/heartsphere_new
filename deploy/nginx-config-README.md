# Nginx配置文件使用说明

## 概述

本目录包含两个Nginx配置文件模板，支持多项目统一部署：
- **`nginx-heartsphere-local.conf`** - 本地开发环境配置
- **`nginx-heartsphere-production.conf`** - 生产环境配置

## 多项目路径路由

所有项目通过统一的 Nginx 端口访问，通过路径前缀区分不同项目：

| 项目 | 访问路径 | 说明 |
|------|---------|------|
| main (PC) | `/` | 主项目 PC 端 |
| main (Mobile) | `/mobile.html` | 主项目移动端 |
| admin | `/admin.html` | 管理后台 |
| edu | `/edu.html` | 教育版 |
| mentis | `/mentis` | Mentis 系统 |

## 文件说明

### 1. 本地开发环境配置

**文件**: `nginx-heartsphere-local.conf`

**配置路径**:
- 监听端口: `8080`
- main 前端: `/Users/admin/Workspace/heartsphere_new/main/frontend/dist`
- admin 前端: `/Users/admin/Workspace/heartsphere_new/admin/frontend/dist`
- edu 前端: `/Users/admin/Workspace/heartsphere_new/edu/frontend/dist`
- mentis 前端: `/Users/admin/Workspace/heartsphere_new/mentis/frontend/dist`
- 图片目录: `/Users/admin/Workspace/heartsphere_new/main/backend/uploads/images/`

**API 代理路径**:
- `/api/main/` → `http://localhost:8081/api/`
- `/api/admin/` → `http://localhost:8085/api/`
- `/api/edu/` → `http://localhost:8084/api/`
- `/api/mentis/` → `http://localhost:8082/api/`

**部署步骤**:
```bash
# 1. 复制配置文件到Nginx配置目录
sudo cp deploy/nginx-heartsphere-local.conf /usr/local/etc/nginx/servers/heartsphere.conf

# 2. 测试配置
sudo nginx -t

# 3. 重载配置
sudo nginx -s reload
```

**macOS路径**:
- Nginx配置目录: `/usr/local/etc/nginx/servers/`
- 日志目录: `/usr/local/var/log/nginx/`

### 2. 生产环境配置

**文件**: `nginx-heartsphere-production.conf`

**配置路径**:
- 监听端口: `80`
- 域名: `heartsphere.cn`（需要修改为实际域名）
- main 前端: `/opt/heartsphere/main/frontend`
- admin 前端: `/opt/heartsphere/admin/frontend`
- edu 前端: `/opt/heartsphere/edu/frontend`
- mentis 前端: `/opt/heartsphere/mentis/frontend`
- 图片目录: `/opt/heartsphere/main/backend/uploads/images/`

**API 代理路径**:
- `/api/main/` → `http://localhost:8081/api/`
- `/api/admin/` → `http://localhost:8085/api/`
- `/api/edu/` → `http://localhost:8084/api/`
- `/api/mentis/` → `http://localhost:8082/api/`

**部署步骤**:
```bash
# 1. 复制配置文件到Nginx配置目录
sudo cp deploy/nginx-heartsphere-production.conf /etc/nginx/conf.d/heartsphere.conf

# 2. 修改域名（如需要）
sudo nano /etc/nginx/conf.d/heartsphere.conf
# 修改 server_name 为实际域名

# 3. 测试配置
sudo nginx -t

# 4. 重载配置
sudo systemctl reload nginx
```

**Linux路径**:
- Nginx配置目录: `/etc/nginx/conf.d/` (CentOS/RHEL) 或 `/etc/nginx/sites-available/` (Ubuntu/Debian)
- 日志目录: `/var/log/nginx/`

## 配置项说明

### 本地开发环境

| 配置项 | 值 |
|--------|-----|
| 监听端口 | 8080 |
| main 前端目录 | /Users/admin/Workspace/heartsphere_new/main/frontend/dist |
| admin 前端目录 | /Users/admin/Workspace/heartsphere_new/admin/frontend/dist |
| edu 前端目录 | /Users/admin/Workspace/heartsphere_new/edu/frontend/dist |
| mentis 前端目录 | /Users/admin/Workspace/heartsphere_new/mentis/frontend/dist |
| 后端API | 见上方 API 代理路径 |
| 图片目录 | /Users/admin/Workspace/heartsphere_new/main/backend/uploads/images/ |
| 日志文件 | /usr/local/var/log/nginx/heartsphere_access.log |

### 生产环境

| 配置项 | 值 |
|--------|-----|
| 监听端口 | 80 |
| 域名 | heartsphere.cn（需要修改） |
| main 前端目录 | /opt/heartsphere/main/frontend |
| admin 前端目录 | /opt/heartsphere/admin/frontend |
| edu 前端目录 | /opt/heartsphere/edu/frontend |
| mentis 前端目录 | /opt/heartsphere/mentis/frontend |
| 后端API | 见上方 API 代理路径 |
| 图片目录 | /opt/heartsphere/main/backend/uploads/images/ |
| 日志文件 | /var/log/nginx/heartsphere-access.log |

## 配置功能

### 1. 图片文件服务 (`/images/`)
- 静态文件服务，直接读取文件系统
- 30天缓存
- 支持跨域访问
- 最大上传50M
- 所有项目共享图片资源

### 2. 后端API代理
- **多项目支持**: 通过路径前缀区分不同后端服务
  - `/api/main/` → main 后端 (8081)
  - `/api/admin/` → admin 后端 (8085)
  - `/api/edu/` → edu 后端 (8084)
  - `/api/mentis/` → mentis 后端 (8082)
- 支持WebSocket升级
- 60秒超时设置
- 禁用缓冲以提高响应速度
- **兼容性**: `/api/` 路径默认转发到 main 后端 (8081)

### 3. 前端静态文件路由
- **main (PC)**: `/` → `main/frontend/dist/index.html`
- **main (Mobile)**: `/mobile.html` → `main/frontend/dist/mobile.html`
- **admin**: `/admin.html` → `admin/frontend/dist/index.html`
- **edu**: `/edu.html` → `edu/frontend/dist/index.html`
- **mentis**: `/mentis` → `mentis/frontend/dist/index.html`
- SPA路由支持（try_files）
- 1小时缓存
- 移动端自动重定向

### 4. 静态资源缓存
- JS/CSS等静态资源1年缓存
- 排除 `/images/` 路径（单独配置）

## 注意事项

1. **端口配置**:
   - 本地开发环境：Nginx监听8080，各后端服务端口独立（8081, 8082, 8084, 8085）
   - 生产环境：Nginx监听80，各后端服务端口独立（8081, 8082, 8084, 8085）

2. **域名配置**:
   - 生产环境配置中的 `server_name` 需要修改为实际域名
   - 如果有多个域名，用空格分隔

3. **前端部署路径**:
   - 确保各项目前端构建产物已部署到对应目录
   - main 项目需要包含 `index.html` 和 `mobile.html`
   - 其他项目需要包含 `index.html`

4. **API 路径配置**:
   - 前端需要配置正确的 API 基础路径
   - 例如：`/api/main/`, `/api/admin/` 等
   - 旧版 `/api/` 路径仍兼容，默认转发到 main 后端

5. **HTTPS配置**:
   - 生产环境配置文件末尾包含HTTPS配置示例（已注释）
   - 如需启用HTTPS，需要：
     - 取消注释HTTPS server块
     - 配置SSL证书路径
     - 取消注释HTTP重定向块

6. **权限配置**:
   - 确保Nginx用户有读取前端目录和图片目录的权限
   - 图片目录需要后端应用的写入权限

7. **日志目录**:
   - 确保日志目录存在并有写入权限
   - 本地：`/usr/local/var/log/nginx/`
   - 生产：`/var/log/nginx/`

## 验证配置

### 本地环境
```bash
# 测试配置
sudo nginx -t

# 查看Nginx状态
ps aux | grep nginx

# 测试各项目访问
curl http://localhost:8080/              # main (PC)
curl http://localhost:8080/mobile.html   # main (Mobile)
curl http://localhost:8080/admin.html    # admin
curl http://localhost:8080/edu.html      # edu
curl http://localhost:8080/mentis        # mentis

# 测试API代理
curl http://localhost:8080/api/main/health
curl http://localhost:8080/api/admin/health

# 查看日志
tail -f /usr/local/var/log/nginx/heartsphere_access.log
tail -f /usr/local/var/log/nginx/heartsphere_error.log
```

### 生产环境
```bash
# 测试配置
sudo nginx -t

# 查看Nginx状态
sudo systemctl status nginx

# 测试各项目访问
curl http://heartsphere.cn/              # main (PC)
curl http://heartsphere.cn/mobile.html    # main (Mobile)
curl http://heartsphere.cn/admin.html     # admin
curl http://heartsphere.cn/edu.html       # edu
curl http://heartsphere.cn/mentis         # mentis

# 查看日志
sudo tail -f /var/log/nginx/heartsphere-access.log
sudo tail -f /var/log/nginx/heartsphere-error.log
```

## 常见问题

### Q: 如何修改生产环境的域名？

A: 编辑配置文件中的 `server_name` 行：
```nginx
server_name heartsphere.cn www.heartsphere.cn _;
```

### Q: 如何启用HTTPS？

A: 
1. 取消注释HTTPS server块
2. 修改SSL证书路径
3. 取消注释HTTP重定向块
4. 测试并重载配置

### Q: 图片无法访问？

A: 检查：
1. 图片目录路径是否正确
2. Nginx用户是否有读取权限
3. 目录权限：`ls -ld /path/to/images/`
4. 设置权限：`chmod -R 755 /path/to/images/`

### Q: API请求失败？

A: 检查：
1. 后端服务是否运行
2. API路径是否正确（如 `/api/main/`, `/api/admin/`）
3. 端口是否正确（main:8081, admin:8085, edu:8084, mentis:8082）
4. 测试连接：`curl http://localhost:8081/api/health`

### Q: 前端路由404？

A: 确保：
1. 各项目前端构建产物已部署到正确目录
2. main 项目包含 `index.html` 和 `mobile.html`
3. 其他项目包含 `index.html`
4. 主location块有 `try_files` 配置

### Q: 如何更新前端项目？

A: 
1. 构建各项目前端：`cd <project>/frontend && npm run build`
2. 确保构建产物在正确目录
3. 重载Nginx配置：`sudo nginx -s reload` 或 `sudo systemctl reload nginx`

## 相关文件

- `nginx-heartsphere-local.conf` - 本地开发环境配置
- `nginx-heartsphere-production.conf` - 生产环境配置
- `nginx-heartsphere.conf.example` - 通用示例配置
- `install-nginx-config-dev.sh` - 本地环境安装脚本
- `install-nginx-config-prod.sh` - 生产环境安装脚本