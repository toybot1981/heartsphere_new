package com.heartsphere.aistudio.tool;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 提示词优化工具
 * 将简单想法扩展为专业的绘画提示词
 */
@Slf4j
@Component
public class PromptOptimizerTool implements Tool {
    
    @Override
    public String getName() {
        return "optimize_prompt";
    }
    
    @Override
    public String getDescription() {
        return "优化提示词，将简单想法扩展为专业绘画提示词。参数：simplePrompt(简单提示词), style(风格,可选: realistic/anime/cartoon/oil_painting/watercolor等)";
    }
    
    @Override
    public Object execute(Map<String, Object> parameters) {
        try {
            String simplePrompt = parameters.getOrDefault("simplePrompt", "").toString();
            String style = parameters.containsKey("style") 
                ? parameters.get("style").toString() 
                : "realistic";
            
            log.info("优化提示词: simplePrompt={}, style={}", simplePrompt, style);
            
            // 构建优化后的提示词
            // 这里可以调用 LLM 来优化，暂时使用模板
            String optimizedPrompt = buildOptimizedPrompt(simplePrompt, style);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("originalPrompt", simplePrompt);
            result.put("optimizedPrompt", optimizedPrompt);
            result.put("style", style);
            result.put("details", Map.of(
                "lighting", "professional studio lighting",
                "composition", "well-composed, balanced",
                "quality", "high quality, detailed",
                "style", style
            ));
            
            return result;
        } catch (Exception e) {
            log.error("提示词优化失败", e);
            return Map.of("success", false, "error", e.getMessage());
        }
    }
    
    private String buildOptimizedPrompt(String simplePrompt, String style) {
        StringBuilder sb = new StringBuilder();
        sb.append(simplePrompt);
        
        // 添加风格描述
        switch (style.toLowerCase()) {
            case "anime":
                sb.append(", anime style, vibrant colors, detailed character design");
                break;
            case "cartoon":
                sb.append(", cartoon style, playful, colorful");
                break;
            case "oil_painting":
                sb.append(", oil painting, classical art style, rich textures");
                break;
            case "watercolor":
                sb.append(", watercolor painting, soft colors, flowing brushstrokes");
                break;
            default:
                sb.append(", realistic, high quality, detailed, professional photography");
        }
        
        // 添加通用质量描述
        sb.append(", 8k, ultra detailed, best quality, masterpiece");
        
        return sb.toString();
    }
}








