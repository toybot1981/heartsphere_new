# HSMem 服务启动指南

## 🚀 快速启动

### 方式 1: 使用启动脚本（推荐）

```bash
# 从项目根目录运行
./scripts/hsmem_start.sh
```

启动脚本会自动：
- ✅ 检查 Python 和依赖
- ✅ 检查服务是否已在运行
- ✅ 启动服务器
- ✅ 验证服务状态
- ✅ 显示日志文件位置

### 方式 2: 直接运行

```bash
cd hsmem
python3 rest_api_server.py
```

## 📋 服务管理

### 启动服务

```bash
./start.sh
```

### 停止服务

```bash
# 从项目根目录运行
./scripts/hsmem_stop.sh
```

### 查看日志

```bash
# 实时查看日志
tail -f hsmem.log

# 查看最后 100 行
tail -n 100 hsmem.log

# 搜索特定内容
grep "ERROR" hsmem.log
```

## 📊 日志文件

### 日志位置

- **日志文件**: `hsmem/hsmem.log`（位于 hsmem 目录下）
- **PID 文件**: `hsmem/hsmem.pid`（位于 hsmem 目录下）

### 日志内容

日志文件包含：
- ✅ **访问日志**: 所有 API 请求和响应
- ✅ **错误日志**: 服务器错误和异常
- ✅ **应用日志**: 服务启动、关闭等信息

### 日志格式

```
2026-01-16 08:05:58 - uvicorn.access - INFO - 127.0.0.1:52345 - "GET /health HTTP/1.1" 200
2026-01-16 08:05:59 - uvicorn.access - INFO - 127.0.0.1:52346 - "POST /api/v1/memory/memorize/conversation HTTP/1.1" 200
```

### 日志轮转

- **最大文件大小**: 10MB
- **备份数量**: 5 个
- **备份命名**: `hsmem.log.1`, `hsmem.log.2`, ...

当日志文件达到 10MB 时，会自动轮转：
- 当前日志 → `hsmem.log.1`
- `hsmem.log.1` → `hsmem.log.2`
- ...以此类推
- 最旧的日志会被删除

## 🔍 查看日志示例

### 查看所有访问记录

```bash
grep "uvicorn.access" hsmem.log
```

### 查看错误日志

```bash
grep "ERROR" hsmem.log
```

### 查看特定 API 的请求

```bash
grep "/api/v1/memory/memorize" hsmem.log
```

### 查看特定时间段的日志

```bash
grep "2026-01-16 08:" hsmem.log
```

### 实时监控日志

```bash
tail -f hsmem.log | grep --color=always -E "ERROR|WARNING|INFO"
```

## 🛠️ 故障排查

### 服务无法启动

1. 检查端口是否被占用：
   ```bash
   lsof -i :8000
   ```

2. 查看日志文件：
   ```bash
   tail -n 50 hsmem.log
   ```

3. 检查 Python 依赖：
   ```bash
   python3 -c "import fastapi, uvicorn"
   ```

### 日志文件过大

日志文件会自动轮转，但也可以手动清理：

```bash
# 清空日志文件（保留当前内容）
> hsmem.log

# 或删除旧日志
rm hsmem.log.*
```

### 查看服务状态

```bash
# 检查进程
ps aux | grep rest_api_server

# 检查健康状态
curl http://localhost:8000/health
```

## 📝 日志配置

日志配置在 `rest_api_server.py` 中的 `setup_logging()` 函数：

```python
def setup_logging(log_file: str = "hsmem.log"):
    # 配置日志格式、级别、轮转等
    ...
```

可以修改：
- **日志文件路径**: 修改 `log_file` 参数
- **日志级别**: 修改 `setLevel()` 调用
- **日志格式**: 修改 `log_format` 变量
- **轮转大小**: 修改 `maxBytes` 参数
- **备份数量**: 修改 `backupCount` 参数

## 🌐 访问地址

- **服务地址**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

## 📚 相关文档

- [API 使用指南](API_GUIDE.md)
- [快速开始](QUICKSTART.md)
- [使用说明](USAGE.md)
