package com.heartsphere.admin.service;

import com.heartsphere.shared.util.ImageUrlUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Stream;
import java.util.logging.Logger;
import java.util.Arrays;

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

    @Autowired
    private ImageUrlUtils imageUrlUtils;

    @Autowired(required = false)
    private ImageProcessingService imageProcessingService;
    
    @Autowired(required = false)
    private ThumbnailGenerationService thumbnailGenerationService;

    @Value("${app.image.storage.max-size:10485760}")
    private long maxFileSize; // 10MB default

    @Value("${app.image.processing.variants.auto-generate:true}")
    private boolean autoGenerateVariants; // 是否自动生成多分辨率版本

    @Value("${app.image.processing.variants.include-high-quality:false}")
    private boolean includeHighQuality; // 是否包含高质量背景图

    @Value("${app.video.storage.local.path:./uploads/videos}")
    private String videoStoragePath;

    @Value("${app.video.storage.max-size:104857600}")
    private long maxVideoFileSize; // 100MB default

    @Value("${app.video.storage.supported-formats:mp4,mov,avi,webm}")
    private String supportedVideoFormatsStr;

    @jakarta.annotation.PostConstruct
    public void init() {
        // 确保图片上传目录存在
        try {
            Path uploadPath = Paths.get(localStoragePath);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                logger.info("图片上传目录已创建: " + uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            logger.severe("创建图片上传目录失败: " + e.getMessage());
        }
        
        // 确保视频上传目录存在
        try {
            Path videoUploadPath = Paths.get(videoStoragePath);
            if (!Files.exists(videoUploadPath)) {
                Files.createDirectories(videoUploadPath);
                logger.info("视频上传目录已创建: " + videoUploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            logger.severe("创建视频上传目录失败: " + e.getMessage());
        }
    }

    /**
     * 保存图片文件（系统资源，不包含userId）
     * @param file 上传的文件
     * @param category 图片分类（如：era, character, journal等）
     * @return 图片相对路径（格式：category/year/month/filename）
     */
    public String saveImage(MultipartFile file, String category) throws IOException {
        return saveImage(file, category, null);
    }

    /**
     * 保存图片文件（用户资源，包含userId）
     * @param file 上传的文件
     * @param category 图片分类（如：era, character, journal等）
     * @param userId 用户ID（如果为null，则为系统资源，路径格式：category/year/month/filename；如果不为null，则为用户资源，路径格式：userId/category/year/month/filename）
     * @return 图片相对路径
     */
    public String saveImage(MultipartFile file, String category, String userId) throws IOException {
        logger.info("[ImageStorageService] 开始保存图片，分类: " + category);
        
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        // 验证分类名称（文件夹名称）安全性
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("分类名称不能为空");
        }
        category = category.trim();
        // 只允许字母、数字、下划线和连字符，防止路径遍历攻击
        if (!category.matches("^[a-zA-Z0-9_-]+$")) {
            throw new IllegalArgumentException("分类名称只能包含字母、数字、下划线和连字符");
        }
        // 防止特殊路径
        if (category.equals(".") || category.equals("..") || category.contains("/") || category.contains("\\")) {
            throw new IllegalArgumentException("无效的分类名称");
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
                return saveToLocal(file, category, userId);
            case "oss":
                // TODO: 实现OSS存储
                throw new UnsupportedOperationException("OSS存储暂未实现");
            case "s3":
                // TODO: 实现S3存储
                throw new UnsupportedOperationException("S3存储暂未实现");
            default:
                return saveToLocal(file, category, userId);
        }
    }

    /**
     * 保存到本地文件系统
     * @param file 上传的文件
     * @param category 图片分类
     * @param userId 用户ID（如果为null，则为系统资源）
     * @return 相对路径（格式：category/year/month/filename 或 userId/category/year/month/filename）
     */
    private String saveToLocal(MultipartFile file, String category, String userId) throws IOException {
        logger.info("[ImageStorageService] 开始保存到本地文件系统，userId: " + (userId != null ? userId : "系统资源"));
        
        // 创建目录结构
        // 系统资源：uploads/images/{category}/{year}/{month}/
        // 用户资源：uploads/images/{userId}/{category}/{year}/{month}/
        String year = String.valueOf(java.time.Year.now().getValue());
        String month = String.format("%02d", java.time.MonthDay.now().getMonthValue());
        
        Path categoryPath;
        if (userId != null && !userId.isEmpty()) {
            // 用户资源：包含 userId
            categoryPath = Paths.get(localStoragePath, userId, category, year, month);
        } else {
            // 系统资源：不包含 userId
            categoryPath = Paths.get(localStoragePath, category, year, month);
        }
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

        // 返回相对路径
        // 系统资源格式：category/year/month/filename
        // 用户资源格式：userId/category/year/month/filename
        String relativePath;
        if (userId != null && !userId.isEmpty()) {
            relativePath = String.format("%s/%s/%s/%s/%s", userId, category, year, month, filename);
        } else {
            relativePath = String.format("%s/%s/%s/%s", category, year, month, filename);
        }
        logger.info("[ImageStorageService] 返回图片相对路径: " + relativePath);
        
        // 如果启用了自动生成多分辨率版本，异步生成所有分辨率版本
        if (autoGenerateVariants) {
            try {
                logger.info("[ImageStorageService] 开始异步生成多分辨率版本: " + relativePath);
                // 获取完整URL用于异步生成
                String fullUrl = imageUrlUtils.toFullUrl(relativePath);
                // 异步生成缩略图
                if (thumbnailGenerationService != null) {
                    thumbnailGenerationService.generateAllThumbnailsAsync(fullUrl);
                    logger.info("[ImageStorageService] 已启动异步生成缩略图任务");
                } else if (imageProcessingService != null) {
                    // 如果异步服务不可用，尝试同步生成（向后兼容）
                    logger.warning("[ImageStorageService] ThumbnailGenerationService不可用，使用同步模式");
                    imageProcessingService.generateAllVariants(relativePath, includeHighQuality);
                    logger.info("[ImageStorageService] 多分辨率版本生成完成（同步模式）");
                }
            } catch (Exception e) {
                // 如果生成失败，记录警告但不影响原图保存
                logger.warning("[ImageStorageService] 生成多分辨率版本失败: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
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
     * 保存Base64图片（用于前端直接上传base64数据，系统资源）
     */
    public String saveBase64Image(String base64Data, String category) throws IOException {
        return saveBase64Image(base64Data, category, null);
    }

    /**
     * 保存Base64图片（用于前端直接上传base64数据，用户资源）
     */
    public String saveBase64Image(String base64Data, String category, String userId) throws IOException {
        if (base64Data == null || base64Data.isEmpty()) {
            throw new IllegalArgumentException("Base64数据不能为空");
        }

        // 验证分类名称（文件夹名称）安全性
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("分类名称不能为空");
        }
        category = category.trim();
        // 只允许字母、数字、下划线和连字符，防止路径遍历攻击
        if (!category.matches("^[a-zA-Z0-9_-]+$")) {
            throw new IllegalArgumentException("分类名称只能包含字母、数字、下划线和连字符");
        }
        // 防止特殊路径
        if (category.equals(".") || category.equals("..") || category.contains("/") || category.contains("\\")) {
            throw new IllegalArgumentException("无效的分类名称");
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
        // 系统资源：uploads/images/{category}/{year}/{month}/
        // 用户资源：uploads/images/{userId}/{category}/{year}/{month}/
        String year = String.valueOf(java.time.Year.now().getValue());
        String month = String.format("%02d", java.time.MonthDay.now().getMonthValue());
        Path categoryPath;
        if (userId != null && !userId.isEmpty()) {
            // 用户资源：包含 userId
            categoryPath = Paths.get(localStoragePath, userId, category, year, month);
        } else {
            // 系统资源：不包含 userId
            categoryPath = Paths.get(localStoragePath, category, year, month);
        }
        Files.createDirectories(categoryPath);

        // 生成文件名
        String extension = getExtensionFromMimeType(mimeType);
        String filename = UUID.randomUUID().toString() + extension;

        // 保存文件
        Path targetPath = categoryPath.resolve(filename);
        Files.write(targetPath, imageBytes);

        // 返回相对路径
        // 系统资源格式：category/year/month/filename
        // 用户资源格式：userId/category/year/month/filename
        String relativePath;
        if (userId != null && !userId.isEmpty()) {
            relativePath = String.format("%s/%s/%s/%s/%s", userId, category, year, month, filename);
        } else {
            relativePath = String.format("%s/%s/%s/%s", category, year, month, filename);
        }
        
        // 如果启用了自动生成多分辨率版本，生成所有分辨率版本
        if (autoGenerateVariants && imageProcessingService != null) {
            try {
                logger.info("[ImageStorageService] 开始生成多分辨率版本（Base64）: " + relativePath);
                imageProcessingService.generateAllVariants(relativePath, includeHighQuality);
                logger.info("[ImageStorageService] 多分辨率版本生成完成（Base64）");
            } catch (Exception e) {
                // 如果生成失败，记录警告但不影响原图保存
                logger.warning("[ImageStorageService] 生成多分辨率版本失败（Base64）: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
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

    /**
     * 获取图片列表（按分类）
     * @param category 图片分类（如果为null或"all"，返回所有分类）
     * @param userId 用户ID（如果为null，只返回系统资源）
     * @return 图片信息列表
     */
    public List<ImageInfo> listImages(String category, String userId) {
        List<ImageInfo> images = new ArrayList<>();
        try {
            Path basePath = Paths.get(localStoragePath);
            
            // 如果指定了分类，只扫描该分类目录
            if (category != null && !category.isEmpty() && !category.equals("all")) {
                if (userId != null && !userId.isEmpty()) {
                    // 用户资源：userId/category/...
                    Path categoryPath = basePath.resolve(userId).resolve(category);
                    if (Files.exists(categoryPath)) {
                        images.addAll(scanDirectory(categoryPath, category, userId));
                    }
                } else {
                    // 系统资源：category/...
                    Path categoryPath = basePath.resolve(category);
                    if (Files.exists(categoryPath)) {
                        images.addAll(scanDirectory(categoryPath, category, null));
                    }
                }
            } else {
                // 扫描所有分类
                if (userId != null && !userId.isEmpty()) {
                    // 用户资源：userId/category/...
                    Path userPath = basePath.resolve(userId);
                    if (Files.exists(userPath)) {
                        try (Stream<Path> categoryDirs = Files.list(userPath)) {
                            categoryDirs.filter(Files::isDirectory).forEach(categoryDir -> {
                                String cat = categoryDir.getFileName().toString();
                                images.addAll(scanDirectory(categoryDir, cat, userId));
                            });
                        }
                    }
                } else {
                    // 系统资源：category/...
                    try (Stream<Path> categoryDirs = Files.list(basePath)) {
                        categoryDirs.filter(Files::isDirectory).forEach(categoryDir -> {
                            String cat = categoryDir.getFileName().toString();
                            // 跳过用户目录（如果存在）
                            if (!cat.matches("\\d+")) { // 用户ID通常是数字
                                images.addAll(scanDirectory(categoryDir, cat, null));
                            }
                        });
                    }
                }
            }
        } catch (IOException e) {
            logger.severe("获取图片列表失败: " + e.getMessage());
        }
        
        // 按创建时间倒序排序
        images.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()));
        return images;
    }

    /**
     * 扫描目录，查找图片文件
     */
    private List<ImageInfo> scanDirectory(Path dir, String category, String userId) {
        List<ImageInfo> images = new ArrayList<>();
        try {
            Files.walkFileTree(dir, new java.nio.file.SimpleFileVisitor<Path>() {
                @Override
                public java.nio.file.FileVisitResult visitFile(Path file, java.nio.file.attribute.BasicFileAttributes attrs) {
                    String filename = file.getFileName().toString().toLowerCase();
                    if (filename.endsWith(".jpg") || filename.endsWith(".jpeg") || 
                        filename.endsWith(".png") || filename.endsWith(".webp") || 
                        filename.endsWith(".gif")) {
                        try {
                            // 计算相对路径
                            Path relativePath = Paths.get(localStoragePath).relativize(file);
                            String relativePathStr = relativePath.toString().replace("\\", "/");
                            
                            // 获取文件信息
                            long fileSize = Files.size(file);
                            long createdAt = Files.getLastModifiedTime(file).toMillis();
                            
                            // 获取图片尺寸（简单方式，只读取文件头）
                            int[] dimensions = getImageDimensions(file);
                            
                            // 提取文件名（不含路径）
                            String name = file.getFileName().toString();
                            
                            images.add(new ImageInfo(relativePathStr, name, category, fileSize, 
                                    dimensions[0], dimensions[1], createdAt));
                        } catch (IOException e) {
                            logger.warning("读取图片信息失败: " + file + " - " + e.getMessage());
                        }
                    }
                    return java.nio.file.FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException e) {
            logger.warning("扫描目录失败: " + dir + " - " + e.getMessage());
        }
        return images;
    }

    /**
     * 获取图片尺寸（简单实现，只读取文件头）
     */
    private int[] getImageDimensions(Path file) {
        try {
            javax.imageio.ImageReader reader = javax.imageio.ImageIO.getImageReadersByFormatName(
                getFormatName(file.getFileName().toString())).next();
            reader.setInput(javax.imageio.ImageIO.createImageInputStream(Files.newInputStream(file)));
            int width = reader.getWidth(0);
            int height = reader.getHeight(0);
            reader.dispose();
            return new int[]{width, height};
        } catch (Exception e) {
            return new int[]{0, 0};
        }
    }

    private String getFormatName(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "jpeg";
        if (lower.endsWith(".png")) return "png";
        if (lower.endsWith(".webp")) return "webp";
        if (lower.endsWith(".gif")) return "gif";
        return "png";
    }

    /**
     * 图片信息类
     */
    public static class ImageInfo {
        private String relativePath;
        private String name;
        private String category;
        private long size;
        private int width;
        private int height;
        private long createdAt;

        public ImageInfo(String relativePath, String name, String category, 
                        long size, int width, int height, long createdAt) {
            this.relativePath = relativePath;
            this.name = name;
            this.category = category;
            this.size = size;
            this.width = width;
            this.height = height;
            this.createdAt = createdAt;
        }

        public String getRelativePath() { return relativePath; }
        public String getName() { return name; }
        public String getCategory() { return category; }
        public long getSize() { return size; }
        public int getWidth() { return width; }
        public int getHeight() { return height; }
        public long getCreatedAt() { return createdAt; }
    }

    /**
     * 保存视频文件
     * @param file 上传的视频文件
     * @param category 视频分类
     * @param userId 用户ID（如果为null，则为系统资源）
     * @return 视频相对路径
     */
    public String saveVideo(MultipartFile file, String category, String userId) throws IOException {
        logger.info("[ImageStorageService] 开始保存视频，分类: " + category);
        
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        // 验证分类名称（文件夹名称）安全性
        if (category == null || category.trim().isEmpty()) {
            throw new IllegalArgumentException("分类名称不能为空");
        }
        category = category.trim();
        if (!category.matches("^[a-zA-Z0-9_-]+$")) {
            throw new IllegalArgumentException("分类名称只能包含字母、数字、下划线和连字符");
        }
        if (category.equals(".") || category.equals("..") || category.contains("/") || category.contains("\\")) {
            throw new IllegalArgumentException("无效的分类名称");
        }

        // 验证文件类型
        String contentType = file.getContentType();
        logger.info("[ImageStorageService] 文件类型: " + contentType);
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new IllegalArgumentException("只支持视频文件");
        }

        // 验证文件大小
        long fileSize = file.getSize();
        logger.info("[ImageStorageService] 文件大小: " + fileSize + " bytes (限制: " + maxVideoFileSize + " bytes)");
        if (fileSize > maxVideoFileSize) {
            throw new IllegalArgumentException("文件大小不能超过 " + (maxVideoFileSize / 1024 / 1024) + "MB");
        }

        // 验证视频格式
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("文件名不能为空");
        }
        String extension = getVideoFileExtension(originalFilename).toLowerCase();
        List<String> supportedFormats = Arrays.asList(supportedVideoFormatsStr.toLowerCase().split(","));
        if (!supportedFormats.contains(extension)) {
            throw new IllegalArgumentException("不支持的视频格式: " + extension + "，支持的格式: " + supportedVideoFormatsStr);
        }

        // 保存到本地文件系统
        return saveVideoToLocal(file, category, userId);
    }

    /**
     * 保存视频到本地文件系统
     */
    private String saveVideoToLocal(MultipartFile file, String category, String userId) throws IOException {
        logger.info("[ImageStorageService] 开始保存视频到本地文件系统，userId: " + (userId != null ? userId : "系统资源"));
        
        // 创建目录结构
        String year = String.valueOf(java.time.Year.now().getValue());
        String month = String.format("%02d", java.time.MonthDay.now().getMonthValue());
        
        Path categoryPath;
        if (userId != null && !userId.isEmpty()) {
            categoryPath = Paths.get(videoStoragePath, userId, category, year, month);
        } else {
            categoryPath = Paths.get(videoStoragePath, category, year, month);
        }
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

        // 返回相对路径
        String relativePath;
        if (userId != null && !userId.isEmpty()) {
            relativePath = String.format("%s/%s/%s/%s/%s", userId, category, year, month, filename);
        } else {
            relativePath = String.format("%s/%s/%s/%s", category, year, month, filename);
        }
        logger.info("[ImageStorageService] 返回视频相对路径: " + relativePath);
        return relativePath;
    }

    /**
     * 删除视频
     */
    public boolean deleteVideo(String videoUrl) {
        if (videoUrl == null || videoUrl.isEmpty()) {
            return false;
        }

        try {
            // 如果是绝对URL，提取相对路径
            String relativePath = videoUrl;
            if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
                relativePath = imageUrlUtils.toRelativePath(videoUrl);
                if (relativePath == null || relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
                    return false;
                }
            }
            
            Path filePath = Paths.get(videoStoragePath, relativePath);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                return true;
            }
            return false;
        } catch (Exception e) {
            logger.warning("删除视频失败: " + e.getMessage());
            return false;
        }
    }

    /**
     * 获取视频文件扩展名
     */
    private String getVideoFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex + 1);
        }
        return "";
    }

    /**
     * 列出视频文件
     * @param category 分类名称（"all"表示所有分类）
     * @param userId 用户ID（如果为null，只返回系统资源）
     * @param isSystemResource 是否只返回系统资源（如果为true，忽略userId）
     * @return 视频信息列表
     */
    public List<VideoInfo> listVideos(String category, String userId, boolean isSystemResource) {
        List<VideoInfo> videos = new ArrayList<>();
        try {
            Path basePath = Paths.get(videoStoragePath);
            
            // 如果 isSystemResource=true，忽略 userId
            String effectiveUserId = isSystemResource ? null : userId;
            
            // 如果指定了分类，只扫描该分类目录
            if (category != null && !category.isEmpty() && !category.equals("all")) {
                if (effectiveUserId != null && !effectiveUserId.isEmpty()) {
                    // 用户资源：userId/category/...
                    Path categoryPath = basePath.resolve(effectiveUserId).resolve(category);
                    if (Files.exists(categoryPath)) {
                        videos.addAll(scanVideoDirectory(categoryPath, category, effectiveUserId));
                    }
                } else {
                    // 系统资源：category/...
                    Path categoryPath = basePath.resolve(category);
                    if (Files.exists(categoryPath)) {
                        videos.addAll(scanVideoDirectory(categoryPath, category, null));
                    }
                }
            } else {
                // 扫描所有分类
                if (effectiveUserId != null && !effectiveUserId.isEmpty()) {
                    // 用户资源：userId/category/...
                    Path userPath = basePath.resolve(effectiveUserId);
                    if (Files.exists(userPath)) {
                        try (Stream<Path> categoryDirs = Files.list(userPath)) {
                            categoryDirs.filter(Files::isDirectory).forEach(categoryDir -> {
                                String cat = categoryDir.getFileName().toString();
                                videos.addAll(scanVideoDirectory(categoryDir, cat, effectiveUserId));
                            });
                        }
                    }
                } else {
                    // 系统资源：category/...
                    try (Stream<Path> categoryDirs = Files.list(basePath)) {
                        categoryDirs.filter(Files::isDirectory).forEach(categoryDir -> {
                            String cat = categoryDir.getFileName().toString();
                            // 跳过用户目录（如果存在）
                            if (!cat.matches("\\d+")) { // 用户ID通常是数字
                                videos.addAll(scanVideoDirectory(categoryDir, cat, null));
                            }
                        });
                    }
                }
            }
        } catch (IOException e) {
            logger.severe("获取视频列表失败: " + e.getMessage());
        }
        
        // 按创建时间倒序排序
        videos.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()));
        return videos;
    }

    /**
     * 扫描目录，查找视频文件
     */
    private List<VideoInfo> scanVideoDirectory(Path dir, String category, String userId) {
        List<VideoInfo> videos = new ArrayList<>();
        try {
            Files.walkFileTree(dir, new java.nio.file.SimpleFileVisitor<Path>() {
                @Override
                public java.nio.file.FileVisitResult visitFile(Path file, java.nio.file.attribute.BasicFileAttributes attrs) {
                    String filename = file.getFileName().toString().toLowerCase();
                    String extension = getVideoFileExtension(filename);
                    List<String> supportedFormats = Arrays.asList(supportedVideoFormatsStr.toLowerCase().split(","));
                    if (supportedFormats.contains(extension.toLowerCase())) {
                        try {
                            // 计算相对路径
                            Path relativePath = Paths.get(videoStoragePath).relativize(file);
                            String relativePathStr = relativePath.toString().replace("\\", "/");
                            
                            // 获取文件信息
                            long fileSize = Files.size(file);
                            long createdAt = Files.getLastModifiedTime(file).toMillis();
                            
                            // 提取文件名（不含路径）
                            String name = file.getFileName().toString();
                            
                            videos.add(new VideoInfo(relativePathStr, name, category, fileSize, createdAt));
                        } catch (IOException e) {
                            logger.warning("读取视频信息失败: " + file + " - " + e.getMessage());
                        }
                    }
                    return java.nio.file.FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException e) {
            logger.warning("扫描视频目录失败: " + dir + " - " + e.getMessage());
        }
        return videos;
    }

    /**
     * 视频信息内部类（用于列表返回）
     */
    public static class VideoInfo {
        private final String relativePath;
        private final String name;
        private final String category;
        private final long size;
        private final long createdAt;

        public VideoInfo(String relativePath, String name, String category, long size, long createdAt) {
            this.relativePath = relativePath;
            this.name = name;
            this.category = category;
            this.size = size;
            this.createdAt = createdAt;
        }

        public String getRelativePath() { return relativePath; }
        public String getName() { return name; }
        public String getCategory() { return category; }
        public long getSize() { return size; }
        public long getCreatedAt() { return createdAt; }
    }
}

