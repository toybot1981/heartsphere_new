package com.heartsphere.controller;

import com.heartsphere.service.WeChatAuthService;
import com.heartsphere.admin.service.SystemConfigService;
import com.heartsphere.repository.WorldRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.config.TestSecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;

/**
 * 微信回调接口测试
 */
@WebMvcTest(controllers = WeChatController.class)
@Import(TestSecurityConfig.class)
class WeChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WeChatAuthService weChatAuthService;

    @MockBean
    private SystemConfigService systemConfigService;

    @MockBean
    private WorldRepository worldRepository;

    @MockBean
    private UserRepository userRepository;

    private String validCode;
    private String validState;
    private Map<String, Object> mockCallbackResult;

    @BeforeEach
    void setUp() {
        validCode = "test_code_12345";
        validState = "test_state_67890";
        
        // 模拟成功的回调结果
        mockCallbackResult = new HashMap<>();
        mockCallbackResult.put("status", "confirmed");
        mockCallbackResult.put("type", "login");
        mockCallbackResult.put("openid", "test_openid");
        mockCallbackResult.put("token", "test_jwt_token");
        mockCallbackResult.put("userId", 1L);
        mockCallbackResult.put("username", "test_user");
    }

    /**
     * 测试正常回调场景 - 登录成功
     */
    @Test
    void testCallback_Success() throws Exception {
        // Given
        when(weChatAuthService.handleCallback(validCode, validState))
                .thenReturn(mockCallbackResult);

        // When & Then
        mockMvc.perform(get("/api/wechat/callback")
                        .param("code", validCode)
                        .param("state", validState))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/html;charset=UTF-8"))
                .andExpect(content().string(containsString("登录成功")));

        // 验证service被调用
        verify(weChatAuthService, times(1)).handleCallback(validCode, validState);
    }

    /**
     * 测试正常回调场景 - 绑定成功
     */
    @Test
    void testCallback_BindSuccess() throws Exception {
        // Given
        Map<String, Object> bindResult = new HashMap<>();
        bindResult.put("status", "confirmed");
        bindResult.put("type", "bind");
        bindResult.put("openid", "test_openid");
        bindResult.put("message", "微信绑定成功");
        
        when(weChatAuthService.handleCallback(validCode, validState))
                .thenReturn(bindResult);

        // When & Then
        mockMvc.perform(get("/api/wechat/callback")
                        .param("code", validCode)
                        .param("state", validState))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("绑定成功")));

        verify(weChatAuthService, times(1)).handleCallback(validCode, validState);
    }

    /**
     * 测试缺少code参数
     */
    @Test
    void testCallback_MissingCode() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/wechat/callback")
                        .param("state", validState))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("缺少必要参数")))
                .andExpect(content().string(containsString("code")));

        // 验证service未被调用
        verify(weChatAuthService, never()).handleCallback(anyString(), anyString());
    }

    /**
     * 测试缺少state参数
     */
    @Test
    void testCallback_MissingState() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/wechat/callback")
                        .param("code", validCode))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("缺少必要参数")))
                .andExpect(content().string(containsString("state")));

        // 验证service未被调用
        verify(weChatAuthService, never()).handleCallback(anyString(), anyString());
    }

    /**
     * 测试缺少code和state参数
     */
    @Test
    void testCallback_MissingBothParams() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/wechat/callback"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("缺少必要参数")));

        // 验证service未被调用
        verify(weChatAuthService, never()).handleCallback(anyString(), anyString());
    }

    /**
     * 测试微信返回错误
     */
    @Test
    void testCallback_WechatError() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/wechat/callback")
                        .param("error", "access_denied")
                        .param("error_description", "用户拒绝授权"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("登录失败")))
                .andExpect(content().string(containsString("access_denied")))
                .andExpect(content().string(containsString("用户拒绝授权")));

        // 验证service未被调用
        verify(weChatAuthService, never()).handleCallback(anyString(), anyString());
    }

    /**
     * 测试回调处理失败场景
     */
    @Test
    void testCallback_HandleCallbackFailed() throws Exception {
        // Given
        Map<String, Object> failedResult = new HashMap<>();
        failedResult.put("status", "error");
        failedResult.put("type", "login");
        failedResult.put("error", "无效的state参数");
        
        when(weChatAuthService.handleCallback(validCode, validState))
                .thenReturn(failedResult);

        // When & Then
        mockMvc.perform(get("/api/wechat/callback")
                        .param("code", validCode)
                        .param("state", validState))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("登录失败")))
                .andExpect(content().string(containsString("无效的state参数")));

        verify(weChatAuthService, times(1)).handleCallback(validCode, validState);
    }

    /**
     * 测试回调处理异常场景
     */
    @Test
    void testCallback_HandleCallbackException() throws Exception {
        // Given
        when(weChatAuthService.handleCallback(validCode, validState))
                .thenThrow(new RuntimeException("微信配置未完成"));

        // When & Then
        mockMvc.perform(get("/api/wechat/callback")
                        .param("code", validCode)
                        .param("state", validState))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(containsString("登录异常")))
                .andExpect(content().string(containsString("微信配置未完成")));

        verify(weChatAuthService, times(1)).handleCallback(validCode, validState);
    }

    /**
     * 测试完整的请求参数（包含所有可能的参数）
     */
    @Test
    void testCallback_WithAllParams() throws Exception {
        // Given
        when(weChatAuthService.handleCallback(validCode, validState))
                .thenReturn(mockCallbackResult);

        // When & Then
        mockMvc.perform(get("/api/wechat/callback")
                        .param("code", validCode)
                        .param("state", validState)
                        .header("User-Agent", "Mozilla/5.0")
                        .header("Referer", "https://example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("登录成功")));

        verify(weChatAuthService, times(1)).handleCallback(validCode, validState);
    }

    /**
     * 测试URL编码的参数（Spring会自动解码）
     */
    @Test
    void testCallback_WithEncodedParams() throws Exception {
        // Given
        // Spring的param()方法会自动处理URL编码，所以直接传入解码后的值即可
        String codeWithSpaces = "test code+123";
        
        when(weChatAuthService.handleCallback(codeWithSpaces, validState))
                .thenReturn(mockCallbackResult);

        // When & Then
        mockMvc.perform(get("/api/wechat/callback")
                        .param("code", codeWithSpaces)
                        .param("state", validState))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("登录成功")));

        verify(weChatAuthService, times(1)).handleCallback(codeWithSpaces, validState);
    }

    /**
     * 测试空字符串参数（Spring可能将空字符串视为null）
     */
    @Test
    void testCallback_WithEmptyParams() throws Exception {
        // When & Then
        // Spring的@RequestParam对于空字符串的处理可能因版本而异
        // 如果传入空字符串，可能被视为缺少参数或进入handleCallback
        mockMvc.perform(get("/api/wechat/callback")
                        .param("code", "")
                        .param("state", ""))
                .andExpect(status().isBadRequest());

        // 根据实际行为，空字符串可能被Spring转换为null，返回"缺少必要参数"
        // 或者进入handleCallback后因为state不存在而返回错误
        // 这里只验证返回400错误即可
    }

    /**
     * 测试获取微信AppID
     */
    @Test
    void testGetWechatAppId() throws Exception {
        // Given
        String appId = "wx1234567890abcdef";
        when(weChatAuthService.getAppId()).thenReturn(appId);

        // When & Then
        mockMvc.perform(get("/api/wechat/appid"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appid").value(appId));

        verify(weChatAuthService, times(1)).getAppId();
    }
}

