package com.heartsphere.quickconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 收藏DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteDTO {
    private Long id;
    private Long userId;
    private Long characterId;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 可选：包含角色信息
    private QuickConnectCharacterDTO character;
}




