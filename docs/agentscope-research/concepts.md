# AgentScope Java 核心概念总结

## 框架概述

AgentScope Java 是一个面向智能体的编程框架，旨在帮助开发者使用 Java 构建由大型语言模型（LLM）驱动的应用程序。

## 核心概念

### 1. ReAct（推理-行动）范式

**定义**：ReAct（Reasoning and Acting）是一种智能体工作模式，结合了推理（Reasoning）和行动（Acting）。

**特点**：
- 智能体通过推理理解任务和规划步骤
- 通过行动（工具调用）执行任务
- 通过观察结果调整推理
- 形成推理 → 行动 → 观察 → 推理的循环

**在 AgentScope 中的应用**：
- ReActAgent 是核心组件，自动实现 ReAct 循环
- 无需手动实现推理和行动的逻辑编排

### 2. ReActAgent（智能体）

**定义**：AgentScope 的核心组件，实现推理-行动循环的智能体。

**主要功能**：
- 理解用户意图
- 规划任务步骤
- 调用工具执行任务
- 生成响应

**关键特性**：
- 系统提示词配置
- 工具注册和调用
- 流式响应支持
- 结构化输出支持
- 钩子函数（实时介入）

### 3. Tool（工具）

**定义**：将外部能力封装为智能体可以调用的工具。

**功能**：
- 将 API、函数、服务封装为工具
- 工具可以被智能体自动调用
- 支持同步/异步工具函数
- 支持流式工具响应
- 支持并行工具调用

**实现方式**：
- 实现 Tool 接口
- 定义工具名称和描述
- 实现工具调用逻辑
- 注册到 ReActAgent

### 4. ChatModel（模型适配器）

**定义**：适配不同的大语言模型服务。

**支持的模型**：
- DashScope（阿里云通义千问）
- OpenAI（GPT 系列）
- 其他模型适配器

**配置方式**：
- 使用 builder 模式配置
- 设置 API Key 和模型名称
- 配置其他参数（温度、top-p 等）

### 5. Session（会话管理）

**定义**：管理智能体的会话状态。

**功能**：
- 持久化会话状态
- 跨应用运行保持连续性
- 会话上下文管理

**与 Mentis 的关系**：
- AgentScope Session 是可选功能
- 可以保留现有的 MentisSessionService
- 需要评估是否需要 AgentScope Session

### 6. Memory（长期记忆）

**定义**：存储和召回跨会话的用户偏好和知识。

**功能**：
- 语义搜索
- 知识召回
- 上下文增强

**状态**：可选功能，需要评估是否需要

### 7. Structured Output（结构化输出）

**定义**：支持类型安全的输出解析。

**功能**：
- 确保响应符合预定义的数据结构
- 减少手动 JSON 解析
- 类型安全

**优势**：
- 减少解析错误
- 提高代码可维护性
- 更好的类型安全

### 8. Streaming（流式响应）

**定义**：实时返回响应内容。

**实现**：
- `.callStream()` 方法支持流式调用
- 每个 chunk 包含部分响应
- 可以实时处理流式数据

**应用场景**：
- 长文本生成
- 实时对话
- 提升用户体验

## 关键特性

### 1. 钩子函数（Hooks）

**功能**：在推理和行动的关键点插入自定义逻辑。

**用途**：
- 实时介入
- 安全检查
- 日志记录
- 性能监控

### 2. 工具沙箱（Sandbox）

**功能**：隔离工具执行环境。

**用途**：
- 安全性保障
- 资源隔离
- 错误隔离

### 3. 可视化调试（Studio）

**功能**：可视化观察智能体的推理和执行过程。

**用途**：
- 开发调试
- 性能分析
- 行为理解

### 4. 多智能体协作（A2A）

**功能**：支持多个智能体之间的协作。

**用途**：
- 复杂任务分解
- 智能体分工
- 协作执行

## 与 Mentis 的对应关系

| AgentScope 概念 | Mentis 当前实现 | 集成方式 |
|----------------|----------------|----------|
| ReActAgent | IntentRecognizer + TaskPlanner + ResponseGenerator | 替代 |
| Tool | ComputerUseExecutor、CommandExecutor、ScriptExecutor | 包装为工具 |
| ChatModel | AIService | 使用模型适配器 |
| Session | MentisSessionService | 保留现有实现或集成 |
| Memory | 数据库消息存储 | 可选增强 |
| Structured Output | LLMResponseParser | 替代 |
| Streaming | AIService.generateTextStream | 使用框架能力 |

## 核心优势

1. **简化架构**：ReActAgent 自动处理推理-行动循环，减少手动编排
2. **标准化实现**：遵循业界成熟的框架模式
3. **功能增强**：提供流式响应、结构化输出、工具系统等
4. **易于扩展**：工具系统便于添加新功能
5. **生产就绪**：提供钩子函数、沙箱等企业级特性

## 待确认问题

1. 具体的 API 签名和返回值类型
2. 工具接口的详细定义
3. 流式响应的处理方式
4. 会话管理的具体实现
5. 与 Spring Boot 的集成方式

## 参考资源

- 官方文档：https://java.agentscope.io/zh/intro.html
- API 参考：https://runtime.agentscope.io/zh/api/index.html
- GitHub：https://github.com/agentscope-ai/agentscope-java

## 最后更新

2026-01-09 - 初始概念总结
