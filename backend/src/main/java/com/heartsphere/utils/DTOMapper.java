package com.heartsphere.utils;

import com.heartsphere.dto.*;
import com.heartsphere.entity.Character;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.JournalEntry;
import com.heartsphere.entity.Script;
import com.heartsphere.entity.User;
import com.heartsphere.entity.World;

public class DTOMapper {
    
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
        dto.setImageUrl(era.getImageUrl());
        dto.setSystemEraId(era.getSystemEraId());
        dto.setWorldId(era.getWorld() != null ? era.getWorld().getId() : null);
        dto.setUserId(era.getUser() != null ? era.getUser().getId() : null);
        dto.setCreatedAt(era.getCreatedAt());
        dto.setUpdatedAt(era.getUpdatedAt());
        return dto;
    }
    
    public static CharacterDTO toCharacterDTO(Character character) {
        if (character == null) return null;
        return new CharacterDTO(
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
            character.getWorld() != null ? character.getWorld().getId() : null,
            character.getEra() != null ? character.getEra().getId() : null,
            character.getUser() != null ? character.getUser().getId() : null,
            character.getCreatedAt(),
            character.getUpdatedAt()
        );
    }
    
    public static UserDTO toUserDTO(User user) {
        if (user == null) return null;
        return new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getNickname(),
            user.getAvatar(),
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
}

