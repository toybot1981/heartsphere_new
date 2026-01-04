package com.heartsphere.utils;

import com.heartsphere.dto.*;
import com.heartsphere.entity.Character;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.JournalEntry;
import com.heartsphere.entity.Script;
import com.heartsphere.entity.User;
import com.heartsphere.entity.World;
import com.heartsphere.util.ImageUrlUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DTOMapper {
    
    private static ImageUrlUtils imageUrlUtils;
    
    @Autowired
    public void setImageUrlUtils(ImageUrlUtils imageUrlUtils) {
        DTOMapper.imageUrlUtils = imageUrlUtils;
    }
    
    public static WorldDTO toWorldDTO(World world) {
        if (world == null) return null;
        return new WorldDTO(
            world.getId(),
            world.getName(),
            world.getDescription(),
            world.getUser() != null ? world.getUser().getId() : null,
            world.getCreatedAt(),
            world.getUpdatedAt()
        );
    }
    
    public static EraDTO toEraDTO(Era era) {
        if (era == null) return null;
        EraDTO dto = new EraDTO();
        dto.setId(era.getId());
        dto.setName(era.getName());
        dto.setDescription(era.getDescription());
        dto.setStartYear(era.getStartYear());
        dto.setEndYear(era.getEndYear());
        // 智能处理图片URL：如果是系统预置图片直接使用，如果是placeholder优先使用用户图片
        Long userId = era.getUser() != null ? era.getUser().getId() : null;
        String imageUrl = smartImageUrl(era.getImageUrl(), userId);
        dto.setImageUrl(imageUrl);
        dto.setSystemEraId(era.getSystemEraId());
        dto.setWorldId(era.getWorld() != null ? era.getWorld().getId() : null);
        dto.setUserId(era.getUser() != null ? era.getUser().getId() : null);
        dto.setCreatedAt(era.getCreatedAt());
        dto.setUpdatedAt(era.getUpdatedAt());
        return dto;
    }
    
    public static CharacterDTO toCharacterDTO(Character character) {
        if (character == null) return null;
        // 智能处理图片URL：如果是系统预置图片直接使用，如果是placeholder优先使用用户图片
        Long userId = character.getUser() != null ? character.getUser().getId() : null;
        String avatarUrl = smartImageUrl(character.getAvatarUrl(), userId);
        String backgroundUrl = smartImageUrl(character.getBackgroundUrl(), userId);
        return new CharacterDTO(
            character.getId(),
            character.getName(),
            character.getDescription(),
            character.getAge(),
            character.getGender(),
            character.getRole(),
            character.getBio(),
            avatarUrl,  // 使用转换后的URL
            backgroundUrl,  // 使用转换后的URL
            character.getThemeColor(),
            character.getColorAccent(),
            character.getFirstMessage(),
            character.getSystemInstruction(),
            character.getVoiceName(),
            character.getMbti(),
            character.getTags(),
            character.getSpeechStyle(),
            character.getCatchphrases(),
            character.getSecrets(),
            character.getMotivations(),
            character.getRelationships(),
            character.getWorld() != null ? character.getWorld().getId() : null,
            character.getEra() != null ? character.getEra().getId() : null,
            character.getUser() != null ? character.getUser().getId() : null,
            character.getCreatedAt(),
            character.getUpdatedAt()
        );
    }
    
    public static UserDTO toUserDTO(User user) {
        if (user == null) return null;
        // 转换头像URL（相对路径 -> 完整URL）
        String avatar = user.getAvatar();
        if (avatar != null && imageUrlUtils != null) {
            avatar = imageUrlUtils.toFullUrl(avatar);
        }
        return new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getNickname(),
            avatar,  // 使用转换后的URL
            user.getWechatOpenid(),
            user.getIsEnabled(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
    
    public static JournalEntryDTO toJournalEntryDTO(JournalEntry entry) {
        if (entry == null) return null;
        JournalEntryDTO dto = new JournalEntryDTO();
        dto.setId(entry.getId());
        dto.setTitle(entry.getTitle());
        dto.setContent(entry.getContent());
        dto.setTags(entry.getTags());
        String insight = entry.getInsight();
        dto.setInsight(insight);
        // 智能处理图片URL：如果是系统预置图片直接使用，如果是placeholder优先使用用户图片
        Long userId = entry.getUser() != null ? entry.getUser().getId() : null;
        String imageUrl = smartImageUrl(entry.getImageUrl(), userId);
        dto.setImageUrl(imageUrl);
        // 添加日志记录
        java.util.logging.Logger logger = java.util.logging.Logger.getLogger(DTOMapper.class.getName());
        logger.info(String.format("[DTOMapper] toJournalEntryDTO - 转换字段, ID: %s, Insight: %s (长度: %s), ImageUrl: %s", 
            entry.getId(),
            insight != null ? (insight.length() > 50 ? insight.substring(0, 50) + "..." : insight) : "null",
            insight != null ? String.valueOf(insight.length()) : "0",
            entry.getImageUrl() != null && !entry.getImageUrl().isEmpty() ? entry.getImageUrl() : "null或空字符串"));
        dto.setEntryDate(entry.getEntryDate());
        dto.setTimestamp(entry.getTimestamp());
        dto.setWorldId(entry.getWorld() != null ? entry.getWorld().getId() : null);
        dto.setEraId(entry.getEra() != null ? entry.getEra().getId() : null);
        dto.setCharacterId(entry.getCharacter() != null ? entry.getCharacter().getId() : null);
        dto.setUserId(entry.getUser() != null ? entry.getUser().getId() : null);
        dto.setCreatedAt(entry.getCreatedAt());
        dto.setUpdatedAt(entry.getUpdatedAt());
        return dto;
    }
    
    public static ScriptDTO toScriptDTO(Script script) {
        if (script == null) return null;
        ScriptDTO dto = new ScriptDTO();
        dto.setId(script.getId());
        dto.setTitle(script.getTitle());
        dto.setDescription(script.getDescription());
        dto.setContent(script.getContent());
        dto.setSceneCount(script.getSceneCount());
        dto.setCharacterIds(script.getCharacterIds());
        dto.setTags(script.getTags());
        dto.setWorldId(script.getWorld() != null ? script.getWorld().getId() : null);
        dto.setEraId(script.getEra() != null ? script.getEra().getId() : null);
        dto.setUserId(script.getUser() != null ? script.getUser().getId() : null);
        dto.setCreatedAt(script.getCreatedAt());
        dto.setUpdatedAt(script.getUpdatedAt());
        // systemScriptId 不需要设置，因为这是输入参数，不是从实体映射的
        return dto;
    }
    
    /**
     * 智能处理图片URL
     * 规则：
     * 1. 如果URL是系统预置图片（不以userId开头），直接使用系统预置图片
     * 2. 如果URL是用户图片（以userId开头），使用用户图片（URL包含userId）
     * 3. 如果URL是placeholder，保持placeholder（后续可以扩展为查找用户实际图片）
     * 4. 最终转换为完整URL
     * 
     * 说明：
     * - 系统预置图片格式：category/year/month/filename（如：character/2025/12/xxx.png）
     * - 用户图片格式：userId/category/year/month/filename（如：70/character/2025/12/xxx.png）
     * - placeholder格式：placeholder://category/xxx.jpg
     * 
     * @param imageUrl 原始图片URL（可能是相对路径、placeholder或绝对URL）
     * @param userId 用户ID（用于识别用户图片和系统预置图片）
     * @return 处理后的完整URL
     */
    private static String smartImageUrl(String imageUrl, Long userId) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return null;
        }
        
        // 如果已经是绝对URL（http://或https://开头），直接返回
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl;
        }
        
        // 如果URL是placeholder，保持placeholder（可以后续扩展为查找用户实际图片）
        // placeholder格式：placeholder://category/xxx.jpg
        if (imageUrl.startsWith("placeholder://")) {
            // placeholder不需要转换为完整URL，保持原样
            // 前端应该处理placeholder的显示，或者后端可以扩展为查找用户实际图片
            return imageUrl;
        }
        
        // 系统预置图片和用户图片都直接转换为完整URL
        // 系统预置图片格式：category/year/month/filename
        // 用户图片格式：userId/category/year/month/filename
        // ImageUrlUtils.toFullUrl() 会自动处理相对路径的拼接
        if (imageUrlUtils != null) {
            return imageUrlUtils.toFullUrl(imageUrl);
        }
        
        // 如果没有imageUrlUtils，返回原始URL
        return imageUrl;
    }
}

