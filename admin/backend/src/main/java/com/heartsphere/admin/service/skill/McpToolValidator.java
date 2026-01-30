package com.heartsphere.admin.service.skill;

import com.heartsphere.admin.service.MentisManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * MCP工具验证服务
 * 验证MCP工具可用性、服务器连接等
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class McpToolValidator {
    
    private final MentisManagementService mentisManagementService;
    
    /**
     * 验证MCP工具可用性
     * 
     * @param mcpConfigId MCP服务器配置ID
     * @param toolNames 工具名称列表
     * @return 验证结果
     */
    public McpToolValidationResult validateToolAvailability(Long mcpConfigId, List<String> toolNames) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        if (mcpConfigId == null) {
            errors.add("MCP服务器配置ID不能为空");
            return new McpToolValidationResult(false, errors, warnings, null);
        }
        
        if (toolNames == null || toolNames.isEmpty()) {
            warnings.add("未选择任何MCP工具");
            return new McpToolValidationResult(true, errors, warnings, null);
        }
        
        try {
            // 获取MCP配置
            var mcpConfig = mentisManagementService.getMcpConfig(mcpConfigId);
            if (mcpConfig == null) {
                errors.add("MCP服务器配置不存在: " + mcpConfigId);
                return new McpToolValidationResult(false, errors, warnings, null);
            }
            
            // 检查配置是否启用
            if (!Boolean.TRUE.equals(mcpConfig.getEnabled())) {
                errors.add("MCP服务器配置未启用: " + mcpConfig.getName());
                return new McpToolValidationResult(false, errors, warnings, null);
            }
            
            // 获取可用工具列表
            List<Object> availableToolsObj = mentisManagementService.getMcpTools(mcpConfigId);
            if (availableToolsObj == null || availableToolsObj.isEmpty()) {
                errors.add("无法获取MCP服务器工具列表，请检查服务器连接");
                return new McpToolValidationResult(false, errors, warnings, null);
            }
            
            // 提取工具名称
            @SuppressWarnings("unchecked")
            Set<String> availableToolNames = availableToolsObj.stream()
                .filter(obj -> obj instanceof Map)
                .map(obj -> (Map<String, Object>) obj)
                .map(tool -> (String) tool.get("name"))
                .filter(name -> name != null)
                .collect(Collectors.toSet());
            
            // 验证每个工具是否可用
            List<String> unavailableTools = new ArrayList<>();
            for (String toolName : toolNames) {
                if (!availableToolNames.contains(toolName)) {
                    unavailableTools.add(toolName);
                }
            }
            
            if (!unavailableTools.isEmpty()) {
                errors.add("以下工具在MCP服务器中不可用: " + String.join(", ", unavailableTools));
                return new McpToolValidationResult(false, errors, warnings, availableToolNames);
            }
            
            // 测试服务器连接
            boolean connectionTest = mentisManagementService.testMcpConnection(mcpConfigId);
            if (!connectionTest) {
                warnings.add("MCP服务器连接测试失败，但工具配置已保存");
            }
            
            return new McpToolValidationResult(true, errors, warnings, availableToolNames);
            
        } catch (Exception e) {
            log.error("验证MCP工具可用性失败: {}", e.getMessage(), e);
            errors.add("验证MCP工具可用性时发生错误: " + e.getMessage());
            return new McpToolValidationResult(false, errors, warnings, null);
        }
    }
    
    /**
     * 获取所有可用的MCP工具
     * 
     * @return MCP工具信息列表
     */
    public List<McpToolInfo> getAvailableTools() {
        List<McpToolInfo> allTools = new ArrayList<>();
        
        try {
            // 获取所有已启用的MCP配置
            var configs = mentisManagementService.getMcpConfigs();
            if (configs == null) {
                return allTools;
            }
            
            for (var config : configs) {
                if (!Boolean.TRUE.equals(config.getEnabled())) {
                    continue;
                }
                
                try {
                    List<Object> toolsObj = mentisManagementService.getMcpTools(config.getId());
                    if (toolsObj != null) {
                        for (Object toolObj : toolsObj) {
                            if (toolObj instanceof Map) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> tool = (Map<String, Object>) toolObj;
                                McpToolInfo info = new McpToolInfo();
                                info.setMcpConfigId(config.getId());
                                info.setMcpConfigName(config.getName());
                                info.setToolName((String) tool.get("name"));
                                info.setToolDescription((String) tool.get("description"));
                                info.setToolInputSchema(tool.get("inputSchema"));
                                allTools.add(info);
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("获取MCP配置 {} 的工具列表失败: {}", config.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("获取可用MCP工具列表失败: {}", e.getMessage(), e);
        }
        
        return allTools;
    }
    
    /**
     * MCP工具验证结果
     */
    public static class McpToolValidationResult {
        private final boolean valid;
        private final List<String> errors;
        private final List<String> warnings;
        private final Set<String> availableToolNames;
        
        public McpToolValidationResult(boolean valid, List<String> errors, List<String> warnings, Set<String> availableToolNames) {
            this.valid = valid;
            this.errors = errors != null ? errors : new ArrayList<>();
            this.warnings = warnings != null ? warnings : new ArrayList<>();
            this.availableToolNames = availableToolNames;
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public List<String> getErrors() {
            return errors;
        }
        
        public List<String> getWarnings() {
            return warnings;
        }
        
        public Set<String> getAvailableToolNames() {
            return availableToolNames;
        }
    }
    
    /**
     * MCP工具信息
     */
    public static class McpToolInfo {
        private Long mcpConfigId;
        private String mcpConfigName;
        private String toolName;
        private String toolDescription;
        private Object toolInputSchema;
        
        // Getters and Setters
        public Long getMcpConfigId() {
            return mcpConfigId;
        }
        
        public void setMcpConfigId(Long mcpConfigId) {
            this.mcpConfigId = mcpConfigId;
        }
        
        public String getMcpConfigName() {
            return mcpConfigName;
        }
        
        public void setMcpConfigName(String mcpConfigName) {
            this.mcpConfigName = mcpConfigName;
        }
        
        public String getToolName() {
            return toolName;
        }
        
        public void setToolName(String toolName) {
            this.toolName = toolName;
        }
        
        public String getToolDescription() {
            return toolDescription;
        }
        
        public void setToolDescription(String toolDescription) {
            this.toolDescription = toolDescription;
        }
        
        public Object getToolInputSchema() {
            return toolInputSchema;
        }
        
        public void setToolInputSchema(Object toolInputSchema) {
            this.toolInputSchema = toolInputSchema;
        }
    }
}
