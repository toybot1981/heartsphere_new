package com.heartsphere.multiagent.core;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * 智能体基类
 * 
 * 提供智能体的通用功能实现，具体智能体可以继承此类
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Getter
@Setter
public abstract class BaseAgent implements Agent {
    
    protected String id;
    protected String name;
    protected String description;
    protected Set<String> capabilities;
    protected AgentStatus status;
    
    public BaseAgent(String id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.capabilities = new HashSet<>();
        this.status = AgentStatus.IDLE;
    }
    
    /**
     * 添加能力
     * 
     * @param capability 能力描述
     */
    public void addCapability(String capability) {
        this.capabilities.add(capability);
    }
    
    /**
     * 添加多个能力
     * 
     * @param capabilities 能力集合
     */
    public void addCapabilities(Set<String> capabilities) {
        this.capabilities.addAll(capabilities);
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public String getName() {
        return name;
    }
    
    @Override
    public String getDescription() {
        return description;
    }
    
    @Override
    public Set<String> getCapabilities() {
        return new HashSet<>(capabilities);
    }
    
    @Override
    public AgentStatus getStatus() {
        return status;
    }
    
    @Override
    public AgentResult execute(String task, Map<String, Object> context) {
        if (status == AgentStatus.BUSY) {
            return AgentResult.failure("Agent is busy");
        }
        
        try {
            status = AgentStatus.BUSY;
            log.info("Agent {} executing task: {}", id, task);
            
            AgentResult result = doExecute(task, context != null ? context : new HashMap<>());
            
            status = AgentStatus.IDLE;
            return result;
        } catch (Exception e) {
            status = AgentStatus.ERROR;
            log.error("Agent {} execution failed: {}", id, e.getMessage(), e);
            return AgentResult.failure("Execution failed: " + e.getMessage());
        } finally {
            if (status == AgentStatus.ERROR) {
                // 错误状态需要手动恢复
            }
        }
    }
    
    /**
     * 执行任务的具体实现，由子类实现
     * 
     * @param task 任务描述
     * @param context 执行上下文
     * @return 执行结果
     */
    protected abstract AgentResult doExecute(String task, Map<String, Object> context);
    
    @Override
    public boolean canHandle(String task) {
        // 默认实现：检查任务描述中是否包含能力关键词
        String taskLower = task.toLowerCase();
        return capabilities.stream()
            .anyMatch(capability -> taskLower.contains(capability.toLowerCase()));
    }
    
    /**
     * 恢复智能体状态（从错误状态恢复）
     */
    public void recover() {
        if (status == AgentStatus.ERROR) {
            status = AgentStatus.IDLE;
            log.info("Agent {} recovered from error state", id);
        }
    }
}
