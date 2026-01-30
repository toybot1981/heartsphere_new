# 多智能体框架快速开始指南

## 概述

本指南帮助您快速上手多智能体框架，在 10 分钟内创建一个简单的多智能体应用。

## 前置要求

- Java 17+
- Spring Boot 3.2.0+
- Maven 3.9+

## 步骤 1: 创建智能体

创建一个简单的智能体类：

```java
package com.example.agent;

import com.heartsphere.multiagent.core.BaseAgent;
import com.heartsphere.multiagent.core.Agent;
import org.springframework.stereotype.Component;

@Component
public class GreetingAgent extends BaseAgent {
    
    public GreetingAgent() {
        super("greeting-agent", "问候助手", "提供友好的问候服务");
        addCapability("greeting");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        String name = (String) context.getOrDefault("name", "朋友");
        String greeting = String.format("你好，%s！很高兴为你服务。", name);
        return AgentResult.success(greeting);
    }
}
```

## 步骤 2: 注册智能体

智能体会在 Spring 容器启动时自动注册到 `AgentRegistry`。如果需要手动注册：

```java
package com.example.config;

import com.heartsphere.multiagent.core.AgentRegistry;
import com.example.agent.GreetingAgent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

@Configuration
public class AgentConfig {
    
    @Autowired
    private AgentRegistry agentRegistry;
    
    @Autowired
    private GreetingAgent greetingAgent;
    
    @PostConstruct
    public void registerAgents() {
        agentRegistry.register(greetingAgent);
    }
}
```

## 步骤 3: 创建路由策略

创建一个简单的路由策略：

```java
package com.example.router;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.AgentRegistry;
import com.heartsphere.multiagent.router.AgentRouter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SimpleRouter implements AgentRouter {
    
    @Autowired
    private AgentRegistry agentRegistry;
    
    @Override
    public List<Agent> route(String task, RoutingContext context) {
        List<Agent> agents = new ArrayList<>();
        
        // 简单的关键词匹配
        if (task.contains("问候") || task.contains("hello") || task.contains("greeting")) {
            List<Agent> greetingAgents = agentRegistry.findAgentsByCapability("greeting");
            agents.addAll(greetingAgents);
        }
        
        return agents;
    }
    
    @Override
    public List<SubTask> decompose(String task) {
        // 简单任务，不需要分解
        return Arrays.asList(new SubTask("main-task", task, Set.of()));
    }
}
```

## 步骤 4: 创建编排服务

创建一个编排服务来协调智能体：

```java
package com.example.service;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.orchestrator.CollaborationOrchestrator;
import com.heartsphere.multiagent.router.AgentRouter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class CollaborationService {
    
    @Autowired
    private AgentRouter router;
    
    @Autowired
    private CollaborationOrchestrator orchestrator;
    
    public CompletableFuture<String> collaborate(String task, String userId, String sessionId) {
        // 1. 路由到合适的智能体
        RoutingContext routingContext = new RoutingContext(userId, sessionId);
        List<Agent> agents = router.route(task, routingContext);
        
        if (agents.isEmpty()) {
            return CompletableFuture.completedFuture("未找到合适的智能体");
        }
        
        // 2. 创建协作任务
        CollaborationContext context = new CollaborationContext(userId, sessionId);
        context.setMode(WorkflowMode.SEQUENTIAL);
        
        String collaborationId = orchestrator.createCollaboration(task, agents, context);
        
        // 3. 执行协作
        return orchestrator.execute(collaborationId)
            .thenApply(result -> {
                if (result.isSuccess()) {
                    return result.getResult();
                } else {
                    return "执行失败: " + String.join(", ", result.getErrors());
                }
            });
    }
}
```

## 步骤 5: 创建控制器

创建一个 REST 控制器来暴露 API：

```java
package com.example.controller;

import com.example.service.CollaborationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/collaborate")
public class CollaborationController {
    
    @Autowired
    private CollaborationService collaborationService;
    
    @PostMapping
    public CompletableFuture<Map<String, Object>> collaborate(
            @RequestBody Map<String, String> request) {
        String task = request.get("task");
        String userId = request.getOrDefault("userId", "anonymous");
        String sessionId = request.getOrDefault("sessionId", "default");
        
        return collaborationService.collaborate(task, userId, sessionId)
            .thenApply(result -> Map.of("result", result));
    }
}
```

## 步骤 6: 测试

启动应用并测试：

```bash
# 启动应用
mvn spring-boot:run

# 测试 API
curl -X POST http://localhost:8080/api/collaborate \
  -H "Content-Type: application/json" \
  -d '{
    "task": "请问候我",
    "userId": "user-123",
    "sessionId": "session-456"
  }'
```

预期响应：
```json
{
  "result": "你好，朋友！很高兴为你服务。"
}
```

## 完整示例：多智能体协作

创建一个更复杂的示例，展示多个智能体协作：

```java
@Component
public class WeatherAgent extends BaseAgent {
    public WeatherAgent() {
        super("weather-agent", "天气助手", "提供天气查询服务");
        addCapability("weather");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        // 模拟天气查询
        return AgentResult.success("今天天气晴朗，温度 25°C");
    }
}

@Component
public class RecommendationAgent extends BaseAgent {
    public RecommendationAgent() {
        super("recommendation-agent", "推荐助手", "提供活动推荐服务");
        addCapability("recommendation");
    }
    
    @Override
    protected AgentResult doExecute(String task, Map<String, Object> context) {
        // 使用前一个智能体的结果
        String weatherResult = (String) context.get("weather-agent_result");
        
        if (weatherResult != null && weatherResult.contains("晴朗")) {
            return AgentResult.success("建议进行户外活动，如散步或运动");
        } else {
            return AgentResult.success("建议进行室内活动，如阅读或看电影");
        }
    }
}
```

更新路由策略以支持多个智能体：

```java
@Override
public List<Agent> route(String task, RoutingContext context) {
    List<Agent> agents = new ArrayList<>();
    
    if (task.contains("天气") || task.contains("weather")) {
        agents.addAll(agentRegistry.findAgentsByCapability("weather"));
    }
    
    if (task.contains("推荐") || task.contains("recommendation")) {
        agents.addAll(agentRegistry.findAgentsByCapability("recommendation"));
    }
    
    return agents;
}
```

测试多智能体协作：

```bash
curl -X POST http://localhost:8080/api/collaborate \
  -H "Content-Type: application/json" \
  -d '{
    "task": "查询天气并推荐活动",
    "userId": "user-123",
    "sessionId": "session-456"
  }'
```

## 下一步

现在您已经掌握了基本用法，可以：

1. **阅读架构文档**: 了解框架的详细设计
2. **查看 API 指南**: 学习更多 API 使用方法
3. **参考最佳实践**: 学习开发最佳实践
4. **查看性能优化指南**: 优化应用性能

## 常见问题

### Q: 智能体没有执行？

A: 检查智能体是否正确注册到 `AgentRegistry`，可以使用 `agentRegistry.getAllAgents()` 查看所有已注册的智能体。

### Q: 路由没有找到智能体？

A: 检查路由策略是否正确实现，确保智能体的能力描述与路由逻辑匹配。

### Q: 协作执行失败？

A: 检查协作模式设置是否正确，查看日志了解详细错误信息。

### Q: 如何调试？

A: 启用 DEBUG 日志级别，查看详细的执行日志：

```properties
logging.level.com.heartsphere.multiagent=DEBUG
```

## 总结

通过本指南，您已经：

1. ✅ 创建了第一个智能体
2. ✅ 实现了路由策略
3. ✅ 创建了协作服务
4. ✅ 暴露了 REST API
5. ✅ 测试了基本功能

现在您可以开始构建更复杂的多智能体应用了！
