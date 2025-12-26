package com.heartsphere.aistudio.tool;

import com.heartsphere.aistudio.adapter.MultimodalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 图表生成工具
 * 基于数据生成可视化图表
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChartGeneratorTool implements Tool {
    
    private final MultimodalService multimodalService;
    
    @Override
    public String getName() {
        return "generate_chart";
    }
    
    @Override
    public String getDescription() {
        return "根据数据生成图表。参数：data(数据对象), chartType(图表类型: line/bar/pie), title(图表标题)";
    }
    
    @Override
    public Object execute(Map<String, Object> parameters) {
        try {
            Map<String, Object> data = (Map<String, Object>) parameters.get("data");
            String chartType = parameters.getOrDefault("chartType", "line").toString();
            String title = parameters.getOrDefault("title", "数据图表").toString();
            
            log.info("生成图表: type={}, title={}", chartType, title);
            
            // 构建图表描述 prompt
            String chartPrompt = buildChartPrompt(data, chartType, title);
            
            // 调用图片生成 API
            Map<String, Object> options = new HashMap<>();
            var response = multimodalService.generateImage(chartPrompt, options);
            
            if (response != null && response.getResult() != null && response.getResult().getOutput() != null) {
                String imageUrl = response.getResult().getOutput().getUrl();
                
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("chartUrl", imageUrl);
                result.put("chartType", chartType);
                result.put("title", title);
                result.put("prompt", chartPrompt);
                
                return result;
            }
            
            return Map.of("success", false, "error", "图表生成失败");
        } catch (Exception e) {
            log.error("图表生成失败", e);
            return Map.of("success", false, "error", e.getMessage());
        }
    }
    
    /**
     * 构建图表生成 prompt
     */
    private String buildChartPrompt(Map<String, Object> data, String chartType, String title) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("生成一个专业的").append(chartType).append("图表，标题：").append(title).append("。");
        
        // 提取数据
        if (data.containsKey("monthlyData")) {
            Map<String, Object> monthlyData = (Map<String, Object>) data.get("monthlyData");
            prompt.append("数据如下：");
            monthlyData.forEach((month, value) -> {
                prompt.append(month).append(": ").append(value).append("; ");
            });
        }
        
        prompt.append("要求：图表清晰、数据准确、专业美观，使用中文标签。");
        
        return prompt.toString();
    }
}

