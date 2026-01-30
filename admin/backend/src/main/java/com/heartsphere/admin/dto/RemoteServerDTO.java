package com.heartsphere.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 远程服务器 DTO
 */
@Data
public class RemoteServerDTO {
    private Long id;
    private String name;
    private String description;
    private String host;
    private Integer port;
    private String username;
    private String deployPath;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private LocalDateTime lastConnectionTest;
    private String lastConnectionResult;
    
    // 注意：privateKey 和 keyPassphrase 不会在 DTO 中暴露
}
