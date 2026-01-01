package com.heartsphere.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ScenarioItemDTO {
    private Long id;
    private String name;
    private String itemId;
    private String description;
    private Long eraId;
    private String eraName;
    private Long userId;
    private Boolean isSystem;
    private String iconUrl;
    private String itemType;
    private String tags;
    private Integer sortOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}




