package com.heartsphere.multiagent.orchestrator;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 智能任务分解服务
 * 
 * <p>提供任务分解功能，将复杂任务分解为多个子任务。采用规则引擎 + LLM 混合方案：
 * <ul>
 *   <li>规则引擎：快速处理常见任务模式，延迟低</li>
 *   <li>LLM：处理复杂任务，进行深度分析</li>
 * </ul>
 * </p>
 * 
 * <p>任务分解策略：
 * <ol>
 *   <li>首先尝试规则引擎进行快速分解</li>
 *   <li>如果规则引擎无法处理，使用 LLM 进行深度分析</li>
 *   <li>缓存常见任务的分解结果</li>
 * </ol>
 * </p>
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
public class TaskDecompositionService {
    
    /**
     * 任务分解结果
     */
    public static class DecompositionResult {
        private List<SubTask> subTasks;
        private Map<String, Set<String>> dependencies;  // 子任务ID -> 依赖的子任务ID集合
        private boolean fromCache;
        
        public DecompositionResult(List<SubTask> subTasks, Map<String, Set<String>> dependencies) {
            this.subTasks = subTasks;
            this.dependencies = dependencies != null ? dependencies : new HashMap<>();
            this.fromCache = false;
        }
        
        public List<SubTask> getSubTasks() {
            return subTasks;
        }
        
        public Map<String, Set<String>> getDependencies() {
            return dependencies;
        }
        
        public boolean isFromCache() {
            return fromCache;
        }
        
        public void setFromCache(boolean fromCache) {
            this.fromCache = fromCache;
        }
    }
    
    /**
     * 子任务
     */
    public static class SubTask {
        private String taskId;
        private String description;
        private Set<String> requiredCapabilities;
        private int priority;  // 优先级，数字越大优先级越高
        
        public SubTask(String taskId, String description, Set<String> requiredCapabilities) {
            this.taskId = taskId;
            this.description = description;
            this.requiredCapabilities = requiredCapabilities != null ? 
                requiredCapabilities : new HashSet<>();
            this.priority = 0;
        }
        
        // Getters and Setters
        public String getTaskId() {
            return taskId;
        }
        
        public void setTaskId(String taskId) {
            this.taskId = taskId;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public Set<String> getRequiredCapabilities() {
            return requiredCapabilities;
        }
        
        public void setRequiredCapabilities(Set<String> requiredCapabilities) {
            this.requiredCapabilities = requiredCapabilities;
        }
        
        public int getPriority() {
            return priority;
        }
        
        public void setPriority(int priority) {
            this.priority = priority;
        }
    }
    
    /**
     * 任务分解缓存
     */
    private final Map<String, DecompositionResult> decompositionCache = new HashMap<>();
    
    /**
     * 常见任务模式（规则引擎）
     */
    private static final Map<Pattern, TaskPattern> TASK_PATTERNS = new HashMap<>();
    
    static {
        // 初始化常见任务模式
        TASK_PATTERNS.put(
            Pattern.compile(".*(提高|提升|改善|优化).*(效率|工作|学习).*"),
            new TaskPattern("效率提升", Arrays.asList("time-management", "learning"))
        );
        TASK_PATTERNS.put(
            Pattern.compile(".*(健康|运动|饮食|睡眠).*"),
            new TaskPattern("健康管理", Arrays.asList("health", "nutrition"))
        );
        TASK_PATTERNS.put(
            Pattern.compile(".*(情绪|心情|压力|焦虑).*"),
            new TaskPattern("情绪管理", Arrays.asList("emotion", "mental-health"))
        );
    }
    
    /**
     * 任务模式
     */
    private static class TaskPattern {
        String category;
        List<String> capabilities;
        
        TaskPattern(String category, List<String> capabilities) {
            this.category = category;
            this.capabilities = capabilities;
        }
    }
    
    /**
     * 分解任务
     * 
     * @param task 任务描述
     * @return 分解结果，包含子任务列表和依赖关系
     */
    public DecompositionResult decompose(String task) {
        if (task == null || task.trim().isEmpty()) {
            log.warn("任务描述为空，返回空分解结果");
            return new DecompositionResult(Collections.emptyList(), new HashMap<>());
        }
        
        // 1. 检查缓存
        String cacheKey = generateCacheKey(task);
        DecompositionResult cached = decompositionCache.get(cacheKey);
        if (cached != null) {
            log.info("从缓存获取任务分解结果: {}", cacheKey);
            cached.setFromCache(true);
            return cached;
        }
        
        // 2. 尝试规则引擎分解
        DecompositionResult result = tryRuleBasedDecomposition(task);
        
        // 3. 如果规则引擎无法处理，使用 LLM（这里简化实现，实际应该调用 LLM）
        if (result.getSubTasks().isEmpty()) {
            log.info("规则引擎无法处理，使用 LLM 分解: {}", task);
            result = tryLLMDecomposition(task);
        }
        
        // 4. 缓存结果
        if (!result.getSubTasks().isEmpty()) {
            decompositionCache.put(cacheKey, result);
        }
        
        return result;
    }
    
    /**
     * 规则引擎分解
     */
    private DecompositionResult tryRuleBasedDecomposition(String task) {
        for (Map.Entry<Pattern, TaskPattern> entry : TASK_PATTERNS.entrySet()) {
            if (entry.getKey().matcher(task).matches()) {
                TaskPattern pattern = entry.getValue();
                log.info("匹配到任务模式: {}", pattern.category);
                
                // 根据模式创建子任务
                List<SubTask> subTasks = pattern.capabilities.stream()
                    .map(capability -> {
                        String taskId = "subtask-" + UUID.randomUUID().toString().substring(0, 8);
                        String description = String.format("处理%s相关任务", pattern.category);
                        return new SubTask(taskId, description, Set.of(capability));
                    })
                    .collect(Collectors.toList());
                
                // 简单依赖：按顺序执行
                Map<String, Set<String>> dependencies = new HashMap<>();
                for (int i = 1; i < subTasks.size(); i++) {
                    String currentId = subTasks.get(i).getTaskId();
                    String previousId = subTasks.get(i - 1).getTaskId();
                    dependencies.put(currentId, Set.of(previousId));
                }
                
                return new DecompositionResult(subTasks, dependencies);
            }
        }
        
        return new DecompositionResult(Collections.emptyList(), new HashMap<>());
    }
    
    /**
     * LLM 分解（简化实现）
     * 
     * <p>实际实现中应该调用 LLM API 进行智能分解</p>
     */
    private DecompositionResult tryLLMDecomposition(String task) {
        // TODO: 实现 LLM 调用
        // 这里简化实现，将任务按关键词分解
        log.warn("LLM 分解未实现，使用简化分解");
        
        // 简化实现：按常见连接词分解
        String[] keywords = task.split("(和|与|同时|并且|以及)");
        List<SubTask> subTasks = new ArrayList<>();
        
        for (int i = 0; i < keywords.length; i++) {
            String keyword = keywords[i].trim();
            if (!keyword.isEmpty()) {
                String taskId = "subtask-" + UUID.randomUUID().toString().substring(0, 8);
                SubTask subTask = new SubTask(taskId, keyword, new HashSet<>());
                subTask.setPriority(keywords.length - i);  // 后面的任务优先级更高
                subTasks.add(subTask);
            }
        }
        
        // 简单依赖：按顺序执行
        Map<String, Set<String>> dependencies = new HashMap<>();
        for (int i = 1; i < subTasks.size(); i++) {
            String currentId = subTasks.get(i).getTaskId();
            String previousId = subTasks.get(i - 1).getTaskId();
            dependencies.put(currentId, Set.of(previousId));
        }
        
        return new DecompositionResult(subTasks, dependencies);
    }
    
    /**
     * 生成缓存键
     */
    private String generateCacheKey(String task) {
        // 简单实现：使用任务描述的规范化版本作为键
        return task.toLowerCase().trim();
    }
    
    /**
     * 清除缓存
     */
    public void clearCache() {
        decompositionCache.clear();
        log.info("任务分解缓存已清除");
    }
    
    /**
     * 获取缓存统计信息
     */
    public Map<String, Object> getCacheStats() {
        return Map.of(
            "size", decompositionCache.size(),
            "keys", decompositionCache.keySet()
        );
    }
}
