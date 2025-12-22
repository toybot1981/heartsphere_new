package com.heartsphere.dto.ai;

import lombok.Data;

/**
 * 音频处理请求DTO
 */
@Data
public class AudioRequest {
    
    /**
     * 提供商
     */
    private String provider;
    
    /**
     * 模型名称
     */
    private String model;
    
    /**
     * 文本转语音：要转换为语音的文本
     */
    private String text;
    
    /**
     * 语音类型
     */
    private String voice;
    
    /**
     * 语速：0.25-4.0，默认1.0
     */
    private Double speed;
    
    /**
     * 音调：-20.0到20.0，默认0.0
     */
    private Double pitch;
    
    /**
     * 语言代码，如 "zh-CN", "en-US"
     */
    private String language;
}

