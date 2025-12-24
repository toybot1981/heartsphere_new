package com.heartsphere.aiagent.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 图片生成请求DTO
 * 与前端types.ts中的ImageGenerationRequest接口保持一致
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Schema(description = "图片生成请求，格式与客户端适配器接口一致")
public class ImageGenerationRequest {
    
    @Schema(description = "提供商（可选）：gemini, openai, qwen, doubao", example = "gemini")
    private String provider;
    
    @Schema(description = "模型名称（可选）", example = "imagen-3.0-generate-001")
    private String model;
    
    @Schema(description = "生成图片的提示词", requiredMode = Schema.RequiredMode.REQUIRED, example = "一只可爱的小猫")
    private String prompt;
    
    @Schema(description = "负面提示词（可选）", example = "模糊, 低质量")
    private String negativePrompt;
    
    @Schema(description = "图片宽度，默认1024", example = "1024")
    private Integer width;
    
    @Schema(description = "图片高度，默认1024", example = "1024")
    private Integer height;
    
    @Schema(description = "宽高比（可选）：1:1, 16:9, 9:16等", example = "1:1")
    private String aspectRatio;
    
    @Schema(description = "生成图片数量，默认1", example = "1")
    private Integer numberOfImages;
    
    @Schema(description = "图片风格（可选）", example = "realistic")
    private String style;
    
    @Schema(description = "API基础URL（可选，用于统一接入模式）", example = "https://ark.cn-beijing.volces.com/api/v3")
    private String baseUrl; // API基础URL，从配置表中获取
    
    @Schema(description = "API密钥（可选，用于统一接入模式，从模型配置表获取）", example = "xxx")
    private String apiKey; // API密钥，从配置表中获取
}
