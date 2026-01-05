# 后端部署脚本使用说明

## 概述

后端部署脚本分为两个独立的脚本：
- **`deploy-backend-dev.sh`**：开发环境部署脚本 - 本地构建后直接启动
- **`deploy-backend-prod.sh`**：生产环境部署脚本 - 通过 SCP 上传到服务器并启动

## 功能特性

1. ✅ 支持两种部署模式（Development / Production）
2. ✅ 自动构建 Maven 项目
3. ✅ 自动停止和启动服务
4. ✅ 支持配置文件保存
5. ✅ 完整的错误处理
6. ✅ 自动备份（Production 模式）

## 使用方法

### Development 模式（开发环境）

```bash
cd deploy
./deploy-backend-dev.sh
```

### Production 模式（生产环境）

```bash
cd deploy
./deploy-backend-prod.sh
```

## Development 模式（开发环境）

### 功能

- 本地构建 Maven 项目
- 自动停止现有进程
- 后台启动应用
- 显示日志文件位置

### 使用步骤

1. 运行开发环境部署脚本
2. 脚本会自动：
   - 检查 Java 和 Maven 环境
   - 构建项目（如需要）
   - 停止现有进程
   - 启动应用

### 示例

```bash
./deploy-backend-dev.sh
```

### 配置

- **端口**：脚本会询问后端端口（默认 8080）
- **配置文件**：使用 `src/main/resources/application.yml`
- **日志文件**：`backend/backend.log`
- **PID文件**：进程ID在后台运行

### 常用命令

```bash
# 查看日志
tail -f backend/backend.log

# 停止应用
kill $(ps aux | grep heartsphere-service | grep -v grep | awk '{print $2}')

# 检查进程
ps aux | grep heartsphere-service
```

## Production 模式（生产环境）

### 功能

- 本地构建 Maven 项目
- 通过 SCP 上传 JAR 文件到服务器
- 在服务器端停止现有服务
- 在服务器端启动新服务
- 自动备份现有文件

### 使用步骤

1. **首次使用**：配置远程服务器信息
   - 服务器地址
   - SSH 端口
   - SSH 用户名
   - 远程部署路径
   - SSH 私钥路径（可选）
   - 后端端口

2. **保存配置**（可选）：脚本会询问是否保存配置

3. **后续使用**：直接运行脚本，会自动加载保存的配置

### 示例

```bash
# 首次使用（交互式配置）
./deploy-backend-prod.sh

# 再次使用（使用保存的配置）
./deploy-backend-prod.sh
```

### 配置示例

创建 `deploy/.deploy-backend-config` 文件：

```bash
REMOTE_HOST="heartsphere.cn"
REMOTE_PORT="22"
REMOTE_USER="root"
REMOTE_PATH="/opt/heartsphere/backend"
SSH_KEY="~/.ssh/id_rsa"
BACKEND_PORT="8080"
```

### 远程服务器要求

1. **Java 17+**：远程服务器必须安装 Java 17 或更高版本
2. **目录权限**：用户需要有写入权限到部署目录
3. **SSH 访问**：必须能够通过 SSH 连接到服务器

### 部署流程

1. **构建项目**：在本地使用 Maven 构建 JAR 文件
2. **上传文件**：通过 SCP 上传 JAR 文件到服务器
3. **备份现有文件**：自动备份现有 JAR 文件到 `.backup.时间戳` 目录
4. **停止服务**：停止远程服务器上的现有进程
5. **启动服务**：在远程服务器上启动新的 JAR 文件
6. **验证服务**：检查服务是否成功启动

### 远程服务器文件结构

```
/opt/heartsphere/backend/
├── heartsphere-service-0.0.1-SNAPSHOT.jar  # JAR 文件
├── backend.pid                              # PID 文件
├── logs/
│   └── backend.log                          # 日志文件
└── uploads/                                 # 上传文件目录
```

### 常用命令

```bash
# 查看远程日志
ssh root@heartsphere.cn 'tail -f /opt/heartsphere/backend/logs/backend.log'

# 停止远程服务
ssh root@heartsphere.cn 'kill $(cat /opt/heartsphere/backend/backend.pid)'

# 检查远程进程
ssh root@heartsphere.cn 'ps aux | grep heartsphere-service'

# 检查远程端口
ssh root@heartsphere.cn 'netstat -tlnp | grep 8080'
```

## 配置文件

### 配置文件位置

- **配置文件**：`deploy/.deploy-backend-config`
- **示例文件**：`deploy/.deploy-backend-config.example`

### 配置项说明

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `REMOTE_HOST` | 远程服务器地址（IP或域名） | - |
| `REMOTE_PORT` | SSH端口 | 22 |
| `REMOTE_USER` | SSH用户名 | root |
| `REMOTE_PATH` | 远程部署路径 | /opt/heartsphere/backend |
| `SSH_KEY` | SSH私钥路径（可选） | - |
| `BACKEND_PORT` | 后端端口 | 8080 |

## 常见问题

### Q: Development 模式启动失败

**A**: 检查以下：

1. **Java 版本**：确保安装了 Java 17+
   ```bash
   java -version
   ```

2. **端口占用**：检查端口是否被占用
   ```bash
   lsof -i :8080
   ```

3. **日志文件**：查看日志文件获取详细错误信息
   ```bash
   tail -50 backend/backend.log
   ```

### Q: Production 模式上传失败

**A**: 检查以下：

1. **SSH 连接**：测试 SSH 连接
   ```bash
   ssh user@host
   ```

2. **SSH 密钥权限**：确保密钥权限正确
   ```bash
   chmod 600 ~/.ssh/id_rsa
   ```

3. **远程目录权限**：确保用户有写入权限
   ```bash
   ssh user@host "ls -ld /opt/heartsphere/backend"
   ```

### Q: 远程服务启动失败

**A**: 检查以下：

1. **Java 环境**：确保远程服务器安装了 Java
   ```bash
   ssh user@host "java -version"
   ```

2. **远程日志**：查看远程日志获取详细错误信息
   ```bash
   ssh user@host "tail -50 /opt/heartsphere/backend/logs/backend.log"
   ```

3. **端口冲突**：检查端口是否被占用
   ```bash
   ssh user@host "netstat -tlnp | grep 8080"
   ```

### Q: 如何回滚到之前的版本？

**A**: 使用备份文件：

```bash
# 1. 停止当前服务
ssh user@host "kill \$(cat /opt/heartsphere/backend/backend.pid)"

# 2. 恢复备份
ssh user@host "
  cd /opt/heartsphere/backend
  mv heartsphere-service-0.0.1-SNAPSHOT.jar heartsphere-service-0.0.1-SNAPSHOT.jar.broken
  cp ../backend.backup.20250105_080000/heartsphere-service-0.0.1-SNAPSHOT.jar .
"

# 3. 重新启动服务
ssh user@host "
  cd /opt/heartsphere/backend
  nohup java -jar heartsphere-service-0.0.1-SNAPSHOT.jar \
    --server.port=8080 \
    --spring.profiles.active=production \
    > logs/backend.log 2>&1 &
  echo \$! > backend.pid
"
```

## 注意事项

1. ⚠️ **Development 模式**：进程在后台运行，需要手动停止
2. ⚠️ **Production 模式**：确保远程服务器有足够的磁盘空间
3. ⚠️ **配置文件安全**：`.deploy-backend-config` 包含敏感信息，不要提交到版本控制
4. ⚠️ **备份文件**：备份文件会占用磁盘空间，定期清理旧备份

## 相关脚本

- `deploy-backend-dev.sh` - 开发环境部署脚本
- `deploy-backend-prod.sh` - 生产环境部署脚本
- `restart-backend.sh` - 重启后端服务（服务器端）
- `check-backend-status.sh` - 检查后端服务状态

## 示例

### Development 模式完整流程

```bash
# 1. 运行脚本
cd deploy
./deploy-backend-dev.sh

# 2. 查看日志
tail -f ../backend/backend.log

# 3. 测试服务
curl http://localhost:8080/api/health

# 4. 停止服务
kill $(ps aux | grep heartsphere-service | grep -v grep | awk '{print $2}')
```

### Production 模式完整流程

```bash
# 1. 首次运行（交互式配置）
cd deploy
./deploy-backend-prod.sh

# 2. 再次运行（使用保存的配置）
./deploy-backend-prod.sh

# 3. 查看远程日志
ssh root@heartsphere.cn 'tail -f /opt/heartsphere/backend/logs/backend.log'

# 4. 测试服务
curl http://heartsphere.cn:8080/api/health
```
