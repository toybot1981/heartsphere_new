package com.heartsphere.service;

import com.heartsphere.shared.util.ImageUrlUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 缩略图生成服务（异步）
 * 用于在上传图片后异步生成各种尺寸的缩略图
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ThumbnailGenerationService {

    private final ImageProcessingService imageProcessingService;
    private final ImageUrlUtils imageUrlUtils;

    /**
     * 异步生成所有缩略图（200x200小缩略图、中等质量、高质量）
     * @param imageUrl 图片URL
     * @param includeHighQuality 是否包含高质量背景图（PC ChatWindow专用）
     * @return CompletableFuture，包含生成结果
     */
    @Async
    public CompletableFuture<Map<String, String>> generateAllThumbnailsAsync(String imageUrl, boolean includeHighQuality) {
        log.info("开始异步生成缩略图: {}", imageUrl);
        
        try {
            // 从URL中提取相对路径
            String relativePath = imageUrlUtils.toRelativePath(imageUrl);
            if (relativePath == null || relativePath.isEmpty()) {
                log.warn("无法从URL中提取图片路径: {}", imageUrl);
                return CompletableFuture.completedFuture(Map.of("status", "failed", "message", "无法提取图片路径"));
            }

            Map<String, String> result = new java.util.HashMap<>();
            result.put("status", "success");
            result.put("originalUrl", imageUrl);
            result.put("relativePath", relativePath);

            // 检查是否已存在所有缩略图
            Map<String, Boolean> exists = imageProcessingService.checkAllThumbnailsExist(relativePath);
            
            // 1. 生成200x200小缩略图（如果不存在）
            if (!exists.get("smallThumbnail")) {
                try {
                    String smallPath = imageProcessingService.generateAndSaveThumbnail(
                            relativePath, 200, 200, true, 0.85);
                    String smallUrl = imageUrlUtils.toFullUrl(smallPath);
                    result.put("smallThumbnail", smallUrl);
                    result.put("smallThumbnailPath", smallPath);
                    log.info("生成200x200小缩略图成功: {}", smallUrl);
                } catch (Exception e) {
                    log.warn("生成200x200小缩略图失败: {} - {}", imageUrl, e.getMessage());
                    result.put("smallThumbnailError", e.getMessage());
                }
            } else {
                log.info("200x200小缩略图已存在，跳过: {}", imageUrl);
                result.put("smallThumbnail", "exists");
            }

            // 2. 生成中等质量缩略图（如果不存在）
            if (!exists.get("medium")) {
                try {
                    String mediumPath = imageProcessingService.generateAndSaveMediumQuality(relativePath);
                    String mediumUrl = imageUrlUtils.toFullUrl(mediumPath);
                    result.put("medium", mediumUrl);
                    result.put("mediumPath", mediumPath);
                    log.info("生成中等质量缩略图成功: {}", mediumUrl);
                } catch (Exception e) {
                    log.warn("生成中等质量缩略图失败: {} - {}", imageUrl, e.getMessage());
                    result.put("mediumError", e.getMessage());
                }
            } else {
                log.info("中等质量缩略图已存在，跳过: {}", imageUrl);
                result.put("medium", "exists");
            }

            // 3. 生成高质量缩略图（如果不存在且需要生成）
            if (includeHighQuality) {
                if (!exists.get("highQuality")) {
                    try {
                        String hqPath = imageProcessingService.generateAndSaveHighQualityBackground(relativePath);
                        String hqUrl = imageUrlUtils.toFullUrl(hqPath);
                        result.put("highQuality", hqUrl);
                        result.put("highQualityPath", hqPath);
                        log.info("生成高质量缩略图成功: {}", hqUrl);
                    } catch (Exception e) {
                        log.warn("生成高质量缩略图失败: {} - {}", imageUrl, e.getMessage());
                        result.put("highQualityError", e.getMessage());
                    }
                } else {
                    log.info("高质量缩略图已存在，跳过: {}", imageUrl);
                    result.put("highQuality", "exists");
                }
            } else {
                log.info("跳过高质量缩略图生成（includeHighQuality=false）: {}", imageUrl);
                result.put("highQuality", "skipped");
            }

            log.info("异步生成缩略图完成: {}", imageUrl);
            return CompletableFuture.completedFuture(result);
        } catch (Exception e) {
            log.error("异步生成缩略图失败: {}", imageUrl, e);
            return CompletableFuture.completedFuture(Map.of(
                    "status", "failed",
                    "message", e.getMessage(),
                    "originalUrl", imageUrl
            ));
        }
    }
}
