package com.heartsphere.aiagent.graph.research;

import java.util.Arrays;
import java.util.List;

/**
 * 简单的Graph可用性测试（不依赖Spring Boot）
 * 可以直接运行来测试Spring AI Graph的可用性
 * 
 * 运行方法：
 * cd backend
 * javac -cp target/classes src/main/java/com/heartsphere/aiagent/graph/research/SimpleGraphTest.java
 * java -cp target/classes:src/main/java com.heartsphere.aiagent.graph.research.SimpleGraphTest
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class SimpleGraphTest {
    
    /**
     * 测试Spring AI Graph是否可用
     */
    public static boolean testSpringAIGraphAvailability() {
        System.out.println("=== 测试Spring AI Graph可用性 ===");
        
        // 尝试查找可能的Graph类
        List<String> possibleClasses = Arrays.asList(
            "org.springframework.ai.graph.Graph",
            "org.springframework.ai.workflow.Graph",
            "org.springframework.ai.framework.graph.Graph",
            "com.alibaba.cloud.ai.graph.Graph",
            "com.alibaba.spring.ai.graph.Graph",
            "com.alibaba.cloud.spring.ai.graph.Graph"
        );
        
        boolean found = false;
        for (String className : possibleClasses) {
            try {
                Class<?> clazz = Class.forName(className);
                System.out.println("✓ 找到Graph类: " + className);
                System.out.println("  类加载器: " + clazz.getClassLoader());
                System.out.println("  包名: " + clazz.getPackage());
                found = true;
            } catch (ClassNotFoundException e) {
                System.out.println("✗ 未找到: " + className);
            }
        }
        
        return found;
    }
    
    /**
     * 测试自定义Graph引擎
     */
    public static void testCustomGraphEngine() {
        System.out.println("\n=== 测试自定义Graph引擎 ===");
        
        try {
            CustomGraphEngine engine = new CustomGraphEngine();
            String result = engine.testSimpleGraph();
            System.out.println("✓ 自定义Graph引擎测试成功");
            System.out.println("  结果: " + result);
        } catch (Exception e) {
            System.out.println("✗ 自定义Graph引擎测试失败");
            e.printStackTrace();
        }
    }
    
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("Graph技术预研测试");
        System.out.println("========================================\n");
        
        // 测试Spring AI Graph
        boolean springAIAvailable = testSpringAIGraphAvailability();
        
        // 测试自定义Graph引擎
        testCustomGraphEngine();
        
        // 输出结论
        System.out.println("\n========================================");
        System.out.println("测试结论");
        System.out.println("========================================");
        System.out.println("Spring AI Graph可用: " + (springAIAvailable ? "是" : "否"));
        System.out.println("自定义Graph引擎: 可用");
        
        if (!springAIAvailable) {
            System.out.println("\n建议: 使用自定义Graph引擎（CustomGraphEngine）");
            System.out.println("原因: Spring AI Graph相关类未找到，可能不存在或未添加依赖");
        } else {
            System.out.println("\n建议: Spring AI Graph可用，可以进一步研究API");
        }
    }
}
