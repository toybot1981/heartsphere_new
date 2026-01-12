package com.heartsphere.aiagent.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 视频生成请求DTO
 * 与前端types.ts中的VideoGenerationRequest接口保持一致
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Schema(description = "视频生成请求，格式与客户端适配器接口一致")
public class VideoGenerationRequest {
    
    @Schema(description = "提供商（可选）：gemini, openai, qwen, doubao", example = "gemini")
    private String provider;
    
    @Schema(description = "模型名称（可选）", example = "veo-2")
    private String model;
    
    @Schema(description = "生成视频的提示词", requiredMode = Schema.RequiredMode.REQUIRED, example = "一只小猫在花园里玩耍")
    private String prompt;
    
    @Schema(description = "视频时长（秒）", example = "5")
    private Integer duration;
    
    @Schema(description = "分辨率：720p, 1080p等", example = "1080p")
    private String resolution;
}
