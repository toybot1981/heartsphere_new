# Design: 增强任务分解和虚拟机执行能力

## Context

Mentis 系统需要实现类似 Manus 的智能任务分解和自动化执行能力。当前系统已有基础框架：
- `TaskDecomposer` 和 `TaskPlanner` 接口及基础实现
- `ExecutionEngine` 接口及基础实现
- `VmManager` 和虚拟机管理功能
- AgentScope 依赖已集成，但功能未充分利用

参考 Manus 的实现和 AgentScope 最佳实践，需要增强这些能力以实现：
1. 智能任务分解（利用 AgentScope 多智能体能力）
2. 虚拟机自动化执行
3. 实时进度跟踪和可视化

## Goals / Non-Goals

### Goals
- 使用 AgentScope 增强任务分解能力，支持复杂任务的多步骤分解
- 实现任务在虚拟机中的自动化执行
- 提供实时任务进度跟踪和虚拟机屏幕预览
- 支持多智能体协作进行任务分解和执行

### Non-Goals
- 不实现完整的 AgentScope 框架（使用现有 Java SDK）
- 不实现新的虚拟机技术（使用现有 Docker 虚拟机）
- 不实现复杂的任务调度系统（当前为顺序执行）

## Decisions

### Decision 1: AgentScope 任务分解器实现
**What**: 创建 `AgentScopeTaskDecomposer`，使用 AgentScope 的多智能体能力进行任务分解

**Why**: 
- AgentScope 提供了强大的多智能体协作能力
- 可以利用多个智能体的不同专长进行任务分解
- 参考文章展示了 AgentScope 在任务规划方面的优势

**Alternatives considered**:
- 继续使用简单的 LLM 提示词分解：不够智能，无法处理复杂任务
- 使用规则引擎：不够灵活，难以扩展

**Implementation**:
- 创建 `AgentScopeTaskDecomposer` 实现 `TaskDecomposer` 接口
- 使用 AgentScope Java SDK 创建多个智能体角色（规划者、执行者、验证者）
- 通过智能体协作生成任务分解结果

### Decision 2: 虚拟机执行集成方式
**What**: 在 `ExecutionEngineImpl` 中集成 `VmManager`，根据任务类型调用不同的虚拟机执行器

**Why**:
- 虚拟机提供了隔离的执行环境
- 可以执行命令、脚本和 GUI 操作
- 支持屏幕截图和状态监控

**Alternatives considered**:
- 直接在宿主机执行：安全性差，资源隔离不足
- 使用容器执行：功能受限，不支持 GUI 操作

**Implementation**:
- 创建 `VmCommandExecutor`、`VmScriptExecutor`、`VmGuiExecutor`
- 在 `ExecutionEngineImpl.executeStep()` 中根据任务类型调用相应执行器
- 每个执行器通过 `VmManager` 获取虚拟机实例并执行操作

### Decision 3: 任务进度跟踪机制
**What**: 使用内存状态映射 + 数据库持久化，支持实时查询和 SSE 推送

**Why**:
- 内存映射提供快速访问
- 数据库持久化保证数据不丢失
- SSE 支持实时进度更新

**Alternatives considered**:
- 仅使用内存：数据易丢失
- 仅使用数据库：查询性能较差

**Implementation**:
- 扩展 `ExecutionStatus` 实体，添加详细字段
- 使用 `ConcurrentHashMap` 存储运行时状态
- 定期将状态持久化到数据库
- 提供 SSE 接口推送进度更新

### Decision 4: 前端界面设计
**What**: 参考 Manus 界面，实现任务进度卡片和虚拟机屏幕预览

**Why**:
- Manus 界面设计清晰直观
- 用户需要实时了解任务执行状态
- 虚拟机屏幕预览有助于理解执行过程

**Implementation**:
- 创建 `TaskProgressViewer` 组件，显示任务步骤和进度
- 创建 `VmScreenPreview` 组件，显示虚拟机屏幕截图
- 使用 Material-UI 组件保持设计一致性
- 实现自动刷新机制（轮询或 SSE）

## Risks / Trade-offs

### Risk 1: AgentScope Java SDK 功能限制
**Risk**: AgentScope Java SDK 可能功能不如 Python 版本完整

**Mitigation**: 
- 先实现基础功能，验证可行性
- 如功能不足，考虑通过 Python 服务桥接
- 保持接口抽象，便于后续替换实现

### Risk 2: 虚拟机执行性能
**Risk**: 虚拟机执行可能比直接执行慢

**Trade-off**: 接受性能损失，换取安全性和隔离性

**Mitigation**:
- 优化虚拟机启动和命令执行流程
- 使用虚拟机池减少启动时间
- 对简单任务可以考虑直接执行

### Risk 3: 任务分解准确性
**Risk**: AI 分解的任务可能不准确或不可执行

**Mitigation**:
- 实现任务验证机制
- 提供任务编辑和手动调整功能
- 记录分解历史，持续优化提示词

## Migration Plan

### Phase 1: 基础实现
1. 实现 `AgentScopeTaskDecomposer`
2. 实现虚拟机执行器
3. 扩展任务进度跟踪

### Phase 2: 集成测试
1. 集成到现有执行流程
2. 测试各种任务类型
3. 优化性能和准确性

### Phase 3: 前端界面
1. 实现任务监控界面
2. 实现虚拟机屏幕预览
3. 集成到工作台

### Phase 4: 优化和文档
1. 性能优化
2. 错误处理完善
3. 文档编写

## Open Questions

1. AgentScope Java SDK 的具体 API 和使用方式需要进一步调研
2. 虚拟机 GUI 操作的实现方式（是否需要 VNC 或其他远程桌面协议）
3. 任务分解的粒度如何控制（太细可能影响效率，太粗可能不够灵活）
4. 多智能体协作的通信机制和结果聚合策略
