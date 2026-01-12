package com.heartsphere.controller;

import com.heartsphere.service.ImageStorageService;
import com.heartsphere.service.video.VideoProcessingService;
import com.heartsphere.util.VideoUrlUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * VideoController集成测试
 * 注意：这些测试需要FFmpeg支持，在某些环境中可能无法运行
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class VideoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ImageStorageService imageStorageService;

    @MockBean
    private VideoProcessingService videoProcessingService;

    @MockBean
    private VideoUrlUtils videoUrlUtils;

    private MockMultipartFile testVideo;

    @BeforeEach
    public void setUp() {
        // 创建一个模拟的视频文件（实际上只是一个测试用的假文件）
        byte[] videoBytes = new byte[1024]; // 1KB的假视频数据
        testVideo = new MockMultipartFile(
            "file",
            "test.mp4",
            "video/mp4",
            videoBytes
        );
    }

    @Test
    public void testUploadVideo_InvalidFormat() throws Exception {
        MockMultipartFile invalidFile = new MockMultipartFile(
            "file",
            "test.txt",
            "text/plain",
            "not a video".getBytes()
        );

        mockMvc.perform(multipart("/api/videos/upload")
                        .file(invalidFile)
                        .param("category", "test"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    public void testUploadVideo_EmptyFile() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
            "file",
            "test.mp4",
            "video/mp4",
            new byte[0]
        );

        mockMvc.perform(multipart("/api/videos/upload")
                        .file(emptyFile)
                        .param("category", "test"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    public void testConvertToAnimation_EmptyUrl() throws Exception {
        mockMvc.perform(post("/api/videos/to-animation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"url\":\"\",\"format\":\"gif\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    public void testConvertToAnimation_InvalidFormat() throws Exception {
        mockMvc.perform(post("/api/videos/to-animation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"url\":\"test.mp4\",\"format\":\"invalid\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    public void testGetVideoInfo_MissingUrl() throws Exception {
        mockMvc.perform(get("/api/videos/info"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testGetVideoInfo_EmptyUrl() throws Exception {
        mockMvc.perform(get("/api/videos/info")
                        .param("url", ""))
                .andExpect(status().isBadRequest());
    }
}
