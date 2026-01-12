package com.heartsphere.dto.ai;

import lombok.Data;

/**
 * 音频处理响应DTO
 */
@Data
public class AudioResponse {
    
    /**
     * 文本转语音：音频文件URL
     */
    private String audioUrl;
    
    /**
     * Base64编码的音频数据（可选）
     */
    private String audioBase64;
    
    /**
     * 音频时长（秒）
     */
    private Double duration;
    
    /**
     * 语音转文本：识别出的文本
     */
    private String text;
    
    /**
     * 置信度：0-1
     */
    private Double confidence;
    
    /**
     * 使用的提供商
     */
    private String provider;
    
    /**
     * 使用的模型
     */
    private String model;
}

