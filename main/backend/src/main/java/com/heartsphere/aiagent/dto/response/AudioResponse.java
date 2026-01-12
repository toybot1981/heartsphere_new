package com.heartsphere.aiagent.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 音频处理响应DTO
 * 与前端types.ts中的AudioResponse接口保持一致
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Schema(description = "音频处理响应，格式与客户端适配器接口一致")
public class AudioResponse {
    
    @Schema(description = "文本转语音：音频文件URL；语音转文本：识别出的文本", example = "https://example.com/audio.mp3")
    private String content;
    
    @Schema(description = "文本转语音：音频Base64编码（可选）", example = "data:audio/mp3;base64,...")
    private String audioBase64;
    
    @Schema(description = "音频时长（秒）", example = "5.0")
    private Double duration;
    
    @Schema(description = "使用的提供商", example = "openai")
    private String provider;
    
    @Schema(description = "使用的模型", example = "tts-1")
    private String model;
    
    @Schema(description = "置信度（STT使用，0-1）", example = "0.95")
    private Double confidence;
}
