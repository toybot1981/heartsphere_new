# Change: 实现 Manus AI 风格的虚拟电脑系统

## Why

参考 Manus AI 的成功实现（详见 `docs/MANUS_ANALYSIS_REPORT.md`），HeartSphere 项目需要实现一个类似的虚拟电脑系统，使 AI Agent 能够像人类一样使用计算机完成复杂任务。

当前 Mentis 系统已有基础的虚拟机管理和任务执行能力，但缺乏：
1. **完整的虚拟电脑环境**：类似 E2B 的完整操作系统环境，支持桌面、浏览器、终端等
2. **多智能体协作架构**：Planner + Executor + Monitor 三智能体协作系统
3. **丰富的工具生态**：27种工具覆盖浏览器、终端、文件系统、代码执行等场景
4. **长期任务支持**：持久化会话、检查点保存，支持最长14天的任务执行
5. **流式交互体验**：实时展示 AI 思考过程、任务进度、虚拟机屏幕状态

通过实现 Manus 风格的系统，可以显著提升 AI Agent 的能力，使其能够：
- 完成复杂的多步骤任务（如数据分析、报告生成、网页自动化等）
- 在完整的计算机环境中执行操作，而非简单的命令执行
- 支持长时间运行的任务，无需担心会话中断
- 提供优秀的用户体验，实时反馈任务执行状态

## What Changes

### 核心能力新增

1. **虚拟电脑沙箱系统** (`virtual-computer-sandbox`)
   - 集成 E2B 平台（与 Manus 一致）
   - 使用 E2B 提供的完整操作系统环境（Firecracker microVM）
   - E2B 已提供桌面环境（XFCE4）、浏览器（Chromium）、终端等
   - 支持 VNC 远程桌面访问（E2B 提供）
   - 快速启动（~150ms，E2B 原生支持）
   - 保留 Docker 实现代码作为备选方案（但不使用）

2. **多智能体协作系统** (`multi-agent-system`)
   - **Planner Agent**：任务理解和分解，生成执行计划
   - **Executor Agent**：执行工具调用，处理执行结果
   - **Monitor Agent**：状态监控和异常处理，自动恢复
   - 智能体间消息传递和协作机制
   - 基于 LangGraph 或类似框架的状态机编排

3. **Agent 工具生态系统** (`agent-tool-ecosystem`)
   - **浏览器工具**（10种）：goto, click, type, scroll, screenshot, back, forward, refresh, search, extract
   - **终端工具**（5种）：exec, write, read, cd, ls
   - **文件系统工具**（4种）：create, delete, copy, move
   - **代码执行工具**（3种）：python_run, node_run, bash_run
   - **系统工具**（5种）：info, snapshot, restore, wait, log
   - 工具注册、发现、调用机制
   - 工具链式调用和上下文传递

4. **会话持久化系统** (`session-persistence`)
   - 会话状态持久化（最长14天）
   - 检查点（Checkpoint）保存和恢复
   - 任务状态恢复机制
   - 数据保留策略（任务结束后7天）

5. **流式交互系统** (`streaming-interaction`)
   - 实时展示 AI 思考过程（agent_thought）
   - 任务步骤进度更新（step_progress）
   - 虚拟机屏幕截图推送（screenshot）
   - 步骤完成通知（step_completed）
   - 基于 WebSocket 或 SSE 的实时通信

### 技术选型

- **虚拟化技术**：优先 E2B 平台（与 Manus 一致），备选 Docker（保留但不使用）
- **Agent 框架**：基于现有 AgentScope 集成，或使用 LangGraph 风格的状态机
- **实时通信**：WebSocket（双向） + SSE（单向推送）
- **前端展示**：React + noVNC（VNC 客户端）或自定义虚拟桌面组件

## Impact

- **Affected specs**: 
  - 新增 `virtual-computer-sandbox` capability
  - 新增 `multi-agent-system` capability
  - 新增 `agent-tool-ecosystem` capability
  - 新增 `session-persistence` capability
  - 新增 `streaming-interaction` capability
  - 可能修改现有的 `mentis-agent` 相关能力（如果存在）

- **Affected code**:
  - `mentis/backend/src/main/java/com/heartsphere/mentis/sandbox/` - E2B 沙箱管理
  - `mentis/backend/src/main/java/com/heartsphere/mentis/agent/` - 多智能体系统
  - `mentis/backend/src/main/java/com/heartsphere/mentis/tool/` - 工具系统
  - `mentis/backend/src/main/java/com/heartsphere/mentis/session/` - 会话持久化
  - `mentis/backend/src/main/java/com/heartsphere/mentis/streaming/` - 流式交互
  - `mentis/frontend/src/components/virtual-computer/` - 前端虚拟电脑界面
  - `mentis/frontend/src/components/task-monitor/` - 任务监控界面

- **Breaking changes**: 无（新增功能，不影响现有功能）

- **Dependencies**:
  - **E2B SDK/API**：需要集成 E2B Java SDK 或 REST API（主要依赖）
  - **浏览器自动化库**：Playwright 或 Selenium WebDriver（用于浏览器工具）
  - **前端 noVNC 库**：用于 VNC 客户端显示
  - **Docker 客户端依赖**：保留但不使用（备选方案）
