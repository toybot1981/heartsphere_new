package com.heartsphere.heartconnect.controller;

import com.heartsphere.controller.BaseControllerTest;
import com.heartsphere.dto.LoginRequest;
import com.heartsphere.entity.User;
import com.heartsphere.heartconnect.dto.CreateConnectionRequestRequest;
import com.heartsphere.heartconnect.dto.CreateShareConfigRequest;
import com.heartsphere.heartconnect.dto.ResponseConnectionRequestRequest;
import com.heartsphere.heartconnect.entity.HeartSphereConnection;
import com.heartsphere.heartconnect.entity.HeartSphereConnectionRequest;
import com.heartsphere.heartconnect.entity.HeartSphereShareConfig;
import com.heartsphere.heartconnect.repository.HeartSphereConnectionRepository;
import com.heartsphere.heartconnect.repository.HeartSphereConnectionRequestRepository;
import com.heartsphere.heartconnect.repository.HeartSphereShareConfigRepository;
import com.heartsphere.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

/**
 * 连接请求控制器集成测试
 * 使用三个测试账号：tongyexin, ty1, heartsphere
 */
public class ConnectionRequestControllerTest extends BaseControllerTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HeartSphereShareConfigRepository shareConfigRepository;

    @Autowired
    private HeartSphereConnectionRequestRepository connectionRequestRepository;

    @Autowired
    private HeartSphereConnectionRepository connectionRepository;

    private User user1; // tongyexin - 共享配置主人
    private User user2; // ty1 - 请求者
    private User user3; // heartsphere - 另一个请求者
    private String token1;
    private String token2;
    private String token3;
    private HeartSphereShareConfig shareConfig;

    @BeforeEach
    void setUp() throws Exception {
        // 清理测试数据
        connectionRepository.deleteAll();
        connectionRequestRepository.deleteAll();
        shareConfigRepository.deleteAll();

        // 登录并获取token
        user1 = loginAndGetUser("tongyexin", "123456");
        user2 = loginAndGetUser("ty1", "Tyx@1234");
        user3 = loginAndGetUser("heartsphere", "Tyx@1234");

        token1 = loginAndGetToken("tongyexin", "123456");
        token2 = loginAndGetToken("ty1", "Tyx@1234");
        token3 = loginAndGetToken("heartsphere", "Tyx@1234");

        // user1创建共享配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("approval");
        createRequest.setDescription("测试共享配置");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createRequest)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        shareConfig = shareConfigRepository.findByUserId(user1.getId()).orElse(null);
        assertNotNull(shareConfig);
    }

    /**
     * 测试创建连接请求（需要审批）
     */
    @Test
    public void testCreateConnectionRequest() throws Exception {
        CreateConnectionRequestRequest request = new CreateConnectionRequestRequest();
        request.setShareCode(shareConfig.getShareCode());
        request.setRequestMessage("我想连接您的心域");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.requestStatus").value("pending"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.requestMessage").value("我想连接您的心域"));

        // 验证数据库
        HeartSphereConnectionRequest connectionRequest = connectionRequestRepository
                .findByShareConfigIdAndRequesterId(shareConfig.getId(), user2.getId())
                .orElse(null);
        assertNotNull(connectionRequest);
        assertEquals(HeartSphereConnectionRequest.RequestStatus.PENDING, connectionRequest.getRequestStatus());
        assertEquals("我想连接您的心域", connectionRequest.getRequestMessage());
        assertEquals(shareConfig.getId(), connectionRequest.getShareConfigId());
        assertEquals(user2.getId(), connectionRequest.getRequesterId());

        // 验证共享配置的请求计数增加
        HeartSphereShareConfig updatedConfig = shareConfigRepository.findById(shareConfig.getId()).orElse(null);
        assertNotNull(updatedConfig);
        assertEquals(1, updatedConfig.getRequestCount());
    }

    /**
     * 测试创建连接请求 - 自由连接模式（直接创建连接）
     */
    @Test
    public void testCreateConnectionRequestFreeAccess() throws Exception {
        // 创建自由连接的共享配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("free");
        createRequest.setDescription("自由连接配置");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token3)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createRequest)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        HeartSphereShareConfig freeConfig = shareConfigRepository.findByUserId(user3.getId()).orElse(null);
        assertNotNull(freeConfig);

        // user2请求连接（应该直接创建连接，不需要审批）
        CreateConnectionRequestRequest request = new CreateConnectionRequestRequest();
        request.setShareCode(freeConfig.getShareCode());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.requestStatus").value("approved"));

        // 验证数据库 - 应该直接创建连接记录
        HeartSphereConnection connection = connectionRepository
                .findByShareConfigIdAndVisitorIdAndConnectionStatus(
                        freeConfig.getId(), user2.getId(), HeartSphereConnection.ConnectionStatus.ACTIVE)
                .orElse(null);
        assertNotNull(connection);
        assertEquals(freeConfig.getId(), connection.getShareConfigId());
        assertEquals(user2.getId(), connection.getVisitorId());

        // 验证共享配置的批准计数增加
        HeartSphereShareConfig updatedConfig = shareConfigRepository.findById(freeConfig.getId()).orElse(null);
        assertNotNull(updatedConfig);
        assertEquals(1, updatedConfig.getApprovedCount());
    }

    /**
     * 测试重复创建连接请求（应该失败）
     */
    @Test
    public void testCreateConnectionRequestDuplicate() throws Exception {
        // 第一次创建请求
        CreateConnectionRequestRequest request = new CreateConnectionRequestRequest();
        request.setShareCode(shareConfig.getShareCode());
        request.setRequestMessage("第一次请求");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        // 第二次创建请求（应该失败）
        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(400));
    }

    /**
     * 测试批准连接请求
     */
    @Test
    public void testApproveConnectionRequest() throws Exception {
        // user2创建连接请求
        CreateConnectionRequestRequest createRequest = new CreateConnectionRequestRequest();
        createRequest.setShareCode(shareConfig.getShareCode());
        createRequest.setRequestMessage("请批准我的连接请求");

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        HeartSphereConnectionRequest connectionRequest = connectionRequestRepository
                .findByShareConfigIdAndRequesterId(shareConfig.getId(), user2.getId())
                .orElse(null);
        assertNotNull(connectionRequest);
        Long requestId = connectionRequest.getId();

        // user1批准请求
        ResponseConnectionRequestRequest responseRequest = new ResponseConnectionRequestRequest();
        responseRequest.setAction("approve");
        responseRequest.setResponseMessage("欢迎连接！");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests/" + requestId + "/response")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(responseRequest)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.requestStatus").value("approved"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.responseMessage").value("欢迎连接！"));

        // 验证数据库
        HeartSphereConnectionRequest updatedRequest = connectionRequestRepository.findById(requestId).orElse(null);
        assertNotNull(updatedRequest);
        assertEquals(HeartSphereConnectionRequest.RequestStatus.APPROVED, updatedRequest.getRequestStatus());
        assertEquals("欢迎连接！", updatedRequest.getResponseMessage());
        assertNotNull(updatedRequest.getRespondedAt());

        // 验证连接记录已创建
        HeartSphereConnection connection = connectionRepository
                .findByShareConfigIdAndVisitorIdAndConnectionStatus(
                        shareConfig.getId(), user2.getId(), HeartSphereConnection.ConnectionStatus.ACTIVE)
                .orElse(null);
        assertNotNull(connection);
        assertEquals(shareConfig.getId(), connection.getShareConfigId());
        assertEquals(user2.getId(), connection.getVisitorId());

        // 验证共享配置的批准计数增加
        HeartSphereShareConfig updatedConfig = shareConfigRepository.findById(shareConfig.getId()).orElse(null);
        assertNotNull(updatedConfig);
        assertEquals(1, updatedConfig.getApprovedCount());
    }

    /**
     * 测试拒绝连接请求
     */
    @Test
    public void testRejectConnectionRequest() throws Exception {
        // user3创建连接请求
        CreateConnectionRequestRequest createRequest = new CreateConnectionRequestRequest();
        createRequest.setShareCode(shareConfig.getShareCode());
        createRequest.setRequestMessage("请批准我的连接请求");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests")
                .header("Authorization", "Bearer " + token3)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createRequest)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        HeartSphereConnectionRequest connectionRequest = connectionRequestRepository
                .findByShareConfigIdAndRequesterId(shareConfig.getId(), user3.getId())
                .orElse(null);
        assertNotNull(connectionRequest);
        Long requestId = connectionRequest.getId();

        // user1拒绝请求
        ResponseConnectionRequestRequest responseRequest = new ResponseConnectionRequestRequest();
        responseRequest.setAction("reject");
        responseRequest.setResponseMessage("抱歉，暂时不接受新连接");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests/" + requestId + "/response")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(responseRequest)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.requestStatus").value("rejected"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.responseMessage").value("抱歉，暂时不接受新连接"));

        // 验证数据库
        HeartSphereConnectionRequest updatedRequest = connectionRequestRepository.findById(requestId).orElse(null);
        assertNotNull(updatedRequest);
        assertEquals(HeartSphereConnectionRequest.RequestStatus.REJECTED, updatedRequest.getRequestStatus());
        assertEquals("抱歉，暂时不接受新连接", updatedRequest.getResponseMessage());
        assertNotNull(updatedRequest.getRespondedAt());

        // 验证没有创建连接记录
        HeartSphereConnection connection = connectionRepository
                .findByShareConfigIdAndVisitorIdAndConnectionStatus(
                        shareConfig.getId(), user3.getId(), HeartSphereConnection.ConnectionStatus.ACTIVE)
                .orElse(null);
        assertNull(connection);
    }

    /**
     * 测试获取共享配置的连接请求列表
     */
    @Test
    public void testGetConnectionRequests() throws Exception {
        // user2和user3都创建连接请求
        CreateConnectionRequestRequest request1 = new CreateConnectionRequestRequest();
        request1.setShareCode(shareConfig.getShareCode());
        request1.setRequestMessage("user2的请求");

        CreateConnectionRequestRequest request2 = new CreateConnectionRequestRequest();
        request2.setShareCode(shareConfig.getShareCode());
        request2.setRequestMessage("user3的请求");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request1)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests")
                .header("Authorization", "Bearer " + token3)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request2)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        // user1获取连接请求列表
        mockMvc.perform(MockMvcRequestBuilders.get("/api/heartconnect/requests/share-config/" + shareConfig.getId())
                .header("Authorization", "Bearer " + token1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.length()").value(2));

        // 验证数据库
        List<HeartSphereConnectionRequest> requests = connectionRequestRepository
                .findByShareConfigId(shareConfig.getId());
        assertEquals(2, requests.size());
    }

    /**
     * 测试获取我的连接请求
     */
    @Test
    public void testGetMyConnectionRequests() throws Exception {
        // user2创建连接请求
        CreateConnectionRequestRequest request = new CreateConnectionRequestRequest();
        request.setShareCode(shareConfig.getShareCode());
        request.setRequestMessage("我的请求");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        // user2获取自己的连接请求列表
        mockMvc.perform(MockMvcRequestBuilders.get("/api/heartconnect/requests/my")
                .header("Authorization", "Bearer " + token2))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.length()").value(1))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data[0].requestMessage").value("我的请求"));

        // 验证数据库
        List<HeartSphereConnectionRequest> requests = connectionRequestRepository
                .findByRequesterId(user2.getId());
        assertEquals(1, requests.size());
    }

    /**
     * 测试取消连接请求
     */
    @Test
    public void testCancelConnectionRequest() throws Exception {
        // user2创建连接请求
        CreateConnectionRequestRequest createRequest = new CreateConnectionRequestRequest();
        createRequest.setShareCode(shareConfig.getShareCode());
        createRequest.setRequestMessage("我的请求");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createRequest)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        HeartSphereConnectionRequest connectionRequest = connectionRequestRepository
                .findByShareConfigIdAndRequesterId(shareConfig.getId(), user2.getId())
                .orElse(null);
        assertNotNull(connectionRequest);
        Long requestId = connectionRequest.getId();

        // user2取消请求
        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests/" + requestId + "/cancel")
                .header("Authorization", "Bearer " + token2))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200));

        // 验证数据库
        HeartSphereConnectionRequest updatedRequest = connectionRequestRepository.findById(requestId).orElse(null);
        assertNotNull(updatedRequest);
        assertEquals(HeartSphereConnectionRequest.RequestStatus.CANCELLED, updatedRequest.getRequestStatus());
    }

    /**
     * 测试权限验证 - 不能处理他人的连接请求
     */
    @Test
    public void testResponseConnectionRequestUnauthorized() throws Exception {
        // user2创建连接请求
        CreateConnectionRequestRequest createRequest = new CreateConnectionRequestRequest();
        createRequest.setShareCode(shareConfig.getShareCode());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createRequest)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        HeartSphereConnectionRequest connectionRequest = connectionRequestRepository
                .findByShareConfigIdAndRequesterId(shareConfig.getId(), user2.getId())
                .orElse(null);
        assertNotNull(connectionRequest);
        Long requestId = connectionRequest.getId();

        // user3尝试处理user2的请求（应该失败）
        ResponseConnectionRequestRequest responseRequest = new ResponseConnectionRequestRequest();
        responseRequest.setAction("approve");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests/" + requestId + "/response")
                .header("Authorization", "Bearer " + token3)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(responseRequest)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(400));
    }

    /**
     * 测试不能请求连接自己的心域
     */
    @Test
    public void testCreateConnectionRequestToOwnHeartSphere() throws Exception {
        CreateConnectionRequestRequest request = new CreateConnectionRequestRequest();
        request.setShareCode(shareConfig.getShareCode());

        // user1尝试连接自己的心域（应该失败）
        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/requests")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(400));
    }

    // 辅助方法：登录并获取用户
    private User loginAndGetUser(String username, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername(username);
        loginRequest.setPassword(password);

        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(loginRequest)))
                .andReturn().getResponse().getContentAsString();

        return userRepository.findByUsername(username).orElse(null);
    }

    // 辅助方法：登录并获取token
    private String loginAndGetToken(String username, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername(username);
        loginRequest.setPassword(password);

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(loginRequest)))
                .andReturn().getResponse().getContentAsString();

        // 从响应中提取token
        if (response.contains("\"token\"")) {
            int start = response.indexOf("\"token\"") + 9;
            int end = response.indexOf("\"", start);
            return response.substring(start, end);
        }
        return "";
    }
}
