# Change: Build AgentScope Computer-Use Demo Prototype

## Why

在完成 AgentScope Java Computer-Use 场景的技术评估和原型验证后，需要一个直观的可视化演示原型来展示：

1. **AgentScope 工具系统的实际效果**
   - 展示 ReActAgent 如何通过工具调用操作虚拟机
   - 展示工具调用的推理过程和执行结果
   - 展示会话上下文传递和虚拟机状态管理

2. **Computer-Use 场景的完整流程**
   - 虚拟机生命周期管理（创建、启动、停止、删除）
   - 命令执行、脚本执行、GUI 操作的演示
   - 长时间运行操作的处理
   - 错误处理和回退机制

3. **技术可行性验证**
   - 通过实际的可视化演示，验证 AgentScope Java 在实际场景中的表现
   - 发现原型验证阶段未能发现的问题
   - 为后续的正式集成提供参考

4. **决策支持**
   - 为技术决策提供直观的依据
   - 便于向团队展示 AgentScope Java 的优势
   - 评估用户体验和交互设计

如果没有这个演示原型，评估结果只能停留在代码和文档层面，无法直观地展示 AgentScope Java 的实际能力和效果。

## What Changes

### 核心变更

- **ADDED**: 客户端演示原型（用户端）
  - 简化的 Chat 界面，展示与 AgentScope Agent 的交互
  - 实时显示工具调用过程（推理 → 工具选择 → 执行 → 结果反馈）
  - 展示虚拟机状态和操作历史
  - 支持流式响应显示

- **ADDED**: 管理端演示原型（管理员端）
  - 完整的演示控制界面
  - 虚拟机管理面板（创建、查看状态、删除）
  - 工具调用监控面板（实时显示工具调用日志）
  - 会话管理和演示场景配置
  - 性能监控和统计面板

- **ADDED**: 演示场景和示例
  - 预设的演示场景（命令执行、脚本执行、GUI 操作）
  - 示例对话和交互流程
  - 错误处理演示场景

- **ADDED**: 后端演示 API 增强
  - 工具调用日志记录和查询接口
  - 虚拟机状态实时查询接口
  - 演示场景管理接口
  - 性能指标统计接口

### 交付物

1. **前端组件**：
   - `frontend/demo/components/AgentScopeDemo.tsx` - 客户端演示组件
   - `frontend/admin/components/AgentScopeDemoAdmin.tsx` - 管理端演示组件
   - `frontend/demo/components/ToolCallMonitor.tsx` - 工具调用监控组件
   - `frontend/demo/components/VmStatusPanel.tsx` - 虚拟机状态面板

2. **后端接口**：
   - `backend/src/main/java/com/heartsphere/mentis/demo/DemoController.java` - 演示 API 控制器
   - `backend/src/main/java/com/heartsphere/mentis/demo/service/DemoService.java` - 演示服务
   - `backend/src/main/java/com/heartsphere/mentis/demo/model/ToolCallLog.java` - 工具调用日志模型

3. **演示数据**：
   - `docs/demo/scenarios.md` - 演示场景说明
   - `docs/demo/examples.md` - 示例对话和交互流程

4. **演示文档**：
   - `docs/demo/README.md` - 演示原型使用说明
   - `docs/demo/architecture.md` - 演示架构说明

## Impact

### 正面影响

- ✅ 提供直观的可视化演示，验证 AgentScope Java 的实际效果
- ✅ 发现原型验证阶段未能发现的问题
- ✅ 为技术决策提供直观依据
- ✅ 便于向团队展示 AgentScope Java 的优势

### 风险

- ⚠️ 演示原型需要与现有的 Mentis 系统集成，可能需要适配
- ⚠️ 工具调用日志和监控功能可能影响性能
- ⚠️ 演示场景的设计需要充分展示 AgentScope 的能力

### 依赖

- 依赖 `evaluate-agentscope-computer-use` 提案的完成（Phase 3 已完成）
- 依赖现有的 Mentis 前端和后端基础设施
- 依赖 AgentScope Java 框架（已添加依赖）

## Success Criteria

1. ✅ 客户端演示原型能够展示基本的 AgentScope Agent 交互
2. ✅ 管理端演示原型能够监控和展示工具调用过程
3. ✅ 能够演示至少 3 个完整的 Computer-Use 场景
4. ✅ 工具调用日志和状态信息能够实时更新
5. ✅ 演示原型代码质量良好，便于后续扩展和维护

## Timeline

- **Phase 1**: 后端演示 API 开发（2-3 天）
- **Phase 2**: 客户端演示原型开发（2-3 天）
- **Phase 3**: 管理端演示原型开发（2-3 天）
- **Phase 4**: 演示场景设计和测试（1-2 天）
- **总计**: 约 7-11 天
