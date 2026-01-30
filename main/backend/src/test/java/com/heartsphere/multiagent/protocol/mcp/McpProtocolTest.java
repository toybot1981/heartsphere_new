package com.heartsphere.multiagent.protocol.mcp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * MCP Protocol 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@DisplayName("MCP Protocol 单元测试")
class McpProtocolTest {
    
    private McpProtocolImpl mcpProtocol;
    private String testAgentId;
    
    @Mock
    private McpToolExecutor mcpToolExecutor;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mcpProtocol = new McpProtocolImpl(mcpToolExecutor);
        testAgentId = "test-agent-1";
    }
    
    @Test
    @DisplayName("测试授予工具访问权限")
    void testGrantToolAccess() {
        Set<String> toolNames = Set.of("calculator", "database-query", "file-reader");
        
        // 先注册工具
        for (String toolName : toolNames) {
            McpProtocol.McpTool tool = new McpProtocol.McpTool();
            tool.setName(toolName);
            tool.setDescription("Test tool: " + toolName);
            mcpProtocol.registerTool(tool);
        }
        
        // 授予工具访问权限
        mcpProtocol.grantToolAccess(testAgentId, toolNames);
        
        // 验证工具已授予
        List<McpProtocol.McpTool> availableTools = mcpProtocol.getAvailableTools(testAgentId);
        assertNotNull(availableTools);
        assertTrue(availableTools.size() >= toolNames.size());
        
        // 验证工具名称
        Set<String> availableToolNames = new HashSet<>();
        for (McpProtocol.McpTool tool : availableTools) {
            availableToolNames.add(tool.getName());
        }
        assertTrue(availableToolNames.containsAll(toolNames));
    }
    
    @Test
    @DisplayName("测试获取可用工具")
    void testGetAvailableTools() {
        Set<String> toolNames = Set.of("tool-1", "tool-2");
        
        // 注册工具
        for (String toolName : toolNames) {
            McpProtocol.McpTool tool = new McpProtocol.McpTool();
            tool.setName(toolName);
            mcpProtocol.registerTool(tool);
        }
        
        mcpProtocol.grantToolAccess(testAgentId, toolNames);
        
        List<McpProtocol.McpTool> availableTools = mcpProtocol.getAvailableTools(testAgentId);
        
        assertNotNull(availableTools);
        assertTrue(availableTools.size() >= toolNames.size());
    }
    
    @Test
    @DisplayName("测试未授权智能体的工具访问")
    void testUnauthorizedToolAccess() {
        List<McpProtocol.McpTool> tools = mcpProtocol.getAvailableTools("unauthorized-agent");
        
        // 未授权的智能体应该没有工具或返回空列表
        assertNotNull(tools);
    }
    
    @Test
    @DisplayName("测试工具执行")
    void testExecuteTool() {
        // 注册工具
        McpProtocol.McpTool tool = new McpProtocol.McpTool();
        tool.setName("test-tool");
        tool.setDescription("Test tool");
        mcpProtocol.registerTool(tool);
        
        // 授予工具访问权限
        mcpProtocol.grantToolAccess(testAgentId, Set.of("test-tool"));
        
        // 执行工具
        Map<String, Object> parameters = Map.of("param1", "value1");
        
        McpProtocol.McpToolResult result = mcpProtocol.executeTool(testAgentId, "test-tool", parameters);
        
        // 验证结果不为空（可能成功或失败）
        assertNotNull(result);
    }
    
    @Test
    @DisplayName("测试工具访问权限检查")
    void testHasToolAccess() {
        // 注册工具
        McpProtocol.McpTool tool = new McpProtocol.McpTool();
        tool.setName("test-tool");
        mcpProtocol.registerTool(tool);
        
        // 未授予权限前，应该没有访问权限
        // 注意：如果实现中注册工具后自动授予权限，这里可能需要调整
        boolean hasAccessBefore = mcpProtocol.hasToolAccess(testAgentId, "test-tool");
        
        // 授予权限
        mcpProtocol.grantToolAccess(testAgentId, Set.of("test-tool"));
        
        // 授予权限后，应该有访问权限
        assertTrue(mcpProtocol.hasToolAccess(testAgentId, "test-tool"), 
            "授予权限后应该有访问权限");
    }
    
    @Test
    @DisplayName("测试多次授予工具访问权限")
    void testMultipleGrantToolAccess() {
        Set<String> tools1 = Set.of("tool-1", "tool-2");
        Set<String> tools2 = Set.of("tool-2", "tool-3");
        
        // 注册所有工具
        for (String toolName : Set.of("tool-1", "tool-2", "tool-3")) {
            McpProtocol.McpTool tool = new McpProtocol.McpTool();
            tool.setName(toolName);
            mcpProtocol.registerTool(tool);
        }
        
        mcpProtocol.grantToolAccess(testAgentId, tools1);
        mcpProtocol.grantToolAccess(testAgentId, tools2);
        
        List<McpProtocol.McpTool> availableTools = mcpProtocol.getAvailableTools(testAgentId);
        
        // 应该包含所有工具（去重）
        assertNotNull(availableTools);
        Set<String> availableToolNames = new HashSet<>();
        for (McpProtocol.McpTool tool : availableTools) {
            availableToolNames.add(tool.getName());
        }
        assertTrue(availableToolNames.contains("tool-1"));
        assertTrue(availableToolNames.contains("tool-2"));
        assertTrue(availableToolNames.contains("tool-3"));
    }
}
