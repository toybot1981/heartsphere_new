package com.heartsphere.mentis.agentscope.prototype;

import io.agentscope.core.ReActAgent;
import io.agentscope.core.model.DashScopeChatModel;
import io.agentscope.core.message.Msg;
import io.agentscope.core.message.MsgRole;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * AgentScope vs Mentis 性能对比测试
 * 
 * 目的：对比 AgentScope 和 Mentis 当前实现的性能
 * 
 * 注意：需要有效的 API Key 才能运行完整测试
 * 
 * @author HeartSphere Research
 * @version 1.0
 */
public class PerformanceComparisonTest {
    
    private static final String TEST_MESSAGE = "你好，请介绍一下你自己";
    private static final int WARMUP_ITERATIONS = 2;
    private static final int TEST_ITERATIONS = 5;
    
    /**
     * 测试 AgentScope 的响应时间
     * 
     * 测试场景：简单聊天
     */
    @Test
    public void testAgentScopeResponseTime() {
        String apiKey = System.getenv("DASHSCOPE_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("⚠ 跳过测试：未设置 DASHSCOPE_API_KEY 环境变量");
            return;
        }
        
        System.out.println("=== AgentScope 性能测试 ===");
        
        try {
            // 创建 Agent
            DashScopeChatModel model = DashScopeChatModel.builder()
                .apiKey(apiKey)
                .modelName("qwen-max")
                .stream(false)
                .build();
            
            ReActAgent agent = ReActAgent.builder()
                .name("TestAgent")
                .sysPrompt("你是一个友好的助手。")
                .model(model)
                .maxIters(5)
                .build();
            
            // 创建消息
            Msg userMsg = Msg.builder()
                .textContent(TEST_MESSAGE)
                .role(MsgRole.USER)
                .build();
            
            List<Msg> messages = Arrays.asList(userMsg);
            
            // 预热
            System.out.println("预热中...");
            for (int i = 0; i < WARMUP_ITERATIONS; i++) {
                agent.call(messages).block();
            }
            
            // 性能测试
            System.out.println("开始性能测试...");
            long[] responseTimes = new long[TEST_ITERATIONS];
            
            for (int i = 0; i < TEST_ITERATIONS; i++) {
                long startTime = System.nanoTime();
                
                Mono<Msg> responseMono = agent.call(messages);
                Msg response = responseMono.block();
                
                long endTime = System.nanoTime();
                long responseTime = TimeUnit.NANOSECONDS.toMillis(endTime - startTime);
                responseTimes[i] = responseTime;
                
                System.out.printf("  [%d] 响应时间: %d ms, 响应长度: %d 字符%n",
                    i + 1, responseTime, response.getTextContent().length());
            }
            
            // 计算统计数据
            long totalTime = Arrays.stream(responseTimes).sum();
            long avgTime = totalTime / TEST_ITERATIONS;
            long minTime = Arrays.stream(responseTimes).min().orElse(0);
            long maxTime = Arrays.stream(responseTimes).max().orElse(0);
            
            System.out.println("\n=== AgentScope 性能统计 ===");
            System.out.printf("平均响应时间: %d ms%n", avgTime);
            System.out.printf("最小响应时间: %d ms%n", minTime);
            System.out.printf("最大响应时间: %d ms%n", maxTime);
            System.out.printf("总响应时间: %d ms%n", totalTime);
            
        } catch (Exception e) {
            System.err.println("✗ AgentScope 性能测试失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 测试 AgentScope 的并发性能
     */
    @Test
    public void testAgentScopeConcurrentPerformance() {
        String apiKey = System.getenv("DASHSCOPE_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("⚠ 跳过测试：未设置 DASHSCOPE_API_KEY 环境变量");
            return;
        }
        
        System.out.println("=== AgentScope 并发性能测试 ===");
        
        try {
            // 创建 Agent
            DashScopeChatModel model = DashScopeChatModel.builder()
                .apiKey(apiKey)
                .modelName("qwen-max")
                .stream(false)
                .build();
            
            ReActAgent agent = ReActAgent.builder()
                .name("TestAgent")
                .sysPrompt("你是一个友好的助手。")
                .model(model)
                .maxIters(5)
                .build();
            
            // 创建消息
            Msg userMsg = Msg.builder()
                .textContent(TEST_MESSAGE)
                .role(MsgRole.USER)
                .build();
            
            List<Msg> messages = Arrays.asList(userMsg);
            
            // 并发测试
            int concurrency = 3;
            System.out.printf("并发数: %d%n", concurrency);
            
            long startTime = System.nanoTime();
            
            // 使用并行流执行并发请求
            java.util.stream.IntStream.range(0, concurrency)
                .parallel()
                .forEach(i -> {
                    try {
                        long reqStart = System.nanoTime();
                        Msg response = agent.call(messages).block();
                        long reqEnd = System.nanoTime();
                        long reqTime = TimeUnit.NANOSECONDS.toMillis(reqEnd - reqStart);
                        System.out.printf("  [并发 %d] 响应时间: %d ms%n", i + 1, reqTime);
                    } catch (Exception e) {
                        System.err.printf("  [并发 %d] 错误: %s%n", i + 1, e.getMessage());
                    }
                });
            
            long endTime = System.nanoTime();
            long totalTime = TimeUnit.NANOSECONDS.toMillis(endTime - startTime);
            
            System.out.printf("\n总耗时: %d ms%n", totalTime);
            System.out.printf("平均耗时: %d ms%n", totalTime / concurrency);
            
        } catch (Exception e) {
            System.err.println("✗ 并发性能测试失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 测试 AgentScope 的流式响应延迟
     */
    @Test
    public void testAgentScopeStreamingLatency() {
        String apiKey = System.getenv("DASHSCOPE_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("⚠ 跳过测试：未设置 DASHSCOPE_API_KEY 环境变量");
            return;
        }
        
        System.out.println("=== AgentScope 流式响应延迟测试 ===");
        
        try {
            // 创建流式模型
            DashScopeChatModel streamModel = DashScopeChatModel.builder()
                .apiKey(apiKey)
                .modelName("qwen-max")
                .stream(true)
                .build();
            
            // 创建消息
            Msg userMsg = Msg.builder()
                .textContent("请介绍一下你自己，要求详细一些")
                .role(MsgRole.USER)
                .build();
            
            List<Msg> messages = Arrays.asList(userMsg);
            
            System.out.println("开始流式调用...");
            long startTime = System.nanoTime();
            long firstChunkTime = 0;
            int chunkCount = 0;
            
            // 使用 Model 的 stream 方法
            streamModel.stream(messages, java.util.Collections.emptyList(), null)
                .doOnNext(chunk -> {
                    chunkCount++;
                    long currentTime = System.nanoTime();
                    if (chunkCount == 1) {
                        firstChunkTime = TimeUnit.NANOSECONDS.toMillis(currentTime - startTime);
                        System.out.printf("首块延迟: %d ms%n", firstChunkTime);
                    }
                    
                    // 处理内容块
                    List<io.agentscope.core.message.ContentBlock> content = chunk.getContent();
                    if (content != null && !content.isEmpty()) {
                        System.out.print(".");
                    }
                })
                .doOnComplete(() -> {
                    long endTime = System.nanoTime();
                    long totalTime = TimeUnit.NANOSECONDS.toMillis(endTime - startTime);
                    
                    System.out.printf("\n流式完成%n");
                    System.out.printf("总块数: %d%n", chunkCount);
                    System.out.printf("总耗时: %d ms%n", totalTime);
                    System.out.printf("首块延迟: %d ms%n", firstChunkTime);
                    if (chunkCount > 0) {
                        System.out.printf("平均块延迟: %.2f ms%n", (double) totalTime / chunkCount);
                    }
                })
                .doOnError(error -> {
                    System.err.println("流式错误: " + error.getMessage());
                })
                .blockLast();
            
        } catch (Exception e) {
            System.err.println("✗ 流式响应测试失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 性能对比总结
     * 
     * 注意：需要同时运行 Mentis 和 AgentScope 的测试才能对比
     */
    @Test
    public void performanceComparisonSummary() {
        System.out.println("\n=== 性能对比总结 ===");
        System.out.println("⚠ 注意：完整的性能对比需要运行 Mentis 和 AgentScope 的测试");
        System.out.println("\n测试项目：");
        System.out.println("1. 响应时间对比（简单聊天）");
        System.out.println("2. 并发性能对比");
        System.out.println("3. 流式响应延迟对比");
        System.out.println("4. 资源消耗对比（内存、CPU）");
        System.out.println("\n评估标准：");
        System.out.println("- 响应时间增加 < 20%：可接受");
        System.out.println("- 并发性能不降：理想");
        System.out.println("- 流式延迟不增：理想");
        System.out.println("- 资源消耗增加 < 20%：可接受");
    }
}
