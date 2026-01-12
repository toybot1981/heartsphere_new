package com.heartsphere.dto.ai;

import lombok.Data;

/**
 * 图片生成请求DTO
 */
@Data
public class ImageGenerationRequest {
    
    /**
     * 提供商
     */
    private String provider;
    
    /**
     * 模型名称
     */
    private String model;
    
    /**
     * 生成图片的提示词
     */
    private String prompt;
    
    /**
     * 负面提示词（可选）
     */
    private String negativePrompt;
    
    /**
     * 图片宽度，默认1024
     */
    private Integer width;
    
    /**
     * 图片高度，默认1024
     */
    private Integer height;
    
    /**
     * 宽高比，如 "1:1", "16:9"
     */
    private String aspectRatio;
    
    /**
     * 生成图片数量，默认1
     */
    private Integer numberOfImages;
    
    /**
     * 图片风格
     */
    private String style;
}

