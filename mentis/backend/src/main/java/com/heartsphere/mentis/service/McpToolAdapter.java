package com.heartsphere.mentis.service;

import com.heartsphere.mentis.entity.McpServerConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * MCP 工具适配器
 * 将 MCP 工具转换为 AI 服务可以使用的工具格式
 */
@Component
@Slf4j
@lombok.RequiredArgsConstructor
public class McpToolAdapter {

    private final McpClientService mcpClientService;
    private final McpConfigService mcpConfigService;

    /**
     * 获取所有可用的 MCP 工具（转换为函数定义格式）
     */
    public List<FunctionDefinition> getAvailableTools() {
        List<FunctionDefinition> tools = new ArrayList<>();
        
        try {
            List<McpServerConfig> enabledConfigs = mcpConfigService.getEnabledConfigs();
            
            for (McpServerConfig config : enabledConfigs) {
                try {
                    List<Map<String, Object>> mcpTools = mcpClientService.listTools(config);
                    
                    for (Map<String, Object> mcpTool : mcpTools) {
                        FunctionDefinition tool = convertMcpToolToFunction(mcpTool, config);
                        if (tool != null) {
                            tools.add(tool);
                        }
                    }
                } catch (Exception e) {
                    log.warn("无法从 MCP 服务器 {} 获取工具: {}", config.getName(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("获取 MCP 工具失败", e);
        }
        
        return tools;
    }

    /**
     * 调用 MCP 工具
     */
    public ToolExecutionResult executeTool(String toolName, Map<String, Object> arguments) {
        // 工具名称格式: mcp_{configId}_{toolName}
        if (!toolName.startsWith("mcp_")) {
            throw new IllegalArgumentException("无效的 MCP 工具名称: " + toolName);
        }
        
        String[] parts = toolName.substring(4).split("_", 2);
        if (parts.length != 2) {
            throw new IllegalArgumentException("无效的 MCP 工具名称格式: " + toolName);
        }
        
        Long configId = Long.parseLong(parts[0]);
        String actualToolName = parts[1];
        
        try {
            McpServerConfig config = mcpConfigService.getConfig(configId);
            Map<String, Object> result = mcpClientService.callTool(config, actualToolName, arguments);
            
            return ToolExecutionResult.builder()
                    .success(true)
                    .result(result)
                    .message("工具执行成功")
                    .build();
        } catch (Exception e) {
            log.error("执行 MCP 工具失败: {}", toolName, e);
            return ToolExecutionResult.builder()
                    .success(false)
                    .result(null)
                    .message("工具执行失败: " + e.getMessage())
                    .build();
        }
    }

    /**
     * 将 MCP 工具转换为函数定义
     */
    @SuppressWarnings("unchecked")
    private FunctionDefinition convertMcpToolToFunction(Map<String, Object> mcpTool, McpServerConfig config) {
        try {
            String toolName = (String) mcpTool.get("name");
            if (toolName == null) {
                return null;
            }
            
            // 生成唯一的工具名称: mcp_{configId}_{toolName}
            String functionName = "mcp_" + config.getId() + "_" + toolName;
            
            String description = (String) mcpTool.getOrDefault("description", "");
            
            // 获取输入模式
            Map<String, Object> inputSchema = (Map<String, Object>) mcpTool.get("inputSchema");
            if (inputSchema == null) {
                inputSchema = new HashMap<>();
            }
            
            // 转换为函数参数格式
            Map<String, Object> parameters = convertInputSchemaToParameters(inputSchema);
            
            return FunctionDefinition.builder()
                    .name(functionName)
                    .description(description)
                    .parameters(parameters)
                    .mcpConfigId(config.getId())
                    .mcpToolName(toolName)
                    .build();
        } catch (Exception e) {
            log.error("转换 MCP 工具失败", e);
            return null;
        }
    }

    /**
     * 将 MCP 输入模式转换为函数参数格式
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> convertInputSchemaToParameters(Map<String, Object> inputSchema) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("type", inputSchema.getOrDefault("type", "object"));
        
        Map<String, Object> properties = (Map<String, Object>) inputSchema.get("properties");
        if (properties != null) {
            parameters.put("properties", properties);
        }
        
        List<String> required = (List<String>) inputSchema.get("required");
        if (required != null) {
            parameters.put("required", required);
        }
        
        return parameters;
    }

    /**
     * 函数定义
     */
    @lombok.Data
    @lombok.Builder
    public static class FunctionDefinition {
        private String name;
        private String description;
        private Map<String, Object> parameters;
        private Long mcpConfigId;
        private String mcpToolName;
    }

    /**
     * 工具执行结果
     */
    @lombok.Data
    @lombok.Builder
    public static class ToolExecutionResult {
        private boolean success;
        private Map<String, Object> result;
        private String message;
    }
}
