package com.heartsphere.heartconnect.controller;

import com.heartsphere.controller.BaseControllerTest;
import com.heartsphere.dto.LoginRequest;
import com.heartsphere.entity.User;
import com.heartsphere.heartconnect.dto.CreateShareConfigRequest;
import com.heartsphere.heartconnect.dto.UpdateShareConfigRequest;
import com.heartsphere.heartconnect.entity.HeartSphereShareConfig;
import com.heartsphere.heartconnect.entity.HeartSphereShareScope;
import com.heartsphere.heartconnect.repository.HeartSphereShareConfigRepository;
import com.heartsphere.heartconnect.repository.HeartSphereShareScopeRepository;
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
 * 共享配置控制器集成测试
 * 使用三个测试账号：tongyexin, ty1, heartsphere
 */
public class ShareConfigControllerTest extends BaseControllerTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HeartSphereShareConfigRepository shareConfigRepository;

    @Autowired
    private HeartSphereShareScopeRepository shareScopeRepository;

    private User user1; // tongyexin
    private User user2; // ty1
    private User user3; // heartsphere
    private String token1;
    private String token2;
    private String token3;

    @BeforeEach
    void setUp() throws Exception {
        // 清理测试数据
        shareScopeRepository.deleteAll();
        shareConfigRepository.deleteAll();

        // 登录并获取token
        user1 = loginAndGetUser("tongyexin", "123456");
        user2 = loginAndGetUser("ty1", "Tyx@1234");
        user3 = loginAndGetUser("heartsphere", "Tyx@1234");

        token1 = loginAndGetToken("tongyexin", "123456");
        token2 = loginAndGetToken("ty1", "Tyx@1234");
        token3 = loginAndGetToken("heartsphere", "Tyx@1234");
    }

    /**
     * 测试创建共享配置
     */
    @Test
    public void testCreateShareConfig() throws Exception {
        CreateShareConfigRequest request = new CreateShareConfigRequest();
        request.setShareType("all");
        request.setAccessPermission("approval");
        request.setDescription("测试共享配置");
        request.setCoverImageUrl("https://example.com/cover.jpg");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.shareCode").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.shareType").value("all"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.accessPermission").value("approval"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.description").value("测试共享配置"));

        // 验证数据库
        HeartSphereShareConfig config = shareConfigRepository.findByUserId(user1.getId()).orElse(null);
        assertNotNull(config);
        assertEquals("all", config.getShareType().name().toLowerCase());
        assertEquals("approval", config.getAccessPermission().name().toLowerCase());
        assertEquals("测试共享配置", config.getDescription());
        assertEquals(user1.getId(), config.getUserId());
        assertNotNull(config.getShareCode());
    }

    /**
     * 测试创建共享配置 - 按世界共享
     */
    @Test
    public void testCreateShareConfigWithWorldScope() throws Exception {
        // 先创建世界（需要先有世界数据，这里假设已有）
        CreateShareConfigRequest request = new CreateShareConfigRequest();
        request.setShareType("world");
        request.setAccessPermission("free");
        request.setDescription("按世界共享");

        CreateShareConfigRequest.ShareScopeItem scope1 = new CreateShareConfigRequest.ShareScopeItem();
        scope1.setScopeType("world");
        scope1.setScopeId(1L);
        request.setScopes(List.of(scope1));

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.shareType").value("world"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.scopes").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.scopes[0].scopeType").value("world"));

        // 验证数据库
        HeartSphereShareConfig config = shareConfigRepository.findByUserId(user2.getId()).orElse(null);
        assertNotNull(config);
        List<HeartSphereShareScope> scopes = shareScopeRepository.findByShareConfigId(config.getId());
        assertEquals(1, scopes.size());
        assertEquals(HeartSphereShareScope.ScopeType.WORLD, scopes.get(0).getScopeType());
        assertEquals(1L, scopes.get(0).getScopeId());
    }

    /**
     * 测试重复创建共享配置（应该失败）
     */
    @Test
    public void testCreateShareConfigDuplicate() throws Exception {
        // 第一次创建
        CreateShareConfigRequest request = new CreateShareConfigRequest();
        request.setShareType("all");
        request.setAccessPermission("approval");
        request.setDescription("第一个配置");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token3)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        // 第二次创建（应该失败）
        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token3)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(400));
    }

    /**
     * 测试获取我的共享配置
     */
    @Test
    public void testGetMyShareConfig() throws Exception {
        // 先创建配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("approval");
        createRequest.setDescription("我的共享配置");

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        // 获取配置
        mockMvc.perform(MockMvcRequestBuilders.get("/api/heartconnect/config/my")
                .header("Authorization", "Bearer " + token1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.shareType").value("all"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.description").value("我的共享配置"));

        // 验证数据库
        HeartSphereShareConfig config = shareConfigRepository.findByUserId(user1.getId()).orElse(null);
        assertNotNull(config);
        assertEquals("我的共享配置", config.getDescription());
    }

    /**
     * 测试根据共享码获取共享配置
     */
    @Test
    public void testGetShareConfigByCode() throws Exception {
        // 先创建配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("free");
        createRequest.setDescription("公开共享配置");

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        // 从响应中提取shareCode（需要解析JSON）
        HeartSphereShareConfig config = shareConfigRepository.findByUserId(user2.getId()).orElse(null);
        assertNotNull(config);
        String shareCode = config.getShareCode();

        // 根据共享码获取配置
        mockMvc.perform(MockMvcRequestBuilders.get("/api/heartconnect/config/by-code/" + shareCode))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.shareCode").value(shareCode))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.description").value("公开共享配置"));

        // 验证查看次数增加
        HeartSphereShareConfig updatedConfig = shareConfigRepository.findByShareCode(shareCode).orElse(null);
        assertNotNull(updatedConfig);
        assertTrue(updatedConfig.getViewCount() > 0);
    }

    /**
     * 测试更新共享配置
     */
    @Test
    public void testUpdateShareConfig() throws Exception {
        // 先创建配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("approval");
        createRequest.setDescription("原始描述");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token3)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createRequest)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        HeartSphereShareConfig config = shareConfigRepository.findByUserId(user3.getId()).orElse(null);
        assertNotNull(config);
        Long configId = config.getId();

        // 更新配置
        UpdateShareConfigRequest updateRequest = new UpdateShareConfigRequest();
        updateRequest.setDescription("更新后的描述");
        updateRequest.setShareStatus("paused");

        mockMvc.perform(MockMvcRequestBuilders.put("/api/heartconnect/config/" + configId)
                .header("Authorization", "Bearer " + token3)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateRequest)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.description").value("更新后的描述"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.shareStatus").value("paused"));

        // 验证数据库
        HeartSphereShareConfig updatedConfig = shareConfigRepository.findById(configId).orElse(null);
        assertNotNull(updatedConfig);
        assertEquals("更新后的描述", updatedConfig.getDescription());
        assertEquals(HeartSphereShareConfig.ShareStatus.PAUSED, updatedConfig.getShareStatus());
    }

    /**
     * 测试重新生成共享码
     */
    @Test
    public void testRegenerateShareCode() throws Exception {
        // 先创建配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("approval");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createRequest)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        HeartSphereShareConfig config = shareConfigRepository.findByUserId(user1.getId()).orElse(null);
        assertNotNull(config);
        String oldShareCode = config.getShareCode();
        Long configId = config.getId();

        // 重新生成共享码
        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config/" + configId + "/regenerate-code")
                .header("Authorization", "Bearer " + token1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.shareCode").exists());

        // 验证数据库
        HeartSphereShareConfig updatedConfig = shareConfigRepository.findById(configId).orElse(null);
        assertNotNull(updatedConfig);
        assertNotEquals(oldShareCode, updatedConfig.getShareCode());
    }

    /**
     * 测试删除共享配置
     */
    @Test
    public void testDeleteShareConfig() throws Exception {
        // 先创建配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("approval");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createRequest)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        HeartSphereShareConfig config = shareConfigRepository.findByUserId(user2.getId()).orElse(null);
        assertNotNull(config);
        Long configId = config.getId();

        // 删除配置
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/heartconnect/config/" + configId)
                .header("Authorization", "Bearer " + token2))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200));

        // 验证数据库
        assertFalse(shareConfigRepository.findById(configId).isPresent());
    }

    /**
     * 测试获取公开的共享心域列表
     */
    @Test
    public void testGetPublicSharedHeartSpheres() throws Exception {
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

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request1)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request2)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token3)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(request3)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        // 获取公开列表（以user1身份）
        mockMvc.perform(MockMvcRequestBuilders.get("/api/heartconnect/discover")
                .header("Authorization", "Bearer " + token1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.length()").value(2)); // 应该排除自己的

        // 验证数据库
        List<HeartSphereShareConfig> allConfigs = shareConfigRepository.findAll();
        assertEquals(3, allConfigs.size());
    }

    /**
     * 测试权限验证 - 不能修改他人的共享配置
     */
    @Test
    public void testUpdateShareConfigUnauthorized() throws Exception {
        // user1创建配置
        CreateShareConfigRequest createRequest = new CreateShareConfigRequest();
        createRequest.setShareType("all");
        createRequest.setAccessPermission("approval");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/heartconnect/config")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createRequest)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        HeartSphereShareConfig config = shareConfigRepository.findByUserId(user1.getId()).orElse(null);
        assertNotNull(config);
        Long configId = config.getId();

        // user2尝试修改user1的配置（应该失败）
        UpdateShareConfigRequest updateRequest = new UpdateShareConfigRequest();
        updateRequest.setDescription("恶意修改");

        mockMvc.perform(MockMvcRequestBuilders.put("/api/heartconnect/config/" + configId)
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateRequest)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(400));
    }

    // 辅助方法：登录并获取用户
    private User loginAndGetUser(String username, String password) throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername(username);
        loginRequest.setPassword(password);

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(loginRequest)))
                .andReturn().getResponse().getContentAsString();

        // 从响应中提取用户ID（简化处理，实际应该解析JSON）
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

        // 从响应中提取token（简化处理，实际应该解析JSON）
        // 这里假设响应格式为 {"token": "..."}
        if (response.contains("\"token\"")) {
            int start = response.indexOf("\"token\"") + 9;
            int end = response.indexOf("\"", start);
            return response.substring(start, end);
        }
        return "";
    }
}
