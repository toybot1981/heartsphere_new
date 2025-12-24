package com.heartsphere.controller;

import com.heartsphere.service.ImageStorageService;
import com.heartsphere.util.ImageUrlUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@CrossOrigin(origins = "*")
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

    /**
     * 上传图片文件
     * @param file 图片文件
     * @param category 图片分类（可选，默认为general）
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", defaultValue = "general") String category) {
        logger.info("========== 收到图片上传请求 ==========");
        logger.info("文件名: " + (file != null ? file.getOriginalFilename() : "null"));
        logger.info("文件大小: " + (file != null ? file.getSize() + " bytes" : "null"));
        logger.info("文件类型: " + (file != null ? file.getContentType() : "null"));
        logger.info("分类: " + category);
        
        try {
            // 保存图片，返回相对路径
            String relativePath = imageStorageService.saveImage(file, category);
            logger.info("图片上传成功，相对路径: " + relativePath);
            
            // 转换为完整URL返回给前端
            String fullUrl = imageUrlUtils.toFullUrl(relativePath);
            logger.info("图片完整URL: " + fullUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", fullUrl);  // 返回完整URL给前端
            response.put("relativePath", relativePath);  // 可选：同时返回相对路径
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
            
            if (base64Data == null || base64Data.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Base64数据不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            // 保存图片，返回相对路径
            String relativePath = imageStorageService.saveBase64Image(base64Data, category);
            
            // 转换为完整URL返回给前端
            String fullUrl = imageUrlUtils.toFullUrl(relativePath);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", fullUrl);  // 返回完整URL给前端
            response.put("relativePath", relativePath);  // 可选：同时返回相对路径
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
}

