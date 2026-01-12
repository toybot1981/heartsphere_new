package com.heartsphere.aiagent.graph.research;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Graph技术预研测试运行器
 * 应用启动时自动运行测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class GraphResearchTestRunner implements CommandLineRunner {
    
    private final SpringAIGraphTest springAIGraphTest;
    private final CustomGraphEngine customGraphEngine;
    
    public GraphResearchTestRunner(SpringAIGraphTest springAIGraphTest, 
                                  CustomGraphEngine customGraphEngine) {
        this.springAIGraphTest = springAIGraphTest;
        this.customGraphEngine = customGraphEngine;
    }
    
    @Override
    public void run(String... args) {
        // 只在明确要求时才运行（通过系统属性控制）
        if (!"true".equals(System.getProperty("run.graph.research"))) {
            return;
        }
        
        log.info("========================================");
        log.info("开始Graph技术预研测试");
        log.info("========================================");
        
        // 1. 测试Spring AI Graph可用性
        log.info("\n[1/3] 测试Spring AI Graph可用性...");
        boolean springAIAvailable = springAIGraphTest.testGraphAvailability();
        String springAIReport = springAIGraphTest.getTestReport();
        log.info("\n{}", springAIReport);
        
        // 2. 测试自定义Graph引擎（简单Graph）
        log.info("\n[2/3] 测试自定义Graph引擎（简单Graph）...");
        String simpleResult = customGraphEngine.testSimpleGraph();
        log.info("测试结果: {}", simpleResult);
        
        // 3. 测试自定义Graph引擎（带路由）
        log.info("\n[3/3] 测试自定义Graph引擎（带路由）...");
        String routerResult = customGraphEngine.testGraphWithRouter();
        log.info("测试结果: {}", routerResult);
        
        // 总结
        log.info("\n========================================");
        log.info("Graph技术预研测试完成");
        log.info("========================================");
        log.info("Spring AI Graph可用: {}", springAIAvailable);
        log.info("自定义Graph引擎: 可用");
        
        if (!springAIAvailable) {
            log.info("\n建议: 使用自定义Graph引擎（CustomGraphEngine）");
        } else {
            log.info("\n建议: Spring AI Graph可用，可以进一步研究API");
        }
    }
}
