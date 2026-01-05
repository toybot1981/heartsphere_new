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

## 配置说明

### 本地环境路径
- 前端: `/Users/admin/Workspace/heartsphere_new/frontend/dist`
- 后端API: `http://localhost:8081`
- 图片: `/Users/admin/Workspace/heartsphere_new/backend/uploads/images/`
- 监听端口: `8080`

### 生产环境路径
- 前端: `/opt/heartsphere/frontend`
- 后端API: `http://localhost:8080`
- 图片: `/opt/heartsphere/backend/uploads/images/`
- 监听端口: `80`
- 域名: `heartsphere.cn`（需要修改）

## 验证

```bash
# 测试前端
curl http://localhost:8080

# 测试API
curl http://localhost:8080/api/health

# 测试图片
curl -I http://localhost:8080/images/character/user/2025/12/test.png
```
