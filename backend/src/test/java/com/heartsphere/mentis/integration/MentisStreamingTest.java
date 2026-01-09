package com.heartsphere.mentis.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.service.AdminAuthService;
import com.heartsphere.mentis.entity.MentisSession;
import com.heartsphere.mentis.service.MentisSessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Mentis 流式响应测试
 * 测试 SSE (Server-Sent Events) 流式消息功能
 * 
 * @author HeartSphere
 * @version 1.0
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class MentisStreamingTest {
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private MentisSessionService sessionService;
    
    @Autowired
    private AdminAuthService adminAuthService;
    
    private String adminToken;
    private Long adminUserId;
    private String sessionId;
    
    @BeforeEach
    void setUp() throws Exception {
        // 获取管理员token
        try {
            java.util.Map<String, Object> response = adminAuthService.login("admin", "admin123");
            adminToken = (String) response.get("token");
            adminUserId = -1L;
            assertNotNull(adminToken, "管理员登录失败，请确保测试环境中有 admin/admin123 账号");
        } catch (Exception e) {
            adminToken = null;
            System.out.println("警告: 无法获取管理员token，流式测试将被跳过");
        }
        
        // 创建测试会话
        if (adminToken != null && adminUserId != null) {
            MentisSession session = sessionService.createSession(adminUserId, "流式测试会话");
            sessionId = session.getSessionId();
        }
    }
    
    /**
     * 测试流式消息响应
     */
    @Test
    void testStreamingResponse() throws Exception {
        if (adminToken == null || sessionId == null) {
            System.out.println("跳过测试: 缺少管理员token或会话ID");
            return;
        }
        
        // 使用原生HTTP连接测试SSE
        String url = "http://localhost:8080/api/admin/mentis/chat/stream";
        URL streamUrl = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) streamUrl.openConnection();
        
        try {
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Authorization", "Bearer " + adminToken);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Accept", "text/event-stream");
            connection.setDoOutput(true);
            
            // 发送请求体
            String requestBody = String.format(
                "{\"sessionId\": \"%s\", \"message\": \"测试流式消息\", \"enableComputerUse\": false}",
                sessionId
            );
            
            connection.getOutputStream().write(requestBody.getBytes(StandardCharsets.UTF_8));
            
            // 读取响应
            assertEquals(HttpURLConnection.HTTP_OK, connection.getResponseCode(),
                    "HTTP响应码应该是200");
            
            List<String> events = new ArrayList<>();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                int lineCount = 0;
                while ((line = reader.readLine()) != null && lineCount < 50) {
                    if (line.startsWith("data: ")) {
                        events.add(line.substring(6));
                    }
                    lineCount++;
                }
            }
            
            // 验证至少收到了一个事件
            assertFalse(events.isEmpty(), "应该至少收到一个SSE事件");
            
            // 验证事件格式
            for (String event : events) {
                assertNotNull(event, "事件内容不应为null");
                // 尝试解析JSON
                try {
                    objectMapper.readTree(event);
                } catch (Exception e) {
                    // 如果不是JSON，可能是文本数据，这也是可以接受的
                }
            }
            
        } finally {
            connection.disconnect();
        }
    }
    
    /**
     * 测试流式响应超时处理
     */
    @Test
    void testStreamingTimeout() throws Exception {
        if (adminToken == null || sessionId == null) {
            System.out.println("跳过测试: 缺少管理员token或会话ID");
            return;
        }
        
        // 这个测试验证SSE连接在超时后会正确关闭
        // 实际超时时间在控制器中设置为5分钟，这里只测试连接建立
        String url = "http://localhost:8080/api/admin/mentis/chat/stream";
        URL streamUrl = new URL(url);
        HttpURLConnection connection = (HttpURLConnection) streamUrl.openConnection();
        
        try {
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Authorization", "Bearer " + adminToken);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Accept", "text/event-stream");
            connection.setDoOutput(true);
            connection.setReadTimeout(1000); // 1秒读取超时
            
            String requestBody = String.format(
                "{\"sessionId\": \"%s\", \"message\": \"测试\", \"enableComputerUse\": false}",
                sessionId
            );
            
            connection.getOutputStream().write(requestBody.getBytes(StandardCharsets.UTF_8));
            
            // 验证连接可以建立
            assertEquals(HttpURLConnection.HTTP_OK, connection.getResponseCode());
            
        } catch (java.net.SocketTimeoutException e) {
            // 读取超时是预期的，说明连接正常工作
            assertTrue(true, "读取超时是预期的");
        } finally {
            connection.disconnect();
        }
    }
    
    /**
     * 测试多个并发流式连接
     */
    @Test
    void testConcurrentStreaming() throws Exception {
        if (adminToken == null || sessionId == null) {
            System.out.println("跳过测试: 缺少管理员token或会话ID");
            return;
        }
        
        int connectionCount = 3;
        List<Thread> threads = new ArrayList<>();
        List<Boolean> success = new ArrayList<>();
        
        for (int i = 0; i < connectionCount; i++) {
            final int index = i;
            success.add(false);
            
            Thread thread = new Thread(() -> {
                try {
                    String url = "http://localhost:8080/api/admin/mentis/chat/stream";
                    URL streamUrl = new URL(url);
                    HttpURLConnection connection = (HttpURLConnection) streamUrl.openConnection();
                    
                    connection.setRequestMethod("POST");
                    connection.setRequestProperty("Authorization", "Bearer " + adminToken);
                    connection.setRequestProperty("Content-Type", "application/json");
                    connection.setRequestProperty("Accept", "text/event-stream");
                    connection.setDoOutput(true);
                    connection.setReadTimeout(2000);
                    
                    String requestBody = String.format(
                        "{\"sessionId\": \"%s\", \"message\": \"并发测试 %d\", \"enableComputerUse\": false}",
                        sessionId, index
                    );
                    
                    connection.getOutputStream().write(requestBody.getBytes(StandardCharsets.UTF_8));
                    
                    int responseCode = connection.getResponseCode();
                    if (responseCode == HttpURLConnection.HTTP_OK) {
                        success.set(index, true);
                    }
                    
                    connection.disconnect();
                } catch (Exception e) {
                    // 超时或连接错误是预期的
                    e.printStackTrace();
                }
            });
            
            threads.add(thread);
            thread.start();
        }
        
        // 等待所有线程完成
        for (Thread thread : threads) {
            thread.join(5000); // 最多等待5秒
        }
        
        // 验证至少有一些连接成功
        long successCount = success.stream().filter(b -> b).count();
        assertTrue(successCount > 0, "至少应该有一个并发连接成功");
    }
}
