package com.heartsphere.util;

import com.heartsphere.dto.SystemCharacterDTO;
import com.heartsphere.dto.SystemEraDTO;
import com.heartsphere.dto.SystemMainStoryDTO;
import com.heartsphere.dto.SystemScriptDTO;
import com.heartsphere.entity.SystemCharacter;
import com.heartsphere.entity.SystemEra;
import com.heartsphere.entity.SystemMainStory;
import com.heartsphere.entity.SystemScript;
import com.heartsphere.shared.util.ImageUrlUtils;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

/**
 * 系统数据DTO转换工具类
 * 提供Entity到DTO的转换方法
 * 注意：现在需要注入ImageUrlUtils来转换图片URL
 */
@Component
public class SystemDTOMapper implements ApplicationContextAware {
    
    private static ImageUrlUtils imageUrlUtils;
    private static ApplicationContext applicationContext;
    
    @Override
    public void setApplicationContext(@org.springframework.lang.NonNull ApplicationContext applicationContext) throws BeansException {
        SystemDTOMapper.applicationContext = applicationContext;
        // 确保 imageUrlUtils 被注入
        if (imageUrlUtils == null && applicationContext != null) {
            try {
                imageUrlUtils = applicationContext.getBean(ImageUrlUtils.class);
            } catch (Exception e) {
                java.util.logging.Logger.getLogger(SystemDTOMapper.class.getName())
                    .warning("无法从ApplicationContext获取ImageUrlUtils: " + e.getMessage());
            }
        }
    }
    
    @Autowired
    public void setImageUrlUtils(ImageUrlUtils imageUrlUtils) {
        SystemDTOMapper.imageUrlUtils = imageUrlUtils;
    }

    /**
     * 将SystemEra实体转换为DTO
     */
    public static SystemEraDTO toEraDTO(SystemEra era) {
        // 转换图片URL（相对路径 -> 完整URL）
        String imageUrl = era.getImageUrl();
        
        // 如果imageUrlUtils为null，尝试从ApplicationContext获取
        if (imageUrlUtils == null && applicationContext != null) {
            try {
                imageUrlUtils = applicationContext.getBean(ImageUrlUtils.class);
            } catch (Exception e) {
                java.util.logging.Logger.getLogger(SystemDTOMapper.class.getName())
                    .warning("无法从ApplicationContext获取ImageUrlUtils: " + e.getMessage());
            }
        }
        
        if (imageUrlUtils != null) {
            imageUrl = imageUrlUtils.toFullUrl(imageUrl);
        } else if (imageUrl != null && !imageUrl.isEmpty() && !imageUrl.startsWith("http://") && !imageUrl.startsWith("https://") && !imageUrl.startsWith("placeholder://")) {
            // 如果仍然无法获取imageUrlUtils，使用默认值构造完整URL
            java.util.logging.Logger.getLogger(SystemDTOMapper.class.getName())
                .warning("ImageUrlUtils未初始化，使用默认baseUrl转换图片URL: " + imageUrl);
            String defaultBaseUrl = "http://localhost:8081/images";
            String normalizedPath = imageUrl.startsWith("/") ? imageUrl : "/" + imageUrl;
            imageUrl = defaultBaseUrl + normalizedPath;
        }
        
        return new SystemEraDTO(
                era.getId(),
                era.getName(),
                era.getDescription(),
                era.getStartYear(),
                era.getEndYear(),
                imageUrl,  // 使用转换后的URL
                era.getIsActive(),
                era.getSortOrder(),
                era.getCreatedAt(),
                era.getUpdatedAt()
        );
    }

    /**
     * 将SystemScript实体转换为DTO
     */
    public static SystemScriptDTO toScriptDTO(SystemScript script) {
        // 需要查询 SystemEra 来获取名称
        final String[] eraName = {null};
        if (script.getSystemEraId() != null && applicationContext != null) {
            try {
                com.heartsphere.repository.SystemEraRepository eraRepository = 
                    applicationContext.getBean(com.heartsphere.repository.SystemEraRepository.class);
                eraRepository.findById(script.getSystemEraId())
                    .ifPresent(era -> eraName[0] = era.getName());
            } catch (Exception e) {
                // 忽略错误
            }
        }
        
        return new SystemScriptDTO(
                script.getId(),
                script.getTitle(),
                script.getDescription(),
                script.getContent(),
                script.getSceneCount(),
                script.getSystemEraId(),
                eraName[0],
                script.getCharacterIds(),
                script.getTags(),
                script.getIsActive(),
                script.getSortOrder(),
                script.getCreatedAt(),
                script.getUpdatedAt()
        );
    }

    /**
     * 将SystemCharacter实体转换为DTO
     */
    public static SystemCharacterDTO toCharacterDTO(SystemCharacter character) {
        // 转换图片URL（相对路径 -> 完整URL）
        String avatarUrl = character.getAvatarUrl();
        String backgroundUrl = character.getBackgroundUrl();
        
        // 如果imageUrlUtils为null，尝试从ApplicationContext获取
        if (imageUrlUtils == null && applicationContext != null) {
            try {
                imageUrlUtils = applicationContext.getBean(ImageUrlUtils.class);
            } catch (Exception e) {
                java.util.logging.Logger.getLogger(SystemDTOMapper.class.getName())
                    .warning("无法从ApplicationContext获取ImageUrlUtils: " + e.getMessage());
            }
        }
        
        if (imageUrlUtils != null) {
            avatarUrl = imageUrlUtils.toFullUrl(avatarUrl);
            backgroundUrl = imageUrlUtils.toFullUrl(backgroundUrl);
        } else {
            // 如果仍然无法获取imageUrlUtils，使用默认值构造完整URL
            String defaultBaseUrl = "http://localhost:8081/images";
            if (avatarUrl != null && !avatarUrl.isEmpty() && !avatarUrl.startsWith("http://") && !avatarUrl.startsWith("https://") && !avatarUrl.startsWith("placeholder://")) {
                java.util.logging.Logger.getLogger(SystemDTOMapper.class.getName())
                    .warning("ImageUrlUtils未初始化，使用默认baseUrl转换avatarUrl: " + avatarUrl);
                String normalizedPath = avatarUrl.startsWith("/") ? avatarUrl : "/" + avatarUrl;
                avatarUrl = defaultBaseUrl + normalizedPath;
            }
            if (backgroundUrl != null && !backgroundUrl.isEmpty() && !backgroundUrl.startsWith("http://") && !backgroundUrl.startsWith("https://") && !backgroundUrl.startsWith("placeholder://")) {
                java.util.logging.Logger.getLogger(SystemDTOMapper.class.getName())
                    .warning("ImageUrlUtils未初始化，使用默认baseUrl转换backgroundUrl: " + backgroundUrl);
                String normalizedPath = backgroundUrl.startsWith("/") ? backgroundUrl : "/" + backgroundUrl;
                backgroundUrl = defaultBaseUrl + normalizedPath;
            }
        }
        
        return new SystemCharacterDTO(
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
                character.getSystemEraId(),
                character.getIsActive(),
                character.getSortOrder(),
                character.getCreatedAt(),
                character.getUpdatedAt()
        );
    }

    /**
     * 将SystemMainStory实体转换为DTO
     */
    public static SystemMainStoryDTO toMainStoryDTO(SystemMainStory story) {
        SystemMainStoryDTO dto = new SystemMainStoryDTO();
        dto.setId(story.getId());
        dto.setSystemEraId(story.getSystemEraId());
        // 查询 SystemEra 名称
        final String[] eraName = {null};
        if (story.getSystemEraId() != null && applicationContext != null) {
            try {
                com.heartsphere.repository.SystemEraRepository eraRepository = 
                    applicationContext.getBean(com.heartsphere.repository.SystemEraRepository.class);
                eraRepository.findById(story.getSystemEraId())
                    .ifPresent(era -> eraName[0] = era.getName());
            } catch (Exception e) {
                // 忽略错误
            }
        }
        dto.setSystemEraName(eraName[0]);
        dto.setName(story.getName());
        dto.setAge(story.getAge());
        dto.setRole(story.getRole());
        dto.setBio(story.getBio());
        // 转换图片URL（相对路径 -> 完整URL）
        String avatarUrl = story.getAvatarUrl();
        String backgroundUrl = story.getBackgroundUrl();
        
        // 如果imageUrlUtils为null，尝试从ApplicationContext获取
        if (imageUrlUtils == null && applicationContext != null) {
            try {
                imageUrlUtils = applicationContext.getBean(ImageUrlUtils.class);
            } catch (Exception e) {
                java.util.logging.Logger.getLogger(SystemDTOMapper.class.getName())
                    .warning("无法从ApplicationContext获取ImageUrlUtils: " + e.getMessage());
            }
        }
        
        if (imageUrlUtils != null) {
            avatarUrl = imageUrlUtils.toFullUrl(avatarUrl);
            backgroundUrl = imageUrlUtils.toFullUrl(backgroundUrl);
        } else {
            // 如果仍然无法获取imageUrlUtils，使用默认值构造完整URL
            String defaultBaseUrl = "http://localhost:8081/images";
            if (avatarUrl != null && !avatarUrl.isEmpty() && !avatarUrl.startsWith("http://") && !avatarUrl.startsWith("https://") && !avatarUrl.startsWith("placeholder://")) {
                String normalizedPath = avatarUrl.startsWith("/") ? avatarUrl : "/" + avatarUrl;
                avatarUrl = defaultBaseUrl + normalizedPath;
            }
            if (backgroundUrl != null && !backgroundUrl.isEmpty() && !backgroundUrl.startsWith("http://") && !backgroundUrl.startsWith("https://") && !backgroundUrl.startsWith("placeholder://")) {
                String normalizedPath = backgroundUrl.startsWith("/") ? backgroundUrl : "/" + backgroundUrl;
                backgroundUrl = defaultBaseUrl + normalizedPath;
            }
        }
        dto.setAvatarUrl(avatarUrl);
        dto.setBackgroundUrl(backgroundUrl);
        dto.setThemeColor(story.getThemeColor());
        dto.setColorAccent(story.getColorAccent());
        dto.setFirstMessage(story.getFirstMessage());
        dto.setSystemInstruction(story.getSystemInstruction());
        dto.setVoiceName(story.getVoiceName());
        dto.setTags(story.getTags());
        dto.setSpeechStyle(story.getSpeechStyle());
        dto.setCatchphrases(story.getCatchphrases());
        dto.setSecrets(story.getSecrets());
        dto.setMotivations(story.getMotivations());
        dto.setIsActive(story.getIsActive());
        dto.setSortOrder(story.getSortOrder());
        return dto;
    }
}
