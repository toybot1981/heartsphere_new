package com.heartsphere.multiagent.protocol.mcp;

import com.heartsphere.ai.mcp.entity.McpServerConfig;
import com.heartsphere.ai.mcp.repository.McpServerConfigRepository;
import com.heartsphere.ai.mcp.service.McpClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * McpToolExecutor 单元测试
 * 验证 McpToolExecutor 能够正确使用 ai.mcp 的服务执行 MCP 工具
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("McpToolExecutor 单元测试")
class McpToolExecutorTest {

    @Mock
    private McpClientService mcpClientService;

    @Mock
    private McpServerConfigRepository mcpServerConfigRepository;

    @InjectMocks
    private McpToolExecutor mcpToolExecutor;

    private McpServerConfig testServerConfig;
    private List<McpServerConfig> enabledServers;

    @BeforeEach
    void setUp() {
        // 创建测试用的 MCP 服务器配置
        testServerConfig = new McpServerConfig();
        testServerConfig.setId(1L);
        testServerConfig.setName("Test MCP Server");
        testServerConfig.setServerType("test");
        testServerConfig.setServerUrl("http://test-mcp-server");
        testServerConfig.setEnabled(true);

        enabledServers = new ArrayList<>();
        enabledServers.add(testServerConfig);
    }

    @Test
    @DisplayName("测试执行 MCP 工具 - 成功")
    void testExecuteTool_Success() {
        // 准备
        String toolName = "test-tool";
        Map<String, Object> parameters = Map.of("param1", "value1");
        Map<String, Object> expectedResult = Map.of("result", "success", "data", "test data");

        // Mock: 查找服务器配置
        when(mcpServerConfigRepository.findByEnabledTrue()).thenReturn(enabledServers);
        
        // Mock: 列出工具
        Map<String, Object> toolInfo = new HashMap<>();
        toolInfo.put("name", toolName);
        toolInfo.put("description", "Test tool");
        when(mcpClientService.listTools(testServerConfig)).thenReturn(List.of(toolInfo));
        
        // Mock: 调用工具
        when(mcpClientService.callTool(eq(testServerConfig), eq(toolName), any(Map.class)))
            .thenReturn(expectedResult);

        // 执行
        Object result = mcpToolExecutor.executeTool(toolName, parameters);

        // 验证
        assertNotNull(result);
        assertTrue(result instanceof Map);
        Map<String, Object> resultMap = (Map<String, Object>) result;
        assertEquals("success", resultMap.get("result"));
        
        // 验证调用
        verify(mcpServerConfigRepository, atLeastOnce()).findByEnabledTrue();
        verify(mcpClientService).listTools(testServerConfig);
        verify(mcpClientService).callTool(eq(testServerConfig), eq(toolName), any(Map.class));
    }

    @Test
    @DisplayName("测试执行 MCP 工具 - 工具名格式 mcp_{configId}_{toolName}")
    void testExecuteTool_WithPrefixedToolName() {
        // 准备
        String prefixedToolName = "mcp_1_test-tool";
        String actualToolName = "test-tool";
        Map<String, Object> parameters = Map.of("param1", "value1");
        Map<String, Object> expectedResult = Map.of("result", "success");

        // Mock: 查找服务器配置
        when(mcpServerConfigRepository.findByEnabledTrue()).thenReturn(enabledServers);
        
        // Mock: 列出工具
        Map<String, Object> toolInfo = new HashMap<>();
        toolInfo.put("name", actualToolName);
        when(mcpClientService.listTools(testServerConfig)).thenReturn(List.of(toolInfo));
        
        // Mock: 调用工具（应该使用解析后的工具名）
        when(mcpClientService.callTool(eq(testServerConfig), eq(actualToolName), any(Map.class)))
            .thenReturn(expectedResult);

        // 执行
        Object result = mcpToolExecutor.executeTool(prefixedToolName, parameters);

        // 验证
        assertNotNull(result);
        // 验证调用时使用的是解析后的工具名，而不是带前缀的
        verify(mcpClientService).callTool(eq(testServerConfig), eq(actualToolName), any(Map.class));
    }

    @Test
    @DisplayName("测试执行 MCP 工具 - 没有启用的服务器")
    void testExecuteTool_NoEnabledServers() {
        // 准备
        String toolName = "test-tool";
        Map<String, Object> parameters = Map.of("param1", "value1");

        // Mock: 没有启用的服务器
        when(mcpServerConfigRepository.findByEnabledTrue()).thenReturn(Collections.emptyList());

        // 执行并验证异常
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> mcpToolExecutor.executeTool(toolName, parameters));
        
        assertTrue(exception.getMessage().contains("No MCP server found"));
        verify(mcpServerConfigRepository).findByEnabledTrue();
        verify(mcpClientService, never()).callTool(any(), anyString(), any());
    }

    @Test
    @DisplayName("测试执行 MCP 工具 - 服务器已禁用")
    void testExecuteTool_ServerDisabled() {
        // 准备
        String toolName = "test-tool";
        Map<String, Object> parameters = Map.of("param1", "value1");
        
        McpServerConfig disabledConfig = new McpServerConfig();
        disabledConfig.setId(2L);
        disabledConfig.setName("Disabled Server");
        disabledConfig.setEnabled(false);
        
        when(mcpServerConfigRepository.findByEnabledTrue()).thenReturn(List.of(disabledConfig));

        // 执行并验证异常
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> mcpToolExecutor.executeTool(toolName, parameters));
        
        assertTrue(exception.getMessage().contains("No MCP server found"));
    }

    @Test
    @DisplayName("测试清除缓存")
    void testClearCache() {
        // 执行
        mcpToolExecutor.clearCache();
        
        // 验证：缓存已清除（通过后续调用验证缓存为空）
        String toolName = "test-tool";
        when(mcpServerConfigRepository.findByEnabledTrue()).thenReturn(enabledServers);
        when(mcpClientService.listTools(testServerConfig)).thenReturn(Collections.emptyList());
        
        // 第一次调用会查询数据库
        assertThrows(RuntimeException.class, 
            () -> mcpToolExecutor.executeTool(toolName, Map.of()));
        
        verify(mcpServerConfigRepository, atLeastOnce()).findByEnabledTrue();
    }

    @Test
    @DisplayName("测试刷新缓存")
    void testRefreshCache() {
        // 执行
        mcpToolExecutor.refreshCache();
        
        // 验证：缓存已刷新（通过后续调用验证会重新查询）
        String toolName = "test-tool";
        when(mcpServerConfigRepository.findByEnabledTrue()).thenReturn(enabledServers);
        when(mcpClientService.listTools(testServerConfig)).thenReturn(Collections.emptyList());
        
        assertThrows(RuntimeException.class, 
            () -> mcpToolExecutor.executeTool(toolName, Map.of()));
        
        verify(mcpServerConfigRepository, atLeastOnce()).findByEnabledTrue();
    }
}
