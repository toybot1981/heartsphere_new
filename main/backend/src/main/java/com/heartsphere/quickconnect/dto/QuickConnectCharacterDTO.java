package com.heartsphere.quickconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 快速连接角色DTO
 * 用于快速连接界面展示E-SOUL（角色）信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuickConnectCharacterDTO {
    private Long characterId;
    private String characterName;
    private String avatarUrl;
    private Long sceneId;  // 场景ID（对应world_id）
    private String sceneName;  // 场景名称（对应world名称）
    private String themeColor;
    private String colorAccent;
    private String bio;  // 角色简介
    private String tags;  // 标签列表（逗号分隔）
    
    // 收藏相关
    private Boolean isFavorite;  // 是否收藏
    
    // 访问历史相关
    private Long lastAccessTime;  // 最后访问时间（时间戳）
    private Integer accessCount;  // 访问次数
    private Long totalConversationTime;  // 总对话时长（秒）
    private Long lastConversationTime;  // 最后对话时间（时间戳）
    
    // 在线状态（如果支持）
    private Boolean isOnline;
    
    // 未读消息（如果支持）
    private Boolean hasUnreadMessages;
    private Integer unreadMessageCount;
    
    // 推荐相关
    private Double importance;  // 重要性评分（0-1）
    private Double recommendationScore;  // 推荐分数
}

