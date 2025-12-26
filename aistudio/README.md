# HeartSphere AI Studio

AI相关的实验性工具和Agent开发平台，支持快速构建基于工作流的AI Agent和各种AI实验性功能。

## 项目定位

- **实验性工具开发**: 开发和测试各种AI相关的创新功能
- **Agent开发平台**: 基于Spring AI Alibaba的智能Agent框架
- **大模型服务集成**: 通过backend服务层统一接入各大模型API

## 特性

- 🚀 **基于Spring AI Alibaba Graph** - 使用官方工作流引擎
- 🤖 **多模型支持** - 通过backend服务统一接入各大模型
- 🎨 **多模态能力** - 支持文字、图片、语音、视频等多种API
- 🔧 **灵活的工作流** - 支持顺序、并行、路由、循环等工作流模式
- 📦 **快速构建** - 通过配置快速创建Agent，无需编写复杂代码
- 🧠 **Context Engine** - 智能上下文管理和多轮对话记忆系统

## 项目结构

```
aistudio/
├── src/main/java/com/heartsphere/aistudio/
│   ├── agent/          # Agent核心类
│   ├── adapter/        # 大模型适配器（连接backend服务）
│   ├── context/        # Context Engine 上下文管理
│   │   ├── model/      # 上下文数据模型
│   │   ├── memory/     # ChatMemory 实现（Redis）
│   │   ├── optimizer/  # 上下文优化器
│   │   └── config/     # Context Engine 配置
│   ├── graph/          # 工作流构建器
│   ├── model/          # 数据模型
│   ├── service/        # 业务服务
│   ├── controller/     # REST API
│   └── config/         # 配置类
└── src/main/resources/
    └── application.yml  # 配置文件
```

## 快速开始

### 1. 配置backend服务地址

在 `application.yml` 中配置backend服务地址：

```yaml
backend:
  service:
    url: http://localhost:8080
```

### 2. 创建Agent

通过API注册一个Agent：

```bash
POST /api/agents
{
  "id": "chat-agent",
  "name": "聊天助手",
  "description": "一个简单的聊天Agent",
  "type": "TEXT",
  "systemPrompt": "你是一个友好的助手"
}
```

### 3. 执行Agent

```bash
POST /api/agents/chat-agent/execute
{
  "input": "你好，介绍一下自己"
}
```

## 架构说明

### 与backend的职责分离

- **aistudio**: 专注于AI实验性功能开发和Agent工作流编排
- **backend**: 提供大模型统一接入服务，处理API调用、计费、日志等

### 支持的工作流类型

- **Sequential** - 顺序执行
- **Parallel** - 并行执行
- **Routing** - 条件路由
- **Loop** - 循环执行

## 开发计划

- [x] 基础项目结构
- [x] 重命名为aistudio
- [x] Context Engine 基础实现
- [ ] Agent基础框架
- [ ] backend服务连接适配器
- [ ] 基于Graph的工作流实现
- [ ] 多模态API完整实现
- [ ] Agent管理界面
- [ ] 工作流可视化

## Context Engine

### 已实现功能

✅ **核心模型**
- ContextMessage - 上下文消息模型
- ContextSession - 会话管理
- ConversationSummary - 对话摘要
- OptimizedContext - 优化后的上下文

✅ **ChatMemory**
- Redis 存储实现
- 自动过期管理
- 消息压缩触发

✅ **上下文优化**
- 5种优化策略：滚动窗口、摘要、语义选择、重要性、混合
- Token 估算和管理
- 自动摘要生成

✅ **REST API**
- 完整的会话管理 API
- 消息添加和检索
- 上下文优化和统计
- Spring AI 格式转换

### 使用示例

```java
// 1. 初始化会话
contextManager.initializeSession("session-1", "user-1", "agent-1");

// 2. 添加消息
ContextMessage msg = ContextMessage.user("你好", "session-1", "user-1");
contextManager.addMessage("session-1", msg);

// 3. 获取优化后的上下文
List<ContextMessage> context =
    contextManager.getOptimizedContext("session-1", 8000);

// 4. 转换为 Spring AI Messages
List<Message> springAIMessages =
    contextManager.toSpringAIMessages(context);
```

详细使用指南：[Context Engine 使用指南](../docs/开发/CONTEXT_ENGINE_USAGE.md)

## 参考文档

- [Spring AI Alibaba 官方文档](https://java2ai.com/)
- [GitHub 仓库](https://github.com/alibaba/spring-ai-alibaba)
- [Graph Core 文档](https://java2ai.com/docs/frameworks/graph-core/quick-start)
