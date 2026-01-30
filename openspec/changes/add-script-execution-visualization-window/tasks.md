# 任务清单

## 阶段 1: 后端 SSE 日志流实现

- [x] 创建 `LogStreamService` 服务类
  - [x] 实现 SSE 连接管理（添加、移除、获取连接）
  - [x] 实现日志推送方法（支持多客户端）
  - [x] 实现连接清理机制（执行完成后自动清理）

- [x] 修改 `ScriptExecutionEngine`
  - [x] 集成 `LogStreamService`，在执行过程中推送日志
  - [x] 修改日志收集逻辑，实时发送到 SSE 服务
  - [x] 处理标准输出和错误输出的实时推送

- [x] 在 `DevOpsWorkbenchController` 中添加 SSE 端点
  - [x] 实现 `/api/admin/devops/executions/{executionId}/logs/stream` 端点
  - [x] 添加权限验证
  - [x] 处理连接异常和超时

- [ ] 测试后端 SSE 功能
  - [ ] 单元测试：`LogStreamService` 的连接管理
  - [ ] 集成测试：完整的日志流推送流程
  - [ ] 性能测试：多客户端并发连接

## 阶段 2: 前端可视化窗口组件

- [x] 创建 `useLogStream` Hook
  - [x] 封装 fetch + ReadableStream 连接逻辑（支持自定义 headers）
  - [x] 实现日志数据接收和状态管理
  - [x] 实现自动重连机制（指数退避）
  - [x] 处理连接错误和异常

- [x] 创建 `ExecutionMonitor` 组件
  - [x] 实时日志显示区域（支持自动滚动）
  - [x] 状态指示器（运行中、成功、失败、取消）
  - [x] 执行信息面板（执行ID、脚本名称、连接状态）
  - [x] 控制按钮（取消执行、下载日志、清屏、自动滚动切换）
  - [x] 日志搜索和过滤功能

- [x] 样式和交互优化
  - [x] 终端风格的日志显示（等宽字体、深色主题）
  - [x] 日志行高亮（错误、警告、成功信息）
  - [x] 响应式布局，适配不同屏幕尺寸
  - [x] 加载状态和错误状态显示

## 阶段 3: 集成到现有组件

- [x] 修改 `ScriptExecutor` 组件
  - [x] 执行脚本后自动打开可视化窗口
  - [x] 传递执行ID到 `ExecutionMonitor`
  - [x] 处理窗口关闭和状态同步

- [x] 增强 `ExecutionDetail` 组件
  - [x] 添加"实时监控"按钮（运行中的任务）
  - [x] 在实时模式下使用 `ExecutionMonitor`
  - [x] 保持向后兼容（支持非实时模式）

- [x] 更新 `DevOpsWorkbench` 主组件
  - [x] 可视化窗口通过组件状态管理（已在 ScriptExecutor 和 ExecutionDetail 中实现）
  - [x] 支持同时查看多个执行任务（每个组件独立管理）
  - [x] 集成到执行历史列表（通过 ExecutionDetail）

## 阶段 4: API 和类型定义

- [x] 更新前端 API 服务
  - [x] SSE 连接逻辑封装在 `useLogStream` Hook 中（使用 fetch + ReadableStream）
  - [x] 添加日志流相关的类型定义（LogMessage 接口）

- [x] 更新后端 DTO
  - [x] 日志流数据格式统一（JSON 格式：timestamp, level, message）
  - [x] 添加必要的元数据（时间戳、日志级别等）

## 阶段 5: 测试和优化

- [ ] 功能测试
  - [ ] 测试实时日志流的基本功能
  - [ ] 测试多客户端同时查看同一执行任务
  - [ ] 测试连接断开和重连
  - [ ] 测试取消执行功能

- [ ] 性能优化
  - [ ] 优化日志缓冲机制，避免内存溢出
  - [ ] 实现日志分页加载（对于大量日志）
  - [ ] 优化前端渲染性能（虚拟滚动）

- [ ] 错误处理
  - [ ] 处理 SSE 连接失败的情况
  - [ ] 实现优雅降级（回退到轮询模式）
  - [ ] 添加用户友好的错误提示

- [ ] 浏览器兼容性测试
  - [ ] 测试主流浏览器（Chrome、Firefox、Safari、Edge）
  - [ ] 处理不支持 EventSource 的浏览器

## 阶段 6: 文档和规范

- [ ] 更新 OpenSpec 规范
  - [ ] 在 `specs/admin/devops-workbench/spec.md` 中添加实时日志流需求
  - [ ] 添加相关场景和验收标准

- [ ] 代码文档
  - [ ] 为新增的类和方法添加 JavaDoc/JSDoc
  - [ ] 更新 README 或开发文档

- [ ] 用户文档（可选）
  - [ ] 添加使用说明
  - [ ] 添加常见问题解答
