package com.heartsphere.aiagent.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aiagent.dto.request.TextGenerationRequest;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.aiagent.service.AIService;
import com.heartsphere.security.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * AIServiceController集成测试
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AIServiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AIService aiService;

    private Long userId = 1L;

    @BeforeEach
    void setUp() {
        // 设置认证上下文
        UserDetailsImpl userDetails = new UserDetailsImpl(
            userId, "testuser", "test@example.com", "password", true
        );
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities()
        );
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testGenerateText_Success() throws Exception {
        // Given
        TextGenerationRequest request = new TextGenerationRequest();
        request.setPrompt("你好");
        request.setProvider("dashscope");

        TextGenerationResponse mockResponse = new TextGenerationResponse();
        mockResponse.setContent("你好！");
        mockResponse.setProvider("dashscope");
        mockResponse.setModel("qwen-max");

        when(aiService.generateText(eq(userId), any(TextGenerationRequest.class)))
            .thenReturn(mockResponse);

        // When & Then
        mockMvc.perform(post("/api/ai/text/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("文本生成成功"))
            .andExpect(jsonPath("$.data.content").value("你好！"))
            .andExpect(jsonPath("$.data.provider").value("dashscope"));
    }

    @Test
    void testGenerateText_Unauthorized() throws Exception {
        // Clear authentication
        SecurityContextHolder.clearContext();

        // Given
        TextGenerationRequest request = new TextGenerationRequest();
        request.setPrompt("你好");

        // When & Then
        mockMvc.perform(post("/api/ai/text/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isInternalServerError()); // 因为getCurrentUserId会抛出异常
    }

    @Test
    void testGetUserConfig_Success() throws Exception {
        // Given
        com.heartsphere.aiagent.entity.UserAIConfig mockConfig = 
            new com.heartsphere.aiagent.entity.UserAIConfig();
        mockConfig.setUserId(userId);
        mockConfig.setTextProvider("dashscope");
        mockConfig.setTextModel("qwen-max");

        when(aiService.getUserConfig(userId)).thenReturn(mockConfig);

        // When & Then
        mockMvc.perform(get("/api/ai/config"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("获取配置成功"))
            .andExpect(jsonPath("$.data.userId").value(userId))
            .andExpect(jsonPath("$.data.textProvider").value("dashscope"));
    }

    @Test
    void testUpdateUserConfig_Success() throws Exception {
        // Given
        com.heartsphere.aiagent.entity.UserAIConfig requestConfig = 
            new com.heartsphere.aiagent.entity.UserAIConfig();
        requestConfig.setTextProvider("gemini");
        requestConfig.setTextModel("gemini-pro");

        com.heartsphere.aiagent.entity.UserAIConfig updatedConfig = 
            new com.heartsphere.aiagent.entity.UserAIConfig();
        updatedConfig.setUserId(userId);
        updatedConfig.setTextProvider("gemini");
        updatedConfig.setTextModel("gemini-pro");

        when(aiService.updateUserConfig(eq(userId), any(com.heartsphere.aiagent.entity.UserAIConfig.class)))
            .thenReturn(updatedConfig);

        // When & Then
        mockMvc.perform(put("/api/ai/config")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestConfig)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.message").value("更新配置成功"))
            .andExpect(jsonPath("$.data.textProvider").value("gemini"));
    }
}


