package com.heartsphere.admin.controller;

import com.heartsphere.admin.service.ImageProcessingService;
import com.heartsphere.admin.service.ImageStorageService;
import com.heartsphere.admin.service.SystemResourceService;
import com.heartsphere.admin.dto.SystemResourceDTO;
import com.heartsphere.shared.dto.ApiResponse;
import com.heartsphere.shared.util.ImageUrlUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 图片管理控制器（管理员专用）
 */
@RestController
@RequestMapping("/api/admin/images")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Image Management", description = "管理员图片管理 API")
public class AdminImageController extends BaseAdminController {

    @Autowired
    private ImageStorageService imageStorageService;

    @Autowired
    private ImageProcessingService imageProcessingService;

    @Autowired
    private ImageUrlUtils imageUrlUtils;

    @Autowired
    private SystemResourceService systemResourceService;

    @Autowired
    private com.heartsphere.admin.service.AdminAuthService adminAuthService;

    /**
     * 获取图片列表
     */
    @Operation(summary = "获取图片列表", description = "获取系统预置图片列表")
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getImages(
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "true") Boolean isSystemResource,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);

        try {
            List<SystemResourceDTO> resources;
            
            // 如果指定了分类且不是"all"，按分类查询
            if (category != null && !category.isEmpty() && !category.equals("all")) {
                resources = systemResourceService.getResourcesByCategory(category);
            } else {
                // 获取所有资源
                resources = systemResourceService.getAllResources();
            }

            // 转换为图片列表格式
            List<Map<String, Object>> images = resources.stream().map(resource -> {
                Map<String, Object> image = new HashMap<>();
                image.put("id", resource.getId());
                image.put("url", resource.getUrl());
                image.put("name", resource.getName());
                image.put("category", resource.getCategory());
                image.put("description", resource.getDescription());
                image.put("width", resource.getWidth());
                image.put("height", resource.getHeight());
                image.put("fileSize", resource.getFileSize());
                image.put("createdAt", resource.getCreatedAt());
                image.put("updatedAt", resource.getUpdatedAt());
                return image;
            }).collect(java.util.stream.Collectors.toList());

            // 分页处理
            int total = images.size();
            int start = page * size;
            int end = Math.min(start + size, total);
            List<Map<String, Object>> pagedImages = start < total ? images.subList(start, end) : List.of();

            Map<String, Object> response = new HashMap<>();
            response.put("images", pagedImages);
            response.put("total", total);
            response.put("page", page);
            response.put("size", size);

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("获取图片列表失败", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "获取图片列表失败: " + e.getMessage()));
        }
    }

    /**
     * 上传图片
     */
    @Operation(summary = "上传图片", description = "上传系统预置图片")
    @PostMapping({ "", "/upload" })
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false, defaultValue = "general") String category,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        com.heartsphere.admin.entity.SystemAdmin admin = validateAdmin(authHeader);

        try {
            // 使用 SystemResourceService.createResource 同时保存文件和创建数据库记录
            // 这个方法内部会调用 imageStorageService.saveImage 保存文件
            String fileName = file.getOriginalFilename();
            if (fileName == null || fileName.isEmpty()) {
                fileName = "uploaded_image_" + System.currentTimeMillis();
            }
            
            com.heartsphere.admin.dto.SystemResourceDTO resourceDTO = systemResourceService.createResource(
                    file,
                    category,
                    fileName,  // name
                    null,      // description
                    null,      // prompt
                    null,      // tags
                    admin.getId()  // adminId
            );

            Map<String, String> result = new HashMap<>();
            result.put("url", resourceDTO.getUrl());
            result.put("relativePath", imageUrlUtils.toRelativePath(resourceDTO.getUrl()));
            result.put("id", String.valueOf(resourceDTO.getId()));

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("上传图片失败", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "上传图片失败: " + e.getMessage()));
        }
    }

    /**
     * 删除图片
     */
    @Operation(summary = "删除图片", description = "删除指定的图片")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);

        // TODO: 实现图片删除逻辑
        // 这里需要根据实际需求实现图片删除

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 生成缩略图（支持自定义宽高比例）
     */
    @Operation(summary = "生成缩略图", description = "根据自定义宽高比例生成缩略图")
    @PostMapping("/generate-thumbnail")
    public ResponseEntity<ApiResponse<Map<String, String>>> generateThumbnail(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);

        try {
            String imageUrl = (String) request.get("url");
            Integer width = request.get("width") != null ? 
                    Integer.valueOf(request.get("width").toString()) : null;
            Integer height = request.get("height") != null ? 
                    Integer.valueOf(request.get("height").toString()) : null;
            Boolean keepAspectRatio = request.get("keepAspectRatio") != null ? 
                    Boolean.valueOf(request.get("keepAspectRatio").toString()) : true;
            Double quality = request.get("quality") != null ? 
                    Double.valueOf(request.get("quality").toString()) : 0.85;

            if (imageUrl == null || imageUrl.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "图片URL不能为空"));
            }

            if (width == null || width <= 0 || height == null || height <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "宽度和高度必须大于0"));
            }

            // 从URL中提取相对路径
            String relativePath = imageUrlUtils.toRelativePath(imageUrl);
            if (relativePath == null || relativePath.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "无法从URL中提取图片路径"));
            }

            // 生成缩略图
            String thumbnailPath = imageProcessingService.generateAndSaveThumbnail(
                    relativePath, width, height, keepAspectRatio, quality);

            String thumbnailUrl = imageUrlUtils.toFullUrl(thumbnailPath);

            Map<String, String> result = new HashMap<>();
            result.put("url", thumbnailUrl);
            result.put("relativePath", thumbnailPath);

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("生成缩略图失败", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "生成缩略图失败: " + e.getMessage()));
        }
    }

    /**
     * 一键生成所有缩略图（小缩略图、中等质量、高质量）
     */
    @Operation(summary = "一键生成所有缩略图", description = "生成200x200小缩略图、中等质量缩略图和高质量缩略图")
    @PostMapping("/generate-all-thumbnails")
    public ResponseEntity<ApiResponse<Map<String, String>>> generateAllThumbnails(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);

        try {
            String imageUrl = (String) request.get("url");
            if (imageUrl == null || imageUrl.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "图片URL不能为空"));
            }

            // 从URL中提取相对路径
            String relativePath = imageUrlUtils.toRelativePath(imageUrl);
            if (relativePath == null || relativePath.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "无法从URL中提取图片路径"));
            }

            Map<String, String> result = new HashMap<>();

            // 1. 生成200x200小缩略图（质量0.85）
            try {
                String smallThumbnailPath = imageProcessingService.generateAndSaveThumbnail(
                        relativePath, 200, 200, true, 0.85);
                String smallThumbnailUrl = imageUrlUtils.toFullUrl(smallThumbnailPath);
                result.put("smallThumbnail", smallThumbnailUrl);
                result.put("smallThumbnailPath", smallThumbnailPath);
            } catch (Exception e) {
                log.warn("生成小缩略图失败: " + e.getMessage());
                result.put("smallThumbnail", "");
                result.put("smallThumbnailError", e.getMessage());
            }

            // 2. 生成中等质量缩略图（默认配置）
            try {
                String mediumPath = imageProcessingService.generateAndSaveMediumQuality(relativePath);
                String mediumUrl = imageUrlUtils.toFullUrl(mediumPath);
                result.put("medium", mediumUrl);
                result.put("mediumPath", mediumPath);
            } catch (Exception e) {
                log.warn("生成中等质量缩略图失败: " + e.getMessage());
                result.put("medium", "");
                result.put("mediumError", e.getMessage());
            }

            // 3. 生成高质量缩略图（默认配置）
            try {
                String highQualityPath = imageProcessingService.generateAndSaveHighQualityBackground(relativePath);
                String highQualityUrl = imageUrlUtils.toFullUrl(highQualityPath);
                result.put("highQuality", highQualityUrl);
                result.put("highQualityPath", highQualityPath);
            } catch (Exception e) {
                log.warn("生成高质量缩略图失败: " + e.getMessage());
                result.put("highQuality", "");
                result.put("highQualityError", e.getMessage());
            }

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("一键生成缩略图失败", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "一键生成缩略图失败: " + e.getMessage()));
        }
    }

    /**
     * 批量生成所有图片的缩略图（只生成未生成的）
     */
    @Operation(summary = "批量生成所有图片缩略图", description = "遍历所有图片，为没有生成过缩略图的图片生成三种缩略图")
    @PostMapping("/batch-generate-thumbnails")
    public ResponseEntity<ApiResponse<Map<String, Object>>> batchGenerateThumbnails(
            @RequestParam(required = false) String category,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);

        try {
            List<SystemResourceDTO> resources;
            if (category != null && !category.isEmpty() && !category.equals("all")) {
                resources = systemResourceService.getResourcesByCategory(category);
            } else {
                resources = systemResourceService.getAllResources();
            }

            int total = resources.size();
            int processed = 0;
            int generated = 0;
            int skipped = 0;
            int failed = 0;
            List<Map<String, Object>> results = new java.util.ArrayList<>();

            for (SystemResourceDTO resource : resources) {
                Map<String, Object> itemResult = new HashMap<>();
                itemResult.put("id", resource.getId());
                itemResult.put("name", resource.getName());
                itemResult.put("url", resource.getUrl());

                try {
                    String relativePath = imageUrlUtils.toRelativePath(resource.getUrl());
                    if (relativePath == null || relativePath.isEmpty()) {
                        itemResult.put("status", "skipped");
                        itemResult.put("message", "无法提取图片路径");
                        skipped++;
                        results.add(itemResult);
                        continue;
                    }

                    // 检查是否已存在所有缩略图
                    Map<String, Boolean> exists = imageProcessingService.checkAllThumbnailsExist(relativePath);
                    boolean allExist = exists.get("smallThumbnail") && 
                                      exists.get("medium") && 
                                      exists.get("highQuality");

                    if (allExist) {
                        itemResult.put("status", "skipped");
                        itemResult.put("message", "所有缩略图已存在");
                        skipped++;
                    } else {
                        // 生成缺失的缩略图
                        Map<String, String> generatedThumbnails = new HashMap<>();
                        int generatedCount = 0;

                        // 生成200x200小缩略图
                        if (!exists.get("smallThumbnail")) {
                            try {
                                String smallPath = imageProcessingService.generateAndSaveThumbnail(
                                        relativePath, 200, 200, true, 0.85);
                                generatedThumbnails.put("smallThumbnail", imageUrlUtils.toFullUrl(smallPath));
                                generatedCount++;
                            } catch (Exception e) {
                                log.warn("生成小缩略图失败: " + resource.getName() + " - " + e.getMessage());
                            }
                        }

                        // 生成中等质量缩略图
                        if (!exists.get("medium")) {
                            try {
                                String mediumPath = imageProcessingService.generateAndSaveMediumQuality(relativePath);
                                generatedThumbnails.put("medium", imageUrlUtils.toFullUrl(mediumPath));
                                generatedCount++;
                            } catch (Exception e) {
                                log.warn("生成中等质量缩略图失败: " + resource.getName() + " - " + e.getMessage());
                            }
                        }

                        // 生成高质量缩略图
                        if (!exists.get("highQuality")) {
                            try {
                                String hqPath = imageProcessingService.generateAndSaveHighQualityBackground(relativePath);
                                generatedThumbnails.put("highQuality", imageUrlUtils.toFullUrl(hqPath));
                                generatedCount++;
                            } catch (Exception e) {
                                log.warn("生成高质量缩略图失败: " + resource.getName() + " - " + e.getMessage());
                            }
                        }

                        if (generatedCount > 0) {
                            itemResult.put("status", "success");
                            itemResult.put("message", "生成了 " + generatedCount + " 个缩略图");
                            itemResult.put("generated", generatedThumbnails);
                            generated++;
                        } else {
                            itemResult.put("status", "failed");
                            itemResult.put("message", "生成缩略图失败");
                            failed++;
                        }
                    }
                } catch (Exception e) {
                    log.error("处理图片失败: " + resource.getName(), e);
                    itemResult.put("status", "failed");
                    itemResult.put("message", "处理失败: " + e.getMessage());
                    failed++;
                }

                processed++;
                results.add(itemResult);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("total", total);
            response.put("processed", processed);
            response.put("generated", generated);
            response.put("skipped", skipped);
            response.put("failed", failed);
            response.put("results", results);

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("批量生成缩略图失败", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "批量生成缩略图失败: " + e.getMessage()));
        }
    }
}
