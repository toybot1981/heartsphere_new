package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.PromptTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 提示词模板渲染服务测试
 */
@SpringBootTest
public class PromptRenderServiceTest {
    
    @Autowired
    private PromptRenderService renderService;
    
    private PromptTemplate template;
    
    @BeforeEach
    void setUp() {
        template = new PromptTemplate();
    }
    
    @Test
    void testBasicVariableReplacement() {
        template.setSystemPrompt("你好，{{name}}！");
        template.setUserPrompt("用户：{{user}}");
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("name", "世界");
        variables.put("user", "测试用户");
        
        var response = renderService.render(template, variables);
        
        assertEquals("你好，世界！", response.getSystemPrompt());
        assertEquals("用户：测试用户", response.getUserPrompt());
    }
    
    @Test
    void testVariableWithDefaultValue() {
        template.setSystemPrompt("你好，{{name|用户}}！");
        
        Map<String, Object> variables = new HashMap<>();
        // name未定义，应使用默认值
        
        var response = renderService.render(template, variables);
        
        assertEquals("你好，用户！", response.getSystemPrompt());
    }
    
    @Test
    void testIfCondition() {
        template.setSystemPrompt("{{#if hasContext}}上下文：{{context}}{{/if}}");
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("hasContext", true);
        variables.put("context", "测试上下文");
        
        var response = renderService.render(template, variables);
        
        assertEquals("上下文：测试上下文", response.getSystemPrompt());
    }
    
    @Test
    void testIfElseCondition() {
        template.setSystemPrompt("{{#if hasContext}}有上下文{{else}}无上下文{{/if}}");
        
        Map<String, Object> variables1 = new HashMap<>();
        variables1.put("hasContext", true);
        var response1 = renderService.render(template, variables1);
        assertEquals("有上下文", response1.getSystemPrompt());
        
        Map<String, Object> variables2 = new HashMap<>();
        variables2.put("hasContext", false);
        var response2 = renderService.render(template, variables2);
        assertEquals("无上下文", response2.getSystemPrompt());
    }
    
    @Test
    void testIfConditionWithComparison() {
        template.setSystemPrompt("{{#if status == \"active\"}}状态：活跃{{else}}状态：非活跃{{/if}}");
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("status", "active");
        
        var response = renderService.render(template, variables);
        
        assertEquals("状态：活跃", response.getSystemPrompt());
    }
    
    @Test
    void testEachLoop() {
        template.setSystemPrompt("列表：{{#each items}}{{this}} {{/each}}");
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("items", Arrays.asList("A", "B", "C"));
        
        var response = renderService.render(template, variables);
        
        assertEquals("列表：A B C ", response.getSystemPrompt());
    }
    
    @Test
    void testEachLoopWithIndex() {
        template.setSystemPrompt("{{#each items}}{{@index}}. {{this}}\n{{/each}}");
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("items", Arrays.asList("第一项", "第二项", "第三项"));
        
        var response = renderService.render(template, variables);
        
        assertTrue(response.getSystemPrompt().contains("0. 第一项"));
        assertTrue(response.getSystemPrompt().contains("1. 第二项"));
        assertTrue(response.getSystemPrompt().contains("2. 第三项"));
    }
    
    @Test
    void testEachLoopWithObjectArray() {
        template.setSystemPrompt("{{#each users}}{{name}} ({{email}})\n{{/each}}");
        
        Map<String, Object> variables = new HashMap<>();
        List<Map<String, Object>> users = new ArrayList<>();
        Map<String, Object> user1 = new HashMap<>();
        user1.put("name", "张三");
        user1.put("email", "zhangsan@example.com");
        users.add(user1);
        Map<String, Object> user2 = new HashMap<>();
        user2.put("name", "李四");
        user2.put("email", "lisi@example.com");
        users.add(user2);
        variables.put("users", users);
        
        var response = renderService.render(template, variables);
        
        assertTrue(response.getSystemPrompt().contains("张三 (zhangsan@example.com)"));
        assertTrue(response.getSystemPrompt().contains("李四 (lisi@example.com)"));
    }
    
    @Test
    void testNestedIfInEach() {
        template.setSystemPrompt("{{#each items}}{{#if @first}}【开始】{{/if}}{{this}}{{#if @last}}【结束】{{/if}}\n{{/each}}");
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("items", Arrays.asList("A", "B", "C"));
        
        var response = renderService.render(template, variables);
        
        assertTrue(response.getSystemPrompt().contains("【开始】"));
        assertTrue(response.getSystemPrompt().contains("【结束】"));
    }
    
    @Test
    void testNestedEachInIf() {
        template.setSystemPrompt("{{#if hasItems}}列表：{{#each items}}{{this}} {{/each}}{{/if}}");
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("hasItems", true);
        variables.put("items", Arrays.asList("A", "B"));
        
        var response = renderService.render(template, variables);
        
        assertEquals("列表：A B ", response.getSystemPrompt());
    }
    
    @Test
    void testEmptyCollection() {
        template.setSystemPrompt("{{#each items}}{{this}}{{/each}}");
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("items", Collections.emptyList());
        
        var response = renderService.render(template, variables);
        
        assertEquals("", response.getSystemPrompt());
    }
    
    @Test
    void testNullVariable() {
        template.setSystemPrompt("值：{{value|默认值}}");
        
        Map<String, Object> variables = new HashMap<>();
        // value未定义
        
        var response = renderService.render(template, variables);
        
        assertEquals("值：默认值", response.getSystemPrompt());
    }
}
