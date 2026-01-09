# 生产环境 API 配置修复说明

## 问题描述

生产环境管理登录页面出现 CORS 错误：
```
Access to fetch at 'http://localhost:8081/api/admin/auth/login' from origin 'http://heartsphere.cn' 
has been blocked by CORS policy: The request client is not a secure context and the resource is 
in more-private address space `loopback`.
```

**原因**：生产环境的前端代码在访问 `http://localhost:8081`，而不是使用相对路径。

## 修复内容

### 1. 部署脚本修改 (`docs/部署/deploy-frontend.sh`)

**修改点 1**：在构建前清理旧的构建产物
```bash
# 清理旧的构建产物和环境变量文件
rm -rf dist .env.production
```

**修改点 2**：明确设置 `VITE_API_BASE_URL` 为空字符串
```bash
# 创建 .env.production 文件时，明确设置
VITE_API_BASE_URL=
```

**修改点 3**：即使没有 `.env` 文件，也创建 `.env.production`
```bash
# 确保始终创建 .env.production，设置相对路径
cat > .env.production <<EOF
# API 基础 URL 配置（生产环境使用相对路径，通过 nginx 代理）
VITE_API_BASE_URL=
EOF
```

### 2. npm install 配置

添加 `--legacy-peer-deps` 参数，忽略 peer dependencies 冲突：
```bash
npm install --legacy-peer-deps
```

## 解决方案

### 立即修复（已部署的环境）

1. **重新构建前端**：
   ```bash
   cd /opt/heartsphere/frontend
   rm -rf dist .env.production
   
   # 创建 .env.production 文件
   cat > .env.production <<EOF
   VITE_API_BASE_URL=
   EOF
   
   # 重新构建
   npm run build
   
   # 部署新构建的文件
   cp -r dist/* /opt/heartsphere/frontend/
   ```

2. **或者使用部署脚本重新部署**：
   ```bash
   ./docs/部署/deploy-frontend.sh
   ```

### 验证修复

1. 检查构建后的代码：
   ```bash
   # 在 dist 目录中搜索 localhost
   grep -r "localhost:8081" /opt/heartsphere/frontend/
   # 应该没有结果
   ```

2. 检查浏览器控制台：
   - 打开 `http://heartsphere.cn/admin.html`
   - 打开开发者工具（F12）
   - 查看 Network 标签
   - 登录请求应该是 `/api/admin/auth/login`（相对路径）
   - 不应该看到 `http://localhost:8081`

## 配置说明

### 开发环境
- `VITE_API_BASE_URL` 未设置或为空
- 使用相对路径 `/api`
- Vite 代理自动转发到 `http://localhost:8081`

### 生产环境
- `VITE_API_BASE_URL=`（明确设置为空字符串）
- 使用相对路径 `/api`
- Nginx 反向代理转发到后端服务器

## Nginx 配置

确保 Nginx 配置正确（已在部署脚本中配置）：
```nginx
location /api/ {
    proxy_pass http://localhost:8081;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

## 注意事项

1. **环境变量优先级**：
   - `window.__API_BASE_URL__`（运行时注入，最高优先级）
   - `VITE_API_BASE_URL`（构建时注入）
   - 默认值：空字符串（相对路径）

2. **构建时 vs 运行时**：
   - Vite 在构建时将环境变量注入到代码中
   - 构建后无法通过环境变量修改（除非使用运行时注入）

3. **重新构建要求**：
   - 修改 `.env.production` 后必须重新构建
   - 仅修改 Nginx 配置不需要重新构建

## 验证清单

- [ ] `.env.production` 文件中 `VITE_API_BASE_URL=` 为空
- [ ] 构建后的代码中没有硬编码的 `localhost:8081`
- [ ] 浏览器 Network 标签显示请求使用相对路径 `/api/...`
- [ ] Nginx 配置正确，能够代理 `/api/` 请求
- [ ] 后端服务正常运行在 8081 端口
