package com.heartsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScriptDTO {
    private Long id;
    private String title;
    private String description;
    private String content;
    private Integer sceneCount;
    private String characterIds; // JSON数组格式的角色ID列表
    private String tags;
    private Long worldId;
    private Long eraId;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 系统预置剧本ID（用于从预置数据库查询完整数据）
    private Long systemScriptId;
}



