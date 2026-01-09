package com.heartsphere.service.video;

import com.heartsphere.util.VideoUrlUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

/**
 * VideoProcessingService集成测试
 * 这些测试需要实际的FFmpeg环境才能运行
 * 
 * 运行条件：
 * - 设置环境变量 ENABLE_VIDEO_INTEGRATION_TESTS=true
 * - 确保系统安装了FFmpeg
 */
@SpringBootTest
@ActiveProfiles("integration-test")
@EnabledIfEnvironmentVariable(named = "ENABLE_VIDEO_INTEGRATION_TESTS", matches = "true")
public class VideoProcessingServiceIntegrationTest {

    @Autowired
    private VideoProcessingService videoProcessingService;

    @Autowired
    private VideoUrlUtils videoUrlUtils;

    private Path testVideoPath;
    private boolean ffmpegAvailable = false;

    @BeforeEach
    void setUp() throws Exception {
        // 检查FFmpeg是否可用
        // 尝试创建一个简单的测试来验证FFmpeg
        try {
            // 检查是否有可用的FFmpeg
            ffmpegAvailable = checkFFmpegAvailable();
        } catch (Exception e) {
            ffmpegAvailable = false;
            System.out.println("FFmpeg不可用，部分测试将被跳过: " + e.getMessage());
        }
    }

    /**
     * 检查FFmpeg是否可用
     */
    private boolean checkFFmpegAvailable() {
        try {
            // 尝试获取一个不存在的视频信息，如果抛出特定异常，说明FFmpeg可用
            // 如果抛出"找不到FFmpeg"异常，说明FFmpeg不可用
            videoProcessingService.validateVideoFormat(new File("test.mp4"));
            return true;
        } catch (Exception e) {
            // 如果是因为找不到文件而失败，说明FFmpeg可能可用
            // 如果是因为找不到FFmpeg而失败，说明FFmpeg不可用
            return !e.getMessage().toLowerCase().contains("ffmpeg");
        }
    }

    @Test
    void testValidateVideoFormat_ValidFormats() {
        if (!ffmpegAvailable) {
            System.out.println("跳过测试：FFmpeg不可用");
            return;
        }

        assertTrue(videoProcessingService.validateVideoFormat(new File("test.mp4")));
        assertTrue(videoProcessingService.validateVideoFormat(new File("test.mov")));
        assertTrue(videoProcessingService.validateVideoFormat(new File("test.avi")));
        assertTrue(videoProcessingService.validateVideoFormat(new File("test.webm")));
    }

    @Test
    void testValidateVideoFormat_InvalidFormats() {
        assertFalse(videoProcessingService.validateVideoFormat(new File("test.txt")));
        assertFalse(videoProcessingService.validateVideoFormat(new File("test.pdf")));
        assertFalse(videoProcessingService.validateVideoFormat(new File("test.doc")));
    }

    /**
     * 测试视频信息提取（需要真实视频文件）
     */
    @Test
    void testGetVideoInfo_WithRealVideo() throws Exception {
        if (!ffmpegAvailable) {
            System.out.println("跳过测试：FFmpeg不可用");
            return;
        }

        System.out.println("注意：此测试需要真实的视频文件");
        System.out.println("请在测试资源目录中放置一个测试视频文件");
        
        // 示例：如果有测试视频文件
        // String testVideoPath = "src/test/resources/test-video.mp4";
        // File testVideo = new File(testVideoPath);
        // if (testVideo.exists()) {
        //     VideoInfo info = videoProcessingService.getVideoInfo(testVideoPath);
        //     assertNotNull(info);
        //     assertTrue(info.getWidth() > 0);
        //     assertTrue(info.getHeight() > 0);
        //     assertTrue(info.getDuration() > 0);
        // }
    }

    /**
     * 测试视频转换为GIF（需要真实视频文件）
     */
    @Test
    void testConvertToGif_WithRealVideo() throws Exception {
        if (!ffmpegAvailable) {
            System.out.println("跳过测试：FFmpeg不可用");
            return;
        }

        System.out.println("注意：此测试需要真实的视频文件");
        System.out.println("转换测试需要较长时间，建议在CI/CD中运行");
        
        // 示例：如果有测试视频文件
        // String testVideoPath = "src/test/resources/test-video.mp4";
        // File testVideo = new File(testVideoPath);
        // if (testVideo.exists()) {
        //     VideoToAnimationOptions options = new VideoToAnimationOptions();
        //     options.setOutputFormat(AnimationFormat.GIF);
        //     options.setFps(10);
        //     options.setWidth(640);
        //     options.setHeight(480);
        //     options.setQuality("medium");
        //     
        //     String result = videoProcessingService.convertToAnimation(testVideoPath, options);
        //     assertNotNull(result);
        //     
        //     // 验证输出文件存在
        //     File outputFile = new File(result);
        //     assertTrue(outputFile.exists());
        // }
    }

    /**
     * 测试Lottie转换（应该抛出UnsupportedOperationException）
     */
    @Test
    void testConvertToLottie_Unsupported() throws Exception {
        VideoToAnimationOptions options = new VideoToAnimationOptions();
        options.setOutputFormat(AnimationFormat.LOTTIE);
        
        assertThrows(UnsupportedOperationException.class, () -> {
            videoProcessingService.convertToAnimation("test.mp4", options);
        });
    }

    /**
     * 测试PAG转换（应该抛出UnsupportedOperationException）
     */
    @Test
    void testConvertToPag_Unsupported() throws Exception {
        VideoToAnimationOptions options = new VideoToAnimationOptions();
        options.setOutputFormat(AnimationFormat.PAG);
        
        assertThrows(UnsupportedOperationException.class, () -> {
            videoProcessingService.convertToAnimation("test.mp4", options);
        });
    }
}
