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
    private LocalDateTime entryDate;
    private Long timestamp;
    private Long worldId;
    private Long eraId;
    private Long characterId;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

