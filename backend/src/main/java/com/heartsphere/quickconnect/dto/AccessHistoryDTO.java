package com.heartsphere.quickconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 访问历史DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccessHistoryDTO {
    private Long id;
    private Long userId;
    private Long characterId;
    private LocalDateTime accessTime;
    private Integer accessDuration;  // 访问时长（秒）
    private Integer conversationRounds;  // 对话轮数
    private String sessionId;  // 会话ID
    
    // 可选：包含角色信息
    private QuickConnectCharacterDTO character;
}



