package com.heartsphere.memory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 保存聊天消息请求
 * 
 * @author HeartSphere
 * @date 2026-01-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveChatMessageRequest {
    /**
     * 会话ID
     */
    private String sessionId;
    
    /**
     * 消息角色（USER/ASSISTANT/SYSTEM）
     */
    private String role;
    
    /**
     * 消息内容
     */
    private String content;
    
    /**
     * 元数据（可选）
     */
    private Map<String, Object> metadata;
    
    /**
     * 重要性评分（可选）
     */
    private Double importance;
}
