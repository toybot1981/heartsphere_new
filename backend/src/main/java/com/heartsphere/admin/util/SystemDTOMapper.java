package com.heartsphere.admin.util;

import com.heartsphere.admin.dto.SystemCharacterDTO;
import com.heartsphere.admin.dto.SystemEraDTO;
import com.heartsphere.admin.dto.SystemMainStoryDTO;
import com.heartsphere.admin.dto.SystemScriptDTO;
import com.heartsphere.admin.dto.SystemWorldDTO;
import com.heartsphere.admin.entity.SystemCharacter;
import com.heartsphere.admin.entity.SystemEra;
import com.heartsphere.admin.entity.SystemMainStory;
import com.heartsphere.admin.entity.SystemScript;
import com.heartsphere.admin.entity.SystemWorld;

/**
 * 系统数据DTO转换工具类
 * 提供Entity到DTO的转换方法
 */
public class SystemDTOMapper {

    /**
     * 将SystemWorld实体转换为DTO
     */
    public static SystemWorldDTO toWorldDTO(SystemWorld world) {
        return new SystemWorldDTO(
                world.getId(),
                world.getName(),
                world.getDescription(),
                world.getIsActive(),
                world.getSortOrder(),
                world.getCreatedAt(),
                world.getUpdatedAt()
        );
    }

    /**
     * 将SystemEra实体转换为DTO
     */
    public static SystemEraDTO toEraDTO(SystemEra era) {
        return new SystemEraDTO(
                era.getId(),
                era.getName(),
                era.getDescription(),
                era.getStartYear(),
                era.getEndYear(),
                era.getImageUrl(),
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
        return new SystemScriptDTO(
                script.getId(),
                script.getTitle(),
                script.getDescription(),
                script.getContent(),
                script.getSceneCount(),
                script.getSystemEra() != null ? script.getSystemEra().getId() : null,
                script.getSystemEra() != null ? script.getSystemEra().getName() : null,
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
        return new SystemCharacterDTO(
                character.getId(),
                character.getName(),
                character.getDescription(),
                character.getAge(),
                character.getGender(),
                character.getRole(),
                character.getBio(),
                character.getAvatarUrl(),
                character.getBackgroundUrl(),
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
                character.getSystemEra() != null ? character.getSystemEra().getId() : null,
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
        dto.setSystemEraId(story.getSystemEra() != null ? story.getSystemEra().getId() : null);
        dto.setSystemEraName(story.getSystemEra() != null ? story.getSystemEra().getName() : null);
        dto.setName(story.getName());
        dto.setAge(story.getAge());
        dto.setRole(story.getRole());
        dto.setBio(story.getBio());
        dto.setAvatarUrl(story.getAvatarUrl());
        dto.setBackgroundUrl(story.getBackgroundUrl());
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




