package com.heartsphere.aiagent.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 视频生成响应DTO
 * 与前端types.ts中的VideoGenerationResponse接口保持一致
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Schema(description = "视频生成响应，格式与客户端适配器接口一致")
public class VideoGenerationResponse {
    
    @Schema(description = "视频URL", example = "https://example.com/video.mp4")
    private String videoUrl;
    
    @Schema(description = "视频ID（异步生成时使用）", example = "video_123456")
    private String videoId;
    
    @Schema(description = "状态：completed, processing", example = "completed", allowableValues = {"completed", "processing"})
    private String status;
    
    @Schema(description = "使用的提供商", example = "gemini")
    private String provider;
    
    @Schema(description = "使用的模型", example = "veo-2")
    private String model;
    
    @Schema(description = "视频时长（秒）", example = "5")
    private Integer duration;
}
