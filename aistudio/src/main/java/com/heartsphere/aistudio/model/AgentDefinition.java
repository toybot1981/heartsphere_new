package com.heartsphere.aistudio.model;

import lombok.Data;
import java.util.Map;
import java.util.List;

/**
 * Agent 定义
 * 用于描述一个 Agent 的配置和能力
 */
@Data
public class AgentDefinition {
    /**
     * Agent ID
     */
    private String id;
    
    /**
     * Agent 名称
     */
    private String name;
    
    /**
     * Agent 描述
     */
    private String description;
    
    /**
     * Agent 类型：text, image, audio, video, multimodal
     */
    private AgentType type;
    
    /**
     * 使用的大模型提供商：alibaba, openai, ollama
     */
    private String provider;
    
    /**
     * 模型名称
     */
    private String model;
    
    /**
     * 工作流定义（Graph 配置）
     */
    private WorkflowConfig workflow;
    
    /**
     * Agent 能力配置
     */
    private Capabilities capabilities;
    
    /**
     * 工具列表（Tool 定义）
     */
    private List<ToolDefinition> tools;
    
    /**
     * 系统提示词
     */
    private String systemPrompt;
    
    /**
     * 配置参数
     */
    private Map<String, Object> config;
    
    public enum AgentType {
        TEXT,        // 文字处理
        IMAGE,       // 图片生成/处理
        AUDIO,       // 语音处理
        VIDEO,       // 视频生成/处理
        MULTIMODAL   // 多模态
    }
    
    @Data
    public static class WorkflowConfig {
        /**
         * 工作流类型：sequential, parallel, routing, loop
         */
        private String type;
        
        /**
         * 节点定义
         */
        private List<NodeConfig> nodes;
        
        /**
         * 边定义（节点连接关系）
         */
        private List<EdgeConfig> edges;
    }
    
    @Data
    public static class NodeConfig {
        private String id;
        private String name;
        private String type; // agent, tool, condition, etc.
        private Map<String, Object> config;
    }
    
    @Data
    public static class EdgeConfig {
        private String from;
        private String to;
        private String condition; // 可选的条件表达式
    }
    
    @Data
    public static class Capabilities {
        private boolean textGeneration;
        private boolean textUnderstanding;
        private boolean imageGeneration;
        private boolean imageAnalysis;
        private boolean audioGeneration;
        private boolean audioTranscription;
        private boolean videoGeneration;
        private boolean videoAnalysis;
    }
    
    @Data
    public static class ToolDefinition {
        private String name;
        private String description;
        private String className;
        private Map<String, Object> parameters;
    }
}

