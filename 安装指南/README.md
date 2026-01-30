# HeartSphere 安装部署指南

本目录提供 Main 端与 Admin 端的安装、部署说明，以及环境变量与系统调用关系说明。

## 目录结构

```
安装指南/
├── README.md                 # 本文件：总览与调用关系
├── main-安装部署指南.md       # Main 端安装部署
├── admin-安装部署指南.md      # Admin 端安装部署
└── db/                       # 数据库导出文件（用于新环境导入）
    └── heartsphere.sql       # heartsphere 库全量导出
```

## 系统架构与调用关系

### 端口一览

| 服务           | 默认端口 | 说明 |
|----------------|----------|------|
| Main 后端      | 8081     | 主应用 API、用户、角色、记忆、技能等 |
| Main 前端      | 3000     | 主应用 Web 界面 |
| Admin 后端     | 8085     | 管理后台 API |
| Admin 前端     | 3001     | 管理后台 Web 界面 |
| HSMem 记忆服务 | 8000     | 可选，独立记忆服务（未启用时 Main 使用内置实现） |

### 调用关系简图

```
                    ┌─────────────────┐
                    │   Main 前端     │  :3000
                    │ (用户端界面)    │
                    └────────┬────────┘
                             │ VITE_API_BASE_URL → http://localhost:8081
                             ▼
                    ┌─────────────────┐      ┌─────────────────┐
                    │   Main 后端     │ :8081 │  MySQL          │
                    │ (主业务 API)    │◀─────▶│  heartsphere    │
                    └────────┬────────┘      └─────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                     │
         ▼                   ▼                     ▼
  HSMem (可选 :8000)   图片/上传等              技能、记忆、AI

                    ┌─────────────────┐
                    │  Admin 前端     │  :3001
                    │ (管理后台界面)  │
                    └────────┬────────┘
                             │ VITE_API_BASE_URL → http://localhost:8085/api/admin
                             ▼
                    ┌─────────────────┐
                    │  Admin 后端     │ :8085
                    │ (管理 API)      │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┬───────────────────┐
         ▼                   ▼                    ▼                   ▼
  MySQL (heartsphere)  MySQL (mentis/edu/...)  Main 后端 (:8081)   HSMem (:8000)
  Admin 主库           其他业务库              技能测试、AI 等      用户记忆管理
```

### 关键调用关系说明

1. **Admin → Main 后端**
   - Admin 后端配置 `main.backend.base-url`（默认 `http://localhost:8081`），用于代理或调用 Main 的接口（如技能测试、AI 生成等）。
   - Admin 前端配置 `VITE_MAIN_BACKEND_URL`（如 `http://localhost:8081`），用于「技能测试」等直接请求 Main 的接口。

2. **Admin / Main → HSMem**
   - 记忆数据：管理端「用户记忆管理」与 Main「我的记忆」均从 HSMem 获取（或 Main 内置记忆实现）。
   - Admin 前端通过 `VITE_HSMEM_BASE_URL`（默认 `http://localhost:8000`）直连 HSMem；Main 通过后端配置 `heartsphere.memory.hsmem.base-url` 访问。

3. **数据库**
   - **Main**：使用单一 MySQL 库 `heartsphere`（由 `DB_NAME` / application.yml 配置）。
   - **Admin**：多数据源，包括 `heartsphere`（与 Main 共用）、`heartsphere_mentis`、`heartsphere_edu`、`heartsphere_agent_mind` 等；本安装指南的 `db/heartsphere.sql` 仅导出 `heartsphere` 库，用于在新环境恢复主库。

## 数据库导入（新环境）

1. 创建数据库：`CREATE DATABASE heartsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
2. 导入：`mysql -u root -p heartsphere < 安装指南/db/heartsphere.sql`
3. 若使用其他库名或用户，请同步修改各端环境变量中的 `DB_NAME`、`DB_USER`、`DB_PASSWORD` 等。

## 快速启动（开发环境）

在项目根目录下：

```bash
# 1. 启动 Main 后端（依赖 MySQL heartsphere）
./scripts/start/start-main-backend.sh

# 2. 启动 Main 前端
./scripts/start/start-main-frontend.sh

# 3. 启动 Admin 后端（依赖 MySQL 及可选 Main 后端）
./scripts/start/start-admin-backend.sh

# 4. 启动 Admin 前端
./scripts/start/start-admin-frontend.sh
```

或使用一键启动（按脚本顺序启动各服务）：

```bash
./scripts/start/start-all.sh
```

详细环境要求、环境变量与步骤见：
- [Main 安装部署指南](./main-安装部署指南.md)
- [Admin 安装部署指南](./admin-安装部署指南.md)
