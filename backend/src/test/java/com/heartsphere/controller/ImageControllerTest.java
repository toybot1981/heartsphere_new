package com.heartsphere.controller;

import com.heartsphere.service.ImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ImageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ImageStorageService imageStorageService;

    private MockMultipartFile testImage;

    @BeforeEach
    public void setUp() {
        // 创建一个测试图片文件（1x1像素的PNG）
        byte[] pngBytes = new byte[]{
            (byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, (byte)0xC4, (byte)0x89, 0x00, 0x00, 0x00,
            0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, (byte)0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05,
            0x00, 0x01, 0x0D, 0x0A, 0x2D, (byte)0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
            0x4E, 0x44, (byte)0xAE, 0x42, 0x60, (byte)0x82
        };
        testImage = new MockMultipartFile(
            "file",
            "test.png",
            "image/png",
            pngBytes
        );
    }

    @Test
    public void testUploadImage() throws Exception {
        mockMvc.perform(multipart("/api/images/upload")
                        .file(testImage)
                        .param("category", "test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.url").exists());
    }

    @Test
    public void testUploadImageWithInvalidFile() throws Exception {
        MockMultipartFile invalidFile = new MockMultipartFile(
            "file",
            "test.txt",
            "text/plain",
            "not an image".getBytes()
        );

        mockMvc.perform(multipart("/api/images/upload")
                        .file(invalidFile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    public void testUploadBase64Image() throws Exception {
        // 1x1像素PNG的base64编码
        String base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

        mockMvc.perform(post("/api/images/upload-base64")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"base64\":\"" + base64Image + "\",\"category\":\"test\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.url").exists());
    }

    @Test
    public void testUploadBase64ImageWithEmptyData() throws Exception {
        mockMvc.perform(post("/api/images/upload-base64")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"base64\":\"\",\"category\":\"test\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}

