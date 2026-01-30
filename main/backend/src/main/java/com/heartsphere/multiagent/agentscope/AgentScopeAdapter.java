package com.heartsphere.multiagent.agentscope;

import com.heartsphere.multiagent.core.Agent;
import com.heartsphere.shared.service.PromptTemplateIntegrationService;
import io.agentscope.core.ReActAgent;
import io.agentscope.core.message.Msg;
import io.agentscope.core.message.MsgRole;
import io.agentscope.core.model.DashScopeChatModel;
import io.agentscope.core.model.Model;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AgentScope 适配器
 * 
 * 将我们的 Agent 接口适配到 AgentScope 的 ReActAgent
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
public class AgentScopeAdapter {

    private final Model model;
    private final PromptTemplateIntegrationService templateService;

    public AgentScopeAdapter(Model model) {
        this(model, null);
    }

    public AgentScopeAdapter(Model model, PromptTemplateIntegrationService templateService) {
        this.model = model;
        this.templateService = templateService;
    }
    
    /**
     * 将我们的 Agent 包装为 AgentScope 的 ReActAgent
     * 
     * @param agent 我们的 Agent 实例
     * @return AgentScope ReActAgent
     */
    public ReActAgent wrapAgent(Agent agent) {
        String sysPrompt = buildSystemPrompt(agent);
        
        ReActAgent reactAgent = ReActAgent.builder()
            .name(agent.getName())
            .description(agent.getDescription())
            .sysPrompt(sysPrompt)
            .model(model)
            .maxIters(10) // 默认最大迭代次数
            .build();
        
        log.info("Wrapped agent as ReActAgent: id={}, name={}", agent.getId(), agent.getName());
        
        return reactAgent;
    }
    
    /**
     * 通过 AgentScope ReActAgent 执行任务
     * 
     * @param reactAgent AgentScope ReActAgent
     * @param task 任务描述
     * @return 执行结果
     */
    public Mono<String> executeTask(ReActAgent reactAgent, String task) {
        // 创建用户消息
        Msg userMsg = Msg.builder()
            .role(MsgRole.USER)
            .textContent(task)
            .build();
        
        // 调用 ReActAgent
        Mono<Msg> responseMono = reactAgent.call(Arrays.asList(userMsg));
        
        // 提取文本内容
        return responseMono.map(Msg::getTextContent)
            .doOnError(error -> log.error("AgentScope execution failed: {}", error.getMessage(), error));
    }
    
    /**
     * 构建系统提示词
     * 优先从提示词管理（multiagent-agent-system）获取，取不到时使用代码内默认拼接。
     */
    private String buildSystemPrompt(Agent agent) {
        String defaultPrompt = buildSystemPromptDefault(agent);
        if (templateService != null) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("agentName", agent.getName());
            variables.put("agentDescription", agent.getDescription() != null ? agent.getDescription() : "");
            variables.put("capabilities", agent.getCapabilities());
            var response = templateService.getPrompts("multiagent-agent-system", variables, defaultPrompt, "");
            if (response != null && response.getSystemPrompt() != null && !response.getSystemPrompt().isEmpty()) {
                return response.getSystemPrompt();
            }
        }
        return defaultPrompt;
    }

    private String buildSystemPromptDefault(Agent agent) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是 ").append(agent.getName()).append("。");
        prompt.append(agent.getDescription()).append("\n\n");
        if (!agent.getCapabilities().isEmpty()) {
            prompt.append("你的能力包括：\n");
            for (String capability : agent.getCapabilities()) {
                prompt.append("- ").append(capability).append("\n");
            }
        }
        prompt.append("\n请根据用户的需求，使用你的专业能力提供帮助。");
        return prompt.toString();
    }
    
    /**
     * 创建 DashScope 模型
     * 
     * @param apiKey API Key
     * @param modelName 模型名称
     * @return DashScopeChatModel
     */
    public static DashScopeChatModel createDashScopeModel(String apiKey, String modelName) {
        return DashScopeChatModel.builder()
            .apiKey(apiKey)
            .modelName(modelName != null ? modelName : "qwen-max")
            .stream(false)
            .build();
    }
}
