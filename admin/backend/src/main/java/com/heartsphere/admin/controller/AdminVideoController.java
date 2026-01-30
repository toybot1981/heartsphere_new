package com.heartsphere.admin.controller;

import com.heartsphere.admin.service.ImageStorageService;
import com.heartsphere.admin.service.VideoConversionService;
import com.heartsphere.shared.dto.ApiResponse;
import com.heartsphere.shared.util.ImageUrlUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * 视频管理控制器（管理员专用）
 */
@RestController
@RequestMapping("/api/admin/videos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Video Management", description = "管理员视频管理 API")
public class AdminVideoController extends BaseAdminController {

    @Autowired
    private ImageStorageService imageStorageService;

    @Autowired
    private ImageUrlUtils imageUrlUtils;

    @Autowired
    private VideoConversionService videoConversionService;

    @Value("${app.video.storage.local.path:./uploads/videos}")
    private String videoStoragePath;

    /**
     * 获取视频列表
     */
    @Operation(summary = "获取视频列表", description = "获取系统预置视频列表")
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getVideos(
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "true") Boolean isSystemResource,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);

        try {
            List<Map<String, Object>> videos = new ArrayList<>();
            
            // 从文件系统扫描视频文件
            Path basePath = Paths.get(videoStoragePath);
            if (Files.exists(basePath)) {
                // 如果指定了分类且不是"all"，只扫描该分类目录
                if (category != null && !category.isEmpty() && !category.equals("all")) {
                    Path categoryPath = basePath.resolve(category);
                    if (Files.exists(categoryPath)) {
                        videos.addAll(scanVideoDirectory(categoryPath, category));
                    }
                } else {
                    // 扫描所有分类
                    try (Stream<Path> categoryDirs = Files.list(basePath)) {
                        categoryDirs.filter(Files::isDirectory).forEach(categoryDir -> {
                            String cat = categoryDir.getFileName().toString();
                            // 跳过用户目录（如果存在，用户ID通常是数字）
                            if (!cat.matches("\\d+")) {
                                videos.addAll(scanVideoDirectory(categoryDir, cat));
                            }
                        });
                    }
                }
            }

            // 分页处理
            int total = videos.size();
            int start = page * size;
            int end = Math.min(start + size, total);
            List<Map<String, Object>> pagedVideos = start < total ? videos.subList(start, end) : List.of();

            Map<String, Object> response = new HashMap<>();
            response.put("videos", pagedVideos);
            response.put("total", total);
            response.put("page", page);
            response.put("size", size);

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("获取视频列表失败", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "获取视频列表失败: " + e.getMessage()));
        }
    }

    /**
     * 扫描视频目录
     */
    private List<Map<String, Object>> scanVideoDirectory(Path dir, String category) {
        List<Map<String, Object>> videos = new ArrayList<>();
        try {
            Files.walkFileTree(dir, new java.nio.file.SimpleFileVisitor<Path>() {
                @Override
                public java.nio.file.FileVisitResult visitFile(Path file, java.nio.file.attribute.BasicFileAttributes attrs) {
                    String filename = file.getFileName().toString().toLowerCase();
                    if (filename.endsWith(".mp4") || filename.endsWith(".mov") || 
                        filename.endsWith(".avi") || filename.endsWith(".webm")) {
                        try {
                            // 计算相对路径
                            Path relativePath = Paths.get(videoStoragePath).relativize(file);
                            String relativePathStr = relativePath.toString().replace("\\", "/");
                            
                            // 获取文件信息
                            long fileSize = Files.size(file);
                            long createdAt = Files.getLastModifiedTime(file).toMillis();
                            
                            // 构建完整URL
                            String fullUrl = imageUrlUtils.toFullUrl(relativePathStr);
                            // 如果 toFullUrl 返回的是图片路径，需要替换为视频路径
                            if (fullUrl.contains("/images/")) {
                                fullUrl = fullUrl.replace("/images/", "/videos/");
                            }
                            
                            Map<String, Object> video = new HashMap<>();
                            video.put("url", fullUrl);
                            video.put("relativePath", relativePathStr);
                            video.put("name", file.getFileName().toString());
                            video.put("category", category);
                            video.put("size", fileSize);
                            video.put("createdAt", new java.util.Date(createdAt).toInstant().toString());
                            
                            videos.add(video);
                        } catch (IOException e) {
                            log.warn("读取视频信息失败: " + file + " - " + e.getMessage());
                        }
                    }
                    return java.nio.file.FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException e) {
            log.warn("扫描视频目录失败: " + dir + " - " + e.getMessage());
        }
        
        // 按创建时间倒序排序
        videos.sort((a, b) -> {
            String createdAtA = (String) a.get("createdAt");
            String createdAtB = (String) b.get("createdAt");
            if (createdAtA == null || createdAtB == null) return 0;
            return createdAtB.compareTo(createdAtA);
        });
        
        return videos;
    }

    /**
     * 上传视频
     */
    @Operation(summary = "上传视频", description = "上传系统预置视频")
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false, defaultValue = "general") String category,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);

        try {
            // 保存视频文件
            String relativePath = imageStorageService.saveVideo(file, category, null);
            // ImageUrlUtils.toFullUrl 默认使用 /images/ 路径，需要替换为 /videos/
            String imageUrl = imageUrlUtils.toFullUrl(relativePath);
            String fullUrl = imageUrl.replace("/images/", "/videos/");
            // 如果替换后没有变化，说明路径格式不同，手动构建
            if (fullUrl.equals(imageUrl) && !fullUrl.contains("/videos/")) {
                // 从 imageUrl 中提取基础URL，然后替换路径
                String baseUrl = imageUrl.substring(0, imageUrl.indexOf("/images/"));
                fullUrl = baseUrl + "/videos/" + relativePath;
            }

            Map<String, String> result = new HashMap<>();
            result.put("url", fullUrl);
            result.put("relativePath", relativePath);

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("上传视频失败", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "上传视频失败: " + e.getMessage()));
        }
    }

    /**
     * 删除视频
     */
    @Operation(summary = "删除视频", description = "删除指定的视频")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVideo(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);

        // TODO: 实现视频删除逻辑
        // 这里需要根据实际需求实现视频删除

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * 将视频转换为动画（GIF/Lottie/PAG）
     */
    @Operation(summary = "视频转动画", description = "将视频转换为GIF、Lottie或PAG格式")
    @PostMapping("/convert-to-animation")
    public ResponseEntity<ApiResponse<Map<String, String>>> convertToAnimation(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);

        try {
            String videoUrl = (String) request.get("url");
            String format = request.get("format") != null ? 
                    request.get("format").toString().toLowerCase() : "gif";
            Integer fps = request.get("fps") != null ? 
                    Integer.valueOf(request.get("fps").toString()) : 10;
            Integer width = request.get("width") != null ? 
                    Integer.valueOf(request.get("width").toString()) : null;
            Integer height = request.get("height") != null ? 
                    Integer.valueOf(request.get("height").toString()) : null;
            Object qualityObj = request.get("quality");
            String quality = qualityObj != null ? qualityObj.toString() : "medium";
            Boolean keepAspectRatio = request.get("keepAspectRatio") != null ? 
                    Boolean.valueOf(request.get("keepAspectRatio").toString()) : true;
            Double startTime = request.get("startTime") != null ? 
                    Double.valueOf(request.get("startTime").toString()) : 0.0;
            Double duration = request.get("duration") != null ? 
                    Double.valueOf(request.get("duration").toString()) : null;

            if (videoUrl == null || videoUrl.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "视频URL不能为空"));
            }

            // 从URL中提取相对路径
            String relativePath = imageUrlUtils.toRelativePath(videoUrl);
            if (relativePath == null || relativePath.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(400, "无法从URL中提取视频路径"));
            }

            // 处理路径：移除开头的 / 和 videos/ 前缀
            // 可能的情况：
            // 1. /videos/zhengxin/... -> zhengxin/...
            // 2. videos/zhengxin/... -> zhengxin/...
            // 3. /images/videos/zhengxin/... -> zhengxin/... (不应该出现，但兼容处理)
            if (relativePath.startsWith("/")) {
                relativePath = relativePath.substring(1);
            }
            if (relativePath.startsWith("videos/")) {
                relativePath = relativePath.substring("videos/".length());
            }
            if (relativePath.startsWith("images/videos/")) {
                relativePath = relativePath.substring("images/videos/".length());
            }
            
            log.info("提取的视频相对路径: {}", relativePath);

            log.info("视频转动画请求: url={}, format={}, fps={}, width={}, height={}, quality={}", 
                    videoUrl, format, fps, width, height, quality);

            String convertedPath;
            String convertedUrl;

            // 根据格式调用不同的转换方法
            switch (format.toLowerCase()) {
                case "gif":
                    convertedPath = videoConversionService.convertToGif(
                            relativePath, fps, width, height, quality, 
                            keepAspectRatio, startTime, duration);
                    convertedUrl = imageUrlUtils.toFullUrl(convertedPath);
                    break;
                    
                case "lottie":
                    Integer lottiePrecision = request.get("lottiePrecision") != null ? 
                            Integer.valueOf(request.get("lottiePrecision").toString()) : 3;
                    Boolean lottieOptimize = request.get("lottieOptimize") != null ? 
                            Boolean.valueOf(request.get("lottieOptimize").toString()) : true;
                    convertedPath = videoConversionService.convertToLottie(
                            relativePath, fps, width, height, 
                            lottiePrecision, lottieOptimize, 
                            startTime, duration);
                    convertedUrl = imageUrlUtils.toFullUrl(convertedPath);
                    break;
                    
                case "pag":
                    Integer pagCompression = request.get("pagCompressionLevel") != null ? 
                            Integer.valueOf(request.get("pagCompressionLevel").toString()) : 5;
                    convertedPath = videoConversionService.convertToPag(
                            relativePath, fps, width, height, 
                            pagCompression, startTime, duration);
                    convertedUrl = imageUrlUtils.toFullUrl(convertedPath);
                    break;
                    
                default:
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error(400, "不支持的格式: " + format + "，支持: gif, lottie, pag"));
            }

            Map<String, String> result = new HashMap<>();
            result.put("url", convertedUrl);
            result.put("relativePath", convertedPath);
            result.put("format", format);

            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("视频转动画失败", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(400, "视频转动画失败: " + e.getMessage()));
        }
    }
}
