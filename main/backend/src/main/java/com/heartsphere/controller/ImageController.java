package com.heartsphere.controller;

import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.ImageProcessingService;
import com.heartsphere.service.ImageStorageService;
import com.heartsphere.shared.util.ImageUrlUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private static final Logger logger = Logger.getLogger(ImageController.class.getName());

    @Autowired
    private ImageStorageService imageStorageService;

    @Autowired
    private ImageUrlUtils imageUrlUtils;

    @Autowired
    private WebClient webClient;

    @Autowired
    private ImageProcessingService imageProcessingService;

    /**
     * 获取当前用户ID（用于用户资源路径）
     */
    private String getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                return String.valueOf(userDetails.getId());
            }
        } catch (Exception e) {
            logger.warning("无法获取用户ID: " + e.getMessage());
        }
        return null;
    }

    /**
     * 上传图片文件
     * @param file 图片文件
     * @param category 图片分类（可选，默认为general）
     * @param isSystemResource 是否为系统资源（可选，默认为false）。如果为true，则不包含userId
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "general") String category,
            @RequestParam(value = "isSystemResource", defaultValue = "false") Boolean isSystemResource) {
        logger.info("========== 收到图片上传请求 ==========");
        logger.info("文件名: " + (file != null ? file.getOriginalFilename() : "null"));
        logger.info("文件大小: " + (file != null ? file.getSize() + " bytes" : "null"));
        logger.info("文件类型: " + (file != null ? file.getContentType() : "null"));
        logger.info("分类: " + category);
        logger.info("系统资源: " + isSystemResource);
        
        try {
            String relativePath;
            if (isSystemResource != null && isSystemResource) {
                // 系统资源：不包含userId
                relativePath = imageStorageService.saveImage(file, category, null);
                logger.info("系统资源上传成功，相对路径: " + relativePath);
            } else {
                // 用户资源：包含userId
                String userId = getCurrentUserId();
                relativePath = imageStorageService.saveImage(file, category, userId);
                logger.info("用户资源上传成功，相对路径: " + relativePath);
            }
            
            // 转换为完整URL返回给前端
            String fullUrl = imageUrlUtils.toFullUrl(relativePath);
            logger.info("图片完整URL: " + fullUrl);
            
            // 获取所有分辨率版本的URL（如果已生成）
            Map<String, String> variants = new HashMap<>();
            try {
                if (imageProcessingService != null) {
                    // 尝试获取所有分辨率版本
                    String thumbnailPath = getVariantPath(relativePath, 200, 200);
                    String mediumPath = getVariantPath(relativePath, 800, 600);
                    String highQualityPath = getVariantPath(relativePath, 1920, 1080);
                    
                    if (thumbnailPath != null) {
                        variants.put("thumbnail", imageUrlUtils.toFullUrl(thumbnailPath));
                    }
                    if (mediumPath != null) {
                        variants.put("medium", imageUrlUtils.toFullUrl(mediumPath));
                    }
                    if (highQualityPath != null) {
                        variants.put("highQuality", imageUrlUtils.toFullUrl(highQualityPath));
                    }
                }
            } catch (Exception e) {
                logger.warning("获取多分辨率版本URL失败: " + e.getMessage());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", fullUrl);  // 返回完整URL给前端（原图）
            response.put("relativePath", relativePath);  // 可选：同时返回相对路径
            if (!variants.isEmpty()) {
                variants.put("original", fullUrl);  // 添加原图URL到variants
                response.put("variants", variants);  // 返回所有分辨率版本的URL
            }
            response.put("message", "图片上传成功");
            logger.info("========== 图片上传请求处理完成 ==========");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "图片上传失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 上传Base64图片
     * @param request 包含base64数据和分类的请求体
     */
    @PostMapping("/upload-base64")
    public ResponseEntity<Map<String, Object>> uploadBase64Image(@RequestBody Map<String, String> request) {
        try {
            String base64Data = request.get("base64");
            String category = request.getOrDefault("category", "general");
            Boolean isSystemResource = Boolean.parseBoolean(request.getOrDefault("isSystemResource", "false"));
            
            if (base64Data == null || base64Data.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Base64数据不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            String relativePath;
            if (isSystemResource) {
                // 系统资源：不包含userId
                relativePath = imageStorageService.saveBase64Image(base64Data, category, null);
            } else {
                // 用户资源：包含userId
                String userId = getCurrentUserId();
                relativePath = imageStorageService.saveBase64Image(base64Data, category, userId);
            }
            
            // 转换为完整URL返回给前端
            String fullUrl = imageUrlUtils.toFullUrl(relativePath);
            
            // 获取所有分辨率版本的URL（如果已生成）
            Map<String, String> variants = new HashMap<>();
            try {
                if (imageProcessingService != null) {
                    // 尝试获取所有分辨率版本
                    String thumbnailPath = getVariantPath(relativePath, 200, 200);
                    String mediumPath = getVariantPath(relativePath, 800, 600);
                    String highQualityPath = getVariantPath(relativePath, 1920, 1080);
                    
                    if (thumbnailPath != null) {
                        variants.put("thumbnail", imageUrlUtils.toFullUrl(thumbnailPath));
                    }
                    if (mediumPath != null) {
                        variants.put("medium", imageUrlUtils.toFullUrl(mediumPath));
                    }
                    if (highQualityPath != null) {
                        variants.put("highQuality", imageUrlUtils.toFullUrl(highQualityPath));
                    }
                }
            } catch (Exception e) {
                logger.warning("获取多分辨率版本URL失败（Base64）: " + e.getMessage());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", fullUrl);  // 返回完整URL给前端（原图）
            response.put("relativePath", relativePath);  // 可选：同时返回相对路径
            if (!variants.isEmpty()) {
                variants.put("original", fullUrl);  // 添加原图URL到variants
                response.put("variants", variants);  // 返回所有分辨率版本的URL
            }
            response.put("message", "图片上传成功");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "图片上传失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 删除图片
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteImage(@RequestParam("url") String imageUrl) {
        try {
            boolean deleted = imageStorageService.deleteImage(imageUrl);
            Map<String, Object> response = new HashMap<>();
            if (deleted) {
                response.put("success", true);
                response.put("message", "图片删除成功");
            } else {
                response.put("success", false);
                response.put("message", "图片不存在或已删除");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "删除失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 代理下载图片（绕过CORS限制）
     * 从指定的URL下载图片并返回base64编码的数据
     * 
     * @param url 图片URL
     * @return 包含base64编码图片数据的响应
     */
    @GetMapping("/proxy-download")
    public Mono<ResponseEntity<Map<String, Object>>> proxyDownloadImage(@RequestParam("url") String url) {
        if (url == null || url.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "URL参数不能为空");
            return Mono.just(ResponseEntity.badRequest().body(response));
        }
        
        try {
            // 解码 URL（前端已经用 encodeURIComponent 编码过了）
            String decodedUrl = URLDecoder.decode(url, StandardCharsets.UTF_8.name());
            logger.info("收到图片代理下载请求（原始）: " + url);
            logger.info("收到图片代理下载请求（解码后）: " + decodedUrl);
            
            // 验证 URL 格式
            URI uri = URI.create(decodedUrl);
            if (!uri.isAbsolute()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "无效的URL格式");
                return Mono.just(ResponseEntity.badRequest().body(response));
            }
            
            return webClient.get()
                    .uri(uri)
                    .retrieve()
                    .bodyToMono(DataBuffer.class)
                .map(dataBuffer -> {
                    try {
                        // 将 DataBuffer 转换为 byte[]
                        byte[] imageBytes = new byte[dataBuffer.readableByteCount()];
                        dataBuffer.read(imageBytes);
                        DataBufferUtils.release(dataBuffer);
                        
                        // 转换为 base64
                        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
                        String dataUrl = "data:image/jpeg;base64," + base64Image;
                        
                        Map<String, Object> response = new HashMap<>();
                        response.put("success", true);
                        response.put("dataUrl", dataUrl);
                        response.put("size", imageBytes.length);
                        
                        logger.info("图片代理下载成功，大小: " + imageBytes.length + " bytes");
                        return ResponseEntity.ok(response);
                    } catch (Exception e) {
                        logger.severe("处理图片数据失败: " + e.getMessage());
                        Map<String, Object> response = new HashMap<>();
                        response.put("success", false);
                        response.put("error", "处理图片数据失败: " + e.getMessage());
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                    }
                })
                .onErrorResume(error -> {
                    logger.severe("图片代理下载失败: " + error.getClass().getName() + " - " + error.getMessage());
                    if (error.getCause() != null) {
                        logger.severe("原因: " + error.getCause().getMessage());
                    }
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    String errorMessage = error.getMessage();
                    if (errorMessage == null || errorMessage.isEmpty()) {
                        errorMessage = "下载图片失败: " + error.getClass().getSimpleName();
                    } else {
                        errorMessage = "下载图片失败: " + errorMessage;
                    }
                    response.put("error", errorMessage);
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response));
                });
        } catch (Exception e) {
            logger.severe("处理URL失败: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "URL处理失败: " + e.getMessage());
            return Mono.just(ResponseEntity.badRequest().body(response));
        }
    }

    /**
     * 生成缩略图
     * @param request 包含图片URL和处理参数的请求体
     * @return 处理结果
     */
    @PostMapping("/thumbnail")
    public ResponseEntity<Map<String, Object>> generateThumbnail(@RequestBody Map<String, Object> request) {
        logger.info("========== 收到缩略图生成请求 ==========");
        try {
            String imageUrl = (String) request.get("url");
            if (imageUrl == null || imageUrl.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "图片URL不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            Integer width = request.get("width") != null ? ((Number) request.get("width")).intValue() : null;
            Integer height = request.get("height") != null ? ((Number) request.get("height")).intValue() : null;
            Boolean keepAspectRatio = request.get("keepAspectRatio") != null ? 
                    Boolean.parseBoolean(request.get("keepAspectRatio").toString()) : null;
            Double quality = request.get("quality") != null ? 
                    ((Number) request.get("quality")).doubleValue() : null;

            logger.info("图片URL: " + imageUrl);
            logger.info("目标尺寸: " + width + "x" + height);
            logger.info("保持宽高比: " + keepAspectRatio);
            logger.info("压缩质量: " + quality);

            // 获取原始图片信息
            ImageProcessingService.ImageInfo originalInfo = imageProcessingService.getImageInfo(imageUrl);

            // 生成并保存缩略图
            String processedPath = imageProcessingService.generateAndSaveThumbnail(
                    imageUrl, width, height, keepAspectRatio, quality);

            // 获取处理后的图片信息
            ImageProcessingService.ImageInfo processedInfo = imageProcessingService.getImageInfo(processedPath);

            // 转换为完整URL
            String fullUrl = imageUrlUtils.toFullUrl(processedPath);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", fullUrl);
            response.put("relativePath", processedPath);
            response.put("originalSize", originalInfo.getFileSize());
            response.put("processedSize", processedInfo.getFileSize());
            response.put("width", processedInfo.getWidth());
            response.put("height", processedInfo.getHeight());
            response.put("message", "缩略图生成成功");

            logger.info("缩略图生成成功: " + fullUrl);
            logger.info("========== 缩略图生成请求处理完成 ==========");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warning("参数错误: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.severe("生成缩略图失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "生成缩略图失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 获取图片列表（仅系统预置资源）
     * @param category 图片分类（可选，默认为"all"）
     * @param isSystemResource 是否只获取系统资源（可选，默认为true）
     * @return 图片列表
     */
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> listImages(
            @RequestParam(value = "category", defaultValue = "all") String category,
            @RequestParam(value = "isSystemResource", defaultValue = "true") Boolean isSystemResource) {
        try {
            // 图片管理模块主要处理系统预置资源，所以默认只返回系统资源
            String userId = (isSystemResource != null && isSystemResource) ? null : getCurrentUserId();
            List<ImageStorageService.ImageInfo> images = imageStorageService.listImages(category, userId);
            
            // 转换为完整URL
            List<Map<String, Object>> imageList = images.stream().map(img -> {
                Map<String, Object> item = new HashMap<>();
                item.put("url", imageUrlUtils.toFullUrl(img.getRelativePath()));
                item.put("relativePath", img.getRelativePath());
                item.put("name", img.getName());
                item.put("category", img.getCategory());
                item.put("size", img.getSize());
                item.put("width", img.getWidth());
                item.put("height", img.getHeight());
                item.put("createdAt", img.getCreatedAt());
                return item;
            }).collect(java.util.stream.Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("images", imageList);
            response.put("total", imageList.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("获取图片列表失败: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "获取图片列表失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 裁剪图片
     * @param request 包含图片URL和裁剪参数的请求体
     * @return 处理结果
     */
    @PostMapping("/crop")
    public ResponseEntity<Map<String, Object>> cropImage(@RequestBody Map<String, Object> request) {
        logger.info("========== 收到图片裁剪请求 ==========");
        try {
            String imageUrl = (String) request.get("url");
            if (imageUrl == null || imageUrl.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "图片URL不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            Integer x = request.get("x") != null ? ((Number) request.get("x")).intValue() : null;
            Integer y = request.get("y") != null ? ((Number) request.get("y")).intValue() : null;
            Integer width = request.get("width") != null ? ((Number) request.get("width")).intValue() : null;
            Integer height = request.get("height") != null ? ((Number) request.get("height")).intValue() : null;

            if (x == null || y == null || width == null || height == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "裁剪参数不完整: x, y, width, height 都是必需的");
                return ResponseEntity.badRequest().body(response);
            }

            logger.info("图片URL: " + imageUrl);
            logger.info("裁剪区域: x=" + x + ", y=" + y + ", width=" + width + ", height=" + height);

            // 获取原始图片信息
            ImageProcessingService.ImageInfo originalInfo = imageProcessingService.getImageInfo(imageUrl);

            // 裁剪并保存图片
            String processedPath = imageProcessingService.cropAndSaveImage(imageUrl, x, y, width, height);

            // 获取处理后的图片信息
            ImageProcessingService.ImageInfo processedInfo = imageProcessingService.getImageInfo(processedPath);

            // 转换为完整URL
            String fullUrl = imageUrlUtils.toFullUrl(processedPath);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", fullUrl);
            response.put("relativePath", processedPath);
            response.put("originalSize", originalInfo.getFileSize());
            response.put("processedSize", processedInfo.getFileSize());
            response.put("width", processedInfo.getWidth());
            response.put("height", processedInfo.getHeight());
            response.put("message", "图片裁剪成功");

            logger.info("图片裁剪成功: " + fullUrl);
            logger.info("========== 图片裁剪请求处理完成 ==========");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warning("参数错误: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.severe("裁剪图片失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "裁剪图片失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 获取多分辨率版本的路径（如果存在）
     * @param originalPath 原图相对路径
     * @param width 目标宽度
     * @param height 目标高度
     * @return 多分辨率版本的相对路径，如果不存在则返回null
     */
    private String getVariantPath(String originalPath, int width, int height) {
        if (originalPath == null || originalPath.isEmpty()) {
            return null;
        }
        
        try {
            // 构建多分辨率版本的文件名：原图名称_宽度*高度.扩展名
            int lastDotIndex = originalPath.lastIndexOf('.');
            if (lastDotIndex <= 0) {
                return null;
            }
            
            String nameWithoutExt = originalPath.substring(0, lastDotIndex);
            String extension = originalPath.substring(lastDotIndex);
            String variantPath = nameWithoutExt + "_" + width + "*" + height + extension;
            
            // 检查文件是否存在（使用ImageProcessingService的localStoragePath）
            if (imageProcessingService != null) {
                try {
                    // 尝试读取文件，如果存在则返回路径
                    imageProcessingService.readImage(variantPath);
                    return variantPath;
                } catch (Exception e) {
                    // 文件不存在，返回null
                    return null;
                }
            }
        } catch (Exception e) {
            // 忽略错误，返回null
        }
        
        return null;
    }
}
