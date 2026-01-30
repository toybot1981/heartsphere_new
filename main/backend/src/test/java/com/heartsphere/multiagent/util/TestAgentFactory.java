package com.heartsphere.multiagent.util;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.BaseAgent;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 测试智能体工厂
 * 
 * <p>用于创建测试用的智能体，简化测试代码编写</p>
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class TestAgentFactory {
    
    private static final AtomicInteger counter = new AtomicInteger(0);
    
    /**
     * 创建简单的测试智能体
     */
    public static Agent createSimpleAgent(String id, Set<String> capabilities) {
        BaseAgent agent = new BaseAgent(id, "Test Agent " + id, "Test agent for testing") {
            @Override
            protected AgentResult doExecute(String task, Map<String, Object> context) {
                return AgentResult.success("Result from " + id + " for: " + task);
            }
        };
        agent.addCapabilities(capabilities);
        return agent;
    }
    
    /**
     * 创建带延迟的测试智能体
     */
    public static Agent createDelayedAgent(String id, Set<String> capabilities, long delayMs) {
        BaseAgent agent = new BaseAgent(id, "Delayed Agent " + id, "Test agent with delay") {
            @Override
            protected AgentResult doExecute(String task, Map<String, Object> context) {
                try {
                    Thread.sleep(delayMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                return AgentResult.success("Delayed result from " + id);
            }
        };
        agent.addCapabilities(capabilities);
        return agent;
    }
    
    /**
     * 创建会失败的测试智能体
     */
    public static Agent createFailingAgent(String id, Set<String> capabilities, String errorMessage) {
        BaseAgent agent = new BaseAgent(id, "Failing Agent " + id, "Test agent that fails") {
            @Override
            protected AgentResult doExecute(String task, Map<String, Object> context) {
                return AgentResult.failure(errorMessage);
            }
        };
        agent.addCapabilities(capabilities);
        return agent;
    }
    
    /**
     * 创建使用上下文的测试智能体
     */
    public static Agent createContextAwareAgent(String id, Set<String> capabilities, 
                                                String expectedContextKey) {
        BaseAgent agent = new BaseAgent(id, "Context Aware Agent " + id, "Test agent that uses context") {
            @Override
            protected AgentResult doExecute(String task, Map<String, Object> context) {
                if (context.containsKey(expectedContextKey)) {
                    return AgentResult.success("Received context: " + context.get(expectedContextKey));
                } else {
                    return AgentResult.success("No context received");
                }
            }
        };
        agent.addCapabilities(capabilities);
        return agent;
    }
    
    /**
     * 批量创建测试智能体
     */
    public static List<Agent> createAgents(int count, String capabilityPrefix) {
        List<Agent> agents = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            String id = "agent-" + counter.incrementAndGet();
            Set<String> capabilities = Set.of(capabilityPrefix + "-" + (i % 3));
            agents.add(createSimpleAgent(id, capabilities));
        }
        return agents;
    }
    
    /**
     * 创建生活助手测试智能体
     */
    public static Agent createLifeAssistantAgent(String name, String capability) {
        String id = "life-assistant-" + name.toLowerCase();
        BaseAgent agent = new BaseAgent(id, name, "Life assistant for " + capability) {
            @Override
            protected AgentResult doExecute(String task, Map<String, Object> context) {
                return AgentResult.success(name + " 处理了任务: " + task);
            }
        };
        agent.addCapability(capability);
        return agent;
    }
}
