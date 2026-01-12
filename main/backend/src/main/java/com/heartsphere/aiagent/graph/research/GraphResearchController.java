package com.heartsphere.aiagent.graph.research;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Graph技术预研控制器
 * 提供REST API接口用于测试Graph功能
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/graph-research")
@RequiredArgsConstructor
public class GraphResearchController {
    
    private final SpringAIGraphTest springAIGraphTest;
    private final CustomGraphEngine customGraphEngine;
    
    /**
     * 测试Spring AI Graph可用性
     */
    @GetMapping("/test-spring-ai-graph")
    public ResponseEntity<Map<String, Object>> testSpringAIGraph() {
        log.info("[GraphResearchController] 收到Spring AI Graph可用性测试请求");
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            boolean available = springAIGraphTest.testGraphAvailability();
            String report = springAIGraphTest.getTestReport();
            
            result.put("success", true);
            result.put("available", available);
            result.put("report", report);
            
            log.info("[GraphResearchController] Spring AI Graph可用性: {}", available);
            
        } catch (Exception e) {
            log.error("[GraphResearchController] 测试Spring AI Graph时发生异常", e);
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("available", false);
        }
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * 测试自定义Graph引擎
     */
    @PostMapping("/test-custom-graph")
    public ResponseEntity<Map<String, Object>> testCustomGraph(@RequestParam(required = false) String type) {
        log.info("[GraphResearchController] 收到自定义Graph测试请求，类型: {}", type);
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            String testResult;
            
            if ("router".equals(type)) {
                testResult = customGraphEngine.testGraphWithRouter();
                result.put("testType", "带路由的Graph");
            } else {
                testResult = customGraphEngine.testSimpleGraph();
                result.put("testType", "简单Graph");
            }
            
            result.put("success", true);
            result.put("result", testResult);
            
            log.info("[GraphResearchController] 自定义Graph测试成功，结果: {}", testResult);
            
        } catch (Exception e) {
            log.error("[GraphResearchController] 测试自定义Graph时发生异常", e);
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * 获取完整的研究报告
     */
    @GetMapping("/report")
    public ResponseEntity<Map<String, Object>> getResearchReport() {
        log.info("[GraphResearchController] 收到研究报告请求");
        
        Map<String, Object> report = new HashMap<>();
        
        // Spring AI Graph可用性
        boolean springAIGraphAvailable = springAIGraphTest.testGraphAvailability();
        String springAIReport = springAIGraphTest.getTestReport();
        
        // 自定义Graph测试结果
        String customGraphResult = customGraphEngine.testSimpleGraph();
        
        report.put("springAIGraph", Map.of(
            "available", springAIGraphAvailable,
            "report", springAIReport
        ));
        
        report.put("customGraph", Map.of(
            "available", true,
            "testResult", customGraphResult
        ));
        
        // 建议
        String recommendation;
        if (springAIGraphAvailable) {
            recommendation = "建议使用Spring AI Graph，但需要进一步验证API的完整性和稳定性";
        } else {
            recommendation = "Spring AI Graph不可用，建议使用自定义Graph引擎（CustomGraphEngine）。" +
                           "自定义引擎已经实现了基本的节点、边、状态管理和路由功能，可以满足基本需求。";
        }
        report.put("recommendation", recommendation);
        
        report.put("timestamp", java.time.LocalDateTime.now().toString());
        
        return ResponseEntity.ok(report);
    }
}
