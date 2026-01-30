# Design: Nginx 多项目统一部署架构

## Context

HeartSphere 项目包含多个子项目：
- **main**: 主项目（PC 端和移动端）
- **admin**: 管理后台
- **edu**: 教育版
- **mentis**: Mentis 系统

当前架构下，每个项目都有独立的前端和后端服务，前端通过不同的端口访问（3000, 3005, 3001, 3002），后端通过不同的端口提供服务（8081, 8085, 8084, 8082）。

## Goals

1. **统一访问入口**：通过单一 Nginx 端口（本地 8080，生产 80）访问所有前端项目
2. **路径路由**：通过 URL 路径区分不同项目，避免端口冲突
3. **后端服务独立**：保持各项目后端服务的独立性和端口配置
4. **环境配置统一**：统一管理环境变量和部署配置

## Non-Goals

- 不改变后端服务的端口配置
- 不合并前端项目的代码结构
- 不改变各项目的独立构建流程

## Decisions

### 1. 路径路由方案

**决策**: 使用路径前缀区分不同项目

**路径映射**:
- `main` (PC): `/` → `main/frontend/dist/index.html`
- `main` (Mobile): `/mobile.html` → `main/frontend/dist/mobile.html`
- `admin`: `/admin.html` → `admin/frontend/dist/index.html`
- `edu`: `/edu.html` → `edu/frontend/dist/index.html`
- `mentis`: `/mentis` → `mentis/frontend/dist/index.html`

**理由**:
- 简单直观，易于理解和维护
- 符合 SPA 应用的路由模式
- 避免复杂的子域名配置

**替代方案考虑**:
- 子域名方案（如 `admin.heartsphere.cn`）：需要 DNS 配置，复杂度更高
- 端口方案：无法统一访问入口，不符合需求

### 2. API 代理配置

**决策**: 使用路径前缀区分不同后端服务

**API 路径映射**:
- `/api/main/` → `http://localhost:8081/api/`
- `/api/admin/` → `http://localhost:8085/api/`
- `/api/edu/` → `http://localhost:8084/api/`
- `/api/mentis/` → `http://localhost:8082/api/`

**理由**:
- 保持后端服务端口不变，最小化影响
- 通过路径前缀明确区分不同后端服务
- 便于前端配置 API 基础 URL

**替代方案考虑**:
- 统一后端端口：需要修改所有后端配置，影响范围大
- 使用请求头区分：实现复杂，不利于调试

### 3. 静态资源路径

**决策**: 各项目静态资源独立部署

**路径结构**:
```
/opt/heartsphere/
├── main/frontend/dist/      # main 项目前端
├── admin/frontend/dist/     # admin 项目前端
├── edu/frontend/dist/       # edu 项目前端
├── mentis/frontend/dist/    # mentis 项目前端
└── backend/uploads/images/  # 共享图片资源
```

**理由**:
- 保持各项目构建产物的独立性
- 便于独立部署和更新
- 避免资源路径冲突

### 4. 环境变量配置

**决策**: 统一 BASE_URL 配置，支持多项目路径

**配置项**:
- `BASE_URL`: 统一的基础 URL（本地: `http://localhost:8080`，生产: `http://heartsphere.cn`）
- 各项目前端通过相对路径或 `${BASE_URL}/api/{project}/` 访问后端 API

**理由**:
- 简化配置管理
- 便于环境切换（开发/生产）
- 符合统一部署架构

## Risks / Trade-offs

### 风险 1: 路径冲突
**风险**: 不同项目的路由路径可能冲突

**缓解措施**:
- 使用精确路径匹配（`location = /admin.html`）优先于通用匹配
- 明确各项目的路径前缀规范
- 在部署文档中明确说明路径映射关系

### 风险 2: API 路径变更
**风险**: 前端需要更新 API 基础 URL 配置

**缓解措施**:
- 提供迁移指南，说明如何更新前端 API 配置
- 在环境变量脚本中添加配置提示
- 提供配置验证工具

### 风险 3: 构建产物路径
**风险**: 各项目构建产物需要部署到正确位置

**缓解措施**:
- 更新部署脚本，明确各项目的部署路径
- 在 Nginx 配置中添加路径验证
- 提供部署检查清单

## Migration Plan

### 阶段 1: 配置更新
1. 更新 Nginx 配置文件（本地和生产）
2. 更新环境变量脚本和模板
3. 更新部署脚本

### 阶段 2: 前端配置更新
1. 更新各项目前端的 API 基础 URL 配置
2. 确保构建产物输出到正确路径
3. 测试各项目的前端访问

### 阶段 3: 部署验证
1. 本地环境部署验证
2. 生产环境部署验证
3. 各项目功能验证

### 回滚计划
- 保留原有 Nginx 配置文件备份
- 保留原有环境变量配置
- 如有问题，可快速回滚到原配置

## Open Questions

1. **图片资源路径**: 是否需要为不同项目配置独立的图片路径？
   - **当前决策**: 使用共享路径 `/images/`，所有项目共用

2. **WebSocket 支持**: 是否需要为不同项目配置独立的 WebSocket 路径？
   - **当前决策**: 通过 API 路径前缀区分，如 `/api/main/ws`

3. **HTTPS 配置**: 生产环境是否需要立即配置 HTTPS？
   - **当前决策**: 保留 HTTPS 配置示例（已注释），按需启用
