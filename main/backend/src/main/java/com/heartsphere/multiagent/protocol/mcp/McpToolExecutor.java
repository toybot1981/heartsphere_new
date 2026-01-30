package com.heartsphere.multiagent.protocol.mcp;

import com.heartsphere.ai.mcp.entity.McpServerConfig;
import com.heartsphere.ai.mcp.repository.McpServerConfigRepository;
import com.heartsphere.ai.mcp.service.McpClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * MCP 工具执行器
 *
 * 依赖 main 项目 ai.mcp 的 McpClientService 与 McpServerConfigRepository 执行 MCP 工具，
 * 与 skill 的 mcp_tool_config、multiagent 约定兼容（工具名格式 mcp_{configId}_{toolName} 等）。
 *
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class McpToolExecutor {

    private final McpClientService mcpClientService;
    private final McpServerConfigRepository mcpServerConfigRepository;

    private final Map<String, McpServerConfig> toolToServerCache = new HashMap<>();

    /**
     * 执行 MCP 工具
     *
     * @param toolName 工具名称（支持 mcp_{configId}_{toolName} 或仅 toolName）
     * @param parameters 工具参数
     * @return 执行结果
     */
    public Object executeTool(String toolName, Map<String, Object> parameters) {
        try {
            log.info("Executing MCP tool: toolName={}, parameters={}", toolName, parameters);

            McpServerConfig serverConfig = findServerConfigForTool(toolName);
            if (serverConfig == null) {
                throw new RuntimeException("No MCP server found for tool: " + toolName);
            }

            if (!Boolean.TRUE.equals(serverConfig.getEnabled())) {
                throw new RuntimeException("MCP server is disabled: " + serverConfig.getName());
            }

            String resolvedToolName = resolveToolName(toolName, serverConfig);
            Map<String, Object> result = mcpClientService.callTool(serverConfig, resolvedToolName, parameters);

            log.info("MCP tool executed successfully: toolName={}", toolName);
            return result;

        } catch (Exception e) {
            log.error("Failed to execute MCP tool: toolName={}, error={}", toolName, e.getMessage(), e);
            throw new RuntimeException("MCP tool execution failed: " + e.getMessage(), e);
        }
    }

    /**
     * 解析工具名：若为 mcp_{configId}_{toolName} 则提取 toolName；否则原样返回
     */
    private String resolveToolName(String toolName, McpServerConfig config) {
        String prefix = "mcp_" + config.getId() + "_";
        if (toolName != null && toolName.startsWith(prefix)) {
            return toolName.substring(prefix.length());
        }
        return toolName;
    }

    /**
     * 查找工具对应的 MCP 服务器配置
     */
    private McpServerConfig findServerConfigForTool(String toolName) {
        if (toolToServerCache.containsKey(toolName)) {
            return toolToServerCache.get(toolName);
        }

        List<McpServerConfig> enabledServers = mcpServerConfigRepository.findByEnabledTrue();
        if (enabledServers.isEmpty()) {
            log.warn("No enabled MCP servers found");
            return null;
        }

        for (McpServerConfig server : enabledServers) {
            try {
                List<Map<String, Object>> tools = mcpClientService.listTools(server);
                for (Map<String, Object> tool : tools) {
                    Object nameObj = tool.get("name");
                    String name = nameObj != null ? nameObj.toString() : null;
                    if (toolName.equals(name) || (name != null && ("mcp_" + server.getId() + "_" + name).equals(toolName))) {
                        toolToServerCache.put(toolName, server);
                        log.info("Found MCP server for tool: toolName={}, serverName={}", toolName, server.getName());
                        return server;
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to list tools from server: serverName={}, error={}", server.getName(), e.getMessage());
            }
        }

        log.warn("No MCP server found for tool: toolName={}", toolName);
        return null;
    }
    
    /**
     * 清除缓存
     */
    public void clearCache() {
        toolToServerCache.clear();
        log.info("MCP tool-to-server cache cleared");
    }
    
    /**
     * 刷新缓存（重新查找工具到服务器的映射）
     */
    public void refreshCache() {
        clearCache();
        log.info("MCP tool-to-server cache refreshed");
    }
}
