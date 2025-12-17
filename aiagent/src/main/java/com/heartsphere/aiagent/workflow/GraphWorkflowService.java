package com.heartsphere.aiagent.workflow;

import com.alibaba.cloud.ai.dashscope.chat.DashScopeChatModel;
import com.heartsphere.aiagent.model.AgentDefinition;
import com.heartsphere.aiagent.tool.ToolRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

/**
 * 基于 Spring AI Alibaba Graph 的工作流服务
 * 提供复杂工作流的构建和执行能力
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GraphWorkflowService {
    
    private final DashScopeChatModel chatModel;
    private final ToolRegistry toolRegistry;
    
    /**
     * 执行顺序工作流
     * 按顺序执行多个步骤
     */
    public CompletableFuture<WorkflowResult> executeSequentialWorkflow(
            AgentDefinition definition, 
            Map<String, Object> input) {
        return executeSequentialWorkflow(definition, input, null);
    }
    
    /**
     * 执行顺序工作流（带进度回调）
     */
    public CompletableFuture<WorkflowResult> executeSequentialWorkflow(
            AgentDefinition definition, 
            Map<String, Object> input,
            Consumer<WorkflowProgress> progressCallback) {
        
        return CompletableFuture.supplyAsync(() -> {
            log.info("执行顺序工作流: {}", definition.getName());
            
            WorkflowResult result = new WorkflowResult();
            result.setWorkflowId(definition.getId());
            result.setWorkflowType("sequential");
            
            try {
                // 检查是否有工作流配置
                if (definition.getWorkflow() == null) {
                    result.setSuccess(false);
                    result.setError("Agent 未配置工作流");
                    return result;
                }
                
                // 获取工作流节点
                var nodes = definition.getWorkflow().getNodes();
                var edges = definition.getWorkflow().getEdges();
                
                if (nodes == null || nodes.isEmpty()) {
                    result.setSuccess(false);
                    result.setError("工作流节点为空");
                    return result;
                }
                
                // 创建进度跟踪
                WorkflowProgress progress = WorkflowProgress.create(definition.getId(), nodes.size());
                if (progressCallback != null) {
                    progressCallback.accept(progress);
                }
                
                // 按顺序执行节点
                Map<String, Object> context = input;
                for (int i = 0; i < nodes.size(); i++) {
                    var node = nodes.get(i);
                    log.info("执行节点 {}/{}: {}", i + 1, nodes.size(), node.getName());
                    
                    // 更新进度
                    progress.updateStep(i + 1, node.getName(), "running");
                    log.info("步骤 {}/{} 开始执行: {}, 进度: {}%", i + 1, nodes.size(), node.getName(), progress.getProgress());
                    if (progressCallback != null) {
                        progressCallback.accept(progress);
                    }
                    
                    try {
                        Object nodeResult = executeNode(node, context, definition);
                        context.put(node.getId(), nodeResult);
                        result.addStepResult(node.getId(), nodeResult);
                        
                        // 更新进度为完成
                        progress.updateStep(i + 1, node.getName(), "completed");
                        progress.setStepResult(nodeResult);
                        log.info("步骤 {}/{} 执行完成: {}, 进度: {}%", i + 1, nodes.size(), node.getName(), progress.getProgress());
                        if (progressCallback != null) {
                            progressCallback.accept(progress);
                        }
                    } catch (Exception e) {
                        log.error("节点执行失败: {}", node.getName(), e);
                        progress.updateStep(i + 1, node.getName(), "failed");
                        progress.setError(e.getMessage());
                        if (progressCallback != null) {
                            progressCallback.accept(progress);
                        }
                        throw e;
                    }
                }
                
                result.setSuccess(true);
                result.setFinalResult(context);
                
                // 完成进度
                progress.complete(context);
                if (progressCallback != null) {
                    progressCallback.accept(progress);
                }
            } catch (Exception e) {
                log.error("工作流执行失败", e);
                result.setSuccess(false);
                result.setError(e.getMessage());
                
                if (progressCallback != null) {
                    WorkflowProgress progress = WorkflowProgress.create(definition.getId(), 0);
                    progress.fail(e.getMessage());
                    progressCallback.accept(progress);
                }
            }
            
            return result;
        });
    }
    
    /**
     * 执行并行工作流
     * 并行执行多个步骤
     */
    public CompletableFuture<WorkflowResult> executeParallelWorkflow(
            AgentDefinition definition,
            Map<String, Object> input) {
        
        return CompletableFuture.supplyAsync(() -> {
            log.info("执行并行工作流: {}", definition.getName());
            
            WorkflowResult result = new WorkflowResult();
            result.setWorkflowId(definition.getId());
            result.setWorkflowType("parallel");
            
            try {
                // 检查是否有工作流配置
                if (definition.getWorkflow() == null) {
                    result.setSuccess(false);
                    result.setError("Agent 未配置工作流");
                    return result;
                }
                
                var nodes = definition.getWorkflow().getNodes();
                
                if (nodes == null || nodes.isEmpty()) {
                    result.setSuccess(false);
                    result.setError("工作流节点为空");
                    return result;
                }
                
                // 并行执行所有节点
                CompletableFuture<?>[] futures = new CompletableFuture[nodes.size()];
                for (int i = 0; i < nodes.size(); i++) {
                    final AgentDefinition.NodeConfig node = nodes.get(i);
                    futures[i] = CompletableFuture.supplyAsync(() -> {
                        log.info("并行执行节点: {}", node.getName());
                        return executeNode(node, input, definition);
                    });
                }
                
                // 等待所有节点完成
                CompletableFuture.allOf(futures).join();
                
                // 收集结果
                Map<String, Object> results = new java.util.HashMap<>();
                for (int i = 0; i < nodes.size(); i++) {
                    results.put(nodes.get(i).getId(), futures[i].join());
                    result.addStepResult(nodes.get(i).getId(), futures[i].join());
                }
                
                result.setSuccess(true);
                result.setFinalResult(results);
            } catch (Exception e) {
                log.error("并行工作流执行失败", e);
                result.setSuccess(false);
                result.setError(e.getMessage());
            }
            
            return result;
        });
    }
    
    /**
     * 执行路由工作流
     * 根据条件路由到不同的节点
     */
    public CompletableFuture<WorkflowResult> executeRoutingWorkflow(
            AgentDefinition definition,
            Map<String, Object> input) {
        
        return CompletableFuture.supplyAsync(() -> {
            log.info("执行路由工作流: {}", definition.getName());
            
            WorkflowResult result = new WorkflowResult();
            result.setWorkflowId(definition.getId());
            result.setWorkflowType("routing");
            
            try {
                // 检查是否有工作流配置
                if (definition.getWorkflow() == null) {
                    result.setSuccess(false);
                    result.setError("Agent 未配置工作流");
                    return result;
                }
                
                var nodes = definition.getWorkflow().getNodes();
                var edges = definition.getWorkflow().getEdges();
                
                if (nodes == null || nodes.isEmpty()) {
                    result.setSuccess(false);
                    result.setError("工作流节点为空");
                    return result;
                }
                
                // 找到起始节点
                var startNode = nodes.stream()
                    .filter(n -> "start".equals(n.getType()))
                    .findFirst()
                    .orElse(nodes.get(0));
                
                // 执行路由逻辑
                String currentNodeId = startNode.getId();
                Map<String, Object> context = input;
                
                while (currentNodeId != null) {
                    final String finalCurrentNodeId = currentNodeId;
                    var currentNode = nodes.stream()
                        .filter(n -> n.getId().equals(finalCurrentNodeId))
                        .findFirst()
                        .orElse(null);
                    
                    if (currentNode == null) break;
                    
                    Object nodeResult = executeNode(currentNode, context, definition);
                    context.put(currentNodeId, nodeResult);
                    result.addStepResult(currentNodeId, nodeResult);
                    
                    // 查找下一个节点
                    var nextEdge = edges.stream()
                        .filter(e -> e.getFrom().equals(finalCurrentNodeId))
                        .findFirst()
                        .orElse(null);
                    
                    if (nextEdge != null && evaluateCondition(nextEdge.getCondition(), context)) {
                        currentNodeId = nextEdge.getTo();
                    } else {
                        currentNodeId = null;
                    }
                }
                
                result.setSuccess(true);
                result.setFinalResult(context);
            } catch (Exception e) {
                log.error("路由工作流执行失败", e);
                result.setSuccess(false);
                result.setError(e.getMessage());
            }
            
            return result;
        });
    }
    
    /**
     * 执行节点
     */
    private Object executeNode(
            AgentDefinition.NodeConfig node,
            Map<String, Object> context,
            AgentDefinition definition) {
        
        String nodeType = node.getType();
        if (nodeType == null) {
            nodeType = "agent"; // 默认类型
        }
        
        switch (nodeType) {
            case "agent":
                return executeAgentNode(node, context, definition);
            case "tool":
                return executeToolNode(node, context);
            case "condition":
                if (node.getConfig() != null && node.getConfig().containsKey("expression")) {
                    return evaluateCondition(node.getConfig().get("expression").toString(), context);
                }
                return true;
            default:
                log.warn("未知节点类型: {}", nodeType);
                return null;
        }
    }
    
    /**
     * 执行 Agent 节点
     */
    private Object executeAgentNode(
            AgentDefinition.NodeConfig node,
            Map<String, Object> context,
            AgentDefinition definition) {
        
        // 构建提示词
        String prompt = buildPrompt(node, context, definition);
        
        // 调用 AI 模型
        Prompt aiPrompt = new Prompt(prompt);
        var response = chatModel.call(aiPrompt);
        
        // 获取回复内容
        if (response.getResult() != null && response.getResult().getOutput() != null) {
            var output = response.getResult().getOutput();
            // 直接返回字符串表示
            return output.toString();
        }
        return "";
    }
    
    /**
     * 执行 Tool 节点
     */
    private Object executeToolNode(AgentDefinition.NodeConfig node, Map<String, Object> context) {
        log.info("执行 Tool 节点: {}", node.getName());
        
        if (node.getConfig() == null || !node.getConfig().containsKey("toolName")) {
            log.warn("Tool 节点缺少 toolName 配置");
            return null;
        }
        
        String toolName = node.getConfig().get("toolName").toString();
        var tool = toolRegistry.getTool(toolName);
        
        if (tool == null) {
            log.warn("工具不存在: {}", toolName);
            return null;
        }
        
        // 构建工具参数
        Map<String, Object> toolParams = new HashMap<>();
        if (node.getConfig().containsKey("parameters")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> configParams = (Map<String, Object>) node.getConfig().get("parameters");
            toolParams.putAll(configParams);
        }
        
        // 从 context 中提取参数（支持变量替换）
        Map<String, Object> finalParams = new HashMap<>();
        toolParams.forEach((key, value) -> {
            String valueStr = value.toString();
            // 简单的变量替换：${variableName}
            if (valueStr.startsWith("${") && valueStr.endsWith("}")) {
                String varName = valueStr.substring(2, valueStr.length() - 1);
                finalParams.put(key, context.getOrDefault(varName, value));
            } else {
                finalParams.put(key, value);
            }
        });
        
        // 执行工具
        try {
            return tool.execute(finalParams);
        } catch (Exception e) {
            log.error("工具执行失败: {}", toolName, e);
            return Map.of("error", e.getMessage());
        }
    }
    
    /**
     * 构建提示词
     */
    private String buildPrompt(
            AgentDefinition.NodeConfig node,
            Map<String, Object> context,
            AgentDefinition definition) {
        
        String basePrompt = definition.getSystemPrompt() != null 
            ? definition.getSystemPrompt() 
            : "";
        
        String nodePrompt = node.getConfig() != null && node.getConfig().containsKey("prompt")
            ? node.getConfig().get("prompt").toString()
            : "";
        
        // 替换上下文变量
        String finalPrompt = basePrompt + "\n\n" + nodePrompt;
        for (Map.Entry<String, Object> entry : context.entrySet()) {
            finalPrompt = finalPrompt.replace("${" + entry.getKey() + "}", 
                String.valueOf(entry.getValue()));
        }
        
        return finalPrompt;
    }
    
    /**
     * 评估条件表达式
     */
    private boolean evaluateCondition(String condition, Map<String, Object> context) {
        if (condition == null || condition.trim().isEmpty()) {
            return true;
        }
        
        // 简单的条件评估（实际应该使用表达式引擎）
        String evaluated = condition;
        for (Map.Entry<String, Object> entry : context.entrySet()) {
            evaluated = evaluated.replace("${" + entry.getKey() + "}", 
                String.valueOf(entry.getValue()));
        }
        
        // 这里应该使用更强大的表达式引擎，如 SpEL
        // 暂时返回 true
        return true;
    }
}

