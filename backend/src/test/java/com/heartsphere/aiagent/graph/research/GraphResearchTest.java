package com.heartsphere.aiagent.graph.research;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Graph技术预研测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@SpringBootTest
class GraphResearchTest {
    
    @Autowired
    private SpringAIGraphTest springAIGraphTest;
    
    @Autowired
    private CustomGraphEngine customGraphEngine;
    
    @Test
    void testSpringAIGraphAvailability() {
        log.info("=== 测试Spring AI Graph可用性 ===");
        
        boolean available = springAIGraphTest.testGraphAvailability();
        String report = springAIGraphTest.getTestReport();
        
        log.info("测试结果:\n{}", report);
        
        // 无论结果如何，测试都应该通过（因为我们只是验证可用性）
        assertNotNull(report);
        assertTrue(report.contains("可用") || report.contains("不可用"));
    }
    
    @Test
    void testCustomGraphSimple() {
        log.info("=== 测试自定义Graph引擎（简单Graph）===");
        
        String result = customGraphEngine.testSimpleGraph();
        
        assertNotNull(result);
        assertTrue(result.contains("开始执行"));
        assertTrue(result.contains("处理中"));
        assertTrue(result.contains("完成"));
        
        log.info("测试结果: {}", result);
    }
    
    @Test
    void testCustomGraphWithRouter() {
        log.info("=== 测试自定义Graph引擎（带路由）===");
        
        String result = customGraphEngine.testGraphWithRouter();
        
        assertNotNull(result);
        // 由于value=75 >= 50，应该选择success分支
        assertEquals("成功", result);
        
        log.info("测试结果: {}", result);
    }
    
    @Test
    void testResearchReport() {
        log.info("=== 生成完整研究报告 ===");
        
        boolean springAIAvailable = springAIGraphTest.testGraphAvailability();
        String springAIReport = springAIGraphTest.getTestReport();
        
        log.info("\n=== Spring AI Graph 研究报告 ===\n{}", springAIReport);
        
        String customResult = customGraphEngine.testSimpleGraph();
        log.info("\n=== 自定义Graph引擎测试结果 ===\n{}", customResult);
        
        // 输出建议
        if (springAIAvailable) {
            log.info("\n=== 建议 ===\nSpring AI Graph可用，建议进行进一步的功能测试");
        } else {
            log.info("\n=== 建议 ===\nSpring AI Graph不可用，建议使用自定义Graph引擎");
        }
    }
}
