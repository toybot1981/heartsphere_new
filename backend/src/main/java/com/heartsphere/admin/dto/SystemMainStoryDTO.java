package com.heartsphere.admin.dto;

import lombok.Data;

/**
 * 系统主线剧情DTO
 */
@Data
public class SystemMainStoryDTO {
    private Long id;
    private Long systemEraId;
    private String systemEraName;
    private String name;
    private Integer age;
    private String role;
    private String bio;
    private String avatarUrl;
    private String backgroundUrl;
    private String themeColor;
    private String colorAccent;
    private String firstMessage;
    private String systemInstruction;
    private String voiceName;
    private String tags;
    private String speechStyle;
    private String catchphrases;
    private String secrets;
    private String motivations;
    private Boolean isActive;
    private Integer sortOrder;
}

