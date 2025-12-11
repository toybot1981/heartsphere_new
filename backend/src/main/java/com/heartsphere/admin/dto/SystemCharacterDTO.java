package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemCharacterDTO {
    private Long id;
    private String name;
    private String description;
    private Integer age;
    private String gender;
    private String role;
    private String bio;
    private String avatarUrl;
    private String backgroundUrl;
    private String themeColor;
    private String colorAccent;
    private String firstMessage;
    private String systemInstruction;
    private String voiceName;
    private String mbti;
    private String tags;
    private String speechStyle;
    private String catchphrases;
    private String secrets;
    private String motivations;
    private String relationships;
    private Long systemEraId;
    private Boolean isActive;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

