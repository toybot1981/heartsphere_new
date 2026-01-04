# API Base URL 配置指南

## 概述

本文档说明如何配置前端API调用的基础URL，结合API调用逻辑和部署脚本的使用方法。

## API调用逻辑

### 1. 配置优先级

API Base URL的配置优先级（从高到低）：

1. **`window.__API_BASE_URL__`** - 运行时注入（最高优先级）
2. **`VITE_API_BASE_URL`** - 环境变量（构建时注入）
3. **默认值** - 空字符串（使用相对路径 `/api`）

### 2. 配置文件位置

**文件**: `frontend/services/api/config.ts`

```typescript
export function getApiBaseUrl(): string {
  // 1. 优先使用运行时注入的全局变量
  if (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
    return (window as any).__API_BASE_URL__;
  }
  
  // 2. 使用 Vite 环境变量
  if (import.meta.env.VITE_API_BASE_URL !== undefined) {
    return import.meta.env.VITE_API_BASE_URL || '';
  }
  
  // 3. 默认使用相对路径
  return '';
}

// API_BASE_URL 最终值
const baseUrl = getApiBaseUrl();
export const API_BASE_URL = baseUrl ? `${baseUrl}/api` : '/api';
```

### 3. API调用方式

**文件**: `frontend/services/api/base/request.ts`

```typescript
const fullUrl = `${API_BASE_URL}${url}`;
// 例如：API_BASE_URL = '/api', url = '/auth/login'
// 结果：'/api/auth/login'
```

## 部署脚本配置

### 1. 标准部署脚本

**文件**: `deploy/deploy-frontend.sh`

该脚本默认使用**相对路径**配置：

```bash
# 创建 .env.production 文件
cat > .env.production <<EOF
# API 基础 URL 配置（生产环境使用相对路径，通过 nginx 代理）
VITE_API_BASE_URL=
EOF
```

**说明**：
- `VITE_API_BASE_URL=` 设置为空字符串
- 最终 `API_BASE_URL = '/api'`（相对路径）
- 通过nginx反向代理转发到后端

### 2. 详细部署脚本

**文件**: `docs/部署/deploy-frontend.sh`

该脚本提供更多配置选项：

```bash
# 根据部署环境选择
case $env_choice in
    1)
        DEPLOY_ENV="development"
        BASE_PATH="/"
        API_BASE_URL=""  # 空字符串 = 相对路径
        ;;
    2)
        DEPLOY_ENV="production"
        BASE_PATH="/"
        API_BASE_URL=""  # 空字符串 = 相对路径
        ;;
esac

# 写入 .env.production
cat > .env.production <<EOF
VITE_API_BASE_URL=${API_BASE_URL}
EOF
```

## 配置方案

### 方案1：使用相对路径（推荐，生产环境）

**适用场景**：
- 前端和后端部署在同一域名下
- 使用nginx反向代理
- 生产环境标准部署

**配置方法**：

1. **在部署脚本中设置**（已默认配置）：
   ```bash
   VITE_API_BASE_URL=
   ```

2. **手动创建 `.env.production` 文件**：
   ```bash
   cd frontend
   echo "VITE_API_BASE_URL=" > .env.production
   ```

3. **Nginx配置**（部署脚本会自动配置）：
   ```nginx
   location /api/ {
       proxy_pass http://localhost:8081/api/;
       # ... 其他配置
   }
   ```

**结果**：
- `API_BASE_URL = '/api'`
- 所有API请求：`/api/auth/login`, `/api/worlds`, 等
- Nginx自动转发到后端：`http://localhost:8081/api/auth/login`

### 方案2：使用绝对URL（开发环境或跨域场景）

**适用场景**：
- 开发环境，前端和后端运行在不同端口
- 跨域部署（前端和后端在不同域名）
- 需要直接访问后端API

**配置方法**：

1. **开发环境**（`.env.development` 或 `.env.local`）：
   ```bash
   cd frontend
   echo "VITE_API_BASE_URL=http://localhost:8081" > .env.development
   ```

2. **生产环境**（`.env.production`）：
   ```bash
   cd frontend
   echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env.production
   ```

3. **修改部署脚本**：
   ```bash
   # 在 deploy-frontend.sh 中修改
   API_BASE_URL="https://api.yourdomain.com"
   # 或
   API_BASE_URL="http://your-backend-ip:8081"
   ```

**结果**：
- `API_BASE_URL = 'http://localhost:8081/api'`（开发环境）
- `API_BASE_URL = 'https://api.yourdomain.com/api'`（生产环境）
- 所有API请求直接访问后端，不经过nginx代理

### 方案3：运行时动态注入（高级场景）

**适用场景**：
- 需要根据环境动态切换API地址
- 多环境部署（同一构建产物，不同环境）
- 需要在不重新构建的情况下修改API地址

**配置方法**：

1. **在 `index.html` 中注入**：
   ```html
   <script>
     window.__API_BASE_URL__ = 'https://api.yourdomain.com';
   </script>
   ```

2. **通过nginx注入**（推荐）：
   ```nginx
   location / {
       # 在返回HTML前注入API地址
       sub_filter '</head>' '<script>window.__API_BASE_URL__="https://api.yourdomain.com";</script></head>';
       sub_filter_once on;
   }
   ```

3. **通过环境变量注入**（Docker等容器化部署）：
   ```bash
   # 在启动脚本中
   sed -i "s|__API_BASE_URL__|${API_BASE_URL}|g" /opt/heartsphere/frontend/index.html
   ```

**结果**：
- `window.__API_BASE_URL__` 优先级最高
- 可以在不重新构建的情况下修改API地址

## 部署脚本使用

### 使用标准部署脚本

```bash
cd deploy
sudo ./deploy-frontend.sh
```

**脚本会自动**：
1. 创建 `.env.production` 文件，设置 `VITE_API_BASE_URL=`（空字符串）
2. 构建前端项目（Vite会读取 `.env.production`）
3. 配置nginx反向代理 `/api/` 到后端
4. 部署到 `/opt/heartsphere/frontend`

### 自定义API Base URL

如果需要使用绝对URL，可以修改部署脚本：

```bash
# 编辑 deploy/deploy-frontend.sh
# 找到创建 .env.production 的部分，修改为：
cat > .env.production <<EOF
VITE_API_BASE_URL=https://api.yourdomain.com
EOF
```

或者手动创建 `.env.production`：

```bash
cd frontend
cat > .env.production <<EOF
VITE_API_BASE_URL=https://api.yourdomain.com
EOF
npm run build
```

## 验证配置

### 1. 检查构建后的配置

```bash
# 查看构建后的代码
grep -r "API_BASE_URL" frontend/dist/assets/*.js | head -5
```

### 2. 浏览器控制台检查

```javascript
// 在浏览器控制台执行
console.log(window.__API_BASE_URL__);  // 应该是 undefined 或设置的值
console.log(import.meta.env.VITE_API_BASE_URL);  // 构建时的值
```

### 3. 网络请求检查

打开浏览器开发者工具 → Network标签：
- 相对路径：请求URL应该是 `/api/auth/login`
- 绝对路径：请求URL应该是 `http://localhost:8081/api/auth/login`

## 常见问题

### Q1: 为什么生产环境推荐使用相对路径？

**A**: 
- 相对路径通过nginx代理，更安全（隐藏后端地址）
- 支持HTTPS自动转发
- 避免CORS问题
- 便于负载均衡和CDN配置

### Q2: 开发环境应该使用什么配置？

**A**: 
- 如果使用Vite开发服务器（`npm run dev`），使用相对路径即可
- Vite的 `vite.config.ts` 中已配置代理：
  ```typescript
  proxy: {
    '/api': {
      target: 'http://localhost:8081',
      changeOrigin: true,
    }
  }
  ```

### Q3: 如何在不同环境使用不同的API地址？

**A**: 
1. **方案1**：创建不同的环境文件
   - `.env.development` - 开发环境
   - `.env.production` - 生产环境
   - `.env.staging` - 预发布环境

2. **方案2**：使用运行时注入（`window.__API_BASE_URL__`）

3. **方案3**：在部署脚本中根据环境变量设置

### Q4: 修改API Base URL后需要重新构建吗？

**A**: 
- 如果使用 `VITE_API_BASE_URL`：**需要重新构建**
- 如果使用 `window.__API_BASE_URL__`：**不需要重新构建**（运行时注入）

### Q5: Nginx配置和API Base URL的关系？

**A**: 
- **相对路径**（`/api`）：需要nginx配置代理
- **绝对路径**（`http://...`）：不需要nginx代理，直接访问后端

## 配置示例

### 示例1：标准生产环境部署

```bash
# .env.production
VITE_API_BASE_URL=

# Nginx配置（自动生成）
location /api/ {
    proxy_pass http://localhost:8081/api/;
}
```

### 示例2：开发环境

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8081

# 或使用相对路径（Vite代理会自动处理）
VITE_API_BASE_URL=
```

### 示例3：跨域部署

```bash
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com

# 后端需要配置CORS允许前端域名
```

## 相关文件

- `frontend/services/api/config.ts` - API配置核心逻辑
- `frontend/services/api/base/request.ts` - API请求函数
- `frontend/vite.config.ts` - Vite配置（开发环境代理）
- `deploy/deploy-frontend.sh` - 标准部署脚本
- `docs/部署/deploy-frontend.sh` - 详细部署脚本

## 总结

1. **生产环境推荐**：使用相对路径（`VITE_API_BASE_URL=`），通过nginx代理
2. **开发环境**：使用相对路径或 `http://localhost:8081`，Vite会自动代理
3. **跨域场景**：使用绝对URL，需要后端配置CORS
4. **动态切换**：使用 `window.__API_BASE_URL__` 运行时注入

配置优先级：`window.__API_BASE_URL__` > `VITE_API_BASE_URL` > 默认相对路径
