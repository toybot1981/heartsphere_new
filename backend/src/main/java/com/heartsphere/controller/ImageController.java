package com.heartsphere.controller;

import com.heartsphere.service.ImageStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
            String imageUrl = imageStorageService.saveImage(file, category);
            logger.info("图片上传成功，URL: " + imageUrl);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", imageUrl);
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

            String imageUrl = imageStorageService.saveBase64Image(base64Data, category);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", imageUrl);
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
}

