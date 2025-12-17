package com.heartsphere.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.dto.AdminLoginRequest;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AdminAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SystemAdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {
        // 确保测试管理员存在
        adminRepository.findByUsername("testadmin").ifPresent(adminRepository::delete);
        SystemAdmin admin = new SystemAdmin();
        admin.setUsername("testadmin");
        admin.setPassword(passwordEncoder.encode("123456"));
        admin.setEmail("test@test.com");
        admin.setIsActive(true);
        adminRepository.save(admin);
    }

    @Test
    public void testLoginSuccess() throws Exception {
        AdminLoginRequest request = new AdminLoginRequest();
        request.setUsername("testadmin");
        request.setPassword("123456");

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.username").value("testadmin"))
                .andExpect(jsonPath("$.email").value("test@test.com"));
    }

    @Test
    public void testLoginWithWrongPassword() throws Exception {
        AdminLoginRequest request = new AdminLoginRequest();
        request.setUsername("testadmin");
        request.setPassword("wrongpassword");

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    public void testLoginWithNonExistentUser() throws Exception {
        AdminLoginRequest request = new AdminLoginRequest();
        request.setUsername("nonexistent");
        request.setPassword("123456");

        mockMvc.perform(post("/api/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());
    }
}



