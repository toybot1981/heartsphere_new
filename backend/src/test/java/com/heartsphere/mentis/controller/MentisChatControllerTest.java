package com.heartsphere.mentis.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.dto.ApiResponse;
import com.heartsphere.mentis.dto.ChatRequestDTO;
import com.heartsphere.mentis.dto.ChatResponseDTO;
import com.heartsphere.mentis.service.MentisAgentService;
import com.heartsphere.security.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * MentisChatController 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@WebMvcTest(MentisChatController.class)
class MentisChatControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private MentisAgentService agentService;
    
    private Long testUserId;
    private ChatRequestDTO testRequest;
    private ChatResponseDTO testResponse;
    private UserDetailsImpl testUserDetails;
    
    @BeforeEach
    void setUp() {
        testUserId = 1L;
        
        testRequest = new ChatRequestDTO();
        testRequest.setSessionId("mentis_test_session_123");
        testRequest.setMessage("你好");
        testRequest.setEnableComputerUse(true);
        
        testResponse = new ChatResponseDTO();
        testResponse.setSessionId(testRequest.getSessionId());
        testResponse.setMessageId("msg_test_123");
        testResponse.setResponse("你好，我是Mentis");
        
        // UserDetailsImpl 没有公共构造函数，需要使用 build 方法或直接创建
        // 为了测试目的，我们使用反射或直接创建实例
        testUserDetails = new UserDetailsImpl();
        testUserDetails.setId(testUserId);
        testUserDetails.setUsername("testuser");
    }
    
    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void testSendMessage() throws Exception {
        // Given
        when(agentService.processMessage(eq(testUserId), any(ChatRequestDTO.class)))
                .thenReturn(testResponse);
        
        // When & Then
        mockMvc.perform(post("/api/mentis/chat/send")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRequest))
                .with(user(testUserDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.sessionId").value(testRequest.getSessionId()))
                .andExpect(jsonPath("$.data.response").exists());
    }
    
    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void testSendMessageCompatibleEndpoint() throws Exception {
        // Given
        when(agentService.processMessage(eq(testUserId), any(ChatRequestDTO.class)))
                .thenReturn(testResponse);
        
        // When & Then
        mockMvc.perform(post("/api/mentis/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRequest))
                .with(user(testUserDetails)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }
}
