# Main 端安装部署指南

本文档说明 HeartSphere 主应用（Main）的安装、环境变量与基本部署方式。

## 1. 环境要求

- **JDK**：17+
- **Maven**：3.6+
- **Node.js**：18+（前端）
- **MySQL**：5.7+ 或 8.x，已创建数据库 `heartsphere`（或与 `DB_NAME` 一致）
- **可选**：HSMem 记忆服务（不部署时 Main 使用内置记忆实现）

## 2. 目录结构

- 后端：`main/backend`（Spring Boot）
- 前端：`main/frontend`（Vite + React）

## 3. 环境变量配置

### 3.1 后端环境变量

后端可通过 `main/backend/.env` 或系统环境变量配置，优先级：系统环境变量 > `.env` > `application.yml` 默认值。

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DB_HOST` | MySQL 主机 | `localhost` |
| `DB_PORT` | MySQL 端口 | `3306` |
| `DB_NAME` | 数据库名 | `heartsphere` |
| `DB_USER` | 数据库用户 | `root` |
| `DB_PASSWORD` | 数据库密码 | `123456` |
| `JWT_SECRET` | JWT 签名密钥（生产务必修改） | 见 yml |
| `SPRING_PROFILES_ACTIVE` | Spring 配置剖面 | `dev` |
| `IMAGE_STORAGE_PATH` | 图片本地存储路径 | `../../uploads/images` |
| `IMAGE_BASE_URL` | 图片访问基础 URL（生产需配置） | 空则用请求域名 |
| `HSMEM_MODE` | 记忆模式：`local` 内置 / `remote` 外连 HSMem | `local` |
| `HSMEM_BASE_URL` | HSMem 服务地址（`HSMEM_MODE=remote` 时使用） | `http://localhost:8000` |
| `WECHAT_APP_ID` / `WECHAT_APP_SECRET` | 微信登录（可选） | - |

后端配置文件：`main/backend/src/main/resources/application.yml`。

### 3.2 前端环境变量

前端通过 `main/frontend/.env` 或 `.env.development` / `.env.production` 配置，以 `VITE_` 开头的变量会暴露给前端代码。

| 变量名 | 说明 | 默认/示例 |
|--------|------|-----------|
| `VITE_API_BASE_URL` | Main 后端 API 地址 | `http://localhost:8081`（开发直连时） |

开发时留空则走 Vite 代理；生产可配置为实际后端域名（如 `https://api.example.com`）。

## 4. 数据库

- 使用 MySQL 数据库名与 `DB_NAME` 一致（默认 `heartsphere`）。
- 首次部署可使用本目录下 `db/heartsphere.sql` 导入：
  ```bash
  mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS heartsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  mysql -u root -p heartsphere < 安装指南/db/heartsphere.sql
  ```
- 后端已启用 Flyway，若有迁移脚本会按版本执行。

## 5. 启动方式

### 5.1 开发环境

```bash
# 在项目根目录
# 1. 启动 Main 后端（端口 8081）
./scripts/start/start-main-backend.sh

# 2. 启动 Main 前端（端口 3000）
./scripts/start/start-main-frontend.sh
```

或进入子目录手动启动：

```bash
cd main/backend && mvn spring-boot:run
cd main/frontend && npm install && npm run dev
```

### 5.2 生产部署要点

- 修改 `JWT_SECRET`、`DB_PASSWORD` 等敏感配置，不要使用默认值。
- 配置 `IMAGE_BASE_URL`、`APP_CORS_ALLOWED_ORIGINS` 等以匹配生产域名。
- 前端构建：`npm run build`，将 `dist` 交由 Nginx 等托管，API 通过反向代理指向 Main 后端（如 `/api` → `http://127.0.0.1:8081`）。
- 更完整的生产部署可参考项目内 `deploy/DEPLOYMENT_GUIDE.md`。

## 6. 与其它组件的调用关系

- **Main 前端 → Main 后端**：通过 `VITE_API_BASE_URL` 或代理访问 `http://localhost:8081`。
- **Main 后端 → MySQL**：连接 `heartsphere` 库，负责用户、角色、技能、长期记忆等。
- **Main 后端 → HSMem**：当 `HSMEM_MODE=remote` 时，按 `HSMEM_BASE_URL` 访问记忆服务；为 `local` 时使用内置实现，不依赖外部 HSMem。
- **Admin 后端/前端** 会调用 Main 后端（技能测试、AI 等），部署 Admin 时需保证 Main 后端可访问（见 [Admin 安装部署指南](./admin-安装部署指南.md)）。

## 7. 常用端口与检查

- 后端：`http://localhost:8081`
- 前端：`http://localhost:3000`
- 健康检查：`GET http://localhost:8081/api/health`（若项目已暴露该接口）
- Swagger（开发）：`http://localhost:8081/swagger-ui.html`
