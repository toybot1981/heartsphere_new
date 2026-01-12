package com.heartsphere.dto.ai;

import lombok.Data;
import java.util.List;

/**
 * 图片生成响应DTO
 */
@Data
public class ImageGenerationResponse {
    
    /**
     * 生成的图片列表
     */
    private List<ImageInfo> images;
    
    /**
     * 使用的提供商
     */
    private String provider;
    
    /**
     * 使用的模型
     */
    private String model;
    
    /**
     * 使用情况
     */
    private ImageUsage usage;
    
    /**
     * 图片信息DTO
     */
    @Data
    public static class ImageInfo {
        /**
         * 图片URL
         */
        private String url;
        
        /**
         * Base64编码（可选）
         */
        private String base64;
    }
    
    /**
     * 图片使用情况DTO
     */
    @Data
    public static class ImageUsage {
        /**
         * 生成的图片数量
         */
        private Integer imagesGenerated;
    }
}

