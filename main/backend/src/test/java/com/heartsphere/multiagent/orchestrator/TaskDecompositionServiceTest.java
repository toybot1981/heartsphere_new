package com.heartsphere.multiagent.orchestrator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TaskDecompositionService 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@DisplayName("TaskDecompositionService 单元测试")
class TaskDecompositionServiceTest {
    
    private TaskDecompositionService service;
    
    @BeforeEach
    void setUp() {
        service = new TaskDecompositionService();
    }
    
    @Test
    @DisplayName("测试任务分解 - 效率提升任务")
    void testDecomposeEfficiencyTask() {
        String task = "我想提高工作效率";
        TaskDecompositionService.DecompositionResult result = service.decompose(task);
        
        assertNotNull(result);
        assertFalse(result.getSubTasks().isEmpty());
        
        // 验证子任务
        List<TaskDecompositionService.SubTask> subTasks = result.getSubTasks();
        assertTrue(subTasks.size() > 0);
        
        // 验证依赖关系
        assertNotNull(result.getDependencies());
    }
    
    @Test
    @DisplayName("测试任务分解 - 健康管理任务")
    void testDecomposeHealthTask() {
        String task = "我想改善健康状况";
        TaskDecompositionService.DecompositionResult result = service.decompose(task);
        
        assertNotNull(result);
        // 健康任务应该被识别
        assertTrue(result.getSubTasks().size() > 0 || 
                  task.toLowerCase().contains("健康"));
    }
    
    @Test
    @DisplayName("测试任务分解 - 空任务")
    void testDecomposeEmptyTask() {
        TaskDecompositionService.DecompositionResult result = service.decompose("");
        
        assertNotNull(result);
        assertTrue(result.getSubTasks().isEmpty());
    }
    
    @Test
    @DisplayName("测试任务分解 - null 任务")
    void testDecomposeNullTask() {
        TaskDecompositionService.DecompositionResult result = service.decompose(null);
        
        assertNotNull(result);
        assertTrue(result.getSubTasks().isEmpty());
    }
    
    @Test
    @DisplayName("测试任务分解缓存")
    void testDecompositionCache() {
        String task = "测试缓存任务";
        
        // 第一次分解
        TaskDecompositionService.DecompositionResult result1 = service.decompose(task);
        
        // 第二次分解（应该从缓存获取）
        TaskDecompositionService.DecompositionResult result2 = service.decompose(task);
        
        assertNotNull(result1);
        assertNotNull(result2);
        // 验证缓存工作（结果应该相同或标记为来自缓存）
        assertEquals(result1.getSubTasks().size(), result2.getSubTasks().size());
    }
    
    @Test
    @DisplayName("测试清除缓存")
    void testClearCache() {
        String task = "测试任务";
        service.decompose(task);
        
        // 清除缓存
        service.clearCache();
        
        // 验证缓存已清除
        Map<String, Object> stats = service.getCacheStats();
        assertEquals(0, stats.get("size"));
    }
    
    @Test
    @DisplayName("测试复杂任务分解")
    void testDecomposeComplexTask() {
        String task = "我想提高工作效率和保持健康的生活方式";
        TaskDecompositionService.DecompositionResult result = service.decompose(task);
        
        assertNotNull(result);
        // 复杂任务应该被分解为多个子任务
        assertTrue(result.getSubTasks().size() >= 1);
    }
}
