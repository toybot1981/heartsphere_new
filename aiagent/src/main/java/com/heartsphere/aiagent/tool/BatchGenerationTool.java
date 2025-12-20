package com.heartsphere.aiagent.tool;

import com.heartsphere.aiagent.adapter.MultimodalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * 批量生成工具
 * 支持批量生成图片，支持进度监控
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BatchGenerationTool implements Tool {
    
    private final MultimodalService multimodalService;
    private final ImageGenerationTool imageGenerationTool;
    private final ExecutorService executorService = Executors.newFixedThreadPool(5);
    
    @Override
    public String getName() {
        return "batch_generate";
    }
    
    @Override
    public String getDescription() {
        return "批量生成图片。参数：prompts(提示词列表,数组), aspectRatio(画幅比例), callbackUrl(进度回调URL,可选)";
    }
    
    @Override
    public Object execute(Map<String, Object> parameters) {
        try {
            @SuppressWarnings("unchecked")
            List<String> prompts = (List<String>) parameters.getOrDefault("prompts", new ArrayList<>());
            String aspectRatio = parameters.getOrDefault("aspectRatio", "1:1").toString();
            
            log.info("批量生成图片: count={}, aspectRatio={}", prompts.size(), aspectRatio);
            
            // 异步批量生成
            List<CompletableFuture<Map<String, Object>>> futures = prompts.stream()
                .map(prompt -> CompletableFuture.supplyAsync(() -> {
                    Map<String, Object> params = new HashMap<>();
                    params.put("prompt", prompt);
                    params.put("aspectRatio", aspectRatio);
                    return (Map<String, Object>) imageGenerationTool.execute(params);
                }, executorService))
                .collect(Collectors.toList());
            
            // 等待所有任务完成
            List<Map<String, Object>> results = futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());
            
            // 统计结果
            long successCount = results.stream()
                .filter(r -> Boolean.TRUE.equals(r.get("success")))
                .count();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("total", prompts.size());
            result.put("successCount", successCount);
            result.put("failedCount", prompts.size() - successCount);
            result.put("results", results);
            
            return result;
        } catch (Exception e) {
            log.error("批量生成失败", e);
            return Map.of("success", false, "error", e.getMessage());
        }
    }
}








