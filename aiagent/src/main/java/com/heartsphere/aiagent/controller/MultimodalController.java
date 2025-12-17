package com.heartsphere.aiagent.controller;

import com.heartsphere.aiagent.adapter.MultimodalService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.image.ImagePrompt;
import org.springframework.ai.image.ImageResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * 多模态 API
 * 提供图片、语音、视频生成和处理接口
 */
@Slf4j
@RestController
@RequestMapping("/api/multimodal")
@RequiredArgsConstructor
public class MultimodalController {
    
    private final MultimodalService multimodalService;
    
    /**
     * 生成图片
     */
    @PostMapping("/image/generate")
    public ResponseEntity<ImageGenerationResponse> generateImage(@RequestBody ImageGenerationRequest request) {
        try {
            ImagePrompt imagePrompt = new ImagePrompt(request.getPrompt());
            ImageResponse response = multimodalService.generateImage(request.getPrompt(), request.getOptions());
            
            ImageGenerationResponse result = new ImageGenerationResponse();
            result.setSuccess(true);
            if (response.getResult() != null && response.getResult().getOutput() != null) {
                result.setImageUrl(response.getResult().getOutput().getUrl());
            }
            result.setMetadata(response.getMetadata());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("图片生成失败", e);
            ImageGenerationResponse result = new ImageGenerationResponse();
            result.setSuccess(false);
            result.setError(e.getMessage());
            return ResponseEntity.ok(result);
        }
    }
    
    /**
     * 文本转语音
     */
    @PostMapping("/audio/tts")
    public ResponseEntity<byte[]> textToSpeech(@RequestBody TextToSpeechRequest request) {
        try {
            byte[] audioData = multimodalService.textToSpeech(request.getText(), request.getOptions());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "speech.wav");
            
            return new ResponseEntity<>(audioData, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("文本转语音失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 语音转文本
     */
    @PostMapping("/audio/stt")
    public ResponseEntity<SpeechToTextResponse> speechToText(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "model", defaultValue = "paraformer-v2") String model) {
        try {
            byte[] audioData = file.getBytes();
            Map<String, Object> options = new HashMap<>();
            options.put("model", model);
            
            String text = multimodalService.speechToText(audioData, options);
            
            SpeechToTextResponse response = new SpeechToTextResponse();
            response.setSuccess(true);
            response.setText(text);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("语音转文本失败", e);
            SpeechToTextResponse response = new SpeechToTextResponse();
            response.setSuccess(false);
            response.setError(e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * 生成视频
     */
    @PostMapping("/video/generate")
    public ResponseEntity<VideoGenerationResponse> generateVideo(@RequestBody VideoGenerationRequest request) {
        try {
            String videoUrl = multimodalService.generateVideo(request.getPrompt(), request.getOptions());
            
            VideoGenerationResponse response = new VideoGenerationResponse();
            response.setSuccess(true);
            response.setVideoUrl(videoUrl);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("视频生成失败", e);
            VideoGenerationResponse response = new VideoGenerationResponse();
            response.setSuccess(false);
            response.setError(e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    @Data
    public static class ImageGenerationRequest {
        private String prompt;
        private Map<String, Object> options;
    }
    
    @Data
    public static class ImageGenerationResponse {
        private boolean success;
        private String imageUrl;
        private Object metadata;
        private String error;
    }
    
    @Data
    public static class TextToSpeechRequest {
        private String text;
        private Map<String, Object> options;
    }
    
    @Data
    public static class SpeechToTextResponse {
        private boolean success;
        private String text;
        private String error;
    }
    
    @Data
    public static class VideoGenerationRequest {
        private String prompt;
        private Map<String, Object> options;
    }
    
    @Data
    public static class VideoGenerationResponse {
        private boolean success;
        private String videoUrl;
        private String error;
    }
}

