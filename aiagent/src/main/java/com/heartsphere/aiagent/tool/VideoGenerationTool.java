package com.heartsphere.aiagent.tool;

import com.heartsphere.aiagent.adapter.MultimodalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 视频生成工具
 * 支持文生视频，支持不同分辨率和画幅
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VideoGenerationTool implements Tool {
    
    private final MultimodalService multimodalService;
    
    @Override
    public String getName() {
        return "generate_video";
    }
    
    @Override
    public String getDescription() {
        return "生成高清视频。参数：prompt(文字描述), resolution(分辨率: 720p/1080p), aspectRatio(画幅: 16:9/9:16)";
    }
    
    @Override
    public Object execute(Map<String, Object> parameters) {
        try {
            String prompt = parameters.getOrDefault("prompt", "").toString();
            String resolution = parameters.getOrDefault("resolution", "1080p").toString();
            String aspectRatio = parameters.getOrDefault("aspectRatio", "16:9").toString();
            
            log.info("生成视频: prompt={}, resolution={}, aspectRatio={}", 
                prompt, resolution, aspectRatio);
            
            // 构建视频生成选项
            Map<String, Object> options = new HashMap<>();
            options.put("resolution", resolution);
            options.put("aspectRatio", aspectRatio);
            
            // 调用视频生成服务
            String videoUrl = multimodalService.generateVideo(prompt, options);
            
            if (videoUrl != null && !videoUrl.isEmpty()) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("videoUrl", videoUrl);
                result.put("prompt", prompt);
                result.put("resolution", resolution);
                result.put("aspectRatio", aspectRatio);
                
                // 如果是 task_id，标记为异步任务
                if (videoUrl.startsWith("task_id:")) {
                    result.put("async", true);
                    result.put("taskId", videoUrl.substring(8));
                }
                
                return result;
            }
            
            return Map.of("success", false, "error", "视频生成失败");
        } catch (Exception e) {
            log.error("视频生成失败", e);
            return Map.of("success", false, "error", e.getMessage());
        }
    }
}








