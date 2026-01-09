package com.heartsphere.mentis.agentscope.prototype;

import io.agentscope.core.ReActAgent;
import io.agentscope.core.model.DashScopeChatModel;
import io.agentscope.core.message.Msg;
import io.agentscope.core.message.MsgRole;
import reactor.core.publisher.Mono;

/**
 * AgentScope Java 简单 Agent 原型
 * 
 * 目的：验证基本的 ReActAgent 创建和使用方式
 * 
 * 基于实际 API 发现：
 * - ReActAgent: io.agentscope.core.ReActAgent
 * - DashScopeChatModel: io.agentscope.core.model.DashScopeChatModel
 * - Msg: io.agentscope.core.message.Msg
 * - 使用 Reactor 的 Mono<Msg> 返回类型
 * 
 * @author HeartSphere Research
 * @version 1.0
 */
public class SimpleAgentPrototype {
    
    /**
     * 示例：创建最简单的 ReActAgent 实例
     * 
     * 基于实际 API：
     * - ReActAgent.builder() - 静态方法创建 Builder
     * - .name(String) - 设置名称
     * - .sysPrompt(String) - 设置系统提示词
     * - .model(Model) - 设置模型
     * - .build() - 构建 Agent
     * 
     * DashScopeChatModel:
     * - DashScopeChatModel.builder() - 创建 Builder
     * - .apiKey(String) - 设置 API Key
     * - .modelName(String) - 设置模型名称
     * - .stream(boolean) - 是否流式
     * - .build() - 构建模型
     */
    public void createSimpleAgent() {
        // 创建 DashScope 模型
        DashScopeChatModel model = DashScopeChatModel.builder()
            .apiKey(System.getenv("DASHSCOPE_API_KEY"))
            .modelName("qwen-max")
            .stream(false)  // 非流式
            .build();
        
        // 创建 ReActAgent
        ReActAgent agent = ReActAgent.builder()
            .name("Mentis")
            .sysPrompt("你是 Mentis，一个友好的智能助手。")
            .model(model)
            .build();
        
        System.out.println("Agent 创建成功: " + agent);
    }
    
    /**
     * 示例：同步调用 Agent
     * 
     * 基于实际 API：
     * - agent.call(List<Msg>) - 返回 Mono<Msg>
     * - Msg.builder() - 创建消息 Builder
     * - .textContent(String) - 设置文本内容
     * - .role(MsgRole) - 设置角色（可选）
     * - .build() - 构建消息
     * - .block() - 阻塞等待结果（同步调用）
     */
    public void callAgentSync(ReActAgent agent) {
        // 创建用户消息
        Msg userMsg = Msg.builder()
            .textContent("你好！")
            .role(MsgRole.USER)  // 可能需要，待验证
            .build();
        
        // 同步调用（阻塞）
        Mono<Msg> responseMono = agent.call(java.util.Arrays.asList(userMsg));
        Msg response = responseMono.block();
        
        // 获取文本内容
        String text = response.getTextContent();
        System.out.println("响应: " + text);
    }
    
    /**
     * 示例：流式调用 Agent
     * 
     * 注意：需要确认流式调用的具体 API
     * - 可能需要使用 Mono 的流式操作符
     * - 或者使用 DashScopeChatModel 的流式支持
     */
    public void callAgentStream(ReActAgent agent) {
        // 创建流式模型
        DashScopeChatModel streamModel = DashScopeChatModel.builder()
            .apiKey(System.getenv("DASHSCOPE_API_KEY"))
            .modelName("qwen-max")
            .stream(true)  // 启用流式
            .build();
        
        // 创建流式 Agent
        ReActAgent streamAgent = ReActAgent.builder()
            .name("Mentis")
            .sysPrompt("你是 Mentis，一个友好的智能助手。")
            .model(streamModel)
            .build();
        
        // 创建用户消息
        Msg userMsg = Msg.builder()
            .textContent("你好！")
            .build();
        
        // 流式调用（使用 Mono）
        // 注意：Mono 是单值响应式类型，不是流式的
        // 真正的流式可能需要使用 Flux 或模型的流式能力
        streamAgent.call(java.util.Arrays.asList(userMsg))
            .doOnSuccess(response -> {
                // 处理响应
                String content = response.getTextContent();
                System.out.println("响应: " + content);
            })
            .doOnError(error -> {
                System.err.println("错误: " + error.getMessage());
            })
            .block();
    }
    
    /**
     * 验证 API 细节
     * 
     * 待验证的关键点：
     * 
     * 1. MsgRole 枚举是否存在
     * 2. .call() 方法的参数类型（是否是 List<Msg>）
     * 3. 流式调用的实际行为
     * 4. 错误处理方式
     * 5. 响应中是否包含工具调用信息
     */
    public void verifyApiDetails() {
        System.out.println("=== AgentScope Java API 验证 ===");
        
        // 1. 验证 Agent 创建
        try {
            DashScopeChatModel model = DashScopeChatModel.builder()
                .apiKey("test-key")
                .modelName("qwen-max")
                .build();
            System.out.println("✓ DashScopeChatModel 创建成功");
            
            ReActAgent agent = ReActAgent.builder()
                .name("TestAgent")
                .sysPrompt("Test prompt")
                .model(model)
                .build();
            System.out.println("✓ ReActAgent 创建成功");
            System.out.println("  - SysPrompt: " + agent.getSysPrompt());
            System.out.println("  - Model: " + agent.getModel());
            System.out.println("  - Toolkit: " + agent.getToolkit());
            System.out.println("  - MaxIters: " + agent.getMaxIters());
        } catch (Exception e) {
            System.err.println("✗ Agent 创建失败: " + e.getMessage());
            e.printStackTrace();
        }
        
        // 2. 验证消息构建
        try {
            Msg msg = Msg.builder()
                .textContent("测试消息")
                .build();
            System.out.println("✓ Msg 创建成功");
            System.out.println("  - ID: " + msg.getId());
            System.out.println("  - TextContent: " + msg.getTextContent());
            System.out.println("  - Role: " + msg.getRole());
        } catch (Exception e) {
            System.err.println("✗ Msg 创建失败: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("=== API 验证完成 ===");
    }
}
