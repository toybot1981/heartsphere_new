# Mentis 服务快速启动

## 🚀 快速启动命令

### 前提条件

1. 已设置 E2B API Key:
   ```bash
   export E2B_API_KEY="your-e2b-api-key-here"
   ```

2. 确认端口未被占用:
   - 后端端口: 8082
   - 前端端口: 3002

### 启动方式

#### 方式 1: 使用启动脚本（推荐）

```bash
# 启动后端和前端（后台运行）
./scripts/start-mentis.sh both

# 或分别启动
./scripts/start-mentis.sh backend   # 仅后端
./scripts/start-mentis.sh frontend  # 仅前端
```

#### 方式 2: 手动启动

**启动后端** (新终端窗口):
```bash
cd mentis/backend
mvn spring-boot:run
```

**启动前端** (新终端窗口):
```bash
cd mentis/frontend
npm install  # 首次运行
npm run dev
```

### 验证服务

```bash
# 检查后端
curl http://localhost:8082/actuator/health

# 检查前端（浏览器访问）
open http://localhost:3002
```

### 访问地址

- **前端界面**: http://localhost:3002/mentis/manus
- **后端 API**: http://localhost:8082
- **API 文档**: http://localhost:8082/swagger-ui.html

### 停止服务

按 `Ctrl+C` 停止服务

### 如果端口被占用

```bash
# 查找占用进程
lsof -ti:8082  # 后端端口
lsof -ti:3002  # 前端端口

# 停止进程
kill $(lsof -ti:8082)
kill $(lsof -ti:3002)
```

## 📝 详细文档

完整启动指南: `docs/START_MENTIS_SERVICES.md`
