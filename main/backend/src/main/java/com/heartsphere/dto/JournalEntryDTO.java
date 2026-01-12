package com.heartsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JournalEntryDTO {
    private String id;
    private String title;
    private String content;
    private String tags;
    private String insight; // 本我镜像（Mirror of Truth）分析结果
    private String imageUrl; // 日志配图URL
    private LocalDateTime entryDate;
    private Long timestamp;
    private Long worldId;
    private Long eraId;
    private Long characterId;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

