# Change: 更新 Nginx 多项目统一部署配置

## Why

当前 Nginx 配置仅支持主项目（main）的部署，无法通过统一端口访问多个子项目（admin、edu、mentis）。根据新的架构要求，需要实现：

1. **统一访问入口**：所有前端项目通过同一个 Nginx 端口（本地 8080，生产环境 80）访问
2. **路径路由**：通过不同的路径前缀区分不同项目
   - main: `/` (PC) 和 `/mobile.html` (移动端)
   - admin: `/admin.html`
   - edu: `/edu.html`
   - mentis: `/mentis`
3. **后端端口保持独立**：各项目的后端服务端口保持不变（8081, 8082, 8083, 8084, 8085）
4. **环境变量配置**：更新环境变量脚本以支持多项目部署配置

## What Changes

### Nginx 配置更新
- **本地开发环境** (`nginx-heartsphere-local.conf`)
  - 更新监听端口为 8080
  - 添加多项目路径路由配置
  - 更新 API 代理配置，支持不同后端端口
  - 更新静态资源路径配置

- **生产环境** (`nginx-heartsphere-production.conf`)
  - 更新 server_name 为 `heartsphere.cn`
  - 添加多项目路径路由配置
  - 更新 API 代理配置，支持不同后端端口
  - 更新静态资源路径配置

### 部署脚本更新
- **Nginx 安装脚本** (`install-nginx-config-dev.sh`, `install-nginx-config-prod.sh`)
  - 更新配置说明和路径提示

### 环境变量脚本更新
- **开发环境** (`setup-env-dev.sh`)
  - 更新 BASE_URL 默认值为 `http://localhost:8080`
  - 添加多项目路径配置说明

- **生产环境** (`setup-env-prod.sh`)
  - 更新 BASE_URL 默认值为 `http://heartsphere.cn`
  - 添加多项目路径配置说明

### 环境变量模板更新
- **env.template**
  - 更新 BASE_URL 说明
  - 添加多项目部署相关注释

## Impact

- **Affected specs**: `deployment` capability
- **Affected code**:
  - `deploy/nginx-heartsphere-local.conf`
  - `deploy/nginx-heartsphere-production.conf`
  - `deploy/install-nginx-config-dev.sh`
  - `deploy/install-nginx-config-prod.sh`
  - `deploy/setup-env-dev.sh`
  - `deploy/setup-env-prod.sh`
  - `deploy/env.template`

- **Breaking changes**: 
  - **BREAKING**: 本地开发环境访问端口从 3000 改为 8080（通过 Nginx）
  - **BREAKING**: 生产环境域名从 `localhost` 改为 `heartsphere.cn`
  - 各项目前端需要通过 Nginx 访问，不再直接访问开发服务器端口

- **Migration notes**:
  - 需要重新安装 Nginx 配置文件
  - 需要更新前端项目的 API 基础 URL 配置
  - 需要确保所有前端项目的构建产物都部署到正确的位置
