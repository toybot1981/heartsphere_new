package com.heartsphere.service;

import com.heartsphere.util.ImageUrlUtils;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.logging.Logger;

/**
 * 图片处理服务
 * 提供图片裁剪和缩略图生成功能
 */
@Service
public class ImageProcessingService {

    private static final Logger logger = Logger.getLogger(ImageProcessingService.class.getName());

    @Autowired
    private ImageUrlUtils imageUrlUtils;

    @Value("${app.image.storage.local.path:./uploads/images}")
    private String localStoragePath;

    // 缩略图默认配置
    @Value("${app.image.processing.thumbnail.default-width:200}")
    private int defaultThumbnailWidth;

    @Value("${app.image.processing.thumbnail.default-height:200}")
    private int defaultThumbnailHeight;

    @Value("${app.image.processing.thumbnail.default-quality:0.85}")
    private double defaultThumbnailQuality;

    @Value("${app.image.processing.thumbnail.keep-aspect-ratio:true}")
    private boolean defaultKeepAspectRatio;

    // 裁剪配置
    @Value("${app.image.processing.crop.max-width:5000}")
    private int maxCropWidth;

    @Value("${app.image.processing.crop.max-height:5000}")
    private int maxCropHeight;

    /**
     * 从相对路径或URL读取图片
     * @param imagePath 图片相对路径或URL
     * @return BufferedImage对象
     * @throws IOException 如果读取失败
     */
    public BufferedImage readImage(String imagePath) throws IOException {
        if (imagePath == null || imagePath.isEmpty()) {
            throw new IllegalArgumentException("图片路径不能为空");
        }

        // 如果是URL，转换为相对路径
        String relativePath = imagePath;
        if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            relativePath = imageUrlUtils.toRelativePath(imagePath);
            if (relativePath == null || relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
                throw new IllegalArgumentException("无法处理外部URL: " + imagePath);
            }
        }

        // 构建文件路径
        Path filePath = Paths.get(localStoragePath, relativePath);
        
        if (!Files.exists(filePath)) {
            throw new IOException("图片文件不存在: " + filePath.toAbsolutePath());
        }

        logger.info("读取图片: " + filePath.toAbsolutePath());
        return ImageIO.read(filePath.toFile());
    }

    /**
     * 生成缩略图
     * @param sourceImage 原始图片
     * @param width 目标宽度（可选，如果为null或<=0，使用默认值或按高度缩放）
     * @param height 目标高度（可选，如果为null或<=0，使用默认值或按宽度缩放）
     * @param keepAspectRatio 是否保持宽高比
     * @param quality 压缩质量（0.0-1.0）
     * @return 处理后的图片
     * @throws IOException 如果处理失败
     */
    public BufferedImage generateThumbnail(BufferedImage sourceImage, Integer width, Integer height, 
                                          Boolean keepAspectRatio, Double quality) throws IOException {
        if (sourceImage == null) {
            throw new IllegalArgumentException("原始图片不能为空");
        }

        // 使用默认值
        int targetWidth = (width != null && width > 0) ? width : defaultThumbnailWidth;
        int targetHeight = (height != null && height > 0) ? height : defaultThumbnailHeight;
        boolean keepRatio = (keepAspectRatio != null) ? keepAspectRatio : defaultKeepAspectRatio;
        double compressQuality = (quality != null && quality > 0 && quality <= 1.0) ? quality : defaultThumbnailQuality;

        logger.info(String.format("生成缩略图: %dx%d, 保持宽高比: %s, 质量: %.2f", 
                targetWidth, targetHeight, keepRatio, compressQuality));

        // 如果只指定了宽度或高度，保持宽高比
        if ((width == null || width <= 0) && (height != null && height > 0)) {
            // 只指定高度
            return Thumbnails.of(sourceImage)
                    .height(targetHeight)
                    .keepAspectRatio(true)
                    .outputQuality(compressQuality)
                    .asBufferedImage();
        } else if ((height == null || height <= 0) && (width != null && width > 0)) {
            // 只指定宽度
            return Thumbnails.of(sourceImage)
                    .width(targetWidth)
                    .keepAspectRatio(true)
                    .outputQuality(compressQuality)
                    .asBufferedImage();
        } else {
            // 指定了宽度和高度
            if (keepRatio) {
                // 保持宽高比，按比例缩放
                return Thumbnails.of(sourceImage)
                        .size(targetWidth, targetHeight)
                        .keepAspectRatio(true)
                        .outputQuality(compressQuality)
                        .asBufferedImage();
            } else {
                // 不保持宽高比，强制缩放到指定尺寸
                return Thumbnails.of(sourceImage)
                        .forceSize(targetWidth, targetHeight)
                        .outputQuality(compressQuality)
                        .asBufferedImage();
            }
        }
    }

    /**
     * 裁剪图片
     * @param sourceImage 原始图片
     * @param x 裁剪起始X坐标
     * @param y 裁剪起始Y坐标
     * @param width 裁剪宽度
     * @param height 裁剪高度
     * @return 裁剪后的图片
     * @throws IOException 如果处理失败
     */
    public BufferedImage cropImage(BufferedImage sourceImage, int x, int y, int width, int height) throws IOException {
        if (sourceImage == null) {
            throw new IllegalArgumentException("原始图片不能为空");
        }

        if (x < 0 || y < 0 || width <= 0 || height <= 0) {
            throw new IllegalArgumentException("裁剪参数无效: x=" + x + ", y=" + y + ", width=" + width + ", height=" + height);
        }

        if (width > maxCropWidth || height > maxCropHeight) {
            throw new IllegalArgumentException(String.format("裁剪尺寸超出限制: 最大宽度=%d, 最大高度=%d", maxCropWidth, maxCropHeight));
        }

        int sourceWidth = sourceImage.getWidth();
        int sourceHeight = sourceImage.getHeight();

        // 验证裁剪区域是否在图片范围内
        if (x >= sourceWidth || y >= sourceHeight) {
            throw new IllegalArgumentException("裁剪起始坐标超出图片范围");
        }

        if (x + width > sourceWidth) {
            width = sourceWidth - x;
        }
        if (y + height > sourceHeight) {
            height = sourceHeight - y;
        }

        logger.info(String.format("裁剪图片: x=%d, y=%d, width=%d, height=%d", x, y, width, height));

        return Thumbnails.of(sourceImage)
                .sourceRegion(x, y, width, height)
                .scale(1.0)
                .asBufferedImage();
    }

    /**
     * 保存处理后的图片
     * @param image 处理后的图片
     * @param originalPath 原始图片的相对路径
     * @param suffix 文件名后缀（如 "_thumb_200x200"）
     * @return 保存后的相对路径
     * @throws IOException 如果保存失败
     */
    public String saveProcessedImage(BufferedImage image, String originalPath, String suffix) throws IOException {
        if (image == null) {
            throw new IllegalArgumentException("图片不能为空");
        }
        if (originalPath == null || originalPath.isEmpty()) {
            throw new IllegalArgumentException("原始路径不能为空");
        }

        // 如果是URL，转换为相对路径
        String relativePath = originalPath;
        if (originalPath.startsWith("http://") || originalPath.startsWith("https://")) {
            relativePath = imageUrlUtils.toRelativePath(originalPath);
            if (relativePath == null || relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
                throw new IllegalArgumentException("无法处理外部URL: " + originalPath);
            }
        }

        // 解析原始路径，提取目录和文件名
        Path originalFilePath = Paths.get(localStoragePath, relativePath);
        String originalFilename = originalFilePath.getFileName().toString();
        Path originalDir = originalFilePath.getParent();

        // 生成新文件名：原文件名 + 后缀 + 扩展名
        String nameWithoutExt = originalFilename;
        String extension = "";
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            nameWithoutExt = originalFilename.substring(0, lastDotIndex);
            extension = originalFilename.substring(lastDotIndex);
        }

        String newFilename = nameWithoutExt + suffix + extension;
        Path targetPath = originalDir.resolve(newFilename);

        logger.info("保存处理后的图片: " + targetPath.toAbsolutePath());

        // 确定输出格式
        String formatName = "png";
        if (extension.toLowerCase().endsWith(".jpg") || extension.toLowerCase().endsWith(".jpeg")) {
            formatName = "jpg";
        } else if (extension.toLowerCase().endsWith(".png")) {
            formatName = "png";
        } else if (extension.toLowerCase().endsWith(".webp")) {
            formatName = "webp";
        } else if (extension.toLowerCase().endsWith(".gif")) {
            formatName = "gif";
        }

        // 保存图片
        ImageIO.write(image, formatName, targetPath.toFile());

        // 返回相对路径（相对于localStoragePath）
        Path localStoragePathObj = Paths.get(localStoragePath);
        Path relativeTargetPath = localStoragePathObj.relativize(targetPath);
        return relativeTargetPath.toString().replace("\\", "/");
    }

    /**
     * 获取图片信息
     * @param imagePath 图片路径或URL
     * @return 图片信息（宽度、高度、文件大小）
     * @throws IOException 如果读取失败
     */
    public ImageInfo getImageInfo(String imagePath) throws IOException {
        BufferedImage image = readImage(imagePath);
        Path filePath = getFilePath(imagePath);
        long fileSize = Files.exists(filePath) ? Files.size(filePath) : 0;

        return new ImageInfo(image.getWidth(), image.getHeight(), fileSize);
    }

    /**
     * 获取文件路径
     * @param imagePath 图片路径或URL
     * @return 文件路径
     */
    private Path getFilePath(String imagePath) {
        String relativePath = imagePath;
        if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            relativePath = imageUrlUtils.toRelativePath(imagePath);
            if (relativePath == null || relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
                return null;
            }
        }
        return Paths.get(localStoragePath, relativePath);
    }

    /**
     * 图片信息类
     */
    public static class ImageInfo {
        private final int width;
        private final int height;
        private final long fileSize;

        public ImageInfo(int width, int height, long fileSize) {
            this.width = width;
            this.height = height;
            this.fileSize = fileSize;
        }

        public int getWidth() {
            return width;
        }

        public int getHeight() {
            return height;
        }

        public long getFileSize() {
            return fileSize;
        }
    }

    /**
     * 从图片路径生成缩略图并保存
     * @param imagePath 原始图片路径或URL
     * @param width 目标宽度
     * @param height 目标高度
     * @param keepAspectRatio 是否保持宽高比
     * @param quality 压缩质量
     * @return 处理后的图片相对路径
     * @throws IOException 如果处理失败
     */
    public String generateAndSaveThumbnail(String imagePath, Integer width, Integer height, 
                                           Boolean keepAspectRatio, Double quality) throws IOException {
        BufferedImage sourceImage = readImage(imagePath);
        BufferedImage thumbnail = generateThumbnail(sourceImage, width, height, keepAspectRatio, quality);
        
        int targetWidth = (width != null && width > 0) ? width : defaultThumbnailWidth;
        int targetHeight = (height != null && height > 0) ? height : defaultThumbnailHeight;
        String suffix = "_thumb_" + targetWidth + "x" + targetHeight;
        
        return saveProcessedImage(thumbnail, imagePath, suffix);
    }

    /**
     * 从图片路径裁剪图片并保存
     * @param imagePath 原始图片路径或URL
     * @param x 裁剪起始X坐标
     * @param y 裁剪起始Y坐标
     * @param width 裁剪宽度
     * @param height 裁剪高度
     * @return 处理后的图片相对路径
     * @throws IOException 如果处理失败
     */
    public String cropAndSaveImage(String imagePath, int x, int y, int width, int height) throws IOException {
        BufferedImage sourceImage = readImage(imagePath);
        BufferedImage croppedImage = cropImage(sourceImage, x, y, width, height);
        
        String suffix = "_crop_" + x + "_" + y + "_" + width + "_" + height;
        return saveProcessedImage(croppedImage, imagePath, suffix);
    }
}
