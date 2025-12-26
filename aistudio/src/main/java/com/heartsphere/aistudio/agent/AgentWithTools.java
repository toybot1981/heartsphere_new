package com.heartsphere.aistudio.agent;

import com.heartsphere.aistudio.adapter.ModelAdapter;
import com.heartsphere.aistudio.adapter.ModelAdapterFactory;
import com.heartsphere.aistudio.model.AgentDefinition;
import com.heartsphere.aistudio.tool.Tool;
import com.heartsphere.aistudio.tool.ToolRegistry;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 带 Tool 支持的 Agent
 */
@Slf4j
@Getter
public class AgentWithTools extends BaseAgent {
    
    private final ToolRegistry toolRegistry;
    private final List<Tool> tools;
    
    public AgentWithTools(
            AgentDefinition definition,
            ModelAdapterFactory adapterFactory,
            ToolRegistry toolRegistry) {
        super(definition, adapterFactory);
        this.toolRegistry = toolRegistry;
        
        // 加载 Agent 配置的工具
        if (definition.getTools() != null && !definition.getTools().isEmpty()) {
            this.tools = definition.getTools().stream()
                .map(toolDef -> toolRegistry.getTool(toolDef.getName()))
                .filter(tool -> tool != null)
                .collect(Collectors.toList());
        } else {
            this.tools = List.of();
        }
    }
    
    @Override
    public Object execute(Object input) {
        String message = input.toString();
        
        // 如果有工具，可以在提示词中提及工具能力
        if (!tools.isEmpty()) {
            log.info("使用 {} 个工具执行 Agent", tools.size());
            // 构建包含工具信息的提示词
            String toolInfo = tools.stream()
                .map(t -> t.getName() + ": " + t.getDescription())
                .collect(Collectors.joining("\n"));
            
            String enhancedPrompt = message + "\n\n可用工具:\n" + toolInfo;
            return generateText(enhancedPrompt);
        }
        
        return generateText(message);
    }
    
    /**
     * 执行工具
     */
    public Object executeTool(String toolName, java.util.Map<String, Object> parameters) {
        Tool tool = toolRegistry.getTool(toolName);
        if (tool == null) {
            throw new IllegalArgumentException("工具不存在: " + toolName);
        }
        return tool.execute(parameters);
    }
}
