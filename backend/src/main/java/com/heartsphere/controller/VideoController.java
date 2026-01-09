package com.heartsphere.controller;

import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.ImageStorageService;
import com.heartsphere.service.video.AnimationFormat;
import com.heartsphere.service.video.VideoProcessingService;
import com.heartsphere.service.video.VideoInfo;
import com.heartsphere.service.video.VideoToAnimationOptions;
import com.heartsphere.util.VideoUrlUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * 视频控制器
 * 提供视频上传、转换和管理相关的REST API
 * 
 * <p>主要端点：
 * <ul>
 *   <li>POST /api/videos/upload - 上传视频文件</li>
 *   <li>POST /api/videos/to-animation - 转换视频为动画格式（GIF/Lottie/PAG）</li>
 *   <li>GET /api/videos/info - 获取视频元数据信息</li>
 * </ul>
 * 
 * @author HeartSphere
 * @version 1.0
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private static final Logger logger = Logger.getLogger(VideoController.class.getName());

    @Autowired
    private ImageStorageService imageStorageService;

    @Autowired
    private com.heartsphere.util.VideoUrlUtils videoUrlUtils;

    @Autowired
    private VideoProcessingService videoProcessingService;

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
     * 上传视频文件
     * @param file 视频文件
     * @param category 视频分类（可选，默认为general）
     * @param isSystemResource 是否为系统资源（可选，默认为false）。如果为true，则不包含userId
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "general") String category,
            @RequestParam(value = "isSystemResource", defaultValue = "false") Boolean isSystemResource) {
        logger.info("========== 收到视频上传请求 ==========");
        logger.info("文件名: " + (file != null ? file.getOriginalFilename() : "null"));
        logger.info("文件大小: " + (file != null ? file.getSize() + " bytes" : "null"));
        logger.info("文件类型: " + (file != null ? file.getContentType() : "null"));
        logger.info("分类: " + category);
        logger.info("系统资源: " + isSystemResource);
        
        try {
            // 验证视频格式
            if (!videoProcessingService.validateVideoFormat(file)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "不支持的视频格式，支持的格式: mp4, mov, avi, webm");
                return ResponseEntity.badRequest().body(response);
            }

            String relativePath;
            if (isSystemResource != null && isSystemResource) {
                // 系统资源：不包含userId
                relativePath = imageStorageService.saveVideo(file, category, null);
                logger.info("系统资源上传成功，相对路径: " + relativePath);
            } else {
                // 用户资源：包含userId
                String userId = getCurrentUserId();
                relativePath = imageStorageService.saveVideo(file, category, userId);
                logger.info("用户资源上传成功，相对路径: " + relativePath);
            }
            
            // 转换为完整URL返回给前端
            String fullUrl = videoUrlUtils.toFullUrl(relativePath);
            logger.info("视频完整URL: " + fullUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", fullUrl);
            response.put("relativePath", relativePath);
            response.put("message", "视频上传成功");
            logger.info("========== 视频上传请求处理完成 ==========");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "视频上传失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 转换视频为动画格式
     * @param request 包含视频URL和转换参数的请求体
     * @return 处理结果
     */
    @PostMapping("/to-animation")
    public ResponseEntity<Map<String, Object>> convertToAnimation(@RequestBody Map<String, Object> request) {
        logger.info("========== 收到视频转动画请求 ==========");
        try {
            String videoUrl = (String) request.get("url");
            if (videoUrl == null || videoUrl.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "视频URL不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            // 解析输出格式
            String formatStr = (String) request.get("format");
            if (formatStr == null || formatStr.isEmpty()) {
                formatStr = "gif"; // 默认格式
            }
            AnimationFormat outputFormat = AnimationFormat.fromCode(formatStr);
            if (outputFormat == null || !AnimationFormat.isValidFormat(formatStr)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "不支持的动画格式: " + formatStr + "，支持的格式: gif, lottie, pag");
                return ResponseEntity.badRequest().body(response);
            }

            // 构建转换选项
            VideoToAnimationOptions options = new VideoToAnimationOptions();
            options.setOutputFormat(outputFormat);

            // 解析可选参数
            if (request.get("fps") != null) {
                options.setFps(((Number) request.get("fps")).intValue());
            }
            if (request.get("width") != null) {
                options.setWidth(((Number) request.get("width")).intValue());
            }
            if (request.get("height") != null) {
                options.setHeight(((Number) request.get("height")).intValue());
            }
            if (request.get("keepAspectRatio") != null) {
                options.setKeepAspectRatio(Boolean.parseBoolean(request.get("keepAspectRatio").toString()));
            }
            if (request.get("quality") != null) {
                Object qualityObj = request.get("quality");
                if (qualityObj instanceof String) {
                    options.setQuality((String) qualityObj);
                } else if (qualityObj instanceof Number) {
                    // 如果是数字，转换为字符串（low/medium/high）
                    double qualityVal = ((Number) qualityObj).doubleValue();
                    if (qualityVal <= 0.3) {
                        options.setQuality("low");
                    } else if (qualityVal <= 0.7) {
                        options.setQuality("medium");
                    } else {
                        options.setQuality("high");
                    }
                } else {
                    options.setQuality(qualityObj.toString());
                }
            }
            if (request.get("startTime") != null) {
                options.setStartTime(((Number) request.get("startTime")).doubleValue());
            }
            if (request.get("duration") != null) {
                options.setDuration(((Number) request.get("duration")).doubleValue());
            }

            // 格式特定参数
            if (request.get("lottiePrecision") != null) {
                options.setLottiePrecision(((Number) request.get("lottiePrecision")).intValue());
            }
            if (request.get("lottieOptimize") != null) {
                options.setLottieOptimize(Boolean.parseBoolean(request.get("lottieOptimize").toString()));
            }
            if (request.get("pagCompressionLevel") != null) {
                options.setPagCompressionLevel(((Number) request.get("pagCompressionLevel")).intValue());
            }

            logger.info("视频URL: " + videoUrl);
            logger.info("输出格式: " + outputFormat);
            logger.info("转换参数: FPS=" + options.getFps() + ", 尺寸=" + options.getWidth() + "x" + options.getHeight());

            // 获取原始视频信息（返回自定义的 VideoInfo 类）
            com.heartsphere.service.video.VideoInfo originalInfo = videoProcessingService.getVideoInfo(videoUrl);

            // 执行转换
            String processedPath = videoProcessingService.convertToAnimation(videoUrl, options);

            // 转换为完整URL
            String fullUrl = videoUrlUtils.toFullUrl(processedPath);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", fullUrl);
            response.put("relativePath", processedPath);
            response.put("format", outputFormat.getCode());
            response.put("originalSize", originalInfo.getFileSize());
            response.put("message", "视频转换成功");

            logger.info("视频转换成功: " + fullUrl);
            logger.info("========== 视频转动画请求处理完成 ==========");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warning("参数错误: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (UnsupportedOperationException e) {
            logger.warning("不支持的操作: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("message", "该动画格式当前版本暂不支持，请使用GIF格式");
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(response);
        } catch (Exception e) {
            logger.severe("视频转换失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "视频转换失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 列出视频文件
     * @param category 分类名称（可选，默认为"all"表示所有分类）
     * @param isSystemResource 是否只返回系统资源（可选，默认为true）
     * @return 视频列表
     */
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> listVideos(
            @RequestParam(value = "category", defaultValue = "all") String category,
            @RequestParam(value = "isSystemResource", defaultValue = "true") Boolean isSystemResource) {
        logger.info("========== 收到视频列表请求 ==========");
        logger.info("分类: " + category);
        logger.info("系统资源: " + isSystemResource);
        
        try {
            String userId = null;
            if (isSystemResource == null || !isSystemResource) {
                userId = getCurrentUserId();
            }
            
            List<com.heartsphere.service.ImageStorageService.VideoInfo> videoInfos = 
                imageStorageService.listVideos(category, userId, isSystemResource != null ? isSystemResource : true);
            
            // 转换为前端需要的格式，并添加完整URL
            List<Map<String, Object>> videos = new ArrayList<>();
            for (com.heartsphere.service.ImageStorageService.VideoInfo videoInfo : videoInfos) {
                Map<String, Object> video = new HashMap<>();
                String relativePath = videoInfo.getRelativePath();
                String fullUrl = videoUrlUtils.toFullUrl(relativePath);
                
                video.put("url", fullUrl);
                video.put("relativePath", relativePath);
                video.put("name", videoInfo.getName());
                video.put("category", videoInfo.getCategory());
                video.put("size", videoInfo.getSize());
                video.put("createdAt", new java.util.Date(videoInfo.getCreatedAt()));
                
                videos.add(video);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("videos", videos);
            response.put("count", videos.size());
            
            logger.info("返回视频列表，数量: " + videos.size());
            logger.info("========== 视频列表请求处理完成 ==========");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("获取视频列表失败: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "获取视频列表失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 检查 PAG 转换功能是否可用
     * @return PAG 转换可用性状态
     */
    @GetMapping("/pag-available")
    public ResponseEntity<Map<String, Object>> checkPagAvailable() {
        try {
            boolean available = videoProcessingService.isPagConversionAvailable();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("available", available);
            if (!available) {
                response.put("message", "PAG 转换功能暂不可用，请安装 PAGConvertor 工具");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("available", false);
            response.put("error", "检查 PAG 转换可用性失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 获取视频信息
     * @param url 视频URL
     * @return 视频信息
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getVideoInfo(@RequestParam("url") String url) {
        try {
            com.heartsphere.service.video.VideoInfo videoInfo = videoProcessingService.getVideoInfo(url);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("width", videoInfo.getWidth());
            response.put("height", videoInfo.getHeight());
            response.put("duration", videoInfo.getDuration());
            response.put("frameRate", videoInfo.getFrameRate());
            response.put("fileSize", videoInfo.getFileSize());
            response.put("format", videoInfo.getFormat());
            response.put("codec", videoInfo.getCodec());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "获取视频信息失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
