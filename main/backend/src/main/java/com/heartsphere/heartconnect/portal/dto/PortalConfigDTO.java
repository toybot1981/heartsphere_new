package com.heartsphere.heartconnect.portal.dto;

import lombok.Data;
import java.util.List;

/**
 * 传送门配置DTO
 * 参考ShareConfigDTO的结构
 */
@Data
public class PortalConfigDTO {
    private Long id;
    private Long userId;
    private Long sceneId;
    private String portalName;
    private String portalType; // "stargate", "wormhole", "quantum"
    private Long targetHeartsphereId;
    private String targetShareCode;
    private Double positionX;
    private Double positionY;
    private Double positionZ;
    private Double size;
    private String permissionType; // "public", "approval", "invite"
    private String description;
    private Boolean isActive;
    private Long createdAt;
    private Long updatedAt;
    
    // 目标心域信息（从关联查询获取）
    private String targetHeartsphereName;
    private String targetOwnerName;
    private String targetCoverImageUrl;
}
