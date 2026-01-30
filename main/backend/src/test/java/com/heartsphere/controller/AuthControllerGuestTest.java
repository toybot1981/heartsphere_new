package com.heartsphere.controller;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

/**
 * 游客登录与再次进入的测试（enhance-guest-user-initialization）
 */
public class AuthControllerGuestTest extends BaseControllerTest {

    @Test
    public void testGuestLoginNewUser_returnsTokenAndInitData() throws Exception {
        String body = "{\"nickname\":\"TestGuest\"}";
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/guest-login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.token").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.nickname").value("TestGuest"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.isGuest").value(true))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.isFirstLogin").value(true))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        JsonNode root = objectMapper.readTree(responseBody);
        String token = root.path("data").path("token").asText();
        if (token == null || token.isEmpty()) return;

        // 以游客 token 请求 worlds/eras/characters，应返回库内数据：1 世界、1 场景、6 角色
        mockMvc.perform(MockMvcRequestBuilders.get("/api/worlds")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].name").exists());

        mockMvc.perform(MockMvcRequestBuilders.get("/api/eras")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].name").exists());

        mockMvc.perform(MockMvcRequestBuilders.get("/api/characters")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].id").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$[0].eraId").exists());
    }

    @Test
    public void testGuestLoginReEntry_sameNameReturnsSameUser() throws Exception {
        String nickname = "ReEntryGuest_" + System.currentTimeMillis();
        String body = "{\"nickname\":\"" + nickname + "\"}";

        MvcResult first = mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/guest-login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.token").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.isFirstLogin").value(true))
                .andReturn();

        JsonNode firstRoot = objectMapper.readTree(first.getResponse().getContentAsString());
        long firstId = firstRoot.path("data").path("id").asLong();

        MvcResult second = mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/guest-login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").value(firstId))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.isFirstLogin").value(false))
                .andReturn();
    }
}
