# Nginx 多项目统一部署迁移指南

## 概述

本文档说明如何从旧的单项目部署配置迁移到新的多项目统一部署配置。

## 主要变更

### 1. 访问方式变更

**旧配置**：
- 各项目通过独立端口访问
- main: `http://localhost:3000`
- admin: `http://localhost:3005`
- edu: `http://localhost:3001`
- mentis: `http://localhost:3002`

**新配置**：
- 所有项目通过统一端口访问（本地 8080，生产 80）
- main (PC): `http://localhost:8080/` 或 `http://heartsphere.cn/`
- main (Mobile): `http://localhost:8080/mobile.html`
- admin: `http://localhost:8080/admin.html`
- edu: `http://localhost:8080/edu.html`
- mentis: `http://localhost:8080/mentis`

### 2. API 路径变更

**旧配置**：
- 各项目直接访问后端服务
- main: `http://localhost:8081/api`
- admin: `http://localhost:8085/api/admin`
- edu: `http://localhost:8084/api/edu`
- mentis: `http://localhost:8082/api/mentis`

**新配置**：
- 所有项目通过 Nginx 代理访问后端
- main: `/api/main/` → `http://localhost:8081/api/`
- admin: `/api/admin/` → `http://localhost:8085/api/`
- edu: `/api/edu/` → `http://localhost:8084/api/`
- mentis: `/api/mentis/` → `http://localhost:8082/api/`

## 迁移步骤

### 步骤 1: 更新 Nginx 配置

1. **备份现有配置**
   ```bash
   # 本地环境
   sudo cp /usr/local/etc/nginx/servers/heartsphere.conf /usr/local/etc/nginx/servers/heartsphere.conf.backup
   
   # 生产环境
   sudo cp /etc/nginx/conf.d/heartsphere.conf /etc/nginx/conf.d/heartsphere.conf.backup
   ```

2. **安装新配置**
   ```bash
   # 本地环境
   cd deploy
   ./install-nginx-config-dev.sh
   
   # 生产环境
   sudo ./install-nginx-config-prod.sh
   ```

3. **验证配置**
   ```bash
   # 测试配置语法
   sudo nginx -t
   
   # 如果测试通过，重载配置
   sudo nginx -s reload  # macOS
   sudo systemctl reload nginx  # Linux
   ```

### 步骤 2: 更新前端 API 配置

#### Main 项目

Main 项目使用相对路径 `/api`，需要更新为 `/api/main/`。

**文件**: `main/frontend/services/api/config.ts`

**修改**:
```typescript
// 旧配置（默认使用 /api）
export const API_BASE_URL = '/api';

// 新配置（需要更新为 /api/main）
export const API_BASE_URL = '/api/main';
```

或者通过环境变量配置：
```bash
VITE_API_BASE_URL=/api/main
```

#### Admin 项目

**文件**: `admin/frontend/src/services/api/config.ts`

**当前配置**:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/admin';
```

**建议修改为**:
```typescript
// 使用相对路径，通过 Nginx 代理
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/admin';
```

或者通过环境变量配置：
```bash
VITE_API_BASE_URL=/api/admin
```

#### Edu 项目

**文件**: `edu/frontend/src/services/api/config.ts`

**当前配置**:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086/api/edu';
```

**建议修改为**:
```typescript
// 使用相对路径，通过 Nginx 代理
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/edu';
```

或者通过环境变量配置：
```bash
VITE_API_BASE_URL=/api/edu
```

#### Mentis 项目

Mentis 项目已经使用 `/api/mentis`，无需修改。

### 步骤 3: 更新前端构建配置

确保各项目前端构建产物输出到正确目录：

#### 本地开发环境

- main: `main/frontend/dist/`
- admin: `admin/frontend/dist/`
- edu: `edu/frontend/dist/`
- mentis: `mentis/frontend/dist/`

#### 生产环境

- main: `/opt/heartsphere/main/frontend/`
- admin: `/opt/heartsphere/admin/frontend/`
- edu: `/opt/heartsphere/edu/frontend/`
- mentis: `/opt/heartsphere/mentis/frontend/`

### 步骤 4: 更新环境变量

1. **更新环境变量模板**
   ```bash
   cd deploy
   # 查看 env.template 中的 BASE_URL 配置
   ```

2. **更新开发环境变量**
   ```bash
   ./setup-env-dev.sh
   # BASE_URL 默认值: http://localhost:8080
   ```

3. **更新生产环境变量**
   ```bash
   ./setup-env-prod.sh
   # BASE_URL 默认值: http://heartsphere.cn
   ```

### 步骤 5: 重新构建和部署前端

1. **构建各项目前端**
   ```bash
   # Main 项目
   cd main/frontend
   npm run build
   
   # Admin 项目
   cd admin/frontend
   npm run build
   
   # Edu 项目
   cd edu/frontend
   npm run build
   
   # Mentis 项目
   cd mentis/frontend
   npm run build
   ```

2. **部署到正确目录**
   ```bash
   # 本地开发环境
   # 构建产物已经在正确目录
   
   # 生产环境
   sudo cp -r main/frontend/dist/* /opt/heartsphere/main/frontend/
   sudo cp -r admin/frontend/dist/* /opt/heartsphere/admin/frontend/
   sudo cp -r edu/frontend/dist/* /opt/heartsphere/edu/frontend/
   sudo cp -r mentis/frontend/dist/* /opt/heartsphere/mentis/frontend/
   ```

### 步骤 6: 验证部署

1. **验证 Nginx 配置**
   ```bash
   sudo nginx -t
   ```

2. **测试各项目访问**
   ```bash
   # 本地环境
   curl http://localhost:8080/              # main (PC)
   curl http://localhost:8080/mobile.html   # main (Mobile)
   curl http://localhost:8080/admin.html    # admin
   curl http://localhost:8080/edu.html      # edu
   curl http://localhost:8080/mentis        # mentis
   
   # 生产环境
   curl http://heartsphere.cn/              # main (PC)
   curl http://heartsphere.cn/mobile.html   # main (Mobile)
   curl http://heartsphere.cn/admin.html    # admin
   curl http://heartsphere.cn/edu.html      # edu
   curl http://heartsphere.cn/mentis        # mentis
   ```

3. **测试 API 代理**
   ```bash
   # 本地环境
   curl http://localhost:8080/api/main/health
   curl http://localhost:8080/api/admin/health
   curl http://localhost:8080/api/edu/health
   curl http://localhost:8080/api/mentis/health
   
   # 生产环境
   curl http://heartsphere.cn/api/main/health
   curl http://heartsphere.cn/api/admin/health
   curl http://heartsphere.cn/api/edu/health
   curl http://heartsphere.cn/api/mentis/health
   ```

## 回滚方案

如果遇到问题需要回滚：

1. **恢复 Nginx 配置**
   ```bash
   # 本地环境
   sudo cp /usr/local/etc/nginx/servers/heartsphere.conf.backup /usr/local/etc/nginx/servers/heartsphere.conf
   sudo nginx -s reload
   
   # 生产环境
   sudo cp /etc/nginx/conf.d/heartsphere.conf.backup /etc/nginx/conf.d/heartsphere.conf
   sudo systemctl reload nginx
   ```

2. **恢复前端 API 配置**
   - 恢复各项目前端的 API 配置为旧值
   - 重新构建和部署前端

## 常见问题

### Q: 前端 API 请求 404？

A: 检查：
1. 前端 API 基础路径是否正确（如 `/api/main/`, `/api/admin/` 等）
2. Nginx 配置中的 API 代理路径是否正确
3. 后端服务是否正常运行
4. 查看 Nginx 错误日志：`tail -f /var/log/nginx/heartsphere-error.log`

### Q: 前端页面无法访问？

A: 检查：
1. 前端构建产物是否在正确目录
2. Nginx 配置中的路径路由是否正确
3. 文件权限是否正确
4. 查看 Nginx 错误日志

### Q: 图片无法访问？

A: 检查：
1. 图片目录路径是否正确
2. Nginx 配置中的图片路径配置
3. 文件权限是否正确

### Q: 如何确认各项目的前端 API 配置？

A: 查看各项目的 API 配置文件：
- main: `main/frontend/services/api/config.ts`
- admin: `admin/frontend/src/services/api/config.ts`
- edu: `edu/frontend/src/services/api/config.ts`
- mentis: `mentis/frontend/src/services/mentisApi.ts`

## 参考文档

- `deploy/nginx-config-README.md` - Nginx 配置详细说明
- `deploy/nginx-deploy-guide.md` - 快速部署指南
- `deploy/DEPLOYMENT_INDEX.md` - 部署文件总览
- `deploy/env.template` - 环境变量模板
