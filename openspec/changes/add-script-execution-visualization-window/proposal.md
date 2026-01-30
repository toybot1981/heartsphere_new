# 添加脚本执行可视化窗口

## 摘要

为 DevOps 工作台添加实时可视化窗口，用于查看脚本执行过程。该功能将提供实时日志流、执行状态可视化、进度指示和交互式控制，提升脚本执行的可见性和用户体验。

## 背景

当前 DevOps 工作台的脚本执行功能存在以下限制：
1. **缺乏实时反馈**：执行过程中无法实时查看日志输出，只能通过轮询获取状态
2. **用户体验不佳**：执行状态信息分散，缺乏统一的可视化界面
3. **调试困难**：无法实时观察脚本执行过程，难以快速定位问题

用户需要：
- 实时查看脚本执行日志
- 可视化执行状态和进度
- 在执行过程中进行交互（如取消执行）
- 清晰的执行结果展示

## 核心变更

### 1. 实时日志流（SSE）
- 后端实现 Server-Sent Events (SSE) 端点，推送实时日志
- 前端使用 EventSource 接收并显示实时日志流
- 支持日志行级别的实时更新

### 2. 可视化执行窗口
- 创建独立的执行监控窗口组件
- 实时显示执行状态、进度、日志输出
- 支持自动滚动、日志过滤、搜索等功能

### 3. 执行状态可视化
- 实时状态指示器（运行中、成功、失败、取消）
- 执行进度可视化（如果脚本支持进度报告）
- 执行时间、资源使用情况等统计信息

### 4. 交互控制
- 在可视化窗口中支持取消执行
- 支持暂停/恢复自动刷新
- 支持日志下载、清屏等操作

## 功能模块

### 后端模块
1. **SSE 日志流服务**
   - `LogStreamService`: 管理 SSE 连接和日志推送
   - SSE 端点：`/api/admin/devops/executions/{executionId}/logs/stream`
   - 支持多客户端连接同一执行任务

2. **脚本执行引擎增强**
   - 修改 `ScriptExecutionEngine` 以支持实时日志推送
   - 将日志输出实时发送到 SSE 服务

### 前端模块
1. **ExecutionMonitor 组件**
   - 实时日志显示区域
   - 状态指示器和进度条
   - 控制按钮（取消、刷新、下载等）

2. **LogStreamer Hook**
   - 封装 EventSource 连接管理
   - 处理日志数据接收和状态更新
   - 自动重连机制

3. **集成到现有组件**
   - 在 `ScriptExecutor` 中集成可视化窗口
   - 在 `ExecutionDetail` 中支持实时模式切换

## 技术方案

### 后端技术
- **SSE**: Spring MVC 的 `SseEmitter` 实现实时日志推送
- **异步处理**: 使用 `CompletableFuture` 处理日志流
- **连接管理**: 使用 `ConcurrentHashMap` 管理多个 SSE 连接

### 前端技术
- **EventSource API**: 原生浏览器 API，无需额外依赖
- **React Hooks**: `useEffect` 管理 SSE 连接生命周期
- **状态管理**: 使用 React State 管理日志数据和连接状态

## 影响范围

### 修改的文件
- `admin/backend/src/main/java/com/heartsphere/admin/service/ScriptExecutionEngine.java`
- `admin/backend/src/main/java/com/heartsphere/admin/controller/DevOpsWorkbenchController.java`
- `admin/frontend/src/components/DevOpsWorkbench/ScriptExecutor.tsx`
- `admin/frontend/src/components/DevOpsWorkbench/ExecutionDetail.tsx`

### 新增的文件
- `admin/backend/src/main/java/com/heartsphere/admin/service/LogStreamService.java`
- `admin/frontend/src/components/DevOpsWorkbench/ExecutionMonitor.tsx`
- `admin/frontend/src/hooks/useLogStream.ts`

### 影响的规范
- `openspec/specs/admin/devops-workbench/spec.md` (需要添加实时日志流相关需求)

## 迁移策略

1. **向后兼容**: 保留现有的轮询方式作为备选方案
2. **渐进式增强**: 可视化窗口作为可选功能，不影响现有功能
3. **优雅降级**: 如果 SSE 不可用，自动回退到轮询模式

## 验收标准

1. ✅ 脚本执行时能够实时显示日志输出
2. ✅ 执行状态实时更新（运行中、成功、失败）
3. ✅ 支持在可视化窗口中取消执行
4. ✅ 支持日志搜索、过滤、下载等功能
5. ✅ 多用户同时查看同一执行任务时，所有用户都能看到实时日志
6. ✅ SSE 连接断开时能够自动重连
7. ✅ 执行完成后，日志完整保存并可下载

## 风险与缓解

### 风险
1. **SSE 连接数限制**: 大量并发连接可能影响服务器性能
   - 缓解：限制每个执行任务的连接数，使用连接池管理
2. **日志量过大**: 长时间运行的脚本可能产生大量日志
   - 缓解：实现日志缓冲和分页加载
3. **浏览器兼容性**: 部分旧浏览器可能不支持 EventSource
   - 缓解：检测浏览器支持，不支持时回退到轮询

## 后续优化

1. 支持日志行级别的过滤和搜索
2. 支持日志高亮（错误、警告等）
3. 支持执行进度百分比显示（如果脚本支持）
4. 支持多标签页查看多个执行任务
5. 支持日志导出为不同格式（TXT、JSON、HTML）
