# 修复生产环境 API Base URL 配置问题

## 问题描述

生产环境出现以下错误：
```
Access to fetch at 'http://localhost:8081/api/auth/invite-code-required' 
from origin 'http://heartsphere.cn' has been blocked by CORS policy: 
The request client is not a secure context and the resource is in more-private address space `loopback`.
```

**问题原因：**
- 生产环境的前端代码中，`API_BASE_URL` 被错误地设置为 `http://localhost:8081`
- 这导致浏览器尝试从 `http://heartsphere.cn` 访问 `http://localhost:8081`，触发 CORS 错误
- 生产环境应该使用相对路径 `/api`，通过 nginx 反向代理转发到后端

## 解决方案

### 方案1：本地打包后上传（推荐，适用于本地打包场景）

**如果你是在本地打包然后上传到服务器，使用此方案：**

在本地执行：

```bash
cd /path/to/heartsphere_new/deploy
./fix-api-url-local.sh
```

脚本会自动：
1. 检查并修复 `.env.production` 文件（`VITE_API_BASE_URL` 为空字符串）
2. 重新构建前端项目
3. 验证构建产物
4. 提供上传到服务器的命令提示

然后上传构建产物到服务器：

```bash
# 方式1: 使用 scp
scp -r frontend/dist/* user@server:/opt/heartsphere/frontend/

# 方式2: 在服务器上执行
cd /opt/heartsphere/frontend
sudo rm -rf *
sudo cp -r /path/to/local/dist/* .
sudo chown -R heartsphere:heartsphere /opt/heartsphere/frontend
```

### 方案2：在服务器上直接修复（适用于服务器上构建的场景）

在生产服务器上执行：

```bash
cd /path/to/heartsphere_new/deploy
sudo ./fix-production-api-url.sh
```

脚本会自动：
1. 创建正确的 `.env.production` 文件（`VITE_API_BASE_URL` 为空字符串）
2. 重新构建前端项目
3. 部署到生产目录

### 方案3：手动修复

#### 步骤1：在本地创建正确的 .env.production

```bash
cd /path/to/heartsphere_new/frontend

cat > .env.production <<EOF
# API 基础URL（使用相对路径，通过 nginx 代理）
# 空字符串表示使用相对路径 /api
VITE_API_BASE_URL=
EOF
```

#### 步骤2：在本地重新构建

```bash
cd /path/to/heartsphere_new/frontend
npm run build
```

#### 步骤3：上传到服务器

```bash
# 方式1: 使用 scp
scp -r frontend/dist/* user@server:/opt/heartsphere/frontend/

# 方式2: 在服务器上执行
cd /opt/heartsphere/frontend
sudo rm -rf *
sudo cp -r /path/to/local/dist/* .
sudo chown -R heartsphere:heartsphere /opt/heartsphere/frontend
```

#### 步骤4：重启 nginx（如果需要）

```bash
sudo systemctl restart nginx
```

## 配置说明

### 正确的配置（生产环境）

**`.env.production` 文件：**
```bash
VITE_API_BASE_URL=
```

**结果：**
- `API_BASE_URL = '/api'`（相对路径）
- 所有 API 请求：`/api/auth/login`, `/api/worlds` 等
- Nginx 自动转发到后端：`http://localhost:8081/api/auth/login`

### 错误的配置

**错误的 `.env.production` 文件：**
```bash
VITE_API_BASE_URL=http://localhost:8081
```

**结果：**
- `API_BASE_URL = 'http://localhost:8081/api'`（绝对路径）
- 所有 API 请求：`http://localhost:8081/api/auth/login`
- 浏览器会尝试从生产域名访问 localhost，导致 CORS 错误

## Nginx 配置要求

确保 nginx 配置中包含 API 代理：

```nginx
# 后端 API 代理
location /api/ {
    proxy_pass http://localhost:8081/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

## 验证修复

### 1. 检查构建产物

```bash
# 不应该包含 localhost:8081
grep -r "localhost:8081" /path/to/heartsphere_new/frontend/dist/assets/*.js

# 应该包含相对路径 /api
grep -r '"/api' /path/to/heartsphere_new/frontend/dist/assets/*.js
```

### 2. 浏览器检查

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 刷新页面
4. 查看 API 请求的 URL：
   - ✅ 正确：`http://heartsphere.cn/api/auth/invite-code-required`
   - ❌ 错误：`http://localhost:8081/api/auth/invite-code-required`

### 3. 控制台检查

在浏览器控制台执行：

```javascript
// 检查 API_BASE_URL 配置
console.log(window.__API_BASE_URL__);  // 应该是 undefined
```

## 常见问题

### Q1: 修复后仍然出现错误？

**A:** 
1. 清除浏览器缓存（Ctrl+Shift+Delete 或 Cmd+Shift+Delete）
2. 硬刷新页面（Ctrl+F5 或 Cmd+Shift+R）
3. 检查是否有其他地方设置了 `window.__API_BASE_URL__`

### Q2: 如何检查是否修复成功？

**A:** 
运行检查脚本：
```bash
sudo ./check-api-config.sh
```

### Q3: 开发环境应该使用什么配置？

**A:** 
开发环境可以使用：
- 相对路径：`VITE_API_BASE_URL=`（Vite 会自动代理）
- 或绝对路径：`VITE_API_BASE_URL=http://localhost:8081`

### Q4: 为什么生产环境不能使用 localhost？

**A:** 
- 生产环境的前端运行在 `http://heartsphere.cn`
- 如果 API_BASE_URL 设置为 `http://localhost:8081`，浏览器会尝试从生产域名访问 localhost
- 这违反了浏览器的安全策略（CORS），因为 localhost 是私有地址空间

## 相关文件

- `deploy/fix-api-url-local.sh` - 本地修复脚本（适用于本地打包场景）
- `deploy/fix-production-api-url.sh` - 服务器端自动修复脚本
- `deploy/check-api-config.sh` - 配置检查脚本
- `frontend/services/api/config.ts` - API 配置核心逻辑
- `deploy/deploy-frontend.sh` - 前端部署脚本

## 总结

1. **问题**：生产环境使用了 `http://localhost:8081` 作为 API 地址
2. **解决**：使用相对路径 `/api`，通过 nginx 代理
3. **修复**：运行 `fix-production-api-url.sh` 脚本或手动修复
4. **验证**：运行 `check-api-config.sh` 检查配置
