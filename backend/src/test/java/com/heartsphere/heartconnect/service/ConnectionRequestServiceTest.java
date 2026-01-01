package com.heartsphere.heartconnect.service;

import com.heartsphere.entity.User;
import com.heartsphere.exception.BusinessException;
import com.heartsphere.heartconnect.dto.ConnectionRequestDTO;
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
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 连接请求服务单元测试
 * 使用三个测试账号：tongyexin, ty1, heartsphere
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ConnectionRequestServiceTest {

    @Autowired
    private ConnectionRequestService connectionRequestService;

    @Autowired
    private ShareConfigService shareConfigService;

    @Autowired
    private HeartSphereShareConfigRepository shareConfigRepository;

    @Autowired
    private HeartSphereConnectionRequestRepository connectionRequestRepository;

    @Autowired
    private HeartSphereConnectionRepository connectionRepository;

    @Autowired
    private UserRepository userRepository;

    private User user1; // tongyexin - 共享配置主人
    private User user2; // ty1 - 请求者
    private User user3; // heartsphere - 另一个请求者
    private HeartSphereShareConfig shareConfig;

    @BeforeEach
    void setUp() {
        // 清理测试数据
        connectionRepository.deleteAll();
        connectionRequestRepository.deleteAll();
        shareConfigRepository.deleteAll();

        // 获取测试用户
        user1 = userRepository.findByUsername("tongyexin").orElse(null);
        user2 = userRepository.findByUsername("ty1").orElse(null);
        user3 = userRepository.findByUsername("heartsphere").orElse(null);

        assertNotNull(user1, "用户tongyexin不存在");
        assertNotNull(user2, "用户ty1不存在");
        assertNotNull(user3, "用户heartsphere不存在");

        // user1创建共享配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("approval");
        createRequest.setDescription("测试共享配置");

        shareConfigService.createShareConfig(user1.getId(), createRequest);
        shareConfig = shareConfigRepository.findByUserId(user1.getId()).orElse(null);
        assertNotNull(shareConfig);
    }

    /**
     * 测试创建连接请求（需要审批）
     */
    @Test
    public void testCreateConnectionRequest() {
        CreateConnectionRequestRequest request = new CreateConnectionRequestRequest();
        request.setShareCode(shareConfig.getShareCode());
        request.setRequestMessage("我想连接您的心域");

        ConnectionRequestDTO dto = connectionRequestService.createConnectionRequest(user2.getId(), request);

        assertNotNull(dto);
        assertEquals(shareConfig.getId(), dto.getShareConfigId());
        assertEquals(user2.getId(), dto.getRequesterId());
        assertEquals("pending", dto.getRequestStatus());
        assertEquals("我想连接您的心域", dto.getRequestMessage());

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
    public void testCreateConnectionRequestFreeAccess() {
        // 创建自由连接的共享配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("free");
        createRequest.setDescription("自由连接配置");

        shareConfigService.createShareConfig(user3.getId(), createRequest);
        HeartSphereShareConfig freeConfig = shareConfigRepository.findByUserId(user3.getId()).orElse(null);
        assertNotNull(freeConfig);

        // user2请求连接（应该直接创建连接，不需要审批）
        CreateConnectionRequestRequest request = new CreateConnectionRequestRequest();
        request.setShareCode(freeConfig.getShareCode());

        ConnectionRequestDTO dto = connectionRequestService.createConnectionRequest(user2.getId(), request);

        assertNotNull(dto);
        assertEquals("approved", dto.getRequestStatus());

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
    public void testCreateConnectionRequestDuplicate() {
        // 第一次创建请求
        CreateConnectionRequestRequest request = new CreateConnectionRequestRequest();
        request.setShareCode(shareConfig.getShareCode());
        request.setRequestMessage("第一次请求");

        connectionRequestService.createConnectionRequest(user2.getId(), request);

        // 第二次创建请求（应该失败）
        assertThrows(BusinessException.class, () -> {
            connectionRequestService.createConnectionRequest(user2.getId(), request);
        });
    }

    /**
     * 测试批准连接请求
     */
    @Test
    public void testApproveConnectionRequest() {
        // user2创建连接请求
        CreateConnectionRequestRequest createRequest = new CreateConnectionRequestRequest();
        createRequest.setShareCode(shareConfig.getShareCode());
        createRequest.setRequestMessage("请批准我的连接请求");

        connectionRequestService.createConnectionRequest(user2.getId(), createRequest);

        HeartSphereConnectionRequest connectionRequest = connectionRequestRepository
                .findByShareConfigIdAndRequesterId(shareConfig.getId(), user2.getId())
                .orElse(null);
        assertNotNull(connectionRequest);
        Long requestId = connectionRequest.getId();

        // user1批准请求
        ResponseConnectionRequestRequest responseRequest = new ResponseConnectionRequestRequest();
        responseRequest.setAction("approve");
        responseRequest.setResponseMessage("欢迎连接！");

        ConnectionRequestDTO dto = connectionRequestService.responseConnectionRequest(
                user1.getId(), requestId, responseRequest);

        assertNotNull(dto);
        assertEquals("approved", dto.getRequestStatus());
        assertEquals("欢迎连接！", dto.getResponseMessage());

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
    public void testRejectConnectionRequest() {
        // user3创建连接请求
        CreateConnectionRequestRequest createRequest = new CreateConnectionRequestRequest();
        createRequest.setShareCode(shareConfig.getShareCode());
        createRequest.setRequestMessage("请批准我的连接请求");

        connectionRequestService.createConnectionRequest(user3.getId(), createRequest);

        HeartSphereConnectionRequest connectionRequest = connectionRequestRepository
                .findByShareConfigIdAndRequesterId(shareConfig.getId(), user3.getId())
                .orElse(null);
        assertNotNull(connectionRequest);
        Long requestId = connectionRequest.getId();

        // user1拒绝请求
        ResponseConnectionRequestRequest responseRequest = new ResponseConnectionRequestRequest();
        responseRequest.setAction("reject");
        responseRequest.setResponseMessage("抱歉，暂时不接受新连接");

        ConnectionRequestDTO dto = connectionRequestService.responseConnectionRequest(
                user1.getId(), requestId, responseRequest);

        assertNotNull(dto);
        assertEquals("rejected", dto.getRequestStatus());
        assertEquals("抱歉，暂时不接受新连接", dto.getResponseMessage());

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
    public void testGetConnectionRequests() {
        // user2和user3都创建连接请求
        CreateConnectionRequestRequest request1 = new CreateConnectionRequestRequest();
        request1.setShareCode(shareConfig.getShareCode());
        request1.setRequestMessage("user2的请求");

        CreateConnectionRequestRequest request2 = new CreateConnectionRequestRequest();
        request2.setShareCode(shareConfig.getShareCode());
        request2.setRequestMessage("user3的请求");

        connectionRequestService.createConnectionRequest(user2.getId(), request1);
        connectionRequestService.createConnectionRequest(user3.getId(), request2);

        // user1获取连接请求列表
        List<ConnectionRequestDTO> requests = connectionRequestService.getConnectionRequests(
                user1.getId(), shareConfig.getId(), null);

        assertNotNull(requests);
        assertEquals(2, requests.size());

        // 验证数据库
        List<HeartSphereConnectionRequest> dbRequests = connectionRequestRepository
                .findByShareConfigId(shareConfig.getId());
        assertEquals(2, dbRequests.size());
    }

    /**
     * 测试按状态获取连接请求列表
     */
    @Test
    public void testGetConnectionRequestsByStatus() {
        // user2和user3都创建连接请求
        CreateConnectionRequestRequest request1 = new CreateConnectionRequestRequest();
        request1.setShareCode(shareConfig.getShareCode());
        connectionRequestService.createConnectionRequest(user2.getId(), request1);

        CreateConnectionRequestRequest request2 = new CreateConnectionRequestRequest();
        request2.setShareCode(shareConfig.getShareCode());
        connectionRequestService.createConnectionRequest(user3.getId(), request2);

        // 批准user2的请求
        HeartSphereConnectionRequest connectionRequest = connectionRequestRepository
                .findByShareConfigIdAndRequesterId(shareConfig.getId(), user2.getId())
                .orElse(null);
        assertNotNull(connectionRequest);

        ResponseConnectionRequestRequest responseRequest = new ResponseConnectionRequestRequest();
        responseRequest.setAction("approve");
        connectionRequestService.responseConnectionRequest(user1.getId(), connectionRequest.getId(), responseRequest);

        // 获取待审批的请求
        List<ConnectionRequestDTO> pendingRequests = connectionRequestService.getConnectionRequests(
                user1.getId(), shareConfig.getId(), "pending");

        assertNotNull(pendingRequests);
        assertEquals(1, pendingRequests.size());
        assertEquals("pending", pendingRequests.get(0).getRequestStatus());

        // 获取已批准的请求
        List<ConnectionRequestDTO> approvedRequests = connectionRequestService.getConnectionRequests(
                user1.getId(), shareConfig.getId(), "approved");

        assertNotNull(approvedRequests);
        assertEquals(1, approvedRequests.size());
        assertEquals("approved", approvedRequests.get(0).getRequestStatus());
    }

    /**
     * 测试获取我的连接请求
     */
    @Test
    public void testGetMyConnectionRequests() {
        // user2创建连接请求
        CreateConnectionRequestRequest request = new CreateConnectionRequestRequest();
        request.setShareCode(shareConfig.getShareCode());
        request.setRequestMessage("我的请求");

        connectionRequestService.createConnectionRequest(user2.getId(), request);

        // user2获取自己的连接请求列表
        List<ConnectionRequestDTO> requests = connectionRequestService.getMyConnectionRequests(user2.getId());

        assertNotNull(requests);
        assertEquals(1, requests.size());
        assertEquals("我的请求", requests.get(0).getRequestMessage());

        // 验证数据库
        List<HeartSphereConnectionRequest> dbRequests = connectionRequestRepository
                .findByRequesterId(user2.getId());
        assertEquals(1, dbRequests.size());
    }

    /**
     * 测试取消连接请求
     */
    @Test
    public void testCancelConnectionRequest() {
        // user2创建连接请求
        CreateConnectionRequestRequest createRequest = new CreateConnectionRequestRequest();
        createRequest.setShareCode(shareConfig.getShareCode());
        createRequest.setRequestMessage("我的请求");

        connectionRequestService.createConnectionRequest(user2.getId(), createRequest);

        HeartSphereConnectionRequest connectionRequest = connectionRequestRepository
                .findByShareConfigIdAndRequesterId(shareConfig.getId(), user2.getId())
                .orElse(null);
        assertNotNull(connectionRequest);
        Long requestId = connectionRequest.getId();

        // user2取消请求
        connectionRequestService.cancelConnectionRequest(user2.getId(), requestId);

        // 验证数据库
        HeartSphereConnectionRequest updatedRequest = connectionRequestRepository.findById(requestId).orElse(null);
        assertNotNull(updatedRequest);
        assertEquals(HeartSphereConnectionRequest.RequestStatus.CANCELLED, updatedRequest.getRequestStatus());
    }

    /**
     * 测试权限验证 - 不能处理他人的连接请求
     */
    @Test
    public void testResponseConnectionRequestUnauthorized() {
        // user2创建连接请求
        CreateConnectionRequestRequest createRequest = new CreateConnectionRequestRequest();
        createRequest.setShareCode(shareConfig.getShareCode());

        connectionRequestService.createConnectionRequest(user2.getId(), createRequest);

        HeartSphereConnectionRequest connectionRequest = connectionRequestRepository
                .findByShareConfigIdAndRequesterId(shareConfig.getId(), user2.getId())
                .orElse(null);
        assertNotNull(connectionRequest);
        Long requestId = connectionRequest.getId();

        // user3尝试处理user2的请求（应该失败）
        ResponseConnectionRequestRequest responseRequest = new ResponseConnectionRequestRequest();
        responseRequest.setAction("approve");

        assertThrows(BusinessException.class, () -> {
            connectionRequestService.responseConnectionRequest(user3.getId(), requestId, responseRequest);
        });
    }

    /**
     * 测试不能请求连接自己的心域
     */
    @Test
    public void testCreateConnectionRequestToOwnHeartSphere() {
        CreateConnectionRequestRequest request = new CreateConnectionRequestRequest();
        request.setShareCode(shareConfig.getShareCode());

        // user1尝试连接自己的心域（应该失败）
        assertThrows(BusinessException.class, () -> {
            connectionRequestService.createConnectionRequest(user1.getId(), request);
        });
    }

    /**
     * 测试不能取消已处理的请求
     */
    @Test
    public void testCancelProcessedConnectionRequest() {
        // user2创建连接请求
        CreateConnectionRequestRequest createRequest = new CreateConnectionRequestRequest();
        createRequest.setShareCode(shareConfig.getShareCode());
        connectionRequestService.createConnectionRequest(user2.getId(), createRequest);

        HeartSphereConnectionRequest connectionRequest = connectionRequestRepository
                .findByShareConfigIdAndRequesterId(shareConfig.getId(), user2.getId())
                .orElse(null);
        assertNotNull(connectionRequest);
        Long requestId = connectionRequest.getId();

        // user1批准请求
        ResponseConnectionRequestRequest responseRequest = new ResponseConnectionRequestRequest();
        responseRequest.setAction("approve");
        connectionRequestService.responseConnectionRequest(user1.getId(), requestId, responseRequest);

        // user2尝试取消已批准的请求（应该失败）
        assertThrows(BusinessException.class, () -> {
            connectionRequestService.cancelConnectionRequest(user2.getId(), requestId);
        });
    }

    /**
     * 测试不能重复处理已处理的请求
     */
    @Test
    public void testResponseProcessedConnectionRequest() {
        // user2创建连接请求
        CreateConnectionRequestRequest createRequest = new CreateConnectionRequestRequest();
        createRequest.setShareCode(shareConfig.getShareCode());
        connectionRequestService.createConnectionRequest(user2.getId(), createRequest);

        HeartSphereConnectionRequest connectionRequest = connectionRequestRepository
                .findByShareConfigIdAndRequesterId(shareConfig.getId(), user2.getId())
                .orElse(null);
        assertNotNull(connectionRequest);
        Long requestId = connectionRequest.getId();

        // user1批准请求
        ResponseConnectionRequestRequest responseRequest = new ResponseConnectionRequestRequest();
        responseRequest.setAction("approve");
        connectionRequestService.responseConnectionRequest(user1.getId(), requestId, responseRequest);

        // user1再次尝试处理（应该失败）
        assertThrows(BusinessException.class, () -> {
            connectionRequestService.responseConnectionRequest(user1.getId(), requestId, responseRequest);
        });
    }
}
