# AI Agent 子系统快速开始

## 配置信息

已配置阿里云通义千问：
- **API Key**: `sk-a486b81e29484fcea112b2c010b7bd95`
- **默认模型**: `qwen3-max`
- **服务端口**: `8082`

## 启动服务

```bash
cd aiagent
mvn spring-boot:run
```

服务启动后访问：http://localhost:8082

## API 使用示例

### 1. 注册一个简单的聊天 Agent

```bash
curl -X POST http://localhost:8082/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "id": "chat-agent",
    "name": "聊天助手",
    "description": "使用 qwen3-max 的聊天 Agent",
    "type": "TEXT",
    "provider": "alibaba",
    "model": "qwen3-max",
    "systemPrompt": "你是一个友好、专业的AI助手，能够回答各种问题。"
  }'
```

### 2. 执行 Agent

```bash
curl -X POST http://localhost:8082/api/agents/chat-agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "input": "你好，介绍一下自己"
  }'
```

### 3. 查看所有 Agent

```bash
curl http://localhost:8082/api/agents
```

### 4. 查看 Agent 详情

```bash
curl http://localhost:8082/api/agents/chat-agent
```

### 5. 删除 Agent

```bash
curl -X DELETE http://localhost:8082/api/agents/chat-agent
```

## 支持的模型

### 文字模型（Alibaba）
- `qwen3-max` - 默认模型，最新最强版本
- `qwen-max` - 高性能版本
- `qwen-plus` - 平衡版本
- `qwen-turbo` - 快速版本

### 图片生成模型
- `wanx-v1` - 通义万相图片生成

### 语音模型
- `paraformer-v2` - 语音识别

### 视频生成模型
- `wanx-video` - 通义万相视频生成

## 下一步

1. 查看 [Spring AI Alibaba 文档](https://java2ai.com/) 了解如何构建复杂工作流
2. 参考 [Graph Core 文档](https://java2ai.com/docs/frameworks/graph-core/quick-start) 学习工作流编排
3. 探索多 Agent 协作模式

