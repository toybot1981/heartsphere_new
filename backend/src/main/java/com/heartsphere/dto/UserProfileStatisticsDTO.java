package com.heartsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 用户资料统计数据DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileStatisticsDTO {
    
    // 心域探索统计
    private Long scenesCount;           // 访问过的场景数
    private Long charactersCount;       // 互动过的角色数
    private Long totalMessages;         // 总对话消息数
    private Long activeDays;            // 活跃天数
    
    // 内容创作统计
    private Long journalEntriesCount;   // 日记条目数
    private Long customCharactersCount; // 自定义角色数
    private Long customScenesCount;     // 自定义场景数
    private Long customScriptsCount;    // 自定义剧本数
    
    // 社交互动统计
    private Long totalMails;            // 时光信件总数
    private Long unreadMails;           // 未读信件数
}




