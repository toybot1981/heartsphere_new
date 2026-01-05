package com.heartsphere.service;

import com.heartsphere.util.ImageUrlUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * ImageProcessingService 单元测试
 */
@ExtendWith(MockitoExtension.class)
class ImageProcessingServiceTest {

    @Mock
    private ImageUrlUtils imageUrlUtils;

    @InjectMocks
    private ImageProcessingService imageProcessingService;

    @TempDir
    Path tempDir;

    private BufferedImage testImage;
    private Path testImagePath;

    @BeforeEach
    void setUp() throws IOException {
        // 设置localStoragePath为临时目录
        ReflectionTestUtils.setField(imageProcessingService, "localStoragePath", tempDir.toString());
        ReflectionTestUtils.setField(imageProcessingService, "defaultThumbnailWidth", 200);
        ReflectionTestUtils.setField(imageProcessingService, "defaultThumbnailHeight", 200);
        ReflectionTestUtils.setField(imageProcessingService, "defaultThumbnailQuality", 0.85);
        ReflectionTestUtils.setField(imageProcessingService, "defaultKeepAspectRatio", true);
        ReflectionTestUtils.setField(imageProcessingService, "maxCropWidth", 5000);
        ReflectionTestUtils.setField(imageProcessingService, "maxCropHeight", 5000);

        // 创建测试图片（400x300的红色图片）
        testImage = new BufferedImage(400, 300, BufferedImage.TYPE_INT_RGB);
        for (int x = 0; x < 400; x++) {
            for (int y = 0; y < 300; y++) {
                testImage.setRGB(x, y, 0xFF0000); // 红色
            }
        }

        // 保存测试图片到临时目录
        Path testDir = tempDir.resolve("test").resolve("2025").resolve("12");
        Files.createDirectories(testDir);
        testImagePath = testDir.resolve("test.png");
        ImageIO.write(testImage, "png", testImagePath.toFile());
    }

    @Test
    void testReadImage_WithRelativePath() throws IOException {
        // Given
        String relativePath = "test/2025/12/test.png";

        // When
        BufferedImage result = imageProcessingService.readImage(relativePath);

        // Then
        assertNotNull(result);
        assertEquals(400, result.getWidth());
        assertEquals(300, result.getHeight());
    }

    @Test
    void testReadImage_WithAbsoluteUrl() throws IOException {
        // Given
        String url = "http://example.com/test/2025/12/test.png";
        when(imageUrlUtils.toRelativePath(url)).thenReturn("test/2025/12/test.png");

        // When
        BufferedImage result = imageProcessingService.readImage(url);

        // Then
        assertNotNull(result);
        assertEquals(400, result.getWidth());
        assertEquals(300, result.getHeight());
    }

    @Test
    void testReadImage_FileNotFound() {
        // Given
        String relativePath = "test/2025/12/nonexistent.png";

        // When & Then
        assertThrows(IOException.class, () -> imageProcessingService.readImage(relativePath));
    }

    @Test
    void testGenerateThumbnail_WithWidthAndHeight() throws IOException {
        // Given
        int width = 200;
        int height = 150;

        // When
        BufferedImage result = imageProcessingService.generateThumbnail(testImage, width, height, true, 0.85);

        // Then
        assertNotNull(result);
        // 保持宽高比的情况下，应该是200x150
        assertEquals(200, result.getWidth());
        assertEquals(150, result.getHeight());
    }

    @Test
    void testGenerateThumbnail_KeepAspectRatio() throws IOException {
        // Given
        int width = 200;
        int height = 200; // 正方形，但原图是400x300（4:3）

        // When
        BufferedImage result = imageProcessingService.generateThumbnail(testImage, width, height, true, 0.85);

        // Then
        assertNotNull(result);
        // 保持宽高比，应该是200x150（4:3）
        assertEquals(200, result.getWidth());
        assertEquals(150, result.getHeight());
    }

    @Test
    void testGenerateThumbnail_NotKeepAspectRatio() throws IOException {
        // Given
        int width = 200;
        int height = 200;

        // When
        BufferedImage result = imageProcessingService.generateThumbnail(testImage, width, height, false, 0.85);

        // Then
        assertNotNull(result);
        // 不保持宽高比，强制缩放到200x200
        assertEquals(200, result.getWidth());
        assertEquals(200, result.getHeight());
    }

    @Test
    void testGenerateThumbnail_OnlyWidth() throws IOException {
        // Given
        int width = 200;

        // When
        BufferedImage result = imageProcessingService.generateThumbnail(testImage, width, null, null, null);

        // Then
        assertNotNull(result);
        assertEquals(200, result.getWidth());
        // 保持宽高比，高度应该是150
        assertEquals(150, result.getHeight());
    }

    @Test
    void testGenerateThumbnail_OnlyHeight() throws IOException {
        // Given
        int height = 150;

        // When
        BufferedImage result = imageProcessingService.generateThumbnail(testImage, null, height, null, null);

        // Then
        assertNotNull(result);
        // 保持宽高比，宽度应该是200
        assertEquals(200, result.getWidth());
        assertEquals(150, result.getHeight());
    }

    @Test
    void testGenerateThumbnail_WithNullImage() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            imageProcessingService.generateThumbnail(null, 200, 200, true, 0.85));
    }

    @Test
    void testCropImage_NormalCase() throws IOException {
        // Given
        int x = 100;
        int y = 50;
        int width = 200;
        int height = 150;

        // When
        BufferedImage result = imageProcessingService.cropImage(testImage, x, y, width, height);

        // Then
        assertNotNull(result);
        assertEquals(200, result.getWidth());
        assertEquals(150, result.getHeight());
    }

    @Test
    void testCropImage_InvalidParameters() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            imageProcessingService.cropImage(testImage, -1, 0, 100, 100));
        assertThrows(IllegalArgumentException.class, () -> 
            imageProcessingService.cropImage(testImage, 0, -1, 100, 100));
        assertThrows(IllegalArgumentException.class, () -> 
            imageProcessingService.cropImage(testImage, 0, 0, 0, 100));
        assertThrows(IllegalArgumentException.class, () -> 
            imageProcessingService.cropImage(testImage, 0, 0, 100, 0));
    }

    @Test
    void testCropImage_OutOfBounds() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            imageProcessingService.cropImage(testImage, 500, 0, 100, 100));
        assertThrows(IllegalArgumentException.class, () -> 
            imageProcessingService.cropImage(testImage, 0, 500, 100, 100));
    }

    @Test
    void testCropImage_ExceedsMaxSize() throws IOException {
        // Given
        ReflectionTestUtils.setField(imageProcessingService, "maxCropWidth", 100);
        ReflectionTestUtils.setField(imageProcessingService, "maxCropHeight", 100);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            imageProcessingService.cropImage(testImage, 0, 0, 200, 100));
    }

    @Test
    void testCropImage_AdjustToImageBounds() throws IOException {
        // Given - 裁剪区域超出图片范围
        int x = 300; // 原图宽度400，从300开始
        int y = 200; // 原图高度300，从200开始
        int width = 200; // 请求宽度200，但实际只能裁剪100
        int height = 150; // 请求高度150，但实际只能裁剪100

        // When
        BufferedImage result = imageProcessingService.cropImage(testImage, x, y, width, height);

        // Then - 应该自动调整到图片边界
        assertNotNull(result);
        assertTrue(result.getWidth() <= 100); // 400 - 300 = 100
        assertTrue(result.getHeight() <= 100); // 300 - 200 = 100
    }

    @Test
    void testCropImage_WithNullImage() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            imageProcessingService.cropImage(null, 0, 0, 100, 100));
    }

    @Test
    void testSaveProcessedImage() throws IOException {
        // Given
        BufferedImage thumbnail = new BufferedImage(200, 150, BufferedImage.TYPE_INT_RGB);
        String originalPath = "test/2025/12/test.png";
        String suffix = "_thumb_200x150";

        // When
        String result = imageProcessingService.saveProcessedImage(thumbnail, originalPath, suffix);

        // Then
        assertNotNull(result);
        assertTrue(result.contains("test_thumb_200x150.png"));
        
        // 验证文件确实被创建
        Path savedFile = tempDir.resolve(result);
        assertTrue(Files.exists(savedFile));
        
        // 验证保存的图片
        BufferedImage savedImage = ImageIO.read(savedFile.toFile());
        assertNotNull(savedImage);
        assertEquals(200, savedImage.getWidth());
        assertEquals(150, savedImage.getHeight());
    }

    @Test
    void testSaveProcessedImage_WithNullImage() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> 
            imageProcessingService.saveProcessedImage(null, "test/2025/12/test.png", "_thumb"));
    }

    @Test
    void testGetImageInfo() throws IOException {
        // Given
        String relativePath = "test/2025/12/test.png";

        // When
        ImageProcessingService.ImageInfo info = imageProcessingService.getImageInfo(relativePath);

        // Then
        assertNotNull(info);
        assertEquals(400, info.getWidth());
        assertEquals(300, info.getHeight());
        assertTrue(info.getFileSize() > 0);
    }

    @Test
    void testGenerateAndSaveThumbnail() throws IOException {
        // Given
        String relativePath = "test/2025/12/test.png";
        int width = 200;
        int height = 150;

        // When
        String result = imageProcessingService.generateAndSaveThumbnail(relativePath, width, height, true, 0.85);

        // Then
        assertNotNull(result);
        assertTrue(result.contains("_thumb_200x150"));
        
        // 验证文件存在
        Path savedFile = tempDir.resolve(result);
        assertTrue(Files.exists(savedFile));
        
        // 验证缩略图尺寸
        BufferedImage thumbnail = ImageIO.read(savedFile.toFile());
        assertEquals(200, thumbnail.getWidth());
        assertEquals(150, thumbnail.getHeight());
    }

    @Test
    void testCropAndSaveImage() throws IOException {
        // Given
        String relativePath = "test/2025/12/test.png";
        int x = 100;
        int y = 50;
        int width = 200;
        int height = 150;

        // When
        String result = imageProcessingService.cropAndSaveImage(relativePath, x, y, width, height);

        // Then
        assertNotNull(result);
        assertTrue(result.contains("_crop_100_50_200_150"));
        
        // 验证文件存在
        Path savedFile = tempDir.resolve(result);
        assertTrue(Files.exists(savedFile));
        
        // 验证裁剪后尺寸
        BufferedImage cropped = ImageIO.read(savedFile.toFile());
        assertEquals(200, cropped.getWidth());
        assertEquals(150, cropped.getHeight());
    }
}
