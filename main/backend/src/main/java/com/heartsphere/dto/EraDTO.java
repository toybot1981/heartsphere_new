package com.heartsphere.dto;

import com.heartsphere.shared.dto.ImageVariantsDTO;
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
    private ImageVariantsDTO imageVariants; // 场景封面多分辨率版本
    private Long systemEraId;
    private String style; // 场景风格
    private Long worldId;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

