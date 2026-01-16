package com.heartsphere.heartconnect.portal.dto;

import lombok.Data;

/**
 * 创建传送门请求DTO
 * 参考CreateShareConfigRequest的结构
 */
@Data
public class CreatePortalRequest {
    private Long sceneId; // 场景ID（必填）
    private String portalName; // 传送门名称（必填）
    private String portalType; // "stargate", "wormhole", "quantum", "garden", "sakura", "butterfly", "rainbow"（必填）
    private Long targetHeartsphereId; // 目标心域ID（可选，与targetShareCode二选一）
    private String targetShareCode; // 目标心域共享码（可选，与targetHeartsphereId二选一）
    private Double positionX; // X坐标（可选，默认0.0）
    private Double positionY; // Y坐标（可选，默认0.0）
    private Double positionZ; // Z坐标（可选，默认0.0）
    private Double size; // 传送门尺寸（可选，默认3.0米）
    private String permissionType; // "public", "approval", "invite"（必填，默认approval）
    private String description; // 传送门描述（可选）
}
