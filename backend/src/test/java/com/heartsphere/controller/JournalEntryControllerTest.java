package com.heartsphere.controller;

import com.heartsphere.entity.JournalEntry;
import com.heartsphere.entity.User;
import com.heartsphere.repository.JournalEntryRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.security.UserDetailsImpl;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

public class JournalEntryControllerTest extends BaseControllerTest {

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // 存储测试用户，供所有测试方法使用
    private User testUser;

    @BeforeEach
    public void setUp() {
        // 先创建或获取测试用户
        testUser = userRepository.findByEmail("journal@example.com")
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername("journaluser");
                    newUser.setEmail("journal@example.com");
                    newUser.setPassword("password123");
                    newUser.setIsEnabled(true);
                    return userRepository.save(newUser);
                });

        // 使用JPQL删除所有日志条目，避免加载关联实体
        entityManager.createQuery("DELETE FROM JournalEntry").executeUpdate();

        // 设置认证上下文
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                UserDetailsImpl.build(testUser), null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    public void testCreateJournalEntry() throws Exception {
        // 创建一个日志条目请求
        Map<String, Object> journalEntryMap = new HashMap<>();
        journalEntryMap.put("title", "Test Journal Entry");
        journalEntryMap.put("content", "This is a test journal entry content.");
        journalEntryMap.put("entryDate", LocalDateTime.now().toString());

        // 发送创建请求
        mockMvc.perform(MockMvcRequestBuilders.post("/api/journal-entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(journalEntryMap)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.title").value("Test Journal Entry"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.content").value("This is a test journal entry content."))
                .andExpect(MockMvcResultMatchers.jsonPath("$.timestamp").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.user.id").value(testUser.getId()));
    }

    @Test
    public void testGetAllJournalEntries() throws Exception {
        // 创建几个测试条目
        for (int i = 0; i < 3; i++) {
            Map<String, Object> journalEntryMap = new HashMap<>();
            journalEntryMap.put("title", "Test Entry " + i);
            journalEntryMap.put("content", "Test content " + i);
            journalEntryMap.put("entryDate", LocalDateTime.now().toString());

            mockMvc.perform(MockMvcRequestBuilders.post("/api/journal-entries")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(journalEntryMap)))
                    .andExpect(MockMvcResultMatchers.status().isOk());
        }

        // 获取所有日志条目
        mockMvc.perform(MockMvcRequestBuilders.get("/api/journal-entries")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$").isArray());
    }

    @Test
    public void testGetJournalEntryById() throws Exception {
        // 首先创建一个日志条目
        Map<String, Object> journalEntryMap = new HashMap<>();
        journalEntryMap.put("title", "Get By Id Test");
        journalEntryMap.put("content", "This entry is for testing get by id functionality.");
        journalEntryMap.put("entryDate", LocalDateTime.now().toString());

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/journal-entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(journalEntryMap)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 从响应中提取ID
        String id = objectMapper.readTree(response).get("id").asText();

        // 通过ID获取日志条目
        mockMvc.perform(MockMvcRequestBuilders.get("/api/journal-entries/" + id)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(id))
                .andExpect(MockMvcResultMatchers.jsonPath("$.title").value("Get By Id Test"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.content").value("This entry is for testing get by id functionality."))
                .andExpect(MockMvcResultMatchers.jsonPath("$.user.id").value(testUser.getId()));
    }

    @Test
    public void testUpdateJournalEntry() throws Exception {
        // 首先创建一个日志条目
        Map<String, Object> journalEntryMap = new HashMap<>();
        journalEntryMap.put("title", "Update Test Entry");
        journalEntryMap.put("content", "Original content for update test.");
        journalEntryMap.put("entryDate", LocalDateTime.now().toString());

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/journal-entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(journalEntryMap)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 从响应中提取ID
        String id = objectMapper.readTree(response).get("id").asText();

        // 创建更新请求
        Map<String, Object> updatedEntryMap = new HashMap<>();
        updatedEntryMap.put("title", "Updated Journal Entry");
        updatedEntryMap.put("content", "This content has been updated.");
        updatedEntryMap.put("entryDate", LocalDateTime.now().toString());

        // 发送更新请求
        mockMvc.perform(MockMvcRequestBuilders.put("/api/journal-entries/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updatedEntryMap)))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(id))
                .andExpect(MockMvcResultMatchers.jsonPath("$.title").value("Updated Journal Entry"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.content").value("This content has been updated."))
                .andExpect(MockMvcResultMatchers.jsonPath("$.user.id").value(testUser.getId()));
    }

    @Test
    public void testDeleteJournalEntry() throws Exception {
        // 首先创建一个日志条目
        Map<String, Object> journalEntryMap = new HashMap<>();
        journalEntryMap.put("title", "Delete Test Entry");
        journalEntryMap.put("content", "This entry will be deleted.");
        journalEntryMap.put("entryDate", LocalDateTime.now().toString());

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/journal-entries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(journalEntryMap)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 从响应中提取ID
        String id = objectMapper.readTree(response).get("id").asText();
        System.out.println("Created journal entry with ID: " + id);

        // 手动刷新事务，确保条目被持久化到数据库中
        entityManager.flush();

        // 发送删除请求
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/journal-entries/" + id)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isNoContent());

        // 使用repository直接验证条目是否被删除
        boolean exists = journalEntryRepository.existsById(id);
        assert !exists : "Journal entry should be deleted.";
    }
}
