package com.heartsphere.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SystemResourceDTO {
    private Long id;
    private String name;
    private String url;
    private String category;
    private String description;
    private String prompt;
    private String tags;
    private Long fileSize;
    private String mimeType;
    private Integer width;
    private Integer height;
    private Long createdByAdminId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

