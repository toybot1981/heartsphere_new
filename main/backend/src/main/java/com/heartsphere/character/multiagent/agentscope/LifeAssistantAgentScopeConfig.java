package com.heartsphere.character.multiagent.agentscope;

import com.heartsphere.character.multiagent.agent.*;
import com.heartsphere.multiagent.agentscope.AgentScopeAdapter;
import com.heartsphere.multiagent.agentscope.AgentScopeAgentWrapper;
import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.multiagent.core.AgentRegistry;
import com.heartsphere.skill.service.SkillExecutor;
import io.agentscope.core.ReActAgent;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Configuration;

/**
 * 生活助手 AgentScope 配置
 * 
 * 将生活助手 Agent 包装为 AgentScope ReActAgent
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
@ConditionalOnBean(AgentScopeAdapter.class)
public class LifeAssistantAgentScopeConfig {
    
    private final AgentRegistry agentRegistry;
    private final AgentScopeAdapter adapter;
    private final SkillExecutor skillExecutor;
    
    @PostConstruct
    public void wrapAgentsWithAgentScope() {
        log.info("开始将生活助手 Agent 包装为 AgentScope ReActAgent...");
        
        try {
            // 获取所有生活助手 Agent
            wrapAgent("shixiaoguang", new ShiXiaoGuangAgent(skillExecutor));
            wrapAgent("kangxiaojian", new KangXiaoJianAgent(skillExecutor));
            wrapAgent("xuexiaozhi", new XueXiaoZhiAgent(skillExecutor));
            wrapAgent("xinxiaonuan", new XinXiaoNuanAgent(skillExecutor));
            wrapAgent("xinxiaoan", new XinXiaoAnAgent(skillExecutor));
            wrapAgent("nuanxiaoyang", new NuanXiaoYangAgent(skillExecutor));
            
            log.info("生活助手 Agent 包装完成");
        } catch (Exception e) {
            log.error("包装生活助手 Agent 失败", e);
        }
    }
    
    private void wrapAgent(String agentId, Agent originalAgent) {
        try {
            // 包装为 ReActAgent
            ReActAgent reactAgent = adapter.wrapAgent(originalAgent);
            
            // 创建包装器
            AgentScopeAgentWrapper wrapper = new AgentScopeAgentWrapper(
                originalAgent, 
                reactAgent, 
                adapter
            );
            
            // 注册到 AgentRegistry（替换原有的 Agent）
            agentRegistry.unregister(agentId);
            agentRegistry.register(wrapper);
            
            log.info("Agent 已包装为 AgentScope ReActAgent: id={}, name={}", 
                agentId, originalAgent.getName());
        } catch (Exception e) {
            log.error("包装 Agent 失败: id={}", agentId, e);
        }
    }
}
