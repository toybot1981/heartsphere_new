package com.heartsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EraDTO {
    private Long id;
    private String name;
    private String description;
    private Integer startYear;
    private Integer endYear;
    private String imageUrl;
    private Long systemEraId;
    private Long worldId;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

