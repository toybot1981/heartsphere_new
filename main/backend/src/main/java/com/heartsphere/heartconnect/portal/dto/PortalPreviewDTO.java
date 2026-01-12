package com.heartsphere.heartconnect.portal.dto;

import lombok.Data;

/**
 * 传送门目标心域预览DTO
 */
@Data
public class PortalPreviewDTO {
    private Long targetHeartsphereId;
    private String targetHeartsphereName;
    private String targetOwnerName;
    private String targetOwnerAvatar;
    private String targetCoverImageUrl;
    private String targetDescription;
    private Integer targetCharacterCount;
    private Integer targetSceneCount;
    private String targetAccessPermission; // 目标心域的访问权限
    private Boolean canAccess; // 当前用户是否可以访问目标心域
    private String cannotAccessReason; // 如果不能访问，说明原因
}
