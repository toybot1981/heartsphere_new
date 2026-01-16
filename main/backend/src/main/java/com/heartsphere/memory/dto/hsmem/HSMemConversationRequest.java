package com.heartsphere.memory.dto.hsmem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * HSMem 对话记忆化请求DTO
 * 
 * @author HeartSphere
 * @date 2026-01-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HSMemConversationRequest {
    
    /**
     * 对话消息列表
     */
    private List<HSMemMessage> messages;
    
    /**
     * 用户ID（可选）
     */
    private String user_id;
    
    /**
     * 代理ID（可选）
     */
    private String agent_id;
}
