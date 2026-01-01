package com.heartsphere.heartconnect.service;

import com.heartsphere.entity.User;
import com.heartsphere.exception.BusinessException;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.heartconnect.dto.CreateShareConfigRequest;
import com.heartsphere.heartconnect.dto.ShareConfigDTO;
import com.heartsphere.heartconnect.dto.UpdateShareConfigRequest;
import com.heartsphere.heartconnect.entity.HeartSphereShareConfig;
import com.heartsphere.heartconnect.entity.HeartSphereShareScope;
import com.heartsphere.heartconnect.repository.HeartSphereShareConfigRepository;
import com.heartsphere.heartconnect.repository.HeartSphereShareScopeRepository;
import com.heartsphere.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 共享配置服务单元测试
 * 使用三个测试账号：tongyexin, ty1, heartsphere
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ShareConfigServiceTest {

    @Autowired
    private ShareConfigService shareConfigService;

    @Autowired
    private HeartSphereShareConfigRepository shareConfigRepository;

    @Autowired
    private HeartSphereShareScopeRepository shareScopeRepository;

    @Autowired
    private UserRepository userRepository;

    private User user1; // tongyexin
    private User user2; // ty1
    private User user3; // heartsphere

    @BeforeEach
    void setUp() {
        // 清理测试数据
        shareScopeRepository.deleteAll();
        shareConfigRepository.deleteAll();

        // 获取测试用户
        user1 = userRepository.findByUsername("tongyexin").orElse(null);
        user2 = userRepository.findByUsername("ty1").orElse(null);
        user3 = userRepository.findByUsername("heartsphere").orElse(null);

        assertNotNull(user1, "用户tongyexin不存在");
        assertNotNull(user2, "用户ty1不存在");
        assertNotNull(user3, "用户heartsphere不存在");
    }

    /**
     * 测试创建共享配置
     */
    @Test
    public void testCreateShareConfig() {
        CreateShareConfigRequest request = new CreateShareConfigRequest();
        request.setShareType("all");
        request.setAccessPermission("approval");
        request.setDescription("测试共享配置");
        request.setCoverImageUrl("https://example.com/cover.jpg");

        ShareConfigDTO dto = shareConfigService.createShareConfig(user1.getId(), request);

        assertNotNull(dto);
        assertNotNull(dto.getId());
        assertNotNull(dto.getShareCode());
        assertEquals("all", dto.getShareType());
        assertEquals("approval", dto.getAccessPermission());
        assertEquals("测试共享配置", dto.getDescription());
        assertEquals(user1.getId(), dto.getUserId());

        // 验证数据库
        HeartSphereShareConfig config = shareConfigRepository.findById(dto.getId()).orElse(null);
        assertNotNull(config);
        assertEquals(HeartSphereShareConfig.ShareType.ALL, config.getShareType());
        assertEquals(HeartSphereShareConfig.AccessPermission.APPROVAL, config.getAccessPermission());
        assertEquals("测试共享配置", config.getDescription());
        assertEquals(user1.getId(), config.getUserId());
        assertNotNull(config.getShareCode());
        assertEquals(0, config.getViewCount());
        assertEquals(0, config.getRequestCount());
        assertEquals(0, config.getApprovedCount());
    }

    /**
     * 测试创建共享配置 - 按世界共享
     */
    @Test
    public void testCreateShareConfigWithWorldScope() {
        CreateShareConfigRequest request = new CreateShareConfigRequest();
        request.setShareType("world");
        request.setAccessPermission("free");
        request.setDescription("按世界共享");

        CreateShareConfigRequest.ShareScopeItem scope1 = new CreateShareConfigRequest.ShareScopeItem();
        scope1.setScopeType("world");
        scope1.setScopeId(1L);
        CreateShareConfigRequest.ShareScopeItem scope2 = new CreateShareConfigRequest.ShareScopeItem();
        scope2.setScopeType("world");
        scope2.setScopeId(2L);
        request.setScopes(List.of(scope1, scope2));

        ShareConfigDTO dto = shareConfigService.createShareConfig(user2.getId(), request);

        assertNotNull(dto);
        assertEquals("world", dto.getShareType());
        assertNotNull(dto.getScopes());
        assertEquals(2, dto.getScopes().size());

        // 验证数据库
        HeartSphereShareConfig config = shareConfigRepository.findById(dto.getId()).orElse(null);
        assertNotNull(config);
        List<HeartSphereShareScope> scopes = shareScopeRepository.findByShareConfigId(config.getId());
        assertEquals(2, scopes.size());
        assertEquals(HeartSphereShareScope.ScopeType.WORLD, scopes.get(0).getScopeType());
        assertTrue(scopes.stream().anyMatch(s -> s.getScopeId().equals(1L)));
        assertTrue(scopes.stream().anyMatch(s -> s.getScopeId().equals(2L)));
    }

    /**
     * 测试重复创建共享配置（应该失败）
     */
    @Test
    public void testCreateShareConfigDuplicate() {
        CreateShareConfigRequest request = new CreateShareConfigRequest();
        request.setShareType("all");
        request.setAccessPermission("approval");

        // 第一次创建
        shareConfigService.createShareConfig(user3.getId(), request);

        // 第二次创建（应该失败）
        assertThrows(BusinessException.class, () -> {
            shareConfigService.createShareConfig(user3.getId(), request);
        });

        // 验证数据库只有一个配置
        Optional<HeartSphereShareConfig> configOpt = shareConfigRepository.findByUserId(user3.getId());
        assertTrue(configOpt.isPresent());
    }

    /**
     * 测试获取用户的共享配置
     */
    @Test
    public void testGetShareConfigByUserId() {
        // 先创建配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("approval");
        createRequest.setDescription("我的共享配置");

        ShareConfigDTO createdDto = shareConfigService.createShareConfig(user1.getId(), createRequest);

        // 获取配置
        ShareConfigDTO dto = shareConfigService.getShareConfigByUserId(user1.getId());

        assertNotNull(dto);
        assertEquals(createdDto.getId(), dto.getId());
        assertEquals("我的共享配置", dto.getDescription());
        assertEquals(user1.getId(), dto.getUserId());

        // 验证数据库
        HeartSphereShareConfig config = shareConfigRepository.findByUserId(user1.getId()).orElse(null);
        assertNotNull(config);
        assertEquals("我的共享配置", config.getDescription());
    }

    /**
     * 测试根据共享码获取共享配置
     */
    @Test
    public void testGetShareConfigByShareCode() {
        // 先创建配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("free");
        createRequest.setDescription("公开共享配置");

        ShareConfigDTO createdDto = shareConfigService.createShareConfig(user2.getId(), createRequest);
        String shareCode = createdDto.getShareCode();

        // 根据共享码获取配置
        ShareConfigDTO dto = shareConfigService.getShareConfigByShareCode(shareCode);

        assertNotNull(dto);
        assertEquals(shareCode, dto.getShareCode());
        assertEquals("公开共享配置", dto.getDescription());

        // 验证查看次数增加
        HeartSphereShareConfig config = shareConfigRepository.findByShareCode(shareCode).orElse(null);
        assertNotNull(config);
        assertTrue(config.getViewCount() > 0);
    }

    /**
     * 测试更新共享配置
     */
    @Test
    public void testUpdateShareConfig() {
        // 先创建配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("approval");
        createRequest.setDescription("原始描述");

        ShareConfigDTO createdDto = shareConfigService.createShareConfig(user3.getId(), createRequest);
        Long configId = createdDto.getId();

        // 更新配置
        UpdateShareConfigRequest updateRequest = new UpdateShareConfigRequest();
        updateRequest.setDescription("更新后的描述");
        updateRequest.setShareStatus("paused");
        updateRequest.setAccessPermission("free");

        ShareConfigDTO updatedDto = shareConfigService.updateShareConfig(user3.getId(), configId, updateRequest);

        assertNotNull(updatedDto);
        assertEquals("更新后的描述", updatedDto.getDescription());
        assertEquals("paused", updatedDto.getShareStatus());
        assertEquals("free", updatedDto.getAccessPermission());

        // 验证数据库
        HeartSphereShareConfig config = shareConfigRepository.findById(configId).orElse(null);
        assertNotNull(config);
        assertEquals("更新后的描述", config.getDescription());
        assertEquals(HeartSphereShareConfig.ShareStatus.PAUSED, config.getShareStatus());
        assertEquals(HeartSphereShareConfig.AccessPermission.FREE, config.getAccessPermission());
    }

    /**
     * 测试更新共享范围
     */
    @Test
    public void testUpdateShareConfigScopes() {
        // 先创建配置（带范围）
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("world");
        createRequest.setAccessPermission("approval");

        CreateShareConfigRequest.ShareScopeItem scope1 = new CreateShareConfigRequest.ShareScopeItem();
        scope1.setScopeType("world");
        scope1.setScopeId(1L);
        createRequest.setScopes(List.of(scope1));

        ShareConfigDTO createdDto = shareConfigService.createShareConfig(user1.getId(), createRequest);
        Long configId = createdDto.getId();

        // 更新范围
        UpdateShareConfigRequest updateRequest = new UpdateShareConfigRequest();
        UpdateShareConfigRequest.ShareScopeItem newScope1 = new UpdateShareConfigRequest.ShareScopeItem();
        newScope1.setScopeType("world");
        newScope1.setScopeId(2L);
        UpdateShareConfigRequest.ShareScopeItem newScope2 = new UpdateShareConfigRequest.ShareScopeItem();
        newScope2.setScopeType("world");
        newScope2.setScopeId(3L);
        updateRequest.setScopes(List.of(newScope1, newScope2));

        ShareConfigDTO updatedDto = shareConfigService.updateShareConfig(user1.getId(), configId, updateRequest);

        assertNotNull(updatedDto);
        assertNotNull(updatedDto.getScopes());
        assertEquals(2, updatedDto.getScopes().size());

        // 验证数据库 - 旧范围应该被删除，新范围应该被创建
        List<HeartSphereShareScope> scopes = shareScopeRepository.findByShareConfigId(configId);
        assertEquals(2, scopes.size());
        assertTrue(scopes.stream().anyMatch(s -> s.getScopeId().equals(2L)));
        assertTrue(scopes.stream().anyMatch(s -> s.getScopeId().equals(3L)));
        assertFalse(scopes.stream().anyMatch(s -> s.getScopeId().equals(1L)));
    }

    /**
     * 测试重新生成共享码
     */
    @Test
    public void testRegenerateShareCode() {
        // 先创建配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("approval");

        ShareConfigDTO createdDto = shareConfigService.createShareConfig(user2.getId(), createRequest);
        String oldShareCode = createdDto.getShareCode();
        Long configId = createdDto.getId();

        // 重新生成共享码
        ShareConfigDTO updatedDto = shareConfigService.regenerateShareCode(user2.getId(), configId);

        assertNotNull(updatedDto);
        assertNotEquals(oldShareCode, updatedDto.getShareCode());

        // 验证数据库
        HeartSphereShareConfig config = shareConfigRepository.findById(configId).orElse(null);
        assertNotNull(config);
        assertNotEquals(oldShareCode, config.getShareCode());
    }

    /**
     * 测试删除共享配置
     */
    @Test
    public void testDeleteShareConfig() {
        // 先创建配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("approval");

        ShareConfigDTO createdDto = shareConfigService.createShareConfig(user3.getId(), createRequest);
        Long configId = createdDto.getId();

        // 删除配置
        shareConfigService.deleteShareConfig(user3.getId(), configId);

        // 验证数据库
        assertFalse(shareConfigRepository.findById(configId).isPresent());
    }

    /**
     * 测试权限验证 - 不能修改他人的共享配置
     */
    @Test
    public void testUpdateShareConfigUnauthorized() {
        // user1创建配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("approval");

        ShareConfigDTO createdDto = shareConfigService.createShareConfig(user1.getId(), createRequest);
        Long configId = createdDto.getId();

        // user2尝试修改user1的配置（应该失败）
        UpdateShareConfigRequest updateRequest = new UpdateShareConfigRequest();
        updateRequest.setDescription("恶意修改");

        assertThrows(BusinessException.class, () -> {
            shareConfigService.updateShareConfig(user2.getId(), configId, updateRequest);
        });
    }

    /**
     * 测试获取公开的共享心域列表
     */
    @Test
    public void testGetPublicSharedHeartSpheres() {
        // 为三个用户创建共享配置
        CreateShareConfigRequest request1 = new CreateShareConfigRequest();
        request1.setShareType("all");
        request1.setAccessPermission("free");
        request1.setDescription("用户1的共享");

        CreateShareConfigRequest request2 = new CreateShareConfigRequest();
        request2.setShareType("all");
        request2.setAccessPermission("approval");
        request2.setDescription("用户2的共享");

        CreateShareConfigRequest request3 = new CreateShareConfigRequest();
        request3.setShareType("all");
        request3.setAccessPermission("free");
        request3.setDescription("用户3的共享");

        shareConfigService.createShareConfig(user1.getId(), request1);
        shareConfigService.createShareConfig(user2.getId(), request2);
        shareConfigService.createShareConfig(user3.getId(), request3);

        // 获取公开列表（以user1身份）
        List<com.heartsphere.heartconnect.dto.SharedHeartSphereDTO> result = 
                shareConfigService.getPublicSharedHeartSpheres(user1.getId());

        assertNotNull(result);
        assertEquals(2, result.size()); // 应该排除自己的

        // 验证数据库
        List<HeartSphereShareConfig> allConfigs = shareConfigRepository.findAll();
        assertEquals(3, allConfigs.size());
    }

    /**
     * 测试获取不存在的共享配置
     */
    @Test
    public void testGetShareConfigByUserIdNotFound() {
        assertThrows(ResourceNotFoundException.class, () -> {
            shareConfigService.getShareConfigByUserId(user1.getId());
        });
    }

    /**
     * 测试获取不存在的共享码
     */
    @Test
    public void testGetShareConfigByShareCodeNotFound() {
        assertThrows(ResourceNotFoundException.class, () -> {
            shareConfigService.getShareConfigByShareCode("INVALID-CODE");
        });
    }

    /**
     * 测试获取已暂停的共享配置（应该失败）
     */
    @Test
    public void testGetShareConfigByShareCodePaused() {
        // 创建并暂停配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("free");

        ShareConfigDTO createdDto = shareConfigService.createShareConfig(user1.getId(), createRequest);
        String shareCode = createdDto.getShareCode();

        UpdateShareConfigRequest updateRequest = new UpdateShareConfigRequest();
        updateRequest.setShareStatus("paused");
        shareConfigService.updateShareConfig(user1.getId(), createdDto.getId(), updateRequest);

        // 尝试获取已暂停的配置（应该失败）
        assertThrows(BusinessException.class, () -> {
            shareConfigService.getShareConfigByShareCode(shareCode);
        });
    }

    /**
     * 测试获取已过期的共享配置（应该失败）
     */
    @Test
    public void testGetShareConfigByShareCodeExpired() {
        // 创建已过期的配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("free");
        createRequest.setExpiresAt(System.currentTimeMillis() - 86400000); // 昨天过期

        ShareConfigDTO createdDto = shareConfigService.createShareConfig(user2.getId(), createRequest);
        String shareCode = createdDto.getShareCode();

        // 尝试获取已过期的配置（应该失败）
        assertThrows(BusinessException.class, () -> {
            shareConfigService.getShareConfigByShareCode(shareCode);
        });
    }
}
