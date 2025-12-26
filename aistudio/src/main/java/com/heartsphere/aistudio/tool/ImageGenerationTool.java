package com.heartsphere.aistudio.tool;

import com.heartsphere.aistudio.adapter.MultimodalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Base64;

/**
 * 图片生成工具
 * 支持文生图和图生图，支持多种画幅比例
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ImageGenerationTool implements Tool {
    
    private final MultimodalService multimodalService;
    
    @Override
    public String getName() {
        return "generate_image";
    }
    
    @Override
    public String getDescription() {
        return "生成高质量图片。参数：prompt(文字描述), aspectRatio(画幅比例: 1:1/16:9/9:16/4:3/3:4), referenceImage(参考图URL,可选), referenceStrength(参考图影响力0-100,可选)";
    }
    
    @Override
    public Object execute(Map<String, Object> parameters) {
        try {
            String prompt = parameters.getOrDefault("prompt", "").toString();
            String aspectRatio = parameters.getOrDefault("aspectRatio", "1:1").toString();
            String referenceImage = parameters.containsKey("referenceImage") 
                ? parameters.get("referenceImage").toString() 
                : null;
            Integer referenceStrength = parameters.containsKey("referenceStrength")
                ? Integer.parseInt(parameters.get("referenceStrength").toString())
                : null;
            
            log.info("生成图片: prompt={}, aspectRatio={}, hasReference={}, strength={}", 
                prompt, aspectRatio, referenceImage != null, referenceStrength);
            
            // 构建图片生成选项
            Map<String, Object> options = new HashMap<>();
            options.put("aspectRatio", aspectRatio);
            
            if (referenceImage != null && referenceStrength != null) {
                options.put("referenceImage", referenceImage);
                options.put("referenceStrength", referenceStrength / 100.0); // 转换为 0-1 范围
            }
            
            // 调用图片生成服务
            var response = multimodalService.generateImage(prompt, options);
            
            if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                String imageUrl = response.getResult().getOutput().getUrl();
                
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("imageUrl", imageUrl);
                result.put("prompt", prompt);
                result.put("aspectRatio", aspectRatio);
                if (referenceImage != null) {
                    result.put("referenceImage", referenceImage);
                    result.put("referenceStrength", referenceStrength);
                }
                
                return result;
            }
            
            return Map.of("success", false, "error", "图片生成失败");
        } catch (Exception e) {
            log.error("图片生成失败", e);
            return Map.of("success", false, "error", e.getMessage());
        }
    }
}








