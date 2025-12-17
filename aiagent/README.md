# HeartSphere AI Agent 子系统

基于 Spring AI Alibaba 的智能 Agent 框架，支持快速构建基于工作流的 AI Agent。

## 特性

- 🚀 **基于 Spring AI Alibaba Graph** - 使用官方工作流引擎，无需自己实现
- 🤖 **多模型支持** - 支持阿里云通义、OpenAI、Ollama 等
- 🎨 **多模态能力** - 支持文字、图片、语音、视频等多种 API
- 🔧 **灵活的工作流** - 支持顺序、并行、路由、循环等工作流模式
- 📦 **快速构建** - 通过配置快速创建 Agent，无需编写复杂代码

## 项目结构

```
aiagent/
├── src/main/java/com/heartsphere/aiagent/
│   ├── agent/          # Agent 核心类
│   ├── adapter/        # 大模型适配器
│   ├── graph/          # 工作流构建器
│   ├── model/          # 数据模型
│   ├── service/        # 业务服务
│   ├── controller/     # REST API
│   └── config/         # 配置类
└── src/main/resources/
    └── application.yml  # 配置文件
```

## 快速开始

### 1. 配置 API Key

在 `application.yml` 中配置你的 API Key：

```yaml
spring:
  ai:
    alibaba:
      dashscope:
        api-key: your-dashscope-api-key
```

### 2. 创建 Agent

通过 API 注册一个 Agent：

```bash
POST /api/agents
{
  "id": "chat-agent",
  "name": "聊天助手",
  "description": "一个简单的聊天 Agent",
  "type": "TEXT",
  "provider": "alibaba",
  "model": "qwen-max",
  "systemPrompt": "你是一个友好的助手"
}
```

### 3. 执行 Agent

```bash
POST /api/agents/chat-agent/execute
{
  "input": "你好，介绍一下自己"
}
```

## 支持的模型提供商

- **Alibaba (通义千问)** - 文字、图片、语音、视频
- **OpenAI** - 文字、图片、语音
- **Ollama** - 本地模型支持

## 工作流类型

- **Sequential** - 顺序执行
- **Parallel** - 并行执行
- **Routing** - 条件路由
- **Loop** - 循环执行

## 开发计划

- [x] 基础项目结构
- [x] 模型适配器框架
- [x] Agent 基础框架
- [ ] 基于 Graph 的工作流实现
- [ ] 多模态 API 完整实现
- [ ] Agent 管理界面
- [ ] 工作流可视化

## 参考文档

- [Spring AI Alibaba 官方文档](https://java2ai.com/)
- [GitHub 仓库](https://github.com/alibaba/spring-ai-alibaba)
- [Graph Core 文档](https://java2ai.com/docs/frameworks/graph-core/quick-start)

