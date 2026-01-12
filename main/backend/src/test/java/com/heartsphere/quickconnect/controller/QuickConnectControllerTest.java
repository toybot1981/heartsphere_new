package com.heartsphere.quickconnect.controller;

import com.heartsphere.controller.BaseControllerTest;
import com.heartsphere.entity.Character;
import com.heartsphere.entity.User;
import com.heartsphere.entity.World;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.repository.WorldRepository;
import com.heartsphere.security.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

/**
 * 快速连接控制器集成测试
 */
public class QuickConnectControllerTest extends BaseControllerTest {

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorldRepository worldRepository;

    private User testUser;
    private Character testCharacter;
    private World testWorld;

    @BeforeEach
    void setUp() {
        // 清空测试数据
        characterRepository.deleteAll();
        worldRepository.deleteAll();

        // 创建测试用户
        testUser = userRepository.findByEmail("test@example.com")
                .orElseGet(() -> {
                    User user = new User();
                    user.setUsername("testuser");
                    user.setEmail("test@example.com");
                    user.setPassword("password");
                    user.setIsEnabled(true);
                    return userRepository.save(user);
                });

        // 创建测试世界
        testWorld = new World();
        testWorld.setName("Test World");
        testWorld.setDescription("Test World Description");
        testWorld.setUser(testUser);
        testWorld = worldRepository.save(testWorld);

        // 创建测试角色
        testCharacter = new Character();
        testCharacter.setName("Test Character");
        testCharacter.setDescription("Test Description");
        testCharacter.setWorld(testWorld);
        testCharacter.setUser(testUser);
        testCharacter.setThemeColor("#3b82f6");
        testCharacter.setColorAccent("#60a5fa");
        testCharacter = characterRepository.save(testCharacter);

        // 设置认证上下文
        UserDetailsImpl userDetails = new UserDetailsImpl(
                testUser.getId(),
                testUser.getUsername(),
                testUser.getEmail(),
                testUser.getPassword(),
                testUser.getIsEnabled()
        );
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    public void testGetQuickConnectCharacters() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/quick-connect/characters")
                .param("filter", "all")
                .param("sortBy", "frequency"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.characters").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.totalCount").exists());
    }

    @Test
    public void testGetQuickConnectCharacters_WithFilter() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/quick-connect/characters")
                .param("filter", "favorite")
                .param("sortBy", "frequency"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.characters").isArray());
    }

    @Test
    public void testGetQuickConnectCharacters_WithSearch() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/quick-connect/characters")
                .param("search", "Test"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.characters").isArray());
    }

    @Test
    public void testSearchCharacters() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/quick-connect/search")
                .param("query", "Test"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.characters").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.searchQuery").value("Test"));
    }
}




