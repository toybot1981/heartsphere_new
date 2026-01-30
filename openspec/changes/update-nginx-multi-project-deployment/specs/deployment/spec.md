## MODIFIED Requirements

### Requirement: Nginx 多项目统一部署配置

系统 SHALL 通过单一 Nginx 端口提供多项目前端访问，通过路径路由区分不同项目。

#### Scenario: 本地开发环境访问
- **WHEN** 用户在本地开发环境访问 `http://localhost:8080`
- **THEN** 系统返回 main 项目 PC 端页面（`main/frontend/dist/index.html`）

#### Scenario: 本地开发环境移动端访问
- **WHEN** 用户在本地开发环境访问 `http://localhost:8080/mobile.html`
- **THEN** 系统返回 main 项目移动端页面（`main/frontend/dist/mobile.html`）

#### Scenario: 本地开发环境管理后台访问
- **WHEN** 用户在本地开发环境访问 `http://localhost:8080/admin.html`
- **THEN** 系统返回 admin 项目页面（`admin/frontend/dist/index.html`）

#### Scenario: 本地开发环境教育版访问
- **WHEN** 用户在本地开发环境访问 `http://localhost:8080/edu.html`
- **THEN** 系统返回 edu 项目页面（`edu/frontend/dist/index.html`）

#### Scenario: 本地开发环境 Mentis 访问
- **WHEN** 用户在本地开发环境访问 `http://localhost:8080/mentis`
- **THEN** 系统返回 mentis 项目页面（`mentis/frontend/dist/index.html`）

#### Scenario: 生产环境域名访问
- **WHEN** 用户在生产环境访问 `http://heartsphere.cn`
- **THEN** 系统返回 main 项目 PC 端页面

#### Scenario: 生产环境多项目路径访问
- **WHEN** 用户在生产环境访问 `http://heartsphere.cn/admin.html`
- **THEN** 系统返回 admin 项目页面
- **WHEN** 用户访问 `http://heartsphere.cn/edu.html`
- **THEN** 系统返回 edu 项目页面
- **WHEN** 用户访问 `http://heartsphere.cn/mentis`
- **THEN** 系统返回 mentis 项目页面

#### Scenario: API 代理路由
- **WHEN** 前端请求 `/api/main/...`
- **THEN** Nginx 将请求代理到 `http://localhost:8081/api/...`
- **WHEN** 前端请求 `/api/admin/...`
- **THEN** Nginx 将请求代理到 `http://localhost:8085/api/...`
- **WHEN** 前端请求 `/api/edu/...`
- **THEN** Nginx 将请求代理到 `http://localhost:8084/api/...`
- **WHEN** 前端请求 `/api/mentis/...`
- **THEN** Nginx 将请求代理到 `http://localhost:8082/api/...`

#### Scenario: 后端服务端口保持独立
- **WHEN** 系统部署多项目
- **THEN** main 后端服务运行在端口 8081
- **THEN** admin 后端服务运行在端口 8085
- **THEN** edu 后端服务运行在端口 8084
- **THEN** mentis 后端服务运行在端口 8082
- **THEN** company 后端服务运行在端口 8083（如需要）

## ADDED Requirements

### Requirement: 环境变量多项目部署配置

环境变量配置脚本 SHALL 支持多项目统一部署的配置项。

#### Scenario: 开发环境 BASE_URL 配置
- **WHEN** 运行 `setup-env-dev.sh` 脚本
- **THEN** BASE_URL 默认值设置为 `http://localhost:8080`
- **THEN** 脚本提示用户确认或修改 BASE_URL

#### Scenario: 生产环境 BASE_URL 配置
- **WHEN** 运行 `setup-env-prod.sh` 脚本
- **THEN** BASE_URL 默认值设置为 `http://heartsphere.cn`
- **THEN** 脚本提示用户确认或修改 BASE_URL

#### Scenario: 环境变量模板更新
- **WHEN** 查看 `env.template` 文件
- **THEN** BASE_URL 配置项包含多项目部署说明注释
- **THEN** 配置项说明包含各项目路径路由信息
