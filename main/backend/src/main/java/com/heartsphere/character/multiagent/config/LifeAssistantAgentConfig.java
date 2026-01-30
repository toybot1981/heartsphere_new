package com.heartsphere.character.multiagent.config;

import com.heartsphere.character.multiagent.agent.*;
import com.heartsphere.multiagent.core.AgentRegistry;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

/**
 * 生活助手 Agent 配置
 * 
 * 自动注册6个生活助手 Agent 到 AgentRegistry
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class LifeAssistantAgentConfig {
    
    private final AgentRegistry agentRegistry;
    private final ShiXiaoGuangAgent shiXiaoGuangAgent;
    private final KangXiaoJianAgent kangXiaoJianAgent;
    private final XueXiaoZhiAgent xueXiaoZhiAgent;
    private final XinXiaoNuanAgent xinXiaoNuanAgent;
    private final XinXiaoAnAgent xinXiaoAnAgent;
    private final NuanXiaoYangAgent nuanXiaoYangAgent;
    
    @PostConstruct
    public void registerLifeAssistantAgents() {
        log.info("开始注册生活助手 Agent...");
        
        try {
            agentRegistry.register(shiXiaoGuangAgent);
            log.info("注册时小光 Agent: {}", shiXiaoGuangAgent.getId());
            
            agentRegistry.register(kangXiaoJianAgent);
            log.info("注册康小健 Agent: {}", kangXiaoJianAgent.getId());
            
            agentRegistry.register(xueXiaoZhiAgent);
            log.info("注册学小知 Agent: {}", xueXiaoZhiAgent.getId());
            
            agentRegistry.register(xinXiaoNuanAgent);
            log.info("注册心小暖 Agent: {}", xinXiaoNuanAgent.getId());
            
            agentRegistry.register(xinXiaoAnAgent);
            log.info("注册心小安 Agent: {}", xinXiaoAnAgent.getId());
            
            agentRegistry.register(nuanXiaoYangAgent);
            log.info("注册暖小阳 Agent: {}", nuanXiaoYangAgent.getId());
            
            log.info("生活助手 Agent 注册完成，共注册 {} 个 Agent", 6);
        } catch (Exception e) {
            log.error("注册生活助手 Agent 失败", e);
        }
    }
}
