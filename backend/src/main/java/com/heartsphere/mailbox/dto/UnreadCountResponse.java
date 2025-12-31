package com.heartsphere.mailbox.dto;

import com.heartsphere.mailbox.enums.MessageCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 未读消息数量响应DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnreadCountResponse {
    /**
     * 总未读数量
     */
    private Long totalUnread;
    
    /**
     * 各分类未读数量
     */
    private Map<MessageCategory, Long> categoryUnread;
}

