package com.heartsphere.aiagent.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 音频处理请求DTO
 * 与前端types.ts中的TextToSpeechRequest和SpeechToTextRequest接口保持一致
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Schema(description = "音频处理请求，格式与客户端适配器接口一致")
public class AudioRequest {
    
    @Schema(description = "提供商（可选）：gemini, openai, qwen, doubao", example = "openai")
    private String provider;
    
    @Schema(description = "模型名称（可选）", example = "tts-1")
    private String model;
    
    @Schema(description = "文本转语音：要转换的文本", example = "你好，世界")
    private String text;
    
    @Schema(description = "语音转文本：音频文件数据（Base64编码）", example = "data:audio/wav;base64,...")
    private String audioData;
    
    @Schema(description = "语音类型（TTS使用）", example = "alloy")
    private String voice;
    
    @Schema(description = "语速（TTS使用，0.25-4.0）", example = "1.0")
    private Double speed;
    
    @Schema(description = "音调（TTS使用，-20.0到20.0）", example = "0.0")
    private Double pitch;
    
    @Schema(description = "语言（STT使用）", example = "zh-CN")
    private String language;
    
    @Schema(description = "流ID（实时识别使用，用于标识同一个音频流）", example = "stream-123")
    private String streamId;
    
    @Schema(description = "音频格式（实时识别使用）", example = "audio/pcm")
    private String contentType;
    
    @Schema(description = "采样率（实时识别使用）", example = "16000")
    private Integer sampleRate;
    
    @Schema(description = "声道数（实时识别使用，1=单声道，2=立体声）", example = "1")
    private Integer channels;
    
    @Schema(description = "是否结束流（实时识别使用）", example = "false")
    private Boolean endOfStream;
}
