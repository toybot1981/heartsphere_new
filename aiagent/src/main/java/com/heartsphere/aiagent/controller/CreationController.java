package com.heartsphere.aiagent.controller;

import com.heartsphere.aiagent.entity.CreationEntity;
import com.heartsphere.aiagent.service.CreationService;
import com.heartsphere.aiagent.tool.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 创作中心控制器
 * 提供视觉创作、音频创作、智能辅助等功能
 */
@Slf4j
@RestController
@RequestMapping("/api/creation")
@RequiredArgsConstructor
public class CreationController {
    
    private final ImageGenerationTool imageGenerationTool;
    private final VideoGenerationTool videoGenerationTool;
    private final PromptOptimizerTool promptOptimizerTool;
    private final BatchGenerationTool batchGenerationTool;
    private final VoiceSynthesisTool voiceSynthesisTool;
    private final VoiceCloneTool voiceCloneTool;
    private final CreationService creationService;
    
    // ========== 视觉创作中心 ==========
    
    /**
     * 文生图
     */
    @PostMapping("/image/generate")
    public ResponseEntity<CreationResponse> generateImage(@RequestBody ImageGenerateRequest request) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("prompt", request.getPrompt());
            params.put("aspectRatio", request.getAspectRatio() != null ? request.getAspectRatio() : "1:1");
            if (request.getReferenceImage() != null) {
                params.put("referenceImage", request.getReferenceImage());
                params.put("referenceStrength", request.getReferenceStrength() != null ? request.getReferenceStrength() : 50);
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) imageGenerationTool.execute(params);
            
            if (Boolean.TRUE.equals(result.get("success"))) {
                // 保存作品
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("aspectRatio", result.get("aspectRatio"));
                if (request.getReferenceImage() != null) {
                    metadata.put("referenceImage", request.getReferenceImage());
                    metadata.put("referenceStrength", request.getReferenceStrength());
                }
                
                CreationEntity creation = creationService.saveCreation(
                    "image",
                    request.getTitle() != null ? request.getTitle() : "生成的图片",
                    request.getPrompt(),
                    result.get("imageUrl").toString(),
                    null,
                    metadata,
                    request.getUserId()
                );
                
                return ResponseEntity.ok(new CreationResponse(true, creation, null));
            } else {
                return ResponseEntity.ok(new CreationResponse(false, null, result.get("error").toString()));
            }
        } catch (Exception e) {
            log.error("图片生成失败", e);
            return ResponseEntity.ok(new CreationResponse(false, null, e.getMessage()));
        }
    }
    
    /**
     * 文生视频
     */
    @PostMapping("/video/generate")
    public ResponseEntity<CreationResponse> generateVideo(@RequestBody VideoGenerateRequest request) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("prompt", request.getPrompt());
            params.put("resolution", request.getResolution() != null ? request.getResolution() : "1080p");
            params.put("aspectRatio", request.getAspectRatio() != null ? request.getAspectRatio() : "16:9");
            
            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) videoGenerationTool.execute(params);
            
            if (Boolean.TRUE.equals(result.get("success"))) {
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("resolution", result.get("resolution"));
                metadata.put("aspectRatio", result.get("aspectRatio"));
                
                CreationEntity creation = creationService.saveCreation(
                    "video",
                    request.getTitle() != null ? request.getTitle() : "生成的视频",
                    request.getPrompt(),
                    result.get("videoUrl").toString(),
                    null,
                    metadata,
                    request.getUserId()
                );
                
                return ResponseEntity.ok(new CreationResponse(true, creation, null));
            } else {
                return ResponseEntity.ok(new CreationResponse(false, null, result.get("error").toString()));
            }
        } catch (Exception e) {
            log.error("视频生成失败", e);
            return ResponseEntity.ok(new CreationResponse(false, null, e.getMessage()));
        }
    }
    
    // ========== 音频创作实验室 ==========
    
    /**
     * 文本转语音
     */
    @PostMapping("/audio/tts")
    public ResponseEntity<CreationResponse> textToSpeech(@RequestBody TTSRequest request) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("text", request.getText());
            params.put("voice", request.getVoice() != null ? request.getVoice() : "warm_female");
            params.put("language", request.getLanguage() != null ? request.getLanguage() : "zh");
            
            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) voiceSynthesisTool.execute(params);
            
            if (Boolean.TRUE.equals(result.get("success"))) {
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("voice", result.get("voice"));
                metadata.put("language", result.get("language"));
                metadata.put("duration", result.get("duration"));
                
                // 注意：这里 audioBase64 需要存储或转换为 URL
                // 简化处理：直接存储 base64
                CreationEntity creation = creationService.saveCreation(
                    "audio",
                    request.getTitle() != null ? request.getTitle() : "生成的语音",
                    request.getText(),
                    "data:audio/wav;base64," + result.get("audioBase64"),
                    null,
                    metadata,
                    request.getUserId()
                );
                
                return ResponseEntity.ok(new CreationResponse(true, creation, null));
            } else {
                return ResponseEntity.ok(new CreationResponse(false, null, result.get("error").toString()));
            }
        } catch (Exception e) {
            log.error("语音合成失败", e);
            return ResponseEntity.ok(new CreationResponse(false, null, e.getMessage()));
        }
    }
    
    /**
     * 语音克隆
     */
    @PostMapping("/audio/clone")
    public ResponseEntity<Map<String, Object>> cloneVoice(@RequestBody VoiceCloneRequest request) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("referenceAudio", request.getReferenceAudio());
            if (request.getStylePreset() != null) {
                params.put("stylePreset", request.getStylePreset());
            }
            if (request.getCustomStyle() != null) {
                params.put("customStyle", request.getCustomStyle());
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) voiceCloneTool.execute(params);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("语音克隆失败", e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // ========== 智能辅助工具 ==========
    
    /**
     * 提示词优化
     */
    @PostMapping("/assistant/optimize-prompt")
    public ResponseEntity<Map<String, Object>> optimizePrompt(@RequestBody PromptOptimizeRequest request) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("simplePrompt", request.getSimplePrompt());
            params.put("style", request.getStyle() != null ? request.getStyle() : "realistic");
            
            Object result = promptOptimizerTool.execute(params);
            return ResponseEntity.ok(Map.of("success", true, "result", result));
        } catch (Exception e) {
            log.error("提示词优化失败", e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    /**
     * 批量生成
     */
    @PostMapping("/assistant/batch-generate")
    public ResponseEntity<Map<String, Object>> batchGenerate(@RequestBody BatchGenerateRequest request) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("prompts", request.getPrompts());
            params.put("aspectRatio", request.getAspectRatio() != null ? request.getAspectRatio() : "1:1");
            
            Object result = batchGenerationTool.execute(params);
            return ResponseEntity.ok(Map.of("success", true, "result", result));
        } catch (Exception e) {
            log.error("批量生成失败", e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }
    
    // ========== 作品管理 ==========
    
    /**
     * 获取所有作品
     */
    @GetMapping("/gallery")
    public ResponseEntity<List<CreationEntity>> getGallery(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String userId) {
        List<CreationEntity> creations;
        if (type != null) {
            creations = creationService.getCreationsByType(type);
        } else if (userId != null) {
            creations = creationService.getUserCreations(userId);
        } else {
            creations = creationService.getAllCreations();
        }
        return ResponseEntity.ok(creations);
    }
    
    /**
     * 获取作品详情
     */
    @GetMapping("/gallery/{creationId}")
    public ResponseEntity<CreationEntity> getCreation(@PathVariable String creationId) {
        CreationEntity creation = creationService.getCreation(creationId);
        return ResponseEntity.ok(creation);
    }
    
    /**
     * 删除作品
     */
    @DeleteMapping("/gallery/{creationId}")
    public ResponseEntity<Map<String, Object>> deleteCreation(@PathVariable String creationId) {
        creationService.deleteCreation(creationId);
        return ResponseEntity.ok(Map.of("success", true, "message", "作品已删除"));
    }
    
    // ========== 请求/响应类 ==========
    
    @Data
    public static class ImageGenerateRequest {
        private String prompt;
        private String aspectRatio; // 1:1, 16:9, 9:16, 4:3, 3:4
        private String referenceImage; // 参考图 URL
        private Integer referenceStrength; // 0-100
        private String title;
        private String userId;
    }
    
    @Data
    public static class VideoGenerateRequest {
        private String prompt;
        private String resolution; // 720p, 1080p
        private String aspectRatio; // 16:9, 9:16
        private String title;
        private String userId;
    }
    
    @Data
    public static class TTSRequest {
        private String text;
        private String voice; // warm_female, deep_male, energetic_female, gentle_male, professional_female
        private String language; // zh, en
        private String title;
        private String userId;
    }
    
    @Data
    public static class VoiceCloneRequest {
        private String referenceAudio; // 参考音频 URL 或 base64
        private String stylePreset; // cartoon_voice, movie_trailer, news_broadcast, asmr_whisper
        private String customStyle; // 自定义风格指令
    }
    
    @Data
    public static class PromptOptimizeRequest {
        private String simplePrompt;
        private String style; // realistic, anime, cartoon, oil_painting, watercolor
    }
    
    @Data
    public static class BatchGenerateRequest {
        private List<String> prompts;
        private String aspectRatio;
    }
    
    @Data
    public static class CreationResponse {
        private boolean success;
        private CreationEntity creation;
        private String error;
        
        public CreationResponse(boolean success, CreationEntity creation, String error) {
            this.success = success;
            this.creation = creation;
            this.error = error;
        }
    }
}





