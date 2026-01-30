# Change: 增强任务分解和虚拟机执行能力

## Why

当前 Mentis 系统已有基础的任务分解和执行框架，但缺乏：
1. **智能任务分解**：现有 LLM 任务分解器较为简单，未充分利用 AgentScope 的多智能体协作能力
2. **虚拟机集成**：任务执行引擎未与虚拟机系统深度集成，无法实现类似 Manus 的自动化执行
3. **任务进度可视化**：缺少实时任务进度跟踪和虚拟机屏幕预览功能
4. **AgentScope 能力未充分利用**：虽然已集成 AgentScope 依赖，但多智能体协作、任务规划等功能尚未实现

参考 Manus 的实现和 AgentScope 的最佳实践（参考：https://blog.csdn.net/m0_53830442/article/details/154680334），需要增强任务分解和执行能力，使 Agent 能够：
- 智能分解复杂任务为可执行的子任务
- 在虚拟机中自动执行任务步骤
- 实时跟踪任务进度和虚拟机状态
- 利用 AgentScope 的多智能体协作能力

## What Changes

- **增强任务分解器**：集成 AgentScope 的任务规划能力，使用多智能体协作进行更智能的任务分解
- **虚拟机执行集成**：将任务执行引擎与虚拟机系统深度集成，支持在虚拟机中执行命令、脚本和 GUI 操作
- **任务进度跟踪**：实现实时任务进度跟踪，包括步骤状态、执行时间、虚拟机屏幕截图等
- **AgentScope 多智能体协作**：实现基于 AgentScope 的多智能体任务分解和执行协作
- **前端任务监控界面**：参考 Manus 界面，实现任务进度展示和虚拟机屏幕预览

## Impact

- **Affected specs**: 
  - 新增 `task-execution` capability
  - 修改 `mentis-agent` capability（如果存在）
- **Affected code**:
  - `mentis/backend/src/main/java/com/heartsphere/mentis/executor/` - 任务分解和执行相关
  - `mentis/backend/src/main/java/com/heartsphere/mentis/agentscope/` - AgentScope 集成
  - `mentis/backend/src/main/java/com/heartsphere/mentis/vm/` - 虚拟机管理
  - `mentis/frontend/src/components/` - 任务监控界面组件
- **Breaking changes**: 无
