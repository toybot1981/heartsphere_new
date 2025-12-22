package com.heartsphere.dto.ai;

import lombok.Data;

/**
 * 视频生成响应DTO
 */
@Data
public class VideoGenerationResponse {
    
    /**
     * 视频URL
     */
    private String videoUrl;
    
    /**
     * 视频ID（异步生成时使用）
     */
    private String videoId;
    
    /**
     * 状态：completed, processing
     */
    private String status;
    
    /**
     * 使用的提供商
     */
    private String provider;
    
    /**
     * 使用的模型
     */
    private String model;
    
    /**
     * 视频时长（秒）
     */
    private Integer duration;
}

