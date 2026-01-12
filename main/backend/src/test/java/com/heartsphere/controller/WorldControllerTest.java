package com.heartsphere.controller;

import com.heartsphere.entity.User;
import com.heartsphere.entity.World;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.repository.WorldRepository;
import com.heartsphere.security.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class WorldControllerTest extends BaseControllerTest {

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        // 测试前清空数据库，但保留用户数据
        worldRepository.deleteAll();

        // 创建测试用户（如果不存在）
        User user = userRepository.findByEmail("test@example.com")
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername("testuser");
                    newUser.setEmail("test@example.com");
                    newUser.setPassword("password");
                    newUser.setIsEnabled(true);
                    return userRepository.save(newUser);
                });

        // 设置认证上下文
        UserDetailsImpl userDetails = new UserDetailsImpl(user.getId(), user.getUsername(), user.getEmail(), user.getPassword(), user.getIsEnabled());
        org.springframework.security.core.Authentication authentication = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(userDetails, null);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    public void testCreateWorld() throws Exception {
        // 创建一个世界
        World world = new World();
        world.setName("Test World");
        world.setDescription("This is a test world description.");

        // 发送创建请求
        mockMvc.perform(MockMvcRequestBuilders.post("/api/worlds")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(world)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Test World"))
                .andExpect(jsonPath("$.description").value("This is a test world description."))
                .andExpect(jsonPath("$.user.id").exists());
    }

    @Test
    public void testGetAllWorlds() throws Exception {
        // 创建一个测试世界
        World world = new World();
        world.setName("Test World");
        world.setDescription("This is a test world description.");
        // 获取当前认证用户
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        world.setUser(user);
        worldRepository.save(world);

        // 获取所有世界
        mockMvc.perform(MockMvcRequestBuilders.get("/api/worlds")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test World"));
    }
}
