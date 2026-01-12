package com.heartsphere.aiagent.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.util.List;

/**
 * 图片生成响应DTO
 * 与前端types.ts中的ImageGenerationResponse接口保持一致
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Schema(description = "图片生成响应，格式与客户端适配器接口一致")
public class ImageGenerationResponse {
    
    @Schema(description = "生成的图片列表")
    private List<Image> images;
    
    @Schema(description = "使用的提供商", example = "gemini")
    private String provider;
    
    @Schema(description = "使用的模型", example = "imagen-3.0-generate-001")
    private String model;
    
    @Schema(description = "使用量统计")
    private Usage usage;
    
    /**
     * 图片对象
     * 与前端types.ts中的Image接口保持一致
     */
    @Data
    @Schema(description = "图片对象，格式与客户端适配器接口一致")
    public static class Image {
        @Schema(description = "图片URL", example = "https://example.com/image.png")
        private String url;
        
        @Schema(description = "Base64编码（可选）", example = "data:image/png;base64,...")
        private String base64;
    }
    
    /**
     * 使用量统计
     * 与前端types.ts中的Usage接口保持一致
     */
    @Data
    @Schema(description = "使用量统计，格式与客户端适配器接口一致")
    public static class Usage {
        @Schema(description = "生成的图片数量", example = "1")
        private Integer imagesGenerated;
    }
}
