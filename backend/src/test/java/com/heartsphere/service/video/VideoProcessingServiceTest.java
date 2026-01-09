package com.heartsphere.service.video;

import com.heartsphere.util.VideoUrlUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * VideoProcessingService单元测试
 */
@ExtendWith(MockitoExtension.class)
class VideoProcessingServiceTest {

    @Mock
    private VideoUrlUtils videoUrlUtils;

    @InjectMocks
    private VideoProcessingService videoProcessingService;

    private String testStoragePath;

    @BeforeEach
    void setUp() throws Exception {
        // 创建临时测试目录
        Path tempDir = Files.createTempDirectory("video-test-");
        testStoragePath = tempDir.toAbsolutePath().toString();
        
        ReflectionTestUtils.setField(videoProcessingService, "localStoragePath", testStoragePath);
        ReflectionTestUtils.setField(videoProcessingService, "supportedFormats", 
            java.util.Arrays.asList("mp4", "mov", "avi", "webm"));
        ReflectionTestUtils.setField(videoProcessingService, "defaultFps", 10);
        ReflectionTestUtils.setField(videoProcessingService, "maxFps", 30);
        ReflectionTestUtils.setField(videoProcessingService, "defaultWidth", 640);
        ReflectionTestUtils.setField(videoProcessingService, "defaultHeight", 480);
        ReflectionTestUtils.setField(videoProcessingService, "maxDuration", 30);
        ReflectionTestUtils.setField(videoProcessingService, "defaultQuality", "medium");
        ReflectionTestUtils.setField(videoProcessingService, "supportedOutputFormats", 
            java.util.Arrays.asList("gif", "lottie", "pag"));
    }

    @Test
    void testValidateVideoFormat_ValidFormat() {
        File validVideo = new File("test.mp4");
        assertTrue(videoProcessingService.validateVideoFormat(validVideo));
    }

    @Test
    void testValidateVideoFormat_InvalidFormat() {
        File invalidVideo = new File("test.txt");
        assertFalse(videoProcessingService.validateVideoFormat(invalidVideo));
    }

    @Test
    void testConvertToAnimation_UnsupportedFormat() {
        VideoToAnimationOptions options = new VideoToAnimationOptions();
        options.setOutputFormat(AnimationFormat.LOTTIE);
        
        assertThrows(UnsupportedOperationException.class, () -> {
            videoProcessingService.convertToAnimation("test.mp4", options);
        });
    }

    @Test
    void testConvertToAnimation_InvalidFormat() {
        VideoToAnimationOptions options = new VideoToAnimationOptions();
        options.setOutputFormat(null);
        
        assertThrows(IllegalArgumentException.class, () -> {
            videoProcessingService.convertToAnimation("test.mp4", options);
        });
    }

    @Test
    void testGetVideoInfo_InvalidPath() {
        when(videoUrlUtils.toRelativePath(anyString())).thenReturn("nonexistent.mp4");
        
        assertThrows(java.io.IOException.class, () -> {
            videoProcessingService.getVideoInfo("nonexistent.mp4");
        });
    }

    @Test
    void testAnimationFormat_FromCode() {
        assertEquals(AnimationFormat.GIF, AnimationFormat.fromCode("gif"));
        assertEquals(AnimationFormat.LOTTIE, AnimationFormat.fromCode("lottie"));
        assertEquals(AnimationFormat.PAG, AnimationFormat.fromCode("pag"));
        assertNull(AnimationFormat.fromCode("invalid"));
        assertNull(AnimationFormat.fromCode(null));
    }

    @Test
    void testAnimationFormat_IsValidFormat() {
        assertTrue(AnimationFormat.isValidFormat("gif"));
        assertTrue(AnimationFormat.isValidFormat("lottie"));
        assertTrue(AnimationFormat.isValidFormat("pag"));
        assertFalse(AnimationFormat.isValidFormat("invalid"));
        assertFalse(AnimationFormat.isValidFormat(null));
    }

    @Test
    void testVideoToAnimationOptions_Builder() {
        VideoToAnimationOptions options = new VideoToAnimationOptions();
        options.setOutputFormat(AnimationFormat.GIF);
        options.setFps(15);
        options.setWidth(800);
        options.setHeight(600);
        options.setKeepAspectRatio(true);
        options.setQuality("high");
        options.setStartTime(5.0);
        options.setDuration(10.0);
        
        assertEquals(AnimationFormat.GIF, options.getOutputFormat());
        assertEquals(15, options.getFps());
        assertEquals(800, options.getWidth());
        assertEquals(600, options.getHeight());
        assertTrue(options.getKeepAspectRatio());
        assertEquals("high", options.getQuality());
        assertEquals(5.0, options.getStartTime());
        assertEquals(10.0, options.getDuration());
    }
}
