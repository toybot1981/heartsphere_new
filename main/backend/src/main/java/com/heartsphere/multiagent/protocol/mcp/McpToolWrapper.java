package com.heartsphere.multiagent.protocol.mcp;

import com.heartsphere.multiagent.core.Agent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * MCP 工具包装器
 * 
 * 将 MCP 工具包装为智能体可使用的工具
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RequiredArgsConstructor
public class McpToolWrapper {
    
    private final McpProtocol mcpProtocol;
    private final String agentId;
    
    /**
     * 为智能体创建 MCP 工具包装器
     * 
     * @param mcpProtocol MCP 协议实例
     * @param agent 智能体
     * @return MCP 工具包装器
     */
    public static McpToolWrapper forAgent(McpProtocol mcpProtocol, Agent agent) {
        return new McpToolWrapper(mcpProtocol, agent.getId());
    }
    
    /**
     * 获取智能体可用的工具列表
     * 
     * @return 工具列表
     */
    public java.util.List<McpProtocol.McpTool> getAvailableTools() {
        return mcpProtocol.getAvailableTools(agentId);
    }
    
    /**
     * 执行工具
     * 
     * @param toolName 工具名称
     * @param parameters 工具参数
     * @return 执行结果
     */
    public McpProtocol.McpToolResult execute(String toolName, Map<String, Object> parameters) {
        return mcpProtocol.executeTool(agentId, toolName, parameters);
    }
    
    /**
     * 检查是否有权限访问工具
     * 
     * @param toolName 工具名称
     * @return 是否有权限
     */
    public boolean canAccess(String toolName) {
        return mcpProtocol.hasToolAccess(agentId, toolName);
    }
    
    /**
     * 获取共享上下文
     * 
     * @return 上下文信息
     */
    public Map<String, Object> getSharedContext() {
        return mcpProtocol.getSharedContext(agentId);
    }
    
    /**
     * 共享上下文给其他智能体
     * 
     * @param toAgentIds 接收者智能体 ID 列表（null 表示广播）
     * @param context 上下文信息
     */
    public void shareContext(java.util.List<String> toAgentIds, Map<String, Object> context) {
        mcpProtocol.shareContext(agentId, toAgentIds, context);
    }
}
