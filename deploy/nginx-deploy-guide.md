# Nginx配置文件部署指南

## 快速部署

### 本地开发环境（macOS）

```bash
# 方法1: 使用安装脚本（推荐）
cd deploy
./install-nginx-config-dev.sh

# 方法2: 手动复制
sudo cp deploy/nginx-heartsphere-local.conf /usr/local/etc/nginx/servers/heartsphere.conf
sudo nginx -t
sudo nginx -s reload
```

### 生产环境（Linux）

```bash
# 方法1: 使用安装脚本（推荐）
cd deploy
sudo ./install-nginx-config-prod.sh
# 脚本会询问是否修改域名

# 方法2: 手动复制
sudo cp deploy/nginx-heartsphere-production.conf /etc/nginx/conf.d/heartsphere.conf
sudo nano /etc/nginx/conf.d/heartsphere.conf  # 修改域名
sudo nginx -t
sudo systemctl reload nginx
```

## 多项目路径路由

所有项目通过统一的 Nginx 端口访问：

| 项目 | 本地访问 | 生产访问 |
|------|---------|---------|
| main (PC) | http://localhost:8080/ | http://heartsphere.cn/ |
| main (Mobile) | http://localhost:8080/mobile.html | http://heartsphere.cn/mobile.html |
| admin | http://localhost:8080/admin.html | http://heartsphere.cn/admin.html |
| edu | http://localhost:8080/edu.html | http://heartsphere.cn/edu.html |
| mentis | http://localhost:8080/mentis | http://heartsphere.cn/mentis |

## 配置说明

### 本地环境路径
- main 前端: `/Users/admin/Workspace/heartsphere_new/main/frontend/dist`
- admin 前端: `/Users/admin/Workspace/heartsphere_new/admin/frontend/dist`
- edu 前端: `/Users/admin/Workspace/heartsphere_new/edu/frontend/dist`
- mentis 前端: `/Users/admin/Workspace/heartsphere_new/mentis/frontend/dist`
- 图片: `/Users/admin/Workspace/heartsphere_new/main/backend/uploads/images/`
- 监听端口: `8080`

### 生产环境路径
- main 前端: `/opt/heartsphere/main/frontend`
- admin 前端: `/opt/heartsphere/admin/frontend`
- edu 前端: `/opt/heartsphere/edu/frontend`
- mentis 前端: `/opt/heartsphere/mentis/frontend`
- 图片: `/opt/heartsphere/main/backend/uploads/images/`
- 监听端口: `80`
- 域名: `heartsphere.cn`（需要修改）

## API 代理路径

前端通过以下路径访问后端 API：

| API 路径 | 后端服务 | 端口 |
|---------|---------|------|
| `/api/main/` | main 后端 | 8081 |
| `/api/admin/` | admin 后端 | 8085 |
| `/api/edu/` | edu 后端 | 8084 |
| `/api/mentis/` | mentis 后端 | 8082 |

**注意**: 旧版 `/api/` 路径仍兼容，默认转发到 main 后端 (8081)。

## 验证

```bash
# 测试前端
curl http://localhost:8080/              # main (PC)
curl http://localhost:8080/mobile.html  # main (Mobile)
curl http://localhost:8080/admin.html    # admin
curl http://localhost:8080/edu.html      # edu
curl http://localhost:8080/mentis        # mentis

# 测试API
curl http://localhost:8080/api/main/health
curl http://localhost:8080/api/admin/health

# 测试图片
curl -I http://localhost:8080/images/character/user/2025/12/test.png
```

## 前端部署要求

### 构建产物要求

1. **main 项目**:
   - 必须包含 `index.html` (PC 端)
   - 必须包含 `mobile.html` (移动端)
   - 构建输出到 `main/frontend/dist/`

2. **admin 项目**:
   - 必须包含 `index.html`
   - 构建输出到 `admin/frontend/dist/`

3. **edu 项目**:
   - 必须包含 `index.html`
   - 构建输出到 `edu/frontend/dist/`

4. **mentis 项目**:
   - 必须包含 `index.html`
   - 构建输出到 `mentis/frontend/dist/`

### API 配置

各项目前端需要配置正确的 API 基础路径：

```typescript
// main 项目
const API_BASE_URL = '/api/main';

// admin 项目
const API_BASE_URL = '/api/admin';

// edu 项目
const API_BASE_URL = '/api/edu';

// mentis 项目
const API_BASE_URL = '/api/mentis';
```

## 部署检查清单

- [ ] Nginx 配置文件已安装
- [ ] Nginx 配置测试通过 (`nginx -t`)
- [ ] 各项目前端构建产物已部署到正确目录
- [ ] 各项目前端 API 基础路径配置正确
- [ ] 图片目录权限正确
- [ ] 各后端服务正常运行
- [ ] 测试各项目前端访问
- [ ] 测试各项目 API 代理
- [ ] 查看 Nginx 日志确认无错误
