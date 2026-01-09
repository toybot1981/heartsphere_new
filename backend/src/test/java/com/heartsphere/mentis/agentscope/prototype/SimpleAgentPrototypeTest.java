package com.heartsphere.mentis.agentscope.prototype;

import io.agentscope.core.ReActAgent;
import io.agentscope.core.model.DashScopeChatModel;
import io.agentscope.core.message.Msg;
import io.agentscope.core.message.MsgRole;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * AgentScope Java 简单 Agent 原型测试
 * 
 * 目的：验证基本的 ReActAgent API
 * 
 * @author HeartSphere Research
 * @version 1.0
 */
public class SimpleAgentPrototypeTest {
    
    @Test
    public void testAgentCreation() {
        System.out.println("=== 测试 Agent 创建 ===");
        
        try {
            // 创建 DashScope 模型
            DashScopeChatModel model = DashScopeChatModel.builder()
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .modelName("qwen-max")
                .stream(false)
                .build();
            
            assertNotNull(model, "模型创建失败");
            System.out.println("✓ DashScopeChatModel 创建成功");
            
            // 创建 ReActAgent
            ReActAgent agent = ReActAgent.builder()
                .name("TestAgent")
                .sysPrompt("你是一个友好的助手。")
                .model(model)
                .build();
            
            assertNotNull(agent, "Agent 创建失败");
            System.out.println("✓ ReActAgent 创建成功");
            System.out.println("  - Agent: " + agent);
            System.out.println("  - SysPrompt: " + agent.getSysPrompt());
            System.out.println("  - Model: " + agent.getModel());
            System.out.println("  - Toolkit: " + agent.getToolkit());
            System.out.println("  - MaxIters: " + agent.getMaxIters());
            
        } catch (Exception e) {
            System.err.println("✗ Agent 创建失败: " + e.getMessage());
            e.printStackTrace();
            fail("Agent 创建失败: " + e.getMessage());
        }
    }
    
    @Test
    public void testMsgCreation() {
        System.out.println("=== 测试消息创建 ===");
        
        try {
            // 创建消息
            Msg msg = Msg.builder()
                .textContent("测试消息")
                .role(MsgRole.USER)
                .build();
            
            assertNotNull(msg, "消息创建失败");
            System.out.println("✓ Msg 创建成功");
            System.out.println("  - ID: " + msg.getId());
            System.out.println("  - TextContent: " + msg.getTextContent());
            System.out.println("  - Role: " + msg.getRole());
            System.out.println("  - Content: " + msg.getContent());
            
            assertEquals("测试消息", msg.getTextContent(), "文本内容不匹配");
            assertEquals(MsgRole.USER, msg.getRole(), "角色不匹配");
            
        } catch (Exception e) {
            System.err.println("✗ Msg 创建失败: " + e.getMessage());
            e.printStackTrace();
            fail("Msg 创建失败: " + e.getMessage());
        }
    }
    
    @Test
    public void testAgentCall() {
        System.out.println("=== 测试 Agent 调用 ===");
        
        // 注意：这个测试需要有效的 API Key，可能会失败
        String apiKey = System.getenv("DASHSCOPE_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("⚠ 跳过测试：未设置 DASHSCOPE_API_KEY 环境变量");
            return;
        }
        
        try {
            // 创建模型和 Agent
            DashScopeChatModel model = DashScopeChatModel.builder()
                .apiKey(apiKey)
                .modelName("qwen-max")
                .stream(false)
                .build();
            
            ReActAgent agent = ReActAgent.builder()
                .name("TestAgent")
                .sysPrompt("你是一个友好的助手。")
                .model(model)
                .maxIters(1)  // 限制迭代次数
                .build();
            
            // 创建用户消息
            Msg userMsg = Msg.builder()
                .textContent("你好")
                .role(MsgRole.USER)
                .build();
            
            List<Msg> messages = Arrays.asList(userMsg);
            
            // 调用 Agent（返回 Mono<Msg>）
            // 注意：需要查看实际的 call 方法签名
            Mono<Msg> responseMono = agent.call(messages);
            assertNotNull(responseMono, "响应 Mono 为 null");
            
            System.out.println("✓ Agent 调用成功（返回 Mono）");
            
            // 尝试获取响应（阻塞）
            Msg response = responseMono.block();
            assertNotNull(response, "响应为 null");
            
            System.out.println("✓ 获取响应成功");
            System.out.println("  - Response ID: " + response.getId());
            System.out.println("  - Response Role: " + response.getRole());
            System.out.println("  - Response Text: " + response.getTextContent());
            
        } catch (Exception e) {
            System.err.println("✗ Agent 调用失败: " + e.getMessage());
            e.printStackTrace();
            // 不 fail，因为可能是 API Key 或其他网络问题
        }
    }
    
    @Test
    public void testApiDetails() {
        System.out.println("=== API 细节验证 ===");
        
        // 验证 MsgRole 枚举
        assertNotNull(MsgRole.USER);
        assertNotNull(MsgRole.ASSISTANT);
        assertNotNull(MsgRole.SYSTEM);
        assertNotNull(MsgRole.TOOL);
        System.out.println("✓ MsgRole 枚举值存在");
        
        // 验证 Builder 方法
        try {
            DashScopeChatModel.Builder modelBuilder = DashScopeChatModel.builder();
            assertNotNull(modelBuilder);
            
            DashScopeChatModel model = modelBuilder
                .apiKey("test-key")
                .modelName("qwen-max")
                .build();
            assertNotNull(model);
            System.out.println("✓ DashScopeChatModel.Builder 可用");
            
            ReActAgent.Builder agentBuilder = ReActAgent.builder();
            assertNotNull(agentBuilder);
            System.out.println("✓ ReActAgent.Builder 可用");
            
            Msg.Builder msgBuilder = Msg.builder();
            assertNotNull(msgBuilder);
            System.out.println("✓ Msg.Builder 可用");
            
        } catch (Exception e) {
            System.err.println("✗ Builder 验证失败: " + e.getMessage());
            e.printStackTrace();
            fail("Builder 验证失败: " + e.getMessage());
        }
    }
}
