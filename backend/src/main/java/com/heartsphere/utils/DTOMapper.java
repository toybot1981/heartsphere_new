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
        return new EraDTO(
            era.getId(),
            era.getName(),
            era.getDescription(),
            era.getStartYear(),
            era.getEndYear(),
            era.getImageUrl(),
            era.getWorld() != null ? era.getWorld().getId() : null,
            era.getUser() != null ? era.getUser().getId() : null,
            era.getCreatedAt(),
            era.getUpdatedAt()
        );
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
        return new JournalEntryDTO(
            entry.getId(),
            entry.getTitle(),
            entry.getContent(),
            entry.getEntryDate(),
            entry.getTimestamp(),
            entry.getWorld() != null ? entry.getWorld().getId() : null,
            entry.getEra() != null ? entry.getEra().getId() : null,
            entry.getCharacter() != null ? entry.getCharacter().getId() : null,
            entry.getUser() != null ? entry.getUser().getId() : null,
            entry.getCreatedAt(),
            entry.getUpdatedAt()
        );
    }
    
    public static ScriptDTO toScriptDTO(Script script) {
        if (script == null) return null;
        return new ScriptDTO(
            script.getId(),
            script.getTitle(),
            script.getContent(),
            script.getSceneCount(),
            script.getWorld() != null ? script.getWorld().getId() : null,
            script.getEra() != null ? script.getEra().getId() : null,
            script.getUser() != null ? script.getUser().getId() : null,
            script.getCreatedAt(),
            script.getUpdatedAt()
        );
    }
}

