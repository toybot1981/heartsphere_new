package com.heartsphere.controller;

import com.heartsphere.entity.Era;
import com.heartsphere.entity.User;
import com.heartsphere.entity.World;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.repository.WorldRepository;
import com.heartsphere.security.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class EraControllerTest extends BaseControllerTest {

    @Autowired
    private EraRepository eraRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorldRepository worldRepository;

    private User user;

    @BeforeEach
    void setUp() {
        // 测试前清空数据库，但保留用户数据
        eraRepository.deleteAll();
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
        // 将用户设置为实例变量，以便在测试方法中使用
        this.user = user;

        // 设置认证上下文
        UserDetailsImpl userDetails = new UserDetailsImpl(user.getId(), user.getUsername(), user.getEmail(), user.getPassword(), user.getIsEnabled());
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    public void testCreateEra() throws Exception {
        // 首先创建一个世界
        World world = new World();
        world.setName("Test World");
        world.setDescription("Test World Description");
        world.setUser(user);
        world = worldRepository.save(world);

        // 创建DTO对象
        String eraJson = "{\"name\":\"Test Era\",\"description\":\"This is a test era description.\",\"worldId\":" + world.getId() + "}";

        mockMvc.perform(MockMvcRequestBuilders.post("/api/eras")
                .contentType(MediaType.APPLICATION_JSON)
                .content(eraJson))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Test Era"))
                .andExpect(jsonPath("$.description").value("This is a test era description."))
                .andExpect(jsonPath("$.worldId").value(world.getId()));
    }

    @Test
    public void testGetAllEras() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/eras")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
