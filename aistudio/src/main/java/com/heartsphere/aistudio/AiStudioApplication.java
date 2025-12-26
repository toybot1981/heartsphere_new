package com.heartsphere.aistudio;

import com.heartsphere.aistudio.model.AgentDefinition;
import com.heartsphere.aistudio.service.AgentService;
import com.heartsphere.aistudio.service.CreationAgentService;
import com.heartsphere.aistudio.service.TravelAgentService;
import com.heartsphere.aistudio.service.TravelChatAgentService;
import com.heartsphere.aistudio.tool.ToolRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@Slf4j
@SpringBootApplication
@EnableConfigurationProperties
@org.springframework.scheduling.annotation.EnableScheduling
@RequiredArgsConstructor
public class AiStudioApplication implements CommandLineRunner {

    private final AgentService agentService;
    private final ToolRegistry toolRegistry;
    private final CreationAgentService creationAgentService;
    private final TravelAgentService travelAgentService;
    private final TravelChatAgentService travelChatAgentService;

    public static void main(String[] args) {
        SpringApplication.run(AiStudioApplication.class, args);
    }

    @Override
    public void run(String... args) {
        // 初始化默认工具
        toolRegistry.initializeDefaultTools();
        
        // 从数据库加载 Agent
        agentService.loadAgentsFromDatabase();
        
        // 如果没有 agent，创建默认的对话 agent
        if (agentService.listAgents().isEmpty()) {
            createDefaultChatAgent();
        }
        
        // 初始化创作相关的 Agent
        creationAgentService.initializeCreationAgents();
        
        // 初始化旅游出行助手 Agent（对话式，多 Agent 协同）
        travelChatAgentService.initializeTravelChatAgents();
        
        System.out.println("========================================");
        System.out.println("  AI Studio Service Started Successfully");
        System.out.println("  Port: 8082");
        System.out.println("  API Docs: http://localhost:8082/swagger-ui.html");
        System.out.println("  Chatbot UI: http://localhost:8082/");
        System.out.println("  H2 Console: http://localhost:8082/h2-console");
        System.out.println("========================================");
    }
    
    /**
     * 创建默认的对话 Agent
     */
    private void createDefaultChatAgent() {
        try {
            AgentDefinition definition = new AgentDefinition();
            definition.setId("chat-agent");
            definition.setName("聊天助手");
            definition.setDescription("一个友好的 AI 聊天助手，可以回答各种问题");
            definition.setType(AgentDefinition.AgentType.TEXT);
            definition.setProvider("alibaba");
            definition.setModel("qwen-max");
            definition.setSystemPrompt("你是一个友好、专业的AI助手，能够回答各种问题，提供有用的建议和信息。");
            
            agentService.registerAgent(definition);
            log.info("已创建默认对话 Agent: chat-agent");
        } catch (Exception e) {
            log.error("创建默认对话 Agent 失败", e);
        }
    }
}
