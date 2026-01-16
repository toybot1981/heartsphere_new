package com.heartsphere.heartconnect.portal.dto;

import lombok.Data;

/**
 * 更新传送门请求DTO
 * 参考UpdateShareConfigRequest的结构
 */
@Data
public class UpdatePortalRequest {
    private String portalName; // 传送门名称
    private String portalType; // "stargate", "wormhole", "quantum", "garden", "sakura", "butterfly", "rainbow"
    private Long targetHeartsphereId; // 目标心域ID
    private String targetShareCode; // 目标心域共享码
    private Double positionX; // X坐标
    private Double positionY; // Y坐标
    private Double positionZ; // Z坐标
    private Double size; // 传送门尺寸
    private String permissionType; // "public", "approval", "invite"
    private String description; // 传送门描述
    private Boolean isActive; // 是否激活
}
