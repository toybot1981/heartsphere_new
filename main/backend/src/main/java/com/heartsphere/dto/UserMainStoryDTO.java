package com.heartsphere.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * 用户主线剧情DTO
 * 用于接收前端创建/更新请求
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserMainStoryDTO {
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
    
    // 场景ID（前端发送的是ID，需要转换为Era对象）
    private Long eraId;
    
    // 系统预置场景ID（可选）
    private Long systemEraId;
    
    // 系统预置主线剧情ID（用于从预置数据库查询完整数据）
    private Long systemMainStoryId;
}




