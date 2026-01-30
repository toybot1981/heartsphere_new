package com.heartsphere.multiagent.protocol.mcp;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * MCP 协议接口
 * 
 * 为智能体提供标准化的 MCP 工具和上下文访问接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface McpProtocol {
    
    /**
     * 获取智能体可访问的工具列表
     * 
     * @param agentId 智能体 ID
     * @return 工具列表
     */
    List<McpTool> getAvailableTools(String agentId);
    
    /**
     * 执行 MCP 工具
     * 
     * @param agentId 智能体 ID
     * @param toolName 工具名称
     * @param parameters 工具参数
     * @return 执行结果
     */
    McpToolResult executeTool(String agentId, String toolName, Map<String, Object> parameters);
    
    /**
     * 共享上下文信息
     * 
     * @param fromAgentId 发送者智能体 ID
     * @param toAgentIds 接收者智能体 ID 列表（null 表示广播）
     * @param context 上下文信息
     */
    void shareContext(String fromAgentId, List<String> toAgentIds, Map<String, Object> context);
    
    /**
     * 获取共享的上下文信息
     * 
     * @param agentId 智能体 ID
     * @return 上下文信息
     */
    Map<String, Object> getSharedContext(String agentId);
    
    /**
     * 检查智能体是否有权限访问指定工具
     * 
     * @param agentId 智能体 ID
     * @param toolName 工具名称
     * @return 是否有权限
     */
    boolean hasToolAccess(String agentId, String toolName);
    
    /**
     * MCP 工具定义
     */
    class McpTool {
        private String name;
        private String description;
        private Map<String, Object> schema;
        private Set<String> requiredPermissions;
        
        // Getters and Setters
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public Map<String, Object> getSchema() {
            return schema;
        }
        
        public void setSchema(Map<String, Object> schema) {
            this.schema = schema;
        }
        
        public Set<String> getRequiredPermissions() {
            return requiredPermissions;
        }
        
        public void setRequiredPermissions(Set<String> requiredPermissions) {
            this.requiredPermissions = requiredPermissions;
        }
    }
    
    /**
     * MCP 工具执行结果
     */
    class McpToolResult {
        private boolean success;
        private Object result;
        private String errorMessage;
        
        public McpToolResult(boolean success, Object result) {
            this.success = success;
            this.result = result;
        }
        
        public static McpToolResult success(Object result) {
            return new McpToolResult(true, result);
        }
        
        public static McpToolResult failure(String errorMessage) {
            McpToolResult result = new McpToolResult(false, null);
            result.errorMessage = errorMessage;
            return result;
        }
        
        // Getters and Setters
        public boolean isSuccess() {
            return success;
        }
        
        public void setSuccess(boolean success) {
            this.success = success;
        }
        
        public Object getResult() {
            return result;
        }
        
        public void setResult(Object result) {
            this.result = result;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
        
        public void setErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
        }
    }
}
