# DevOps 脚本执行和日志收集机制

## 脚本执行位置

**✅ 脚本在后端执行**

- 执行引擎：`ScriptExecutionEngine.java`
- 执行方式：使用 Java `ProcessBuilder` 启动系统进程
- 执行位置：后端服务器（admin/backend）
- 工作目录：自动检测项目根目录（包含 `scripts` 目录的目录）

## 日志收集机制

### 1. 文件日志（持久化存储）

**存储位置**：
```
logs/script-executions/execution-{executionId}.log
```

**收集方式**：
- 脚本的 stdout（标准输出）和 stderr（标准错误）都会被捕获
- 实时写入日志文件
- 使用 `PrintWriter` 和 `BufferedWriter` 确保日志及时刷新

**日志内容**：
- 标准输出（stdout）→ 正常日志
- 标准错误（stderr）→ 错误日志（前缀 `[ERROR]`）

### 2. 实时日志推送（SSE）

**推送服务**：`LogStreamService.java`

**推送机制**：
- 使用 SSE (Server-Sent Events) 实时推送日志到前端
- 每行输出都会立即推送给所有连接的客户端
- 支持多个客户端同时订阅同一个执行任务的日志

**推送内容**：
```json
{
  "timestamp": 1234567890,
  "level": "INFO" | "ERROR",
  "message": "日志内容"
}
```

**状态更新**：
```json
{
  "timestamp": 1234567890,
  "status": "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED"
}
```

### 3. 前端日志接收

**Hook**：`useLogStream.ts`

**接收方式**：
- 使用 `fetch` + `ReadableStream` 接收 SSE 流
- 支持自定义 Authorization 头（Bearer Token）
- 自动解析 SSE 格式的日志消息
- 支持自动重连（指数退避，最多 5 次）

**使用示例**：
```typescript
const { logs, status, connected, error } = useLogStream(executionId);
```

## 执行流程

```
1. 前端发起执行请求
   ↓
2. 后端 ScriptExecutionEngine 接收请求
   ↓
3. 创建日志文件（logs/script-executions/execution-{id}.log）
   ↓
4. 使用 ProcessBuilder 启动脚本进程
   ↓
5. 并行读取 stdout 和 stderr
   ├─→ 写入日志文件（持久化）
   └─→ 推送到 SSE（实时显示）
   ↓
6. 等待进程完成或超时
   ↓
7. 更新执行状态
   ↓
8. 推送最终状态并清理 SSE 连接
```

## 日志文件管理

**文件位置**：
- 相对路径：`logs/script-executions/execution-{executionId}.log`
- 绝对路径：`{项目根目录}/logs/script-executions/execution-{executionId}.log`

**文件内容**：
- 包含完整的执行输出（stdout + stderr）
- 错误行前缀 `[ERROR]`
- 按时间顺序记录

**下载方式**：
- 前端可以通过 API 下载日志文件
- API 端点：`GET /api/admin/devops/executions/{executionId}/log/download`

## 实时日志显示

**前端组件**：
- `ExecutionMonitor.tsx` - 使用 `useLogStream` hook
- `ExecutionDetail.tsx` - 显示执行详情和实时日志
- `PipelineProgressView.tsx` - 显示流程执行进度和日志

**显示特性**：
- 实时滚动显示最新日志
- 支持日志级别颜色区分（INFO/ERROR）
- 自动限制日志数量（最多 10000 条，避免内存溢出）
- 显示连接状态和错误信息

## 环境变量支持

脚本执行时支持环境变量：
- 全局环境变量（GLOBAL scope）
- 项目环境变量（PROJECT scope）
- 模块环境变量（MODULE scope）
- 流程环境变量（PIPELINE scope）

环境变量会在脚本执行前解析并注入到进程环境中。

## 超时和取消

**超时处理**：
- 默认超时：3600 秒（1 小时）
- 可在脚本配置中自定义超时时间
- 超时后强制终止进程

**取消执行**：
- 前端可以取消正在执行的脚本
- 后端会强制终止进程（`process.destroyForcibly()`）
- 清理相关资源（日志文件、SSE 连接等）

## 总结

- ✅ **执行位置**：后端服务器
- ✅ **日志存储**：文件系统（持久化）+ SSE（实时推送）
- ✅ **日志格式**：文本文件 + JSON（SSE）
- ✅ **实时性**：SSE 实时推送，前端立即显示
- ✅ **持久化**：所有日志都保存到文件，可下载查看
