# Admin 端安装部署指南

本文档说明 HeartSphere 管理后台（Admin）的安装、环境变量与基本部署方式。

## 1. 环境要求

- **JDK**：17+
- **Maven**：3.6+
- **Node.js**：18+（前端）
- **MySQL**：5.7+ 或 8.x，需至少存在数据库 `heartsphere`（与 Main 共用）；若使用 Mentis/Edu/Agent Mind 等模块，还需对应库：`heartsphere_mentis`、`heartsphere_edu`、`heartsphere_agent_mind`
- **可选**：Main 后端（:8081）用于技能测试、AI 生成等；HSMem（:8000）用于用户记忆管理

## 2. 目录结构

- 后端：`admin/backend`（Spring Boot，多数据源）
- 前端：`admin/frontend`（Vite + React）

## 3. 环境变量配置

### 3.1 后端环境变量

通过 `admin/backend` 下的 `.env` 或系统环境变量配置，优先级：系统环境变量 > `.env` > `application.yml` 默认值。

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DB_HOST` | MySQL 主机 | `localhost` |
| `DB_PORT` | MySQL 端口 | `3306` |
| `DB_NAME` | Admin 主库名（与 Main 共用） | `heartsphere` |
| `DB_USER` | 数据库用户 | `root` |
| `DB_PASSWORD` | 数据库密码 | `123456` |
| `MENTIS_DB_NAME` | Mentis 库名 | `heartsphere_mentis` |
| `EDU_DB_NAME` | 教育版库名 | `heartsphere_edu` |
| `AGENT_MIND_DB_NAME` | Agent Mind 库名 | `heartsphere_agent_mind` |
| `JWT_SECRET` | JWT 签名密钥（生产务必修改） | 见 yml |
| `MAIN_BACKEND_BASE_URL` | Main 后端地址（Admin 调用 Main 用） | `http://localhost:8081` |
| `MENTIS_BACKEND_BASE_URL` | Mentis 后端地址 | `http://localhost:8082` |
| `EDU_BACKEND_BASE_URL` | 教育版后端地址 | `http://localhost:8084` |
| `AGENT_MIND_BACKEND_BASE_URL` | Agent Mind 后端地址 | `http://localhost:8086` |
| `AI_SERVICE_BASE_URL` | AI 服务地址（技能生成等） | `http://localhost:8081` |
| `IMAGE_BASE_URL` | 图片服务地址（常指 Main 的图片接口） | `http://localhost:8081/images` |

配置文件：`admin/backend/src/main/resources/application.yml`。

### 3.2 前端环境变量

在 `admin/frontend` 下通过 `.env` 或 `.env.development` / `.env.production` 配置，以 `VITE_` 开头的变量会暴露给前端。

| 变量名 | 说明 | 默认/示例 |
|--------|------|-----------|
| `VITE_API_BASE_URL` | Admin 后端 API 地址 | `http://localhost:8085/api/admin` |
| `VITE_MAIN_BACKEND_URL` | Main 后端地址（技能测试等） | `http://localhost:8081` |
| `VITE_MAIN_API_KEY` | 调用 Main 的 API Key（可选） | - |
| `VITE_HSMEM_BASE_URL` | HSMem 服务地址（用户记忆管理） | `http://localhost:8000` |
| `VITE_MENTIS_API_BASE_URL` | Mentis API 地址（部分功能） | `http://localhost:8082` |
| `VITE_PORT` | 前端开发服务器端口 | `3001` |

## 4. 数据库

- Admin 主库与 Main 共用 `heartsphere`，可使用本目录下 `db/heartsphere.sql` 在新环境导入主库。
- 若启用 Mentis/Edu/Agent Mind，需单独创建并迁移对应库（`heartsphere_mentis`、`heartsphere_edu`、`heartsphere_agent_mind`），参见项目内迁移文档。

导入 heartsphere 示例：

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS heartsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p heartsphere < 安装指南/db/heartsphere.sql
```

## 5. 启动方式

### 5.1 开发环境

```bash
# 在项目根目录
# 1. 启动 Admin 后端（端口 8085）
./scripts/start/start-admin-backend.sh

# 2. 启动 Admin 前端（端口 3001）
./scripts/start/start-admin-frontend.sh
```

或手动启动：

```bash
cd admin/backend && mvn spring-boot:run
cd admin/frontend && npm install && npm run dev
```

### 5.2 依赖与调用关系

- **Admin 前端 → Admin 后端**：`VITE_API_BASE_URL` → `http://localhost:8085/api/admin`。
- **Admin 前端 → Main 后端**：技能测试等功能通过 `VITE_MAIN_BACKEND_URL` 直连 Main（如 `http://localhost:8081`）。
- **Admin 前端 → HSMem**：用户记忆管理通过 `VITE_HSMEM_BASE_URL` 直连 HSMem（默认 `http://localhost:8000`）。
- **Admin 后端 → Main 后端**：配置 `MAIN_BACKEND_BASE_URL`，用于代理或服务端调用 Main 的接口（如 AI 服务、技能相关）。
- **Admin 后端 → MySQL**：多数据源连接 `heartsphere`、`heartsphere_mentis`、`heartsphere_edu`、`heartsphere_agent_mind` 等。

因此，若使用「技能测试」或「用户记忆管理」等能力，需保证 Main 后端、HSMem 按需启动并配置正确地址。

### 5.3 生产部署要点

- 修改 `JWT_SECRET`、`DB_PASSWORD` 等敏感配置。
- 将 `VITE_API_BASE_URL`、`VITE_MAIN_BACKEND_URL`、`VITE_HSMEM_BASE_URL` 等改为生产环境实际地址。
- 后端 `MAIN_BACKEND_BASE_URL`、`AI_SERVICE_BASE_URL`、`IMAGE_BASE_URL` 等指向生产 Main 或网关。
- 前端构建：`npm run build`，由 Nginx 等托管静态资源，API 反向代理到 Admin 后端。

## 6. 常用端口与检查

- Admin 后端：`http://localhost:8085`
- Admin 前端：`http://localhost:3001`
- 管理后台登录与技能测试等依赖 Admin 后端与（可选）Main 后端、HSMem 均可达。

## 7. 与 Main 的协作总结

| 场景 | Admin 侧配置 | 被调用方 |
|------|----------------|----------|
| 管理后台登录、权限、业务数据 | `VITE_API_BASE_URL` → Admin 后端 | Admin 后端 (:8085) |
| 技能测试、部分 AI 能力 | `VITE_MAIN_BACKEND_URL`、后端 `MAIN_BACKEND_BASE_URL` | Main 后端 (:8081) |
| 用户记忆管理 | `VITE_HSMEM_BASE_URL` | HSMem (:8000) |
| 图片展示/上传 | 后端 `IMAGE_BASE_URL` / Main 图片接口 | Main 后端 (:8081) |

详细系统总览与调用关系见 [安装指南 README](./README.md)。
