package com.heartsphere.aistudio.agent;

import com.heartsphere.aistudio.adapter.ModelAdapter;
import com.heartsphere.aistudio.adapter.ModelAdapterFactory;
import com.heartsphere.aistudio.model.AgentDefinition;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;

/**
 * 基础 Agent 类
 * 所有 Agent 的基类，提供通用的能力
 */
@Slf4j
@Getter
@RequiredArgsConstructor
public abstract class BaseAgent {
    
    protected final AgentDefinition definition;
    protected final ModelAdapter modelAdapter;
    protected final ChatModel chatModel;
    
    public BaseAgent(AgentDefinition definition, ModelAdapterFactory adapterFactory) {
        this.definition = definition;
        this.modelAdapter = adapterFactory.getAdapter(definition.getProvider());
        this.chatModel = modelAdapter.getChatModel(definition.getModel());
    }
    
    /**
     * 执行 Agent 任务
     */
    public abstract Object execute(Object input);
    
    /**
     * 生成文字回复
     */
    protected ChatResponse generateText(String userMessage) {
        Prompt prompt = new Prompt(userMessage);
        return chatModel.call(prompt);
    }
    
    /**
     * 生成文字回复（带系统提示词）
     */
    protected ChatResponse generateText(String userMessage, String systemPrompt) {
        Prompt prompt = new Prompt(userMessage);
        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            // 设置系统提示词
            prompt = new Prompt(userMessage);
        }
        return chatModel.call(prompt);
    }
}

