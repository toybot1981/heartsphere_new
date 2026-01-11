# 项目端口配置文档

本文档记录了所有项目的端口分配情况。

## 后端端口分配

| 项目 | 端口 | 配置文件路径 |
|------|------|-------------|
| 主项目 (backend) | 8081 | `backend/src/main/resources/application.yml` |
| 教育版 (edu/backend) | 8084 | `edu/backend/src/main/resources/application.yml` |
| 管理后台 (admin/backend) | 8085 | `admin/backend/src/main/resources/application.yml` |
| Mentis (mentis/backend) | 8082 | `mentis/backend/src/main/resources/application.yml` |
| 公司网站 (company/backend) | 8083 | `company/backend/src/main/resources/application.yml` |

## 前端端口分配

| 项目 | 端口 | 配置文件路径 |
|------|------|-------------|
| 主项目 (frontend) | 3000 | `frontend/vite.config.ts` |
| 教育版 (edu/frontend) | 3001 | `edu/frontend/vite.config.ts` |
| 管理后台 (admin/frontend) | 3005 | `admin/frontend/vite.config.ts` |
| Mentis (mentis/frontend) | 3002 | `mentis/frontend/vite.config.ts` |
| 公司网站 (company/frontend) | 3003 | `company/frontend/vite.config.ts` |
| 教育版管理后台 (admin-edu) | 3006 | `admin-edu/vite.config.ts` |
| 教育版前端 (frontend-edu) | 3007 | `frontend-edu/vite.config.ts` |

## 端口冲突说明

**已解决的冲突：**
- `admin-edu`: 已从 3002 调整为 3006（避免与 mentis/frontend 冲突）
- `frontend-edu`: 已从 3001 调整为 3007（避免与 edu/frontend 冲突）

**配置文件已更新：**
- `admin-edu/vite.config.ts`: port 3002 → 3006
- `frontend-edu/vite.config.ts`: port 3001 → 3007

## 使用说明

启动脚本会自动检查端口占用情况，如果端口被占用，会先终止占用该端口的进程，然后启动服务。

查看所有启动脚本：
```bash
ls scripts/start-*.sh
```

启动所有服务：
```bash
./scripts/start-all.sh
```

停止所有服务：
```bash
./scripts/stop-all.sh
```
