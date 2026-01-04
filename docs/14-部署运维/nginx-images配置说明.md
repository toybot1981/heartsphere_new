# Nginx图片路径配置说明

## 概述

本文档说明如何配置Nginx以支持新的图片路径结构 `/images/**`。

## 路径变化

### 旧路径结构
- 访问路径：`/api/images/files/**`
- 后端处理：Spring MVC资源处理器

### 新路径结构
- 访问路径：`/images/**`
- 后端处理：Spring MVC资源处理器（映射到 `/images/**`）

## Nginx配置

### 配置位置

Nginx配置文件通常位于：
- `/etc/nginx/conf.d/heartsphere.conf` (推荐)
- `/etc/nginx/sites-available/heartsphere` (Ubuntu/Debian)
- `/etc/nginx/nginx.conf` (直接在主配置文件中)

### 配置示例

#### 方式1: 静态文件直接服务（推荐）

如果图片文件存储在后端服务器的本地文件系统中，可以直接通过Nginx服务静态文件：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 文件上传大小限制
        client_max_body_size 50M;
    }

    # 图片文件服务（新路径结构）
    location /images/ {
        alias /path/to/heartsphere/backend/uploads/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
        
        # 允许跨域（如果需要）
        add_header Access-Control-Allow-Origin *;
        
        # 文件上传大小限制（如果Nginx也处理上传）
        client_max_body_size 50M;
    }

    # 前端静态文件
    location / {
        root /path/to/heartsphere/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public";
    }
}
```

#### 方式2: 通过后端代理（如果后端处理文件服务）

如果图片文件通过后端Spring MVC资源处理器提供服务：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 后端API和图片代理
    location /api/ {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }

    # 图片文件代理到后端（新路径结构）
    location /images/ {
        proxy_pass http://localhost:8081/images/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 文件上传大小限制
        client_max_body_size 50M;
        
        # 缓存配置
        proxy_cache_valid 200 30d;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    }

    # 前端静态文件
    location / {
        root /path/to/heartsphere/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public";
    }
}
```

#### 方式3: 混合方式（推荐用于生产环境）

结合静态文件服务和代理，提高性能：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }

    # 图片文件服务（优先使用静态文件服务，性能更好）
    location /images/ {
        # 首先尝试静态文件服务
        alias /path/to/heartsphere/backend/uploads/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # 如果文件不存在，可以回退到后端（可选）
        try_files $uri @backend_images;
        
        access_log off;
    }

    # 图片文件回退到后端（如果静态文件不存在）
    location @backend_images {
        proxy_pass http://localhost:8081/images$request_uri;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 50M;
    }

    # 前端静态文件
    location / {
        root /path/to/heartsphere/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public";
    }
}
```

### 路径映射说明

**图片存储路径**：
- 后端配置：`app.image.storage.local.path = ./uploads/images`
- 实际路径：`/path/to/heartsphere/backend/uploads/images/`

**访问路径映射**：
- 访问URL：`http://your-domain.com/images/category/year/month/filename`
- 系统资源：`/images/character/2025/12/example.png`
- 用户资源：`/images/114/character/2025/12/example.png`

**文件系统映射**：
- 系统资源：`/path/to/heartsphere/backend/uploads/images/character/2025/12/example.png`
- 用户资源：`/path/to/heartsphere/backend/uploads/images/114/character/2025/12/example.png`

## 配置步骤

### 1. 编辑Nginx配置文件

```bash
sudo vi /etc/nginx/conf.d/heartsphere.conf
```

或

```bash
sudo vi /etc/nginx/sites-available/heartsphere
```

### 2. 添加 `/images/` location块

根据选择的配置方式，添加相应的location块（参考上面的配置示例）。

### 3. 验证配置

```bash
sudo nginx -t
```

如果配置正确，会显示：
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 4. 重载Nginx配置

```bash
sudo systemctl reload nginx
```

或

```bash
sudo nginx -s reload
```

### 5. 验证访问

测试图片访问：

```bash
# 测试系统资源图片
curl -I http://your-domain.com/images/character/2025/12/example.png

# 测试用户资源图片
curl -I http://your-domain.com/images/114/character/2025/12/example.png
```

## 性能优化建议

### 1. 启用Gzip压缩

在Nginx配置中添加：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types image/svg+xml text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/x-icon image/png image/jpeg image/gif;
```

注意：图片文件（PNG、JPEG、GIF）通常已经压缩，不需要Gzip。

### 2. 启用缓存

```nginx
location /images/ {
    alias /path/to/heartsphere/backend/uploads/images/;
    expires 30d;
    add_header Cache-Control "public, immutable";
    
    # 启用ETag
    etag on;
}
```

### 3. 设置文件大小限制

```nginx
client_max_body_size 50M;  # 允许上传最大50MB的文件
```

### 4. 限制访问速度（可选）

```nginx
location /images/ {
    alias /path/to/heartsphere/backend/uploads/images/;
    
    # 限制下载速度（可选）
    limit_rate 10m;
}
```

## 安全配置

### 1. 防止目录遍历

```nginx
location /images/ {
    alias /path/to/heartsphere/backend/uploads/images/;
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 2. 限制文件类型（可选）

```nginx
location ~* /images/.*\.(jpg|jpeg|png|gif|webp|svg)$ {
    alias /path/to/heartsphere/backend/uploads/images/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 3. 访问日志（可选）

如果需要记录图片访问日志：

```nginx
location /images/ {
    alias /path/to/heartsphere/backend/uploads/images/;
    access_log /var/log/nginx/images-access.log;
    error_log /var/log/nginx/images-error.log;
}
```

## 故障排查

### 1. 检查Nginx配置语法

```bash
sudo nginx -t
```

### 2. 检查Nginx错误日志

```bash
sudo tail -f /var/log/nginx/error.log
```

### 3. 检查文件权限

确保Nginx用户（通常是 `nginx` 或 `www-data`）可以读取图片文件：

```bash
# 检查文件权限
ls -la /path/to/heartsphere/backend/uploads/images/

# 如果权限不足，设置正确的权限
sudo chmod -R 755 /path/to/heartsphere/backend/uploads/images/
sudo chown -R nginx:nginx /path/to/heartsphere/backend/uploads/images/
```

### 4. 检查路径映射

确保 `alias` 路径正确：

```bash
# 检查路径是否存在
ls -la /path/to/heartsphere/backend/uploads/images/

# 检查Nginx配置中的路径
grep -A 5 "location /images/" /etc/nginx/conf.d/heartsphere.conf
```

### 5. 测试后端资源处理器

如果使用代理方式，测试后端是否正常工作：

```bash
curl -I http://localhost:8081/images/character/2025/12/example.png
```

## 从旧配置迁移

### 旧配置（需要移除或修改）

```nginx
# 旧路径配置（可以移除）
location /api/images/files/ {
    proxy_pass http://localhost:8081/api/images/files/;
    # ...
}
```

### 新配置（添加）

```nginx
# 新路径配置
location /images/ {
    alias /path/to/heartsphere/backend/uploads/images/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

## 注意事项

1. **路径末尾斜杠**：
   - `location /images/` 中的斜杠是必需的
   - `alias` 路径末尾的斜杠通常也需要

2. **文件权限**：
   - 确保Nginx用户有读取权限
   - 确保后端应用有写入权限

3. **路径映射**：
   - `alias` 会将 `location` 路径替换为 `alias` 路径
   - 例如：`/images/character/test.png` → `/path/to/uploads/images/character/test.png`

4. **缓存策略**：
   - 图片文件通常可以设置较长的缓存时间（30天或更长）
   - 使用 `immutable` 标记表示文件不会改变

5. **上传处理**：
   - 图片上传仍然通过 `/api/images/upload` 端点
   - Nginx只需要配置读取访问

## 相关文档

- [图片URL路径结构迁移执行报告](./图片URL路径结构迁移执行报告.md)
- [图片URL路径结构优化完成报告](./图片URL路径结构优化完成报告.md)
- [部署指南](./部署指南/README.md)
