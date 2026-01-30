package com.heartsphere.multiagent.agentscope.config;

import com.heartsphere.multiagent.agentscope.AgentScopeAdapter;
import com.heartsphere.shared.service.PromptTemplateIntegrationService;
import io.agentscope.core.model.DashScopeChatModel;
import io.agentscope.core.model.Model;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * AgentScope 配置
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "multiagent.agentscope")
public class AgentScopeConfig {
    
    /**
     * 是否启用 AgentScope 集成
     */
    private boolean enabled = true;
    
    /**
     * DashScope API Key
     */
    private String dashscopeApiKey;
    
    /**
     * 模型名称（默认：qwen-max）
     */
    private String modelName = "qwen-max";
    
    /**
     * 是否启用流式响应
     */
    private boolean stream = false;
    
    /**
     * 最大迭代次数
     */
    private int maxIters = 10;
    
    @Bean
    public Model dashScopeModel() {
        if (!enabled || dashscopeApiKey == null || dashscopeApiKey.isEmpty()) {
            return null;
        }
        
        return DashScopeChatModel.builder()
            .apiKey(dashscopeApiKey)
            .modelName(modelName)
            .stream(stream)
            .build();
    }
    
    @Bean
    public AgentScopeAdapter agentScopeAdapter(Model model,
            @Autowired(required = false) PromptTemplateIntegrationService templateService) {
        if (model == null) {
            return null;
        }
        return new AgentScopeAdapter(model, templateService);
    }
}
