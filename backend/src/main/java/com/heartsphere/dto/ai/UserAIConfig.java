package com.heartsphere.dto.ai;

import lombok.Data;

/**
 * 用户AI配置DTO
 */
@Data
public class UserAIConfig {
    
    /**
     * 文本生成提供商
     */
    private String textProvider;
    
    /**
     * 文本生成模型名称
     */
    private String textModel;
    
    /**
     * 图片生成提供商
     */
    private String imageProvider;
    
    /**
     * 图片生成模型名称
     */
    private String imageModel;
    
    /**
     * 音频处理提供商
     */
    private String audioProvider;
    
    /**
     * 音频处理模型名称
     */
    private String audioModel;
    
    /**
     * 视频生成提供商
     */
    private String videoProvider;
    
    /**
     * 视频生成模型名称
     */
    private String videoModel;
    
    /**
     * 是否启用降级
     */
    private Boolean enableFallback;
}

