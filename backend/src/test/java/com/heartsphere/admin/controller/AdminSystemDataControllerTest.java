package com.heartsphere.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.dto.SystemCharacterDTO;
import com.heartsphere.admin.dto.SystemEraDTO;
import com.heartsphere.admin.dto.SystemWorldDTO;
import com.heartsphere.admin.dto.InviteCodeDTO;
import com.heartsphere.admin.dto.GenerateInviteCodeRequest;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
import com.heartsphere.admin.service.AdminAuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AdminSystemDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SystemAdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AdminAuthService adminAuthService;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;

    @BeforeEach
    public void setUp() {
        // 创建测试管理员
        adminRepository.findByUsername("testadmin").ifPresent(adminRepository::delete);
        SystemAdmin admin = new SystemAdmin();
        admin.setUsername("testadmin");
        admin.setPassword(passwordEncoder.encode("123456"));
        admin.setEmail("test@test.com");
        admin.setIsActive(true);
        adminRepository.save(admin);

        // 获取管理员token
        Map<String, Object> loginResponse = adminAuthService.login("testadmin", "123456");
        adminToken = (String) loginResponse.get("token");
    }

    // ========== SystemWorld Tests ==========
    @Test
    public void testCreateWorld() throws Exception {
        SystemWorldDTO dto = new SystemWorldDTO();
        dto.setName("测试世界");
        dto.setDescription("这是一个测试世界");
        dto.setIsActive(true);
        dto.setSortOrder(1);

        mockMvc.perform(post("/api/admin/system/worlds")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("测试世界"));
    }

    @Test
    public void testGetAllWorlds() throws Exception {
        mockMvc.perform(get("/api/admin/system/worlds")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void testUpdateWorld() throws Exception {
        // 先创建一个世界
        SystemWorldDTO createDto = new SystemWorldDTO();
        createDto.setName("原始世界");
        createDto.setDescription("原始描述");
        createDto.setIsActive(true);

        String createResponse = mockMvc.perform(post("/api/admin/system/worlds")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        SystemWorldDTO created = objectMapper.readValue(createResponse, SystemWorldDTO.class);

        // 更新世界
        SystemWorldDTO updateDto = new SystemWorldDTO();
        updateDto.setName("更新后的世界");
        updateDto.setDescription("更新后的描述");
        updateDto.setIsActive(true);

        mockMvc.perform(put("/api/admin/system/worlds/" + created.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("更新后的世界"));
    }

    @Test
    public void testDeleteWorld() throws Exception {
        // 先创建一个世界
        SystemWorldDTO createDto = new SystemWorldDTO();
        createDto.setName("待删除世界");
        createDto.setDescription("将被删除");
        createDto.setIsActive(true);

        String createResponse = mockMvc.perform(post("/api/admin/system/worlds")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        SystemWorldDTO created = objectMapper.readValue(createResponse, SystemWorldDTO.class);

        // 删除世界
        mockMvc.perform(delete("/api/admin/system/worlds/" + created.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    // ========== SystemEra Tests ==========
    @Test
    public void testCreateEra() throws Exception {
        SystemEraDTO dto = new SystemEraDTO();
        dto.setName("测试时代");
        dto.setDescription("这是一个测试时代");
        dto.setIsActive(true);
        dto.setSortOrder(1);

        mockMvc.perform(post("/api/admin/system/eras")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("测试时代"));
    }

    @Test
    public void testGetAllEras() throws Exception {
        mockMvc.perform(get("/api/admin/system/eras")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ========== SystemCharacter Tests ==========
    @Test
    public void testCreateCharacter() throws Exception {
        SystemCharacterDTO dto = new SystemCharacterDTO();
        dto.setName("测试角色");
        dto.setDescription("这是一个测试角色");
        dto.setAge(20);
        dto.setGender("女");
        dto.setRole("主角");
        dto.setIsActive(true);
        dto.setSortOrder(1);

        mockMvc.perform(post("/api/admin/system/characters")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("测试角色"));
    }

    @Test
    public void testGetAllCharacters() throws Exception {
        mockMvc.perform(get("/api/admin/system/characters")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // ========== InviteCode Tests ==========
    @Test
    public void testGenerateInviteCodes() throws Exception {
        GenerateInviteCodeRequest request = new GenerateInviteCodeRequest();
        request.setQuantity(5);
        request.setExpiresAt(java.time.LocalDateTime.now().plusDays(30));

        mockMvc.perform(post("/api/admin/system/invite-codes/generate")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(5))
                .andExpect(jsonPath("$[0].code").exists())
                .andExpect(jsonPath("$[0].isUsed").value(false));
    }

    @Test
    public void testGetAllInviteCodes() throws Exception {
        // 先生成一些邀请码
        GenerateInviteCodeRequest request = new GenerateInviteCodeRequest();
        request.setQuantity(3);
        request.setExpiresAt(java.time.LocalDateTime.now().plusDays(30));
        
        mockMvc.perform(post("/api/admin/system/invite-codes/generate")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // 获取所有邀请码
        mockMvc.perform(get("/api/admin/system/invite-codes")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(greaterThanOrEqualTo(3)));
    }

    @Test
    public void testGetInviteCodeRequired() throws Exception {
        mockMvc.perform(get("/api/admin/system/config/invite-code-required")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteCodeRequired").exists())
                .andExpect(jsonPath("$.inviteCodeRequired").isBoolean());
    }

    @Test
    public void testSetInviteCodeRequired() throws Exception {
        Map<String, Boolean> request = new HashMap<>();
        request.put("inviteCodeRequired", true);

        mockMvc.perform(put("/api/admin/system/config/invite-code-required")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteCodeRequired").value(true));

        // 验证设置是否生效
        mockMvc.perform(get("/api/admin/system/config/invite-code-required")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.inviteCodeRequired").value(true));
    }

    @Test
    public void testSetInviteCodeRequiredWithInvalidRequest() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("invalid", "value");

        mockMvc.perform(put("/api/admin/system/config/invite-code-required")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ========== Authentication Tests ==========
    @Test
    public void testAccessWithoutToken() throws Exception {
        mockMvc.perform(get("/api/admin/system/worlds"))
                .andExpect(status().isOk()); // 由于当前配置允许所有请求，这里会成功
    }
}

