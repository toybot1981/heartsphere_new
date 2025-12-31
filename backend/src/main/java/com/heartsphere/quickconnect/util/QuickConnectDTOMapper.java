package com.heartsphere.quickconnect.util;

import com.heartsphere.entity.Character;
import com.heartsphere.entity.World;
import com.heartsphere.quickconnect.dto.AccessHistoryDTO;
import com.heartsphere.quickconnect.dto.FavoriteDTO;
import com.heartsphere.quickconnect.dto.QuickConnectCharacterDTO;
import com.heartsphere.quickconnect.entity.AccessHistory;
import com.heartsphere.quickconnect.entity.UserFavorite;
import com.heartsphere.util.ImageUrlUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.ZoneOffset;

/**
 * 心域连接模块DTO转换工具类
 */
@Component
public class QuickConnectDTOMapper {
    
    private static ImageUrlUtils imageUrlUtils;
    
    @Autowired
    public void setImageUrlUtils(ImageUrlUtils imageUrlUtils) {
        QuickConnectDTOMapper.imageUrlUtils = imageUrlUtils;
    }
    
    /**
     * 将Character实体转换为QuickConnectCharacterDTO
     */
    public static QuickConnectCharacterDTO toQuickConnectCharacterDTO(Character character) {
        if (character == null) {
            return null;
        }
        
        QuickConnectCharacterDTO dto = new QuickConnectCharacterDTO();
        dto.setCharacterId(character.getId());
        dto.setCharacterName(character.getName());
        
        // 转换头像URL（相对路径 -> 完整URL）
        String avatarUrl = character.getAvatarUrl();
        if (avatarUrl != null && imageUrlUtils != null) {
            avatarUrl = imageUrlUtils.toFullUrl(avatarUrl);
        }
        dto.setAvatarUrl(avatarUrl);
        
        // 场景信息（World）
        if (character.getWorld() != null) {
            World world = character.getWorld();
            dto.setSceneId(world.getId());
            dto.setSceneName(world.getName());
        }
        
        dto.setThemeColor(character.getThemeColor());
        dto.setColorAccent(character.getColorAccent());
        dto.setBio(character.getBio());
        dto.setTags(character.getTags());
        
        // 默认值
        dto.setIsFavorite(false);
        dto.setIsOnline(false);
        dto.setHasUnreadMessages(false);
        dto.setUnreadMessageCount(0);
        dto.setAccessCount(0);
        dto.setImportance(0.0);
        dto.setRecommendationScore(0.0);
        
        return dto;
    }
    
    /**
     * 将UserFavorite实体转换为FavoriteDTO
     */
    public static FavoriteDTO toFavoriteDTO(UserFavorite userFavorite) {
        if (userFavorite == null) {
            return null;
        }
        
        FavoriteDTO dto = new FavoriteDTO();
        dto.setId(userFavorite.getId());
        dto.setUserId(userFavorite.getUserId());
        dto.setCharacterId(userFavorite.getCharacterId());
        dto.setSortOrder(userFavorite.getSortOrder());
        dto.setCreatedAt(userFavorite.getCreatedAt());
        dto.setUpdatedAt(userFavorite.getUpdatedAt());
        
        // 可选：包含角色信息
        if (userFavorite.getCharacter() != null) {
            dto.setCharacter(toQuickConnectCharacterDTO(userFavorite.getCharacter()));
        }
        
        return dto;
    }
    
    /**
     * 将AccessHistory实体转换为AccessHistoryDTO
     */
    public static AccessHistoryDTO toAccessHistoryDTO(AccessHistory accessHistory) {
        if (accessHistory == null) {
            return null;
        }
        
        AccessHistoryDTO dto = new AccessHistoryDTO();
        dto.setId(accessHistory.getId());
        dto.setUserId(accessHistory.getUserId());
        dto.setCharacterId(accessHistory.getCharacterId());
        dto.setAccessTime(accessHistory.getAccessTime());
        dto.setAccessDuration(accessHistory.getAccessDuration());
        dto.setConversationRounds(accessHistory.getConversationRounds());
        dto.setSessionId(accessHistory.getSessionId());
        
        // 可选：包含角色信息
        if (accessHistory.getCharacter() != null) {
            dto.setCharacter(toQuickConnectCharacterDTO(accessHistory.getCharacter()));
        }
        
        return dto;
    }
    
    /**
     * 将时间戳（毫秒）转换为LocalDateTime
     */
    public static java.time.LocalDateTime timestampToLocalDateTime(Long timestamp) {
        if (timestamp == null) {
            return null;
        }
        return java.time.LocalDateTime.ofEpochSecond(timestamp / 1000, 0, ZoneOffset.UTC);
    }
    
    /**
     * 将LocalDateTime转换为时间戳（毫秒）
     */
    public static Long localDateTimeToTimestamp(java.time.LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.toEpochSecond(ZoneOffset.UTC) * 1000;
    }
}



