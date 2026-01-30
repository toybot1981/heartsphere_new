package com.heartsphere.multiagent.agentscope;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.orchestrator.CollaborationOrchestrator;
import com.heartsphere.multiagent.core.Agent;
import io.agentscope.core.ReActAgent;
import io.agentscope.core.message.Msg;
import io.agentscope.core.message.MsgRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * AgentScope 编排器
 * 
 * 使用 AgentScope 的多智能体能力进行协作编排
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgentScopeOrchestrator {
    
    private final AgentScopeAdapter adapter;
    
    /**
     * 使用 AgentScope 进行多智能体协作
     * 
     * @param agents 智能体列表
     * @param task 任务描述
     * @param mode 协作模式
     * @return 协作结果
     */
    public CompletableFuture<CollaborationOrchestrator.CollaborationResult> collaborate(
            List<Agent> agents, 
            String task,
            CollaborationOrchestrator.WorkflowMode mode) {
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("Starting AgentScope collaboration: agents={}, task={}, mode={}", 
                    agents.size(), task, mode);
                
                Map<String, Object> agentResults = new HashMap<>();
                List<String> errors = new ArrayList<>();
                
                if (mode == CollaborationOrchestrator.WorkflowMode.PARALLEL) {
                    return executeParallel(agents, task, agentResults, errors);
                } else {
                    return executeSequential(agents, task, agentResults, errors);
                }
            } catch (Exception e) {
                log.error("AgentScope collaboration failed", e);
                CollaborationOrchestrator.CollaborationResult result = 
                    new CollaborationOrchestrator.CollaborationResult();
                result.setSuccess(false);
                result.setErrors(Arrays.asList(e.getMessage()));
                return result;
            }
        });
    }
    
    /**
     * 顺序执行
     */
    private CollaborationOrchestrator.CollaborationResult executeSequential(
            List<Agent> agents,
            String task,
            Map<String, Object> agentResults,
            List<String> errors) {
        
        String currentTask = task;
        Map<String, Object> context = new HashMap<>();
        
        for (Agent agent : agents) {
            try {
                // 如果是 AgentScopeAgentWrapper，使用 ReActAgent
                if (agent instanceof AgentScopeAgentWrapper) {
                    ReActAgent reactAgent = ((AgentScopeAgentWrapper) agent).getReactAgent();
                    
                    Msg userMsg = Msg.builder()
                        .role(MsgRole.USER)
                        .textContent(currentTask)
                        .build();
                    
                    Mono<Msg> responseMono = reactAgent.call(Arrays.asList(userMsg));
                    Msg response = responseMono.block();
                    
                    if (response != null) {
                        String result = response.getTextContent();
                        agentResults.put(agent.getId(), result);
                        context.put(agent.getId() + "_result", result);
                        currentTask = "基于之前的讨论：" + result + "\n继续处理：" + task;
                    }
                } else {
                    // 使用普通 Agent
                    Agent.AgentResult result = agent.execute(currentTask, context);
                    if (result.isSuccess()) {
                        agentResults.put(agent.getId(), result.getResult());
                        context.put(agent.getId() + "_result", result.getResult());
                        currentTask = "基于之前的讨论：" + result.getResult() + "\n继续处理：" + task;
                    } else {
                        errors.add(agent.getId() + ": " + result.getErrorMessage());
                    }
                }
            } catch (Exception e) {
                log.error("Agent execution failed: agentId={}", agent.getId(), e);
                errors.add(agent.getId() + ": " + e.getMessage());
            }
        }
        
        return buildResult(agentResults, errors);
    }
    
    /**
     * 并行执行
     */
    private CollaborationOrchestrator.CollaborationResult executeParallel(
            List<Agent> agents,
            String task,
            Map<String, Object> agentResults,
            List<String> errors) {
        
        // 创建所有 Agent 的 Mono
        List<Mono<AgentExecutionResult>> monos = agents.stream()
            .map(agent -> {
                if (agent instanceof AgentScopeAgentWrapper) {
                    ReActAgent reactAgent = ((AgentScopeAgentWrapper) agent).getReactAgent();
                    Msg userMsg = Msg.builder()
                        .role(MsgRole.USER)
                        .textContent(task)
                        .build();
                    
                    return reactAgent.call(Arrays.asList(userMsg))
                        .map(response -> new AgentExecutionResult(
                            agent.getId(),
                            response != null ? response.getTextContent() : null,
                            null
                        ))
                        .onErrorResume(error -> Mono.just(new AgentExecutionResult(
                            agent.getId(),
                            null,
                            error.getMessage()
                        )));
                } else {
                    return Mono.fromCallable(() -> {
                        try {
                            Agent.AgentResult result = agent.execute(task, new HashMap<>());
                            return new AgentExecutionResult(
                                agent.getId(),
                                result.isSuccess() ? result.getResult() : null,
                                result.isSuccess() ? null : result.getErrorMessage()
                            );
                        } catch (Exception e) {
                            return new AgentExecutionResult(agent.getId(), null, e.getMessage());
                        }
                    });
                }
            })
            .collect(Collectors.toList());
        
        // 等待所有 Mono 完成
        Mono<List<AgentExecutionResult>> allResults = Flux.fromIterable(monos)
            .flatMap(mono -> mono)
            .collectList();
        
        List<AgentExecutionResult> results = allResults.block();
        
        // 收集结果
        if (results != null) {
            for (AgentExecutionResult executionResult : results) {
                if (executionResult.error == null) {
                    agentResults.put(executionResult.agentId, executionResult.result);
                } else {
                    errors.add(executionResult.agentId + ": " + executionResult.error);
                }
            }
        }
        
        return buildResult(agentResults, errors);
    }
    
    /**
     * 构建结果
     */
    private CollaborationOrchestrator.CollaborationResult buildResult(
            Map<String, Object> agentResults,
            List<String> errors) {
        
        CollaborationOrchestrator.CollaborationResult result = 
            new CollaborationOrchestrator.CollaborationResult();
        result.setSuccess(errors.isEmpty());
        result.setAgentResults(agentResults);
        result.setErrors(errors);
        
        if (!agentResults.isEmpty()) {
            String integratedResult = agentResults.values().stream()
                .map(Object::toString)
                .collect(Collectors.joining("\n\n"));
            result.setResult(integratedResult);
        } else {
            result.setResult("No results");
        }
        
        return result;
    }
    
    /**
     * Agent 执行结果
     */
    private static class AgentExecutionResult {
        String agentId;
        String result;
        String error;
        
        AgentExecutionResult(String agentId, String result, String error) {
            this.agentId = agentId;
            this.result = result;
            this.error = error;
        }
    }
}
