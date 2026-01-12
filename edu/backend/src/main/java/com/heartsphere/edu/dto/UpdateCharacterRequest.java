package com.heartsphere.edu.dto;

import com.heartsphere.edu.entity.EduCharacter;
import lombok.Data;

import java.util.List;

/**
 * 更新数字人角色请求 DTO
 */
@Data
public class UpdateCharacterRequest {
    private String name;
    private String avatarUrl;
    private String backgroundUrl;
    private String description;
    private String bio;
    private EduCharacter.CharacterType characterType;
    private List<String> ageGroupSuitability;
    private List<String> subjectTags;
    private String teachingSpecialty;
    private EduCharacter.DifficultyLevel difficultyLevel;
    private EduCharacter.LanguageStyle languageStyle;
    private List<String> personalityTraits;
    private String firstMessage;
    private String systemInstruction;
    private String voiceName;
    private String themeColor;
    private String colorAccent;
    private Boolean isEnabled;
}
