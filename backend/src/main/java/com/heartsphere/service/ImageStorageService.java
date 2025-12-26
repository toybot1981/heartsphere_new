package com.heartsphere.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.logging.Logger;

/**
 * 图片存储服务
 * 支持本地文件存储，可扩展为云存储
 */
@Service
public class ImageStorageService {

    private static final Logger logger = Logger.getLogger(ImageStorageService.class.getName());

    @Value("${app.image.storage.type:local}")
    private String storageType; // local, oss, s3, etc.

    @Value("${app.image.storage.local.path:./uploads/images}")
    private String localStoragePath;

    @Value("${app.image.storage.base-url:}")
    private String baseUrl; // 如果未配置，ImageUrlUtils会从请求中获取

    @Value("${app.image.storage.max-size:10485760}")
    private long maxFileSize; // 10MB default

    @jakarta.annotation.PostConstruct
    public void init() {
        // 确保上传目录存在
        try {
            Path uploadPath = Paths.get(localStoragePath);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                logger.info("图片上传目录已创建: " + uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            logger.severe("创建图片上传目录失败: " + e.getMessage());
        }
    }

    /**
     * 保存图片文件
     * @param file 上传的文件
     * @param category 图片分类（如：era, character, journal等）
     * @return 图片访问URL
     */
    public String saveImage(MultipartFile file, String category) throws IOException {
        logger.info("[ImageStorageService] 开始保存图片，分类: " + category);
        
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        // 验证文件类型
        String contentType = file.getContentType();
        logger.info("[ImageStorageService] 文件类型: " + contentType);
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("只支持图片文件");
        }

        // 验证文件大小
        long fileSize = file.getSize();
        logger.info("[ImageStorageService] 文件大小: " + fileSize + " bytes (限制: " + maxFileSize + " bytes)");
        if (fileSize > maxFileSize) {
            throw new IllegalArgumentException("文件大小不能超过 " + (maxFileSize / 1024 / 1024) + "MB");
        }

        // 根据存储类型选择存储方式
        logger.info("[ImageStorageService] 存储类型: " + storageType);
        switch (storageType.toLowerCase()) {
            case "local":
                return saveToLocal(file, category);
            case "oss":
                // TODO: 实现OSS存储
                throw new UnsupportedOperationException("OSS存储暂未实现");
            case "s3":
                // TODO: 实现S3存储
                throw new UnsupportedOperationException("S3存储暂未实现");
            default:
                return saveToLocal(file, category);
        }
    }

    /**
     * 保存到本地文件系统
     */
    private String saveToLocal(MultipartFile file, String category) throws IOException {
        logger.info("[ImageStorageService] 开始保存到本地文件系统");
        
        // 创建目录结构：uploads/images/{category}/{year}/{month}/
        String year = String.valueOf(java.time.Year.now().getValue());
        String month = String.format("%02d", java.time.MonthDay.now().getMonthValue());
        
        Path categoryPath = Paths.get(localStoragePath, category, year, month);
        logger.info("[ImageStorageService] 目标目录: " + categoryPath.toAbsolutePath());
        Files.createDirectories(categoryPath);
        logger.info("[ImageStorageService] 目录创建成功");

        // 生成唯一文件名：UUID + 原始扩展名
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;
        logger.info("[ImageStorageService] 生成文件名: " + filename);

        // 保存文件
        Path targetPath = categoryPath.resolve(filename);
        logger.info("[ImageStorageService] 保存文件到: " + targetPath.toAbsolutePath());
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        logger.info("[ImageStorageService] 文件保存成功");

        // 返回相对路径（不以 / 开头，与 /files/ 匹配）
        // 格式：category/year/month/filename
        String relativePath = String.format("%s/%s/%s/%s", category, year, month, filename);
        logger.info("[ImageStorageService] 返回图片相对路径: " + relativePath);
        // 注意：不再拼接baseUrl，直接返回相对路径
        // 前端或DTO转换器需要使用 ImageUrlUtils.toFullUrl() 来拼接完整URL
        return relativePath;
    }

    /**
     * 删除图片
     */
    public boolean deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return false;
        }

        try {
            switch (storageType.toLowerCase()) {
                case "local":
                    return deleteFromLocal(imageUrl);
                default:
                    return deleteFromLocal(imageUrl);
            }
        } catch (Exception e) {
            System.err.println("删除图片失败: " + e.getMessage());
            return false;
        }
    }

    /**
     * 从本地删除图片
     * @param imagePath 图片相对路径或绝对URL
     */
    private boolean deleteFromLocal(String imagePath) throws IOException {
        // 如果是绝对URL，提取相对路径
        String relativePath = imagePath;
        if (imagePath != null && (imagePath.startsWith("http://") || imagePath.startsWith("https://"))) {
            // 从URL中提取相对路径（支持 /files/ 前缀）
            relativePath = imagePath.replace(baseUrl + "/files/", "").replace(baseUrl + "/", "");
        }
        
        Path filePath = Paths.get(localStoragePath, relativePath);
        
        if (Files.exists(filePath)) {
            Files.delete(filePath);
            return true;
        }
        return false;
    }

    /**
     * 保存Base64图片（用于前端直接上传base64数据）
     */
    public String saveBase64Image(String base64Data, String category) throws IOException {
        if (base64Data == null || base64Data.isEmpty()) {
            throw new IllegalArgumentException("Base64数据不能为空");
        }

        // 解析Base64数据
        String[] parts = base64Data.split(",");
        if (parts.length != 2) {
            throw new IllegalArgumentException("无效的Base64格式");
        }

        String header = parts[0];
        String data = parts[1];

        // 从header中提取MIME类型
        String mimeType = "image/png";
        if (header.contains("image/jpeg") || header.contains("image/jpg")) {
            mimeType = "image/jpeg";
        } else if (header.contains("image/png")) {
            mimeType = "image/png";
        } else if (header.contains("image/webp")) {
            mimeType = "image/webp";
        } else if (header.contains("image/gif")) {
            mimeType = "image/gif";
        }

        // 解码Base64
        byte[] imageBytes = java.util.Base64.getDecoder().decode(data);

        // 验证文件大小
        if (imageBytes.length > maxFileSize) {
            throw new IllegalArgumentException("文件大小不能超过 " + (maxFileSize / 1024 / 1024) + "MB");
        }

        // 创建目录
        String year = String.valueOf(java.time.Year.now().getValue());
        String month = String.format("%02d", java.time.MonthDay.now().getMonthValue());
        Path categoryPath = Paths.get(localStoragePath, category, year, month);
        Files.createDirectories(categoryPath);

        // 生成文件名
        String extension = getExtensionFromMimeType(mimeType);
        String filename = UUID.randomUUID().toString() + extension;

        // 保存文件
        Path targetPath = categoryPath.resolve(filename);
        Files.write(targetPath, imageBytes);

        // 返回相对路径（不以 / 开头，与 /files/ 匹配）
        // 格式：category/year/month/filename
        String relativePath = String.format("%s/%s/%s/%s", category, year, month, filename);
        // 注意：不再拼接baseUrl，直接返回相对路径
        // 前端或DTO转换器需要使用 ImageUrlUtils.toFullUrl() 来拼接完整URL
        return relativePath;
    }

    /**
     * 根据MIME类型获取文件扩展名
     */
    private String getExtensionFromMimeType(String mimeType) {
        switch (mimeType) {
            case "image/jpeg":
            case "image/jpg":
                return ".jpg";
            case "image/png":
                return ".png";
            case "image/webp":
                return ".webp";
            case "image/gif":
                return ".gif";
            default:
                return ".png";
        }
    }
}

