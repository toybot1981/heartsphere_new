package com.heartsphere.multiagent.orchestrator;

import com.heartsphere.multiagent.core.Agent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.LongAdder;
import java.util.stream.Collectors;

/**
 * 负载均衡器
 * 
 * <p>基于智能体能力和当前负载进行任务分配，实现负载均衡。</p>
 * 
 * <p>负载均衡策略：
 * <ul>
 *   <li>能力匹配：优先选择具备所需能力的智能体</li>
 *   <li>负载评估：考虑智能体的当前任务数和平均执行时间</li>
 *   <li>权重计算：综合能力和负载计算分配权重</li>
 *   <li>优先级队列：支持优先级任务和抢占机制</li>
 * </ul>
 * </p>
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
public class LoadBalancer {
    
    /**
     * 智能体负载指标
     */
    public static class AgentLoadMetrics {
        private final AtomicInteger currentTaskCount = new AtomicInteger(0);
        private final LongAdder totalExecutionTime = new LongAdder();
        private final AtomicInteger completedTaskCount = new AtomicInteger(0);
        private volatile long lastUpdateTime = System.currentTimeMillis();
        
        /**
         * 增加当前任务数
         */
        public void incrementTaskCount() {
            currentTaskCount.incrementAndGet();
            lastUpdateTime = System.currentTimeMillis();
        }
        
        /**
         * 减少当前任务数
         */
        public void decrementTaskCount() {
            currentTaskCount.decrementAndGet();
            lastUpdateTime = System.currentTimeMillis();
        }
        
        /**
         * 记录任务执行时间
         */
        public void recordExecutionTime(long executionTimeMs) {
            totalExecutionTime.add(executionTimeMs);
            completedTaskCount.incrementAndGet();
            lastUpdateTime = System.currentTimeMillis();
        }
        
        /**
         * 获取当前任务数
         */
        public int getCurrentTaskCount() {
            return currentTaskCount.get();
        }
        
        /**
         * 获取平均执行时间（毫秒）
         */
        public double getAverageExecutionTime() {
            int completed = completedTaskCount.get();
            if (completed == 0) {
                return 0.0;
            }
            return totalExecutionTime.sum() / (double) completed;
        }
        
        /**
         * 获取负载分数（0-1，1表示负载最重）
         */
        public double getLoadScore() {
            int currentTasks = currentTaskCount.get();
            double avgTime = getAverageExecutionTime();
            
            // 负载分数 = 当前任务数权重 * 0.6 + 平均执行时间权重 * 0.4
            // 假设最大并发任务数为10，最大平均执行时间为10000ms
            double taskLoad = Math.min(currentTasks / 10.0, 1.0);
            double timeLoad = Math.min(avgTime / 10000.0, 1.0);
            
            return taskLoad * 0.6 + timeLoad * 0.4;
        }
        
        /**
         * 获取最后更新时间
         */
        public long getLastUpdateTime() {
            return lastUpdateTime;
        }
    }
    
    /**
     * 智能体负载指标映射
     */
    private final Map<String, AgentLoadMetrics> agentMetrics = new ConcurrentHashMap<>();
    
    /**
     * 选择智能体
     * 
     * @param candidates 候选智能体列表
     * @param requiredCapabilities 所需能力集合
     * @return 选中的智能体列表（按负载从低到高排序）
     */
    public List<Agent> selectAgents(List<Agent> candidates, Set<String> requiredCapabilities) {
        if (candidates == null || candidates.isEmpty()) {
            return Collections.emptyList();
        }
        
        // 1. 过滤具备所需能力的智能体
        List<Agent> capableAgents = candidates.stream()
            .filter(agent -> hasRequiredCapabilities(agent, requiredCapabilities))
            .collect(Collectors.toList());
        
        if (capableAgents.isEmpty()) {
            log.warn("没有找到具备所需能力的智能体: {}", requiredCapabilities);
            return Collections.emptyList();
        }
        
        // 2. 计算每个智能体的权重
        List<AgentWithWeight> agentsWithWeight = capableAgents.stream()
            .map(agent -> {
                double weight = calculateWeight(agent, requiredCapabilities);
                return new AgentWithWeight(agent, weight);
            })
            .collect(Collectors.toList());
        
        // 3. 按权重排序（权重越大，负载越小，优先级越高）
        agentsWithWeight.sort(Comparator.comparing(AgentWithWeight::getWeight).reversed());
        
        log.info("智能体选择结果: {}", agentsWithWeight.stream()
            .map(a -> String.format("%s(%.2f)", a.agent.getId(), a.weight))
            .collect(Collectors.joining(", ")));
        
        return agentsWithWeight.stream()
            .map(AgentWithWeight::getAgent)
            .collect(Collectors.toList());
    }
    
    /**
     * 检查智能体是否具备所需能力
     */
    private boolean hasRequiredCapabilities(Agent agent, Set<String> requiredCapabilities) {
        if (requiredCapabilities == null || requiredCapabilities.isEmpty()) {
            return true;
        }
        
        Set<String> agentCapabilities = agent.getCapabilities();
        return agentCapabilities.containsAll(requiredCapabilities);
    }
    
    /**
     * 计算智能体权重
     * 
     * <p>权重 = 能力匹配度 * 0.4 + (1 - 负载分数) * 0.6</p>
     * 
     * @param agent 智能体
     * @param requiredCapabilities 所需能力
     * @return 权重值，越大表示优先级越高
     */
    private double calculateWeight(Agent agent, Set<String> requiredCapabilities) {
        // 能力匹配度：具备的能力数 / 所需能力数
        double capabilityMatch = 1.0;
        if (requiredCapabilities != null && !requiredCapabilities.isEmpty()) {
            Set<String> agentCapabilities = agent.getCapabilities();
            long matchedCount = requiredCapabilities.stream()
                .filter(agentCapabilities::contains)
                .count();
            capabilityMatch = matchedCount / (double) requiredCapabilities.size();
        }
        
        // 负载分数（0-1，1表示负载最重）
        AgentLoadMetrics metrics = getOrCreateMetrics(agent.getId());
        double loadScore = metrics.getLoadScore();
        
        // 权重 = 能力匹配度 * 0.4 + (1 - 负载分数) * 0.6
        return capabilityMatch * 0.4 + (1.0 - loadScore) * 0.6;
    }
    
    /**
     * 获取或创建智能体负载指标
     */
    private AgentLoadMetrics getOrCreateMetrics(String agentId) {
        return agentMetrics.computeIfAbsent(agentId, k -> new AgentLoadMetrics());
    }
    
    /**
     * 记录任务开始
     */
    public void recordTaskStart(String agentId) {
        AgentLoadMetrics metrics = getOrCreateMetrics(agentId);
        metrics.incrementTaskCount();
        log.info("智能体 {} 开始新任务，当前任务数: {}", agentId, metrics.getCurrentTaskCount());
    }
    
    /**
     * 记录任务完成
     */
    public void recordTaskComplete(String agentId, long executionTimeMs) {
        AgentLoadMetrics metrics = getOrCreateMetrics(agentId);
        metrics.decrementTaskCount();
        metrics.recordExecutionTime(executionTimeMs);
        log.info("智能体 {} 完成任务，执行时间: {}ms，当前任务数: {}", 
            agentId, executionTimeMs, metrics.getCurrentTaskCount());
    }
    
    /**
     * 获取智能体负载指标
     */
    public AgentLoadMetrics getMetrics(String agentId) {
        return agentMetrics.get(agentId);
    }
    
    /**
     * 获取所有智能体的负载统计
     */
    public Map<String, Map<String, Object>> getAllMetrics() {
        Map<String, Map<String, Object>> stats = new HashMap<>();
        agentMetrics.forEach((agentId, metrics) -> {
            Map<String, Object> stat = new HashMap<>();
            stat.put("currentTaskCount", metrics.getCurrentTaskCount());
            stat.put("averageExecutionTime", metrics.getAverageExecutionTime());
            stat.put("loadScore", metrics.getLoadScore());
            stat.put("lastUpdateTime", metrics.getLastUpdateTime());
            stats.put(agentId, stat);
        });
        return stats;
    }
    
    /**
     * 智能体和权重
     */
    private static class AgentWithWeight {
        private final Agent agent;
        private final double weight;
        
        AgentWithWeight(Agent agent, double weight) {
            this.agent = agent;
            this.weight = weight;
        }
        
        Agent getAgent() {
            return agent;
        }
        
        double getWeight() {
            return weight;
        }
    }
}
