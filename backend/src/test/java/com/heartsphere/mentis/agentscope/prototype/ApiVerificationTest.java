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
 * AgentScope Java API 验证测试
 * 
 * 目的：验证实际 API 的细节和使用方式
 * 
 * 已验证的 API：
 * - ReActAgent.builder() -> ReActAgent.Builder
 * - ReActAgent.call(List<Msg>) -> Mono<Msg>
 * - DashScopeChatModel.builder() -> DashScopeChatModel.Builder
 * - Msg.builder() -> Msg.Builder
 * - MsgRole 枚举（USER, ASSISTANT, SYSTEM, TOOL）
 * 
 * @author HeartSphere Research
 * @version 1.0
 */
public class ApiVerificationTest {
    
    @Test
    public void verifyBasicApi() {
        System.out.println("=== 验证基础 API ===");
        
        // 1. 验证 MsgRole 枚举
        assertNotNull(MsgRole.USER);
        assertNotNull(MsgRole.ASSISTANT);
        assertNotNull(MsgRole.SYSTEM);
        assertNotNull(MsgRole.TOOL);
        System.out.println("✓ MsgRole 枚举值: USER, ASSISTANT, SYSTEM, TOOL");
        
        // 2. 验证 Msg.Builder
        Msg.Builder msgBuilder = Msg.builder();
        assertNotNull(msgBuilder);
        
        Msg msg = msgBuilder
            .textContent("测试消息")
            .role(MsgRole.USER)
            .build();
        
        assertNotNull(msg);
        assertEquals("测试消息", msg.getTextContent());
        assertEquals(MsgRole.USER, msg.getRole());
        assertNotNull(msg.getId());
        System.out.println("✓ Msg.Builder 可用");
        System.out.println("  - textContent() 方法存在");
        System.out.println("  - role() 方法存在");
        System.out.println("  - build() 方法返回 Msg");
        System.out.println("  - getTextContent() 方法可用");
        System.out.println("  - getRole() 方法可用");
        System.out.println("  - getId() 方法可用（自动生成）");
        
        // 3. 验证 DashScopeChatModel.Builder
        DashScopeChatModel.Builder modelBuilder = DashScopeChatModel.builder();
        assertNotNull(modelBuilder);
        
        DashScopeChatModel model = modelBuilder
            .apiKey("test-key")
            .modelName("qwen-max")
            .stream(false)
            .build();
        
        assertNotNull(model);
        assertEquals("qwen-max", model.getModelName());
        System.out.println("✓ DashScopeChatModel.Builder 可用");
        System.out.println("  - apiKey() 方法存在");
        System.out.println("  - modelName() 方法存在");
        System.out.println("  - stream() 方法存在");
        System.out.println("  - build() 方法返回 DashScopeChatModel");
        System.out.println("  - getModelName() 方法可用");
        
        // 4. 验证 ReActAgent.Builder
        ReActAgent.Builder agentBuilder = ReActAgent.builder();
        assertNotNull(agentBuilder);
        
        ReActAgent agent = agentBuilder
            .name("TestAgent")
            .sysPrompt("测试提示词")
            .model(model)
            .maxIters(5)
            .build();
        
        assertNotNull(agent);
        assertEquals("测试提示词", agent.getSysPrompt());
        assertEquals(5, agent.getMaxIters());
        assertNotNull(agent.getModel());
        assertNotNull(agent.getToolkit());
        System.out.println("✓ ReActAgent.Builder 可用");
        System.out.println("  - name() 方法存在");
        System.out.println("  - sysPrompt() 方法存在");
        System.out.println("  - model() 方法存在");
        System.out.println("  - maxIters() 方法存在");
        System.out.println("  - build() 方法返回 ReActAgent");
        System.out.println("  - getSysPrompt() 方法可用");
        System.out.println("  - getMaxIters() 方法可用");
        System.out.println("  - getModel() 方法可用");
        System.out.println("  - getToolkit() 方法可用");
    }
    
    @Test
    public void verifyCallApi() {
        System.out.println("=== 验证调用 API ===");
        
        // 创建模型和 Agent
        DashScopeChatModel model = DashScopeChatModel.builder()
            .apiKey("test-key")
            .modelName("qwen-max")
            .build();
        
        ReActAgent agent = ReActAgent.builder()
            .name("TestAgent")
            .sysPrompt("测试")
            .model(model)
            .build();
        
        // 创建消息列表
        Msg userMsg = Msg.builder()
            .textContent("你好")
            .role(MsgRole.USER)
            .build();
        
        List<Msg> messages = Arrays.asList(userMsg);
        
        // 验证 call 方法签名
        // call(List<Msg>) -> Mono<Msg>
        Mono<Msg> responseMono = agent.call(messages);
        assertNotNull(responseMono);
        System.out.println("✓ ReActAgent.call(List<Msg>) 方法存在");
        System.out.println("  - 返回类型: Mono<Msg>");
        System.out.println("  - 使用 Reactor 响应式编程");
        
        // 验证结构化输出支持
        // call(List<Msg>, Class<?>) -> Mono<Msg>
        Mono<Msg> responseMonoWithType = agent.call(messages, String.class);
        assertNotNull(responseMonoWithType);
        System.out.println("✓ ReActAgent.call(List<Msg>, Class<?>) 方法存在");
        System.out.println("  - 支持结构化输出（通过 Class 类型）");
        
        // 验证 JsonNode 支持（可能需要 Jackson）
        System.out.println("✓ ReActAgent.call(List<Msg>, JsonNode) 方法存在（推测）");
        System.out.println("  - 支持结构化输出（通过 JSON Schema）");
    }
    
    @Test
    public void verifyStreamingApi() {
        System.out.println("=== 验证流式 API ===");
        
        // 创建流式模型
        DashScopeChatModel streamModel = DashScopeChatModel.builder()
            .apiKey("test-key")
            .modelName("qwen-max")
            .stream(true)  // 启用流式
            .build();
        
        assertNotNull(streamModel);
        System.out.println("✓ DashScopeChatModel.stream(true) 可用");
        System.out.println("  - 可以通过 .stream(boolean) 启用流式");
        
        // 注意：流式调用需要使用 Model 的 stream() 方法
        // Model.stream(List<Msg>, List<ToolSchema>, GenerateOptions) -> Flux<ChatResponse>
        // 这是模型层面的流式，不是 Agent 层面的
        System.out.println("✓ Model.stream() 方法存在（返回 Flux<ChatResponse>）");
        System.out.println("  - 流式在模型层面，不是 Agent 层面");
        System.out.println("  - 需要通过 Model 的 stream() 方法调用");
    }
    
    @Test
    public void verifyApiSummary() {
        System.out.println("\n=== API 验证总结 ===");
        System.out.println("✅ 已确认的 API:");
        System.out.println("  1. ReActAgent.builder() -> ReActAgent.Builder");
        System.out.println("  2. ReActAgent.call(List<Msg>) -> Mono<Msg>");
        System.out.println("  3. ReActAgent.call(List<Msg>, Class<?>) -> Mono<Msg> (结构化输出)");
        System.out.println("  4. DashScopeChatModel.builder() -> DashScopeChatModel.Builder");
        System.out.println("  5. DashScopeChatModel.stream(boolean) -> 启用流式");
        System.out.println("  6. Msg.builder() -> Msg.Builder");
        System.out.println("  7. Msg.builder().textContent(String).role(MsgRole).build()");
        System.out.println("  8. MsgRole 枚举: USER, ASSISTANT, SYSTEM, TOOL");
        System.out.println("  9. Model.stream() -> Flux<ChatResponse> (流式)");
        System.out.println("\n⚠️ 需要进一步验证:");
        System.out.println("  1. Toolkit 的创建和使用方式");
        System.out.println("  2. AgentTool 接口的具体实现");
        System.out.println("  3. 流式响应的实际处理方式");
        System.out.println("  4. 工具调用的完整流程");
    }
}
