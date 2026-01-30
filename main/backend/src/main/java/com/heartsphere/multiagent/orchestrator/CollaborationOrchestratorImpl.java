package com.heartsphere.multiagent.orchestrator;

import com.heartsphere.multiagent.core.Agent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import org.springframework.lang.Nullable;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 协作编排引擎实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
public class CollaborationOrchestratorImpl implements CollaborationOrchestrator {
    
    private final Map<String, CollaborationTask> tasks = new ConcurrentHashMap<>();
    
    @Autowired(required = false)
    @Nullable
    private CollaborationLoggingService loggingService; // 可能为 null（如果 admin 模块不可用）
    
    @Autowired(required = false)
    @Nullable
    private TaskDecompositionService taskDecompositionService;
    
    @Autowired(required = false)
    @Nullable
    private LoadBalancer loadBalancer;
    
    @Autowired(required = false)
    @Nullable
    private ResultQualityAssessor qualityAssessor;
    
    @Override
    public String createCollaboration(String taskDescription, List<Agent> agents, 
                                      CollaborationContext context) {
        if (taskDescription == null || agents == null || agents.isEmpty()) {
            throw new IllegalArgumentException("Task description and agents cannot be null or empty");
        }
        
        String collaborationId = generateCollaborationId();
        CollaborationTask task = new CollaborationTask(
            collaborationId, taskDescription, agents, context
        );
        tasks.put(collaborationId, task);
        
        log.info("Collaboration created: id={}, agents={}, mode={}", 
            collaborationId, agents.size(), context.getMode());
        
        // 记录日志（异步）
        if (loggingService != null) {
            List<String> agentIds = agents.stream().map(Agent::getId).collect(Collectors.toList());
            loggingService.logCollaborationCreated(
                collaborationId,
                context.getUserId(),
                context.getSessionId(),
                taskDescription,
                agentIds,
                context.getMode().name()
            );
        }
        
        return collaborationId;
    }
    
    @Override
    public CompletableFuture<CollaborationResult> execute(String collaborationId) {
        CollaborationTask task = tasks.get(collaborationId);
        if (task == null) {
            CompletableFuture<CollaborationResult> future = new CompletableFuture<>();
            future.completeExceptionally(new IllegalArgumentException(
                "Collaboration not found: " + collaborationId));
            return future;
        }
        
        task.setStatus(CollaborationStatus.RUNNING);
        task.setStartedAt(new java.util.Date());
        
        // 记录开始日志
        if (loggingService != null) {
            loggingService.logCollaborationStarted(collaborationId);
        }
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("Executing collaboration: id={}", collaborationId);
                
                CollaborationResult result = executeCollaboration(task);
                
                task.setStatus(CollaborationStatus.COMPLETED);
                
                // 记录完成日志
                if (loggingService != null) {
                    long startTime = task.getStartedAt() != null ? 
                        task.getStartedAt().getTime() : 
                        System.currentTimeMillis();
                    long executionTime = System.currentTimeMillis() - startTime;
                    loggingService.logCollaborationCompleted(
                        collaborationId,
                        result.isSuccess(),
                        result.getResult(),
                        result.getAgentResults(),
                        result.getErrors(),
                        executionTime
                    );
                }
                
                return result;
            } catch (Exception e) {
                log.error("Collaboration execution failed: id={}, error={}", 
                    collaborationId, e.getMessage(), e);
                task.setStatus(CollaborationStatus.FAILED);
                
                CollaborationResult result = new CollaborationResult();
                result.setCollaborationId(collaborationId);
                result.setSuccess(false);
                result.setErrors(Collections.singletonList(e.getMessage()));
                
                // 记录失败日志
                if (loggingService != null) {
                    long startTime = task.getStartedAt() != null ? 
                        task.getStartedAt().getTime() : 
                        System.currentTimeMillis();
                    long executionTime = System.currentTimeMillis() - startTime;
                    loggingService.logCollaborationCompleted(
                        collaborationId,
                        false,
                        null,
                        Collections.emptyMap(),
                        result.getErrors(),
                        executionTime
                    );
                }
                
                return result;
            }
        });
    }
    
    /**
     * 执行协作任务
     * 
     * <p>根据协作模式执行任务，支持动态调整策略。</p>
     */
    private CollaborationResult executeCollaboration(CollaborationTask task) {
        CollaborationContext context = task.getContext();
        List<Agent> agents = task.getAgents();
        
        Map<String, Object> agentResults = new HashMap<>();
        List<String> errors = new ArrayList<>();
        
        // 根据智能体数量和任务特性动态选择模式
        WorkflowMode mode = determineOptimalMode(context, agents);
        if (mode != context.getMode()) {
            log.info("动态调整协作模式: {} -> {}", context.getMode(), mode);
            context.setMode(mode);
        }
        
        switch (mode) {
            case SEQUENTIAL:
                return executeSequential(task, agentResults, errors);
            case PARALLEL:
                return executeParallel(task, agentResults, errors);
            case CONDITIONAL:
                return executeConditional(task, agentResults, errors);
            default:
                return executeSequential(task, agentResults, errors);
        }
    }
    
    /**
     * 确定最优协作模式
     * 
     * <p>根据智能体数量、任务特性等因素动态选择最优的协作模式。</p>
     */
    private WorkflowMode determineOptimalMode(CollaborationContext context, List<Agent> agents) {
        // 如果只有一个智能体，使用顺序模式
        if (agents.size() <= 1) {
            return WorkflowMode.SEQUENTIAL;
        }
        
        // 如果任务描述包含依赖关键词，使用顺序模式
        String taskDescription = context.getParameters() != null && 
            context.getParameters().containsKey("taskDescription") ?
            (String) context.getParameters().get("taskDescription") : "";
        
        if (taskDescription.contains("然后") || taskDescription.contains("接着") || 
            taskDescription.contains("之后") || taskDescription.contains("after")) {
            return WorkflowMode.SEQUENTIAL;
        }
        
        // 如果任务描述包含条件关键词，使用条件模式
        if (taskDescription.contains("如果") || taskDescription.contains("如果") || 
            taskDescription.contains("根据") || taskDescription.contains("if")) {
            return WorkflowMode.CONDITIONAL;
        }
        
        // 默认使用并行模式以提高效率
        return WorkflowMode.PARALLEL;
    }
    
    /**
     * 顺序执行
     */
    private CollaborationResult executeSequential(CollaborationTask task, 
                                                   Map<String, Object> agentResults,
                                                   List<String> errors) {
        String subTask = task.getTaskDescription();
        Map<String, Object> context = new HashMap<>();
        
        for (Agent agent : task.getAgents()) {
            try {
                log.info("Agent {} executing task: {}", agent.getId(), subTask);
                Agent.AgentResult result = agent.execute(subTask, context);
                
                if (result.isSuccess()) {
                    agentResults.put(agent.getId(), result.getResult());
                    // 将结果添加到上下文，供下一个智能体使用
                    context.put(agent.getId() + "_result", result.getResult());
                } else {
                    errors.add(agent.getId() + ": " + result.getErrorMessage());
                }
            } catch (Exception e) {
                log.error("Agent {} execution failed: {}", agent.getId(), e.getMessage(), e);
                errors.add(agent.getId() + ": " + e.getMessage());
            }
        }
        
        return buildResult(task.getCollaborationId(), agentResults, errors);
    }
    
    /**
     * 并行执行
     */
    private CollaborationResult executeParallel(CollaborationTask task,
                                                 Map<String, Object> agentResults,
                                                 List<String> errors) {
        List<CompletableFuture<AgentExecutionResult>> futures = task.getAgents().stream()
            .map(agent -> CompletableFuture.supplyAsync(() -> {
                try {
                    log.info("Agent {} executing task in parallel: {}", 
                        agent.getId(), task.getTaskDescription());
                    Agent.AgentResult result = agent.execute(
                        task.getTaskDescription(), 
                        task.getContext().getParameters() != null ? 
                            task.getContext().getParameters() : new HashMap<>()
                    );
                    return new AgentExecutionResult(agent.getId(), result);
                } catch (Exception e) {
                    log.error("Agent {} execution failed: {}", agent.getId(), e.getMessage(), e);
                    return new AgentExecutionResult(agent.getId(), 
                        Agent.AgentResult.failure(e.getMessage()));
                }
            }))
            .collect(Collectors.toList());
        
        // 等待所有任务完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        
        // 收集结果
        for (CompletableFuture<AgentExecutionResult> future : futures) {
            AgentExecutionResult executionResult = future.join();
            if (executionResult.result.isSuccess()) {
                agentResults.put(executionResult.agentId, executionResult.result.getResult());
            } else {
                errors.add(executionResult.agentId + ": " + 
                    executionResult.result.getErrorMessage());
            }
        }
        
        return buildResult(task.getCollaborationId(), agentResults, errors);
    }
    
    /**
     * 条件分支执行（简化实现）
     */
    private CollaborationResult executeConditional(CollaborationTask task,
                                                    Map<String, Object> agentResults,
                                                    List<String> errors) {
        // 简化实现：按顺序执行，但可以根据条件跳过某些智能体
        // 完整实现需要更复杂的条件判断逻辑
        return executeSequential(task, agentResults, errors);
    }
    
    /**
     * 构建结果（优化版本）
     * 
     * <p>使用优化的结果聚合算法，考虑结果质量、优先级等因素。</p>
     */
    private CollaborationResult buildResult(String collaborationId,
                                            Map<String, Object> agentResults,
                                            List<String> errors) {
        CollaborationResult result = new CollaborationResult();
        result.setCollaborationId(collaborationId);
        result.setSuccess(errors.isEmpty() && !agentResults.isEmpty());
        result.setAgentResults(agentResults);
        result.setErrors(errors);
        
        // 优化的结果聚合
        if (!agentResults.isEmpty()) {
            String integratedResult = aggregateResults(agentResults);
            result.setResult(integratedResult);
        } else {
            result.setResult("协作完成，但未产生结果。");
        }
        
        return result;
    }
    
    /**
     * 聚合结果（优化算法）
     * 
     * <p>考虑以下因素：
     * <ul>
     *   <li>结果长度和质量</li>
     *   <li>结果相关性</li>
     *   <li>结果去重</li>
     *   <li>结果排序（按重要性）</li>
     * </ul>
     * </p>
     */
    private String aggregateResults(Map<String, Object> agentResults) {
        // 1. 过滤空结果
        List<Map.Entry<String, Object>> validResults = agentResults.entrySet().stream()
            .filter(entry -> entry.getValue() != null && 
                    !entry.getValue().toString().trim().isEmpty())
            .collect(Collectors.toList());
        
        if (validResults.isEmpty()) {
            return "所有智能体都未产生有效结果。";
        }
        
        // 2. 按结果长度和质量排序（简单启发式：较长的结果可能包含更多信息）
        validResults.sort((a, b) -> {
            int lengthA = a.getValue().toString().length();
            int lengthB = b.getValue().toString().length();
            return Integer.compare(lengthB, lengthA);  // 降序
        });
        
        // 3. 聚合结果，添加智能体标识
        StringBuilder aggregated = new StringBuilder();
        Set<String> seenResults = new HashSet<>();  // 去重
        
        for (Map.Entry<String, Object> entry : validResults) {
            String agentId = entry.getKey();
            String resultText = entry.getValue().toString().trim();
            
            // 简单去重：如果结果完全相同，跳过
            if (seenResults.contains(resultText)) {
                continue;
            }
            seenResults.add(resultText);
            
            // 添加智能体标识和结果
            aggregated.append(String.format("[%s]\n%s\n\n", agentId, resultText));
        }
        
        // 4. 添加总结
        if (validResults.size() > 1) {
            aggregated.append(String.format("---\n协作完成，共 %d 个智能体参与。\n", validResults.size()));
        }
        
        return aggregated.toString().trim();
    }
    
    @Override
    public CollaborationStatus getStatus(String collaborationId) {
        CollaborationTask task = tasks.get(collaborationId);
        return task != null ? task.getStatus() : null;
    }
    
    @Override
    public void cancel(String collaborationId) {
        CollaborationTask task = tasks.get(collaborationId);
        if (task != null) {
            task.setStatus(CollaborationStatus.CANCELLED);
            log.info("Collaboration cancelled: id={}", collaborationId);
        }
    }
    
    /**
     * 生成协作 ID
     */
    private String generateCollaborationId() {
        return "collab-" + System.currentTimeMillis() + "-" + 
               Long.toHexString(Double.doubleToLongBits(Math.random()));
    }
    
    /**
     * 协作任务内部类
     */
    private static class CollaborationTask {
        private String collaborationId;
        private String taskDescription;
        private List<Agent> agents;
        private CollaborationContext context;
        private CollaborationStatus status;
        private java.util.Date createdAt;
        private java.util.Date startedAt;
        
        public CollaborationTask(String collaborationId, String taskDescription,
                                List<Agent> agents, CollaborationContext context) {
            this.collaborationId = collaborationId;
            this.taskDescription = taskDescription;
            this.agents = agents;
            this.context = context;
            this.status = CollaborationStatus.PENDING;
            this.createdAt = new java.util.Date();
        }
        
        // Getters and Setters
        public String getCollaborationId() {
            return collaborationId;
        }
        
        public String getTaskDescription() {
            return taskDescription;
        }
        
        public List<Agent> getAgents() {
            return agents;
        }
        
        public CollaborationContext getContext() {
            return context;
        }
        
        public CollaborationStatus getStatus() {
            return status;
        }
        
        public void setStatus(CollaborationStatus status) {
            this.status = status;
        }
        
        public java.util.Date getStartedAt() {
            return startedAt;
        }
        
        public void setStartedAt(java.util.Date startedAt) {
            this.startedAt = startedAt;
        }
    }
    
    /**
     * Agent 执行结果
     */
    private static class AgentExecutionResult {
        String agentId;
        Agent.AgentResult result;
        
        AgentExecutionResult(String agentId, Agent.AgentResult result) {
            this.agentId = agentId;
            this.result = result;
        }
    }
}
