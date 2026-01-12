package com.heartsphere.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 权限信息DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionInfo {
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 计划类型
     */
    private String planType;
    
    /**
     * 是否可以使用API
     */
    private Boolean canUseApi;
    
    /**
     * 是否可以使用优先队列
     */
    private Boolean canUsePriorityQueue;
    
    /**
     * 是否可以去除水印
     */
    private Boolean canRemoveWatermark;
    
    /**
     * 是否可以批量处理
     */
    private Boolean canBatchProcess;
    
    /**
     * 是否可以使用团队协作
     */
    private Boolean canUseTeamCollaboration;
    
    /**
     * 允许使用的模型列表
     */
    private List<String> allowedModels;
    
    /**
     * 最大图片分辨率
     */
    private String maxImageResolution;
    
    /**
     * 最大视频时长（秒）
     */
    private Integer maxVideoDuration;
}
