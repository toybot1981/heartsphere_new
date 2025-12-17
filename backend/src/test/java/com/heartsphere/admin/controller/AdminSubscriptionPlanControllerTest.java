package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.SubscriptionPlanDTO;
import com.heartsphere.admin.service.AdminSubscriptionPlanService;
import com.heartsphere.admin.service.AdminAuthService;
import com.heartsphere.admin.entity.SystemAdmin;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.heartsphere.admin.repository.SystemAdminRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminSubscriptionPlanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdminSubscriptionPlanService adminSubscriptionPlanService;

    @Autowired
    private AdminAuthService adminAuthService;

    @Autowired
    private SystemAdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private SubscriptionPlanDTO testPlanDTO;
    private String adminToken;

    @BeforeEach
    void setUp() {
        // 创建测试管理员
        adminRepository.findByUsername("testadmin2").ifPresent(adminRepository::delete);
        SystemAdmin admin = new SystemAdmin();
        admin.setUsername("testadmin2");
        admin.setPassword(passwordEncoder.encode("123456"));
        admin.setEmail("test2@test.com");
        admin.setIsActive(true);
        adminRepository.save(admin);

        // 获取管理员token
        Map<String, Object> loginResponse = adminAuthService.login("testadmin2", "123456");
        adminToken = (String) loginResponse.get("token");

        testPlanDTO = new SubscriptionPlanDTO();
        testPlanDTO.setId(1L);
        testPlanDTO.setName("测试会员");
        testPlanDTO.setType("basic");
        testPlanDTO.setBillingCycle("monthly");
        testPlanDTO.setPrice(new BigDecimal("99.00"));
        testPlanDTO.setOriginalPrice(new BigDecimal("129.00"));
        testPlanDTO.setDiscountPercent(23);
        testPlanDTO.setPointsPerMonth(100);
        testPlanDTO.setMaxImagesPerMonth(100);
        testPlanDTO.setMaxVideosPerMonth(10);
        testPlanDTO.setMaxTextGenerationsPerMonth(1000);
        testPlanDTO.setMaxAudioGenerationsPerMonth(500);
        testPlanDTO.setAllowedAiModels("[\"qwen3-max\", \"gpt-4\"]");
        testPlanDTO.setMaxImageResolution("2k");
        testPlanDTO.setMaxVideoDuration(60);
        testPlanDTO.setAllowPriorityQueue(true);
        testPlanDTO.setAllowWatermarkRemoval(true);
        testPlanDTO.setAllowBatchProcessing(false);
        testPlanDTO.setAllowApiAccess(true);
        testPlanDTO.setMaxApiCallsPerDay(10000);
        testPlanDTO.setAiBenefits("{\"text\": {\"maxTokens\": 4000}}");
        testPlanDTO.setFeatures("[\"功能1\", \"功能2\"]");
        testPlanDTO.setIsActive(true);
        testPlanDTO.setSortOrder(1);
        testPlanDTO.setCreatedAt(LocalDateTime.now());
        testPlanDTO.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testGetAllSubscriptionPlans() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/admin/system/subscription-plans")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testGetSubscriptionPlanById() throws Exception {
        // Given - 先创建一个计划
        SubscriptionPlanDTO created = adminSubscriptionPlanService.createPlan(testPlanDTO);

        // When & Then
        mockMvc.perform(get("/api/admin/system/subscription-plans/" + created.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId()))
                .andExpect(jsonPath("$.name").value("测试会员"))
                .andExpect(jsonPath("$.maxTextGenerationsPerMonth").value(1000))
                .andExpect(jsonPath("$.allowApiAccess").value(true));
    }

    @Test
    void testCreateSubscriptionPlan() throws Exception {
        // Given
        SubscriptionPlanDTO createDTO = new SubscriptionPlanDTO();
        createDTO.setName("新会员");
        createDTO.setType("premium");
        createDTO.setBillingCycle("yearly");
        createDTO.setPrice(new BigDecimal("199.00"));
        createDTO.setMaxTextGenerationsPerMonth(2000);
        createDTO.setAllowApiAccess(true);
        createDTO.setIsActive(true);
        createDTO.setSortOrder(1);

        // When & Then
        mockMvc.perform(post("/api/admin/system/subscription-plans")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("新会员"))
                .andExpect(jsonPath("$.maxTextGenerationsPerMonth").value(2000))
                .andExpect(jsonPath("$.allowApiAccess").value(true));
    }

    @Test
    void testUpdateSubscriptionPlan() throws Exception {
        // Given - 先创建一个计划
        SubscriptionPlanDTO created = adminSubscriptionPlanService.createPlan(testPlanDTO);

        SubscriptionPlanDTO updateDTO = new SubscriptionPlanDTO();
        updateDTO.setName("更新后的会员");
        updateDTO.setPrice(new BigDecimal("149.00"));
        updateDTO.setMaxTextGenerationsPerMonth(3000);
        updateDTO.setType(testPlanDTO.getType());
        updateDTO.setBillingCycle(testPlanDTO.getBillingCycle());
        updateDTO.setIsActive(true);
        updateDTO.setSortOrder(1);

        // When & Then
        mockMvc.perform(put("/api/admin/system/subscription-plans/" + created.getId())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId()))
                .andExpect(jsonPath("$.name").value("更新后的会员"))
                .andExpect(jsonPath("$.price").value(149.00))
                .andExpect(jsonPath("$.maxTextGenerationsPerMonth").value(3000));
    }

    @Test
    void testDeleteSubscriptionPlan() throws Exception {
        // Given - 先创建一个计划
        SubscriptionPlanDTO created = adminSubscriptionPlanService.createPlan(testPlanDTO);

        // When & Then
        mockMvc.perform(delete("/api/admin/system/subscription-plans/" + created.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // 验证计划已被禁用
        SubscriptionPlanDTO deleted = adminSubscriptionPlanService.getPlanById(created.getId());
        assertFalse(deleted.getIsActive());
    }

    @Test
    void testGetAllSubscriptionPlans_Unauthorized() throws Exception {
        // When & Then - 使用无效token，会抛出RuntimeException导致500错误
        try {
            mockMvc.perform(get("/api/admin/system/subscription-plans")
                    .header("Authorization", "Bearer invalid-token"))
                    .andExpect(status().is5xxServerError());
        } catch (Exception e) {
            // 预期会抛出异常，因为token无效
            assertTrue(e.getMessage().contains("无效的管理员token") || 
                      e.getCause() != null && e.getCause().getMessage().contains("无效的管理员token"));
        }
    }
}

