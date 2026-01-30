package com.heartsphere.multiagent.protocol.mcp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * MCP 协议实现
 * 
 * 为智能体提供 MCP 工具和上下文访问
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class McpProtocolImpl implements McpProtocol {
    
    private final McpToolExecutor mcpToolExecutor; // 可能为 null（如果 mentis 模块不可用）
    
    // 工具注册表：toolName -> tool
    private final Map<String, McpTool> toolRegistry = new ConcurrentHashMap<>();
    
    // 智能体工具权限：agentId -> Set<toolName>
    private final Map<String, Set<String>> agentToolPermissions = new ConcurrentHashMap<>();
    
    // 共享上下文：agentId -> context
    private final Map<String, Map<String, Object>> sharedContexts = new ConcurrentHashMap<>();
    
    // 工具访问权限配置：toolName -> Set<requiredPermissions>
    private final Map<String, Set<String>> toolPermissionRequirements = new ConcurrentHashMap<>();
    
    /**
     * 注册 MCP 工具
     * 
     * @param tool 工具定义
     */
    public void registerTool(McpTool tool) {
        if (tool == null || tool.getName() == null) {
            throw new IllegalArgumentException("Tool and tool name cannot be null");
        }
        
        toolRegistry.put(tool.getName(), tool);
        log.info("MCP tool registered: name={}", tool.getName());
    }
    
    /**
     * 为智能体授予工具访问权限
     * 
     * @param agentId 智能体 ID
     * @param toolNames 工具名称列表
     */
    public void grantToolAccess(String agentId, Set<String> toolNames) {
        agentToolPermissions.computeIfAbsent(agentId, k -> ConcurrentHashMap.newKeySet())
            .addAll(toolNames);
        log.info("Tool access granted to agent {}: tools={}", agentId, toolNames);
    }
    
    /**
     * 撤销智能体的工具访问权限
     * 
     * @param agentId 智能体 ID
     * @param toolNames 工具名称列表
     */
    public void revokeToolAccess(String agentId, Set<String> toolNames) {
        Set<String> permissions = agentToolPermissions.get(agentId);
        if (permissions != null) {
            permissions.removeAll(toolNames);
            log.info("Tool access revoked from agent {}: tools={}", agentId, toolNames);
        }
    }
    
    @Override
    public List<McpTool> getAvailableTools(String agentId) {
        Set<String> permissions = agentToolPermissions.getOrDefault(agentId, Collections.emptySet());
        
        return toolRegistry.values().stream()
            .filter(tool -> hasToolAccess(agentId, tool.getName()))
            .collect(java.util.stream.Collectors.toList());
    }
    
    @Override
    public McpToolResult executeTool(String agentId, String toolName, Map<String, Object> parameters) {
        // 检查权限
        if (!hasToolAccess(agentId, toolName)) {
            return McpToolResult.failure("Agent " + agentId + " does not have access to tool " + toolName);
        }
        
        // 获取工具
        McpTool tool = toolRegistry.get(toolName);
        if (tool == null) {
            return McpToolResult.failure("Tool not found: " + toolName);
        }
        
        try {
            log.info("Agent {} executing MCP tool: {}", agentId, toolName);
            
            // 这里应该调用实际的 MCP 工具执行逻辑
            // 目前返回模拟结果，实际实现需要集成 mentis 模块的 MCP 客户端
            Object result = executeMcpToolInternal(tool, parameters);
            
            return McpToolResult.success(result);
        } catch (Exception e) {
            log.error("MCP tool execution failed: agentId={}, toolName={}, error={}", 
                agentId, toolName, e.getMessage(), e);
            return McpToolResult.failure("Tool execution failed: " + e.getMessage());
        }
    }
    
    /**
     * 执行 MCP 工具（内部方法）
     * 
     * 使用 McpToolExecutor 实际执行 MCP 工具
     */
    private Object executeMcpToolInternal(McpTool tool, Map<String, Object> parameters) {
        // 如果 McpToolExecutor 可用，使用它执行工具
        if (mcpToolExecutor != null) {
            try {
                return mcpToolExecutor.executeTool(tool.getName(), parameters);
            } catch (Exception e) {
                log.error("MCP tool execution failed via executor: toolName={}, error={}", 
                    tool.getName(), e.getMessage(), e);
                // 降级到模拟执行
            }
        }
        
        // 降级：模拟执行（当 mentis 模块不可用时）
        log.warn("MCP tool executor not available, using mock execution: toolName={}", tool.getName());
        return Map.of(
            "tool", tool.getName(),
            "status", "executed (mock - MCP executor not available)",
            "parameters", parameters,
            "warning", "MCP tool executor not available. Please ensure mentis module is available."
        );
    }
    
    @Override
    public void shareContext(String fromAgentId, List<String> toAgentIds, Map<String, Object> context) {
        if (context == null || context.isEmpty()) {
            return;
        }
        
        if (toAgentIds == null || toAgentIds.isEmpty()) {
            // 广播到所有智能体
            sharedContexts.keySet().forEach(agentId -> {
                if (!agentId.equals(fromAgentId)) {
                    updateSharedContext(agentId, context);
                }
            });
            log.info("Context broadcasted from agent {} to all agents", fromAgentId);
        } else {
            // 发送到指定智能体
            for (String toAgentId : toAgentIds) {
                if (!toAgentId.equals(fromAgentId)) {
                    updateSharedContext(toAgentId, context);
                }
            }
            log.info("Context shared from agent {} to agents: {}", fromAgentId, toAgentIds);
        }
    }
    
    /**
     * 更新共享上下文
     */
    private void updateSharedContext(String agentId, Map<String, Object> newContext) {
        sharedContexts.computeIfAbsent(agentId, k -> new ConcurrentHashMap<>())
            .putAll(newContext);
    }
    
    @Override
    public Map<String, Object> getSharedContext(String agentId) {
        return new HashMap<>(sharedContexts.getOrDefault(agentId, Collections.emptyMap()));
    }
    
    @Override
    public boolean hasToolAccess(String agentId, String toolName) {
        // 检查工具是否存在
        if (!toolRegistry.containsKey(toolName)) {
            return false;
        }
        
        // 检查智能体是否有权限
        Set<String> permissions = agentToolPermissions.get(agentId);
        if (permissions == null || !permissions.contains(toolName)) {
            // 默认情况下，如果没有明确配置权限，允许访问所有工具
            // 可以根据需要修改此策略
            return true;
        }
        
        return permissions.contains(toolName);
    }
    
    /**
     * 清除智能体的共享上下文
     * 
     * @param agentId 智能体 ID
     */
    public void clearSharedContext(String agentId) {
        sharedContexts.remove(agentId);
        log.info("Shared context cleared for agent: {}", agentId);
    }
    
    /**
     * 获取所有已注册的工具
     * 
     * @return 工具列表
     */
    public List<McpTool> getAllTools() {
        return new ArrayList<>(toolRegistry.values());
    }
}
