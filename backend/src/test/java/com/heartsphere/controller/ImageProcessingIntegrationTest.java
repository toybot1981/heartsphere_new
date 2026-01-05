package com.heartsphere.controller;

import com.heartsphere.service.ImageProcessingService;
import com.heartsphere.service.ImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 图片处理API集成测试
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("integration-test")
public class ImageProcessingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;


    @BeforeEach
    public void setUp() throws Exception {
        // 测试初始化（如果需要的话）
    }

    /**
     * 创建一个测试PNG图片（简单实现）
     */
    private byte[] createTestPngImage(int width, int height) {
        // 创建一个简单的PNG图片字节数组
        // 这是一个1x1像素的PNG的最小格式
        // 为了测试，我们使用一个最小有效的PNG
        return new byte[]{
            (byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, (byte)0xC4, (byte)0x89, 0x00, 0x00, 0x00,
            0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, (byte)0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05,
            0x00, 0x01, 0x0D, 0x0A, 0x2D, (byte)0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
            0x4E, 0x44, (byte)0xAE, 0x42, 0x60, (byte)0x82
        };
    }

    @Test
    public void testGenerateThumbnail_Success() throws Exception {
        // 首先上传一张图片
        byte[] pngBytes = createTestPngImage(400, 300);
        MockMultipartFile testImage = new MockMultipartFile(
            "file",
            "test-thumb.png",
            "image/png",
            pngBytes
        );

        // 上传图片
        mockMvc.perform(multipart("/api/images/upload")
                        .file(testImage)
                        .param("category", "test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.url").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 从响应中提取URL（实际应该解析JSON，这里简化）
        // 假设URL在响应中，我们使用相对路径进行测试
        String imageUrl = "/api/images/files/test/2025/12/test-thumb.png";

        // 生成缩略图请求
        String requestBody = String.format(
            "{\"url\":\"%s\",\"width\":200,\"height\":150,\"keepAspectRatio\":true,\"quality\":0.85}",
            imageUrl
        );

        mockMvc.perform(post("/api/images/thumbnail")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.url").exists())
                .andExpect(jsonPath("$.relativePath").exists())
                .andExpect(jsonPath("$.width").exists())
                .andExpect(jsonPath("$.height").exists())
                .andExpect(jsonPath("$.originalSize").exists())
                .andExpect(jsonPath("$.processedSize").exists());
    }

    @Test
    public void testGenerateThumbnail_WithMissingUrl() throws Exception {
        String requestBody = "{\"width\":200,\"height\":150}";

        mockMvc.perform(post("/api/images/thumbnail")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("图片URL不能为空"));
    }

    @Test
    public void testGenerateThumbnail_WithInvalidImage() throws Exception {
        String requestBody = "{\"url\":\"test/nonexistent.png\",\"width\":200,\"height\":150}";

        mockMvc.perform(post("/api/images/thumbnail")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    public void testGenerateThumbnail_WithOnlyWidth() throws Exception {
        // 首先上传一张图片
        byte[] pngBytes = createTestPngImage(400, 300);
        MockMultipartFile testImage = new MockMultipartFile(
            "file",
            "test-width.png",
            "image/png",
            pngBytes
        );

        mockMvc.perform(multipart("/api/images/upload")
                        .file(testImage)
                        .param("category", "test"))
                .andExpect(status().isOk());

        String imageUrl = "/api/images/files/test/2025/12/test-width.png";
        String requestBody = String.format(
            "{\"url\":\"%s\",\"width\":200}",
            imageUrl
        );

        mockMvc.perform(post("/api/images/thumbnail")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    public void testCropImage_Success() throws Exception {
        // 首先上传一张图片
        byte[] pngBytes = createTestPngImage(400, 300);
        MockMultipartFile testImage = new MockMultipartFile(
            "file",
            "test-crop.png",
            "image/png",
            pngBytes
        );

        mockMvc.perform(multipart("/api/images/upload")
                        .file(testImage)
                        .param("category", "test"))
                .andExpect(status().isOk());

        String imageUrl = "/api/images/files/test/2025/12/test-crop.png";
        String requestBody = String.format(
            "{\"url\":\"%s\",\"x\":100,\"y\":50,\"width\":200,\"height\":150}",
            imageUrl
        );

        mockMvc.perform(post("/api/images/crop")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.url").exists())
                .andExpect(jsonPath("$.relativePath").exists())
                .andExpect(jsonPath("$.width").value(200))
                .andExpect(jsonPath("$.height").value(150))
                .andExpect(jsonPath("$.originalSize").exists())
                .andExpect(jsonPath("$.processedSize").exists());
    }

    @Test
    public void testCropImage_WithMissingParameters() throws Exception {
        String requestBody = "{\"url\":\"test/test.png\",\"x\":100,\"y\":50}";

        mockMvc.perform(post("/api/images/crop")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("裁剪参数不完整: x, y, width, height 都是必需的"));
    }

    @Test
    public void testCropImage_WithMissingUrl() throws Exception {
        String requestBody = "{\"x\":100,\"y\":50,\"width\":200,\"height\":150}";

        mockMvc.perform(post("/api/images/crop")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("图片URL不能为空"));
    }

    @Test
    public void testCropImage_WithInvalidCoordinates() throws Exception {
        String requestBody = "{\"url\":\"test/test.png\",\"x\":-1,\"y\":50,\"width\":200,\"height\":150}";

        mockMvc.perform(post("/api/images/crop")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    public void testCropImage_WithInvalidImage() throws Exception {
        String requestBody = "{\"url\":\"test/nonexistent.png\",\"x\":100,\"y\":50,\"width\":200,\"height\":150}";

        mockMvc.perform(post("/api/images/crop")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false));
    }
}
