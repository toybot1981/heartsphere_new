# Company 公司官网独立部署指南

## 概述

Company 公司官网已从主项目（`main/`）完全迁移到独立子项目（`company/`）。本文档说明如何独立部署和访问 Company 网站。

## 项目位置

- **前端代码**: `company/frontend/`
- **后端代码**: `company/backend/`
- **端口配置**:
  - 前端: 3003
  - 后端: 8083

## 独立部署方式

### 1. 前端部署

```bash
# 进入前端目录
cd company/frontend

# 安装依赖
npm install

# 开发模式运行
npm run dev
# 访问: http://localhost:3003

# 生产构建
npm run build
# 构建产物在 dist/ 目录
```

### 2. 后端部署

```bash
# 进入后端目录
cd company/backend

# 构建项目
mvn clean install

# 运行服务
mvn spring-boot:run
# 服务运行在: http://localhost:8083
```

### 3. 使用 systemd 服务（生产环境）

#### 前端服务

创建 `/etc/systemd/system/company-frontend.service`:

```ini
[Unit]
Description=Company Frontend Service
After=network.target

[Service]
Type=simple
User=heartsphere
WorkingDirectory=/opt/heartsphere/company/frontend
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 后端服务

创建 `/etc/systemd/system/company-backend.service`:

```ini
[Unit]
Description=Company Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=heartsphere
WorkingDirectory=/opt/heartsphere/company/backend
ExecStart=/usr/bin/java -jar target/company-backend-*.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl enable company-frontend
sudo systemctl enable company-backend
sudo systemctl start company-frontend
sudo systemctl start company-backend
```

## 通过主域名访问（反向代理配置）

如果需要通过主域名（如 `heartsphere.cn`）访问 Company 网站，需要在 Nginx 配置中添加反向代理。

### Nginx 配置示例

在 `deploy/nginx-heartsphere-production.conf` 中添加以下配置：

```nginx
# Company 网站路由
location /company {
    proxy_pass http://localhost:3003;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Company API 代理
location ^~ /api/company/ {
    # 移除 /api/company 前缀，转发到后端 /api/
    rewrite ^/api/company/(.*)$ /api/$1 break;
    proxy_pass http://localhost:8083;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_cache_bypass $http_upgrade;
    
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    proxy_buffering off;
}
```

配置后重新加载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

访问地址：
- 网站: `http://heartsphere.cn/company`
- API: `http://heartsphere.cn/api/company/contact`

## 验证部署

### 1. 检查服务状态

```bash
# 检查前端服务
curl http://localhost:3003

# 检查后端服务
curl http://localhost:8083/api/company/contact
```

### 2. 测试功能

- 访问首页
- 测试导航功能
- 测试联系表单提交
- 验证 API 端点响应

## 注意事项

1. **独立运行**: Company 网站可以完全独立运行，不依赖主项目
2. **数据库**: Company 后端使用独立的数据库配置（如果需要）
3. **端口冲突**: 确保端口 3003 和 8083 未被其他服务占用
4. **环境变量**: Company 项目有自己的环境变量配置，需要单独配置

## 相关文档

- Company 项目 README: `company/README.md`
- 主项目部署指南: `docs/14-部署运维/部署指南/README.md`
- Nginx 配置: `deploy/nginx-heartsphere-production.conf`
