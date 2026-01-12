package com.heartsphere.controller;

import com.heartsphere.dto.LoginRequest;
import com.heartsphere.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

public class AuthControllerTest extends BaseControllerTest {

    @Test
    public void testRegisterUser() throws Exception {
        // 创建一个注册请求
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("newuser");
        registerRequest.setEmail("newuser@example.com");
        registerRequest.setPassword("password123");

        // 发送注册请求
        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(registerRequest)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.token").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.username").value("newuser"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.email").value("newuser@example.com"));
    }

    @Test
    public void testLoginUser() throws Exception {
        // 首先注册一个用户
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("loginuser");
        registerRequest.setEmail("loginuser@example.com");
        registerRequest.setPassword("password123");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(registerRequest)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        // 创建一个登录请求
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("loginuser");
        loginRequest.setPassword("password123");

        // 发送登录请求
        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(loginRequest)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.token").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.username").value("loginuser"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.email").value("loginuser@example.com"));
    }

    @Test
    public void testGetCurrentUser() throws Exception {
        // 获取当前用户信息
        mockMvc.perform(MockMvcRequestBuilders.get("/api/auth/me")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.username").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.email").exists());
    }

    @Test
    public void testRegisterWithExistingUsername() throws Exception {
        // 首先注册一个用户
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername("existinguser");
        registerRequest.setEmail("existinguser@example.com");
        registerRequest.setPassword("password123");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(registerRequest)))
                .andExpect(MockMvcResultMatchers.status().isOk());

        // 尝试使用相同的用户名注册另一个用户
        RegisterRequest duplicateRequest = new RegisterRequest();
        duplicateRequest.setUsername("existinguser");
        duplicateRequest.setEmail("different@example.com");
        duplicateRequest.setPassword("password123");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(duplicateRequest)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("$.message").value("Username is already taken!"));
    }
}
