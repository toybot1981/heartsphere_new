# Tasks: 更新 Nginx 多项目统一部署配置

## 1. Nginx 配置文件更新

- [x] 1.1 更新本地开发环境 Nginx 配置 (`deploy/nginx-heartsphere-local.conf`)
  - [x] 1.1.1 确认监听端口为 8080
  - [x] 1.1.2 添加 main 项目路径路由（`/` 和 `/mobile.html`）
  - [x] 1.1.3 添加 admin 项目路径路由（`/admin.html`）
  - [x] 1.1.4 添加 edu 项目路径路由（`/edu.html`）
  - [x] 1.1.5 添加 mentis 项目路径路由（`/mentis`）
  - [x] 1.1.6 更新 API 代理配置，支持多后端服务（`/api/main/`, `/api/admin/`, `/api/edu/`, `/api/mentis/`）
  - [x] 1.1.7 更新静态资源路径配置
  - [x] 1.1.8 更新图片资源路径配置

- [x] 1.2 更新生产环境 Nginx 配置 (`deploy/nginx-heartsphere-production.conf`)
  - [x] 1.2.1 更新 server_name 为 `heartsphere.cn`
  - [x] 1.2.2 添加 main 项目路径路由（`/` 和 `/mobile.html`）
  - [x] 1.2.3 添加 admin 项目路径路由（`/admin.html`）
  - [x] 1.2.4 添加 edu 项目路径路由（`/edu.html`）
  - [x] 1.2.5 添加 mentis 项目路径路由（`/mentis`）
  - [x] 1.2.6 更新 API 代理配置，支持多后端服务
  - [x] 1.2.7 更新静态资源路径配置
  - [x] 1.2.8 更新图片资源路径配置

## 2. 部署脚本更新

- [x] 2.1 更新本地开发环境 Nginx 安装脚本 (`deploy/install-nginx-config-dev.sh`)
  - [x] 2.1.1 更新配置说明，说明多项目路径路由
  - [x] 2.1.2 更新路径提示信息

- [x] 2.2 更新生产环境 Nginx 安装脚本 (`deploy/install-nginx-config-prod.sh`)
  - [x] 2.2.1 更新配置说明，说明多项目路径路由
  - [x] 2.2.2 更新域名配置提示（默认 `heartsphere.cn`）
  - [x] 2.2.3 更新路径提示信息

## 3. 环境变量脚本更新

- [x] 3.1 更新环境变量模板 (`deploy/env.template`)
  - [x] 3.1.1 更新 BASE_URL 说明，添加多项目部署说明
  - [x] 3.1.2 添加多项目路径配置注释

- [x] 3.2 更新开发环境变量脚本 (`deploy/setup-env-dev.sh`)
  - [x] 3.2.1 更新 BASE_URL 默认值为 `http://localhost:8080`
  - [x] 3.2.2 添加多项目路径配置说明

- [x] 3.3 更新生产环境变量脚本 (`deploy/setup-env-prod.sh`)
  - [x] 3.3.1 更新 BASE_URL 默认值为 `http://heartsphere.cn`
  - [x] 3.3.2 添加多项目路径配置说明

## 4. 配置验证

- [ ] 4.1 验证本地开发环境配置
  - [ ] 4.1.1 测试 Nginx 配置语法 (`nginx -t`)
  - [ ] 4.1.2 验证各项目路径路由
  - [ ] 4.1.3 验证 API 代理配置
  - [ ] 4.1.4 验证静态资源访问

- [ ] 4.2 验证生产环境配置
  - [ ] 4.2.1 测试 Nginx 配置语法
  - [ ] 4.2.2 验证域名配置
  - [ ] 4.2.3 验证各项目路径路由
  - [ ] 4.2.4 验证 API 代理配置

## 5. 文档更新

- [x] 5.1 更新部署文档
  - [x] 5.1.1 更新 `deploy/nginx-config-README.md`，说明多项目路径路由
  - [x] 5.1.2 更新 `deploy/nginx-deploy-guide.md`，添加多项目部署说明
  - [x] 5.1.3 更新 `deploy/DEPLOYMENT_INDEX.md`，说明新的部署架构

- [ ] 5.2 创建迁移指南（如需要）
  - [ ] 5.2.1 说明如何从旧配置迁移到新配置
  - [ ] 5.2.2 说明前端 API 配置更新方法
