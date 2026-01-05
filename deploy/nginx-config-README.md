# Nginx配置文件使用说明

## 概述

本目录包含两个Nginx配置文件模板：
- **`nginx-heartsphere-local.conf`** - 本地开发环境配置
- **`nginx-heartsphere-production.conf`** - 生产环境配置

## 文件说明

### 1. 本地开发环境配置

**文件**: `nginx-heartsphere-local.conf`

**配置路径**:
- 前端: `/Users/admin/Workspace/heartsphere_new/frontend/dist`
- 后端API: `http://localhost:8081`
- 图片目录: `/Users/admin/Workspace/heartsphere_new/backend/uploads/images/`
- 监听端口: `8080`

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
- 前端: `/opt/heartsphere/frontend`
- 后端API: `http://localhost:8080`
- 图片目录: `/opt/heartsphere/backend/uploads/images/`
- 监听端口: `80`
- 域名: `heartsphere.cn`（需要修改为实际域名）

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
| 前端目录 | /Users/admin/Workspace/heartsphere_new/frontend/dist |
| 后端API | http://localhost:8081 |
| 图片目录 | /Users/admin/Workspace/heartsphere_new/backend/uploads/images/ |
| 日志文件 | /usr/local/var/log/nginx/heartsphere_access.log |

### 生产环境

| 配置项 | 值 |
|--------|-----|
| 监听端口 | 80 |
| 前端目录 | /opt/heartsphere/frontend |
| 后端API | http://localhost:8080 |
| 图片目录 | /opt/heartsphere/backend/uploads/images/ |
| 域名 | heartsphere.cn（需要修改） |
| 日志文件 | /var/log/nginx/heartsphere-access.log |

## 配置功能

### 1. 图片文件服务 (`/images/`)
- 静态文件服务，直接读取文件系统
- 30天缓存
- 支持跨域访问
- 最大上传50M

### 2. 后端API代理 (`/api/`)
- 代理到本地后端服务
- 支持WebSocket升级
- 60秒超时设置
- 禁用缓冲以提高响应速度

### 3. 前端静态文件 (`/`)
- SPA路由支持（try_files）
- 1小时缓存
- 支持 admin.html 和 mobile.html

### 4. 静态资源缓存
- JS/CSS等静态资源1年缓存
- 排除 `/images/` 路径（单独配置）

## 注意事项

1. **端口配置**:
   - 本地开发环境：Nginx监听8080，后端API在8081
   - 生产环境：Nginx监听80，后端API在8080

2. **域名配置**:
   - 生产环境配置中的 `server_name` 需要修改为实际域名
   - 如果有多个域名，用空格分隔

3. **HTTPS配置**:
   - 生产环境配置文件末尾包含HTTPS配置示例（已注释）
   - 如需启用HTTPS，需要：
     - 取消注释HTTPS server块
     - 配置SSL证书路径
     - 取消注释HTTP重定向块

4. **权限配置**:
   - 确保Nginx用户有读取前端目录和图片目录的权限
   - 图片目录需要后端应用的写入权限

5. **日志目录**:
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
2. 端口是否正确（本地8081，生产8080）
3. 测试连接：`curl http://localhost:8080/api/health`

### Q: 前端路由404？

A: 确保主location块有 `try_files` 配置：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 相关文件

- `nginx-heartsphere-local.conf` - 本地开发环境配置
- `nginx-heartsphere-production.conf` - 生产环境配置
- `nginx-heartsphere.conf.example` - 通用示例配置
