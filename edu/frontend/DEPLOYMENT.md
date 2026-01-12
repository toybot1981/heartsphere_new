# Edu 前端服务部署指南

## 📋 部署概览

本文档说明如何部署 HeartSphere Edu 前端服务到生产环境。

## 🔧 环境要求

- **Node.js**: 18.0 或更高版本
- **npm**: 9.0 或更高版本
- **Web 服务器**: Nginx / Apache / 其他静态文件服务器

## 📦 构建

### 1. 安装依赖

```bash
cd edu/frontend
npm install
```

### 2. 配置环境变量

创建 `.env.production` 文件：

```env
VITE_EDU_API_BASE_URL=https://api-edu.heartsphere.com/api/edu
```

### 3. 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录。

### 4. 验证构建

```bash
# 检查构建产物
ls -lh dist/

# 应该包含：
# - index.html
# - assets/（JS、CSS 文件）
```

## 🚀 部署方式

### 方式 1: Nginx 部署（推荐）

#### 1. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

#### 2. 配置 Nginx

创建配置文件：`/etc/nginx/sites-available/heartsphere-edu`

```nginx
server {
    listen 80;
    server_name edu.heartsphere.com;  # 替换为您的域名

    root /opt/heartsphere-edu/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理（如果需要）
    location /api/ {
        proxy_pass http://localhost:8084;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. 启用配置

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/heartsphere-edu /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

#### 4. 部署文件

```bash
# 创建目录
sudo mkdir -p /opt/heartsphere-edu/frontend

# 复制构建产物
sudo cp -r dist/* /opt/heartsphere-edu/frontend/dist/

# 设置权限
sudo chown -R www-data:www-data /opt/heartsphere-edu/frontend
```

#### 5. HTTPS 配置（推荐）

使用 Let's Encrypt 配置 HTTPS：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d edu.heartsphere.com

# 自动续期（已自动配置）
sudo certbot renew --dry-run
```

### 方式 2: 使用 Docker

#### 1. 创建 Dockerfile

```dockerfile
FROM nginx:alpine

# 复制构建产物
COPY dist/ /usr/share/nginx/html/

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 2. 创建 Nginx 配置（nginx.conf）

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 3. 构建和运行

```bash
# 构建镜像
docker build -t heartsphere-edu-frontend .

# 运行容器
docker run -d -p 80:80 --name edu-frontend heartsphere-edu-frontend
```

## 🔄 更新部署

### 1. 构建新版本

```bash
cd edu/frontend
npm run build
```

### 2. 备份旧版本

```bash
sudo mv /opt/heartsphere-edu/frontend/dist /opt/heartsphere-edu/frontend/dist.backup
```

### 3. 部署新版本

```bash
sudo cp -r dist /opt/heartsphere-edu/frontend/
sudo chown -R www-data:www-data /opt/heartsphere-edu/frontend/dist
```

### 4. 验证

- 访问网站，检查是否正常
- 检查浏览器控制台是否有错误
- 测试主要功能

### 5. 回滚（如果需要）

```bash
sudo rm -rf /opt/heartsphere-edu/frontend/dist
sudo mv /opt/heartsphere-edu/frontend/dist.backup /opt/heartsphere-edu/frontend/dist
sudo systemctl reload nginx
```

## ⚙️ 环境变量配置

### 开发环境

创建 `.env.development`：

```env
VITE_EDU_API_BASE_URL=http://localhost:8084/api/edu
```

### 生产环境

创建 `.env.production`：

```env
VITE_EDU_API_BASE_URL=https://api-edu.heartsphere.com/api/edu
```

**注意**: 环境变量必须以 `VITE_` 开头才能在构建时被替换。

## 🔐 安全配置

### 1. HTTPS

- 使用 HTTPS 部署（推荐使用 Let's Encrypt）
- 配置 HTTP 到 HTTPS 重定向
- 使用安全的 TLS 配置

### 2. 安全头

在 Nginx 配置中添加安全头：

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### 3. CORS

如果需要跨域访问，在后端配置 CORS，不要在前端配置。

## 📊 性能优化

### 1. 代码分割

Vite 已经自动进行代码分割，无需额外配置。

### 2. 资源压缩

- 启用 Gzip 压缩（Nginx 配置中已包含）
- 使用 Brotli 压缩（可选）

### 3. 缓存策略

- 静态资源：长期缓存（1年）
- HTML 文件：不缓存或短时间缓存
- API 响应：由后端控制

### 4. CDN（可选）

可以将静态资源部署到 CDN：
- 上传 `dist/assets/` 到 CDN
- 修改 `index.html` 中的资源路径（或使用构建工具自动处理）

## 🐛 故障排除

### 常见问题

1. **页面空白**
   - 检查浏览器控制台错误
   - 检查 API 连接（网络标签）
   - 检查环境变量配置

2. **API 请求失败**
   - 检查 `VITE_EDU_API_BASE_URL` 配置
   - 检查后端服务是否运行
   - 检查 CORS 配置

3. **路由404**
   - 确保 Nginx 配置了 `try_files $uri $uri/ /index.html;`
   - 检查 Nginx 配置是否正确

4. **构建失败**
   - 检查 Node.js 版本
   - 删除 `node_modules` 重新安装
   - 检查依赖版本冲突

## 📚 相关文档

- [README](../README.md)
- [项目设计文档](../../openspec/changes/separate-edu-version/design.md)
- [后端部署文档](../backend/DEPLOYMENT.md)

---

**最后更新：2026-01-10**
