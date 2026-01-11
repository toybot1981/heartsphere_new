# 多系统本地启动脚本

本文档说明如何使用多系统本地启动脚本。

## 快速开始

### 启动所有服务

```bash
./scripts/start-all.sh
```

这会启动所有项目的前后端服务。

### 停止所有服务

```bash
./scripts/stop-all.sh
```

### 启动单个服务

启动特定项目的服务：

```bash
# 主项目
./scripts/start-backend.sh      # 后端 (8081)
./scripts/start-frontend.sh     # 前端 (3000)

# 教育版
./scripts/start-edu-backend.sh  # 后端 (8084)
./scripts/start-edu-frontend.sh # 前端 (3001)

# 管理后台
./scripts/start-admin-backend.sh  # 后端 (8085)
./scripts/start-admin-frontend.sh # 前端 (3005)

# Mentis
./scripts/start-mentis-backend.sh  # 后端 (8082)
./scripts/start-mentis-frontend.sh # 前端 (3002)

# 公司网站
./scripts/start-company-backend.sh  # 后端 (8083)
./scripts/start-company-frontend.sh # 前端 (3003)
```

## 端口配置

所有端口配置请参考 `scripts/ports.md`。

## 功能特性

- ✅ 自动检测并终止占用端口的进程
- ✅ 后台运行服务
- ✅ 保存进程 PID 到文件
- ✅ 日志输出到文件
- ✅ 启动前检查环境（Java、Maven、Node.js、npm）

## 日志文件

所有服务的日志文件保存在项目根目录：
- `backend-backend.log` / `backend-frontend.log`
- `edu-backend.log` / `edu-frontend.log`
- `admin-backend.log` / `admin-frontend.log`
- `mentis-backend.log` / `mentis-frontend.log`
- `company-backend.log` / `company-frontend.log`

查看日志：
```bash
tail -f backend-backend.log
tail -f frontend-frontend.log
```

## PID 文件

每个服务的 PID 保存在项目根目录：
- `backend-backend.pid` / `backend-frontend.pid`
- `edu-backend.pid` / `edu-frontend.pid`
- 等等...

手动停止服务（使用 PID）：
```bash
kill $(cat backend-backend.pid)
```

## 端口管理工具

端口管理工具位于 `scripts/utils/port-utils.sh`，提供了以下函数：
- `check_port_available <port>` - 检查端口是否可用
- `kill_port_process <port>` - 终止占用端口的进程
- `ensure_port_available <port>` - 确保端口可用（如果被占用则终止进程）

## 故障排除

### 端口被占用

脚本会自动处理端口占用问题，会先终止占用端口的进程再启动服务。

### 服务启动失败

1. 检查日志文件查看错误信息
2. 确认环境变量配置正确
3. 确认数据库连接正常（后端服务）
4. 确认依赖已安装（`npm install` 或 `mvn install`）

### 权限问题

如果脚本无法执行，添加可执行权限：
```bash
chmod +x scripts/start-*.sh
chmod +x scripts/stop-all.sh
```
