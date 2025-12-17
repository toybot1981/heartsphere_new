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
    private String content;
    private Integer sceneCount;
    private Long worldId;
    private Long eraId;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}



