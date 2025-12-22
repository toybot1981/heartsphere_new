package com.heartsphere.dto.ai;

import lombok.Data;

/**
 * 视频生成请求DTO
 */
@Data
public class VideoGenerationRequest {
    
    /**
     * 提供商
     */
    private String provider;
    
    /**
     * 模型名称
     */
    private String model;
    
    /**
     * 生成视频的提示词
     */
    private String prompt;
    
    /**
     * 视频时长（秒）
     */
    private Integer duration;
    
    /**
     * 分辨率：720p, 1080p, 4k
     */
    private String resolution;
}

