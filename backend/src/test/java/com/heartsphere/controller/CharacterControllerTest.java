package com.heartsphere.controller;

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
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

public class CharacterControllerTest extends BaseControllerTest {

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorldRepository worldRepository;

    @BeforeEach
    void setUp() {
        // 测试前清空数据库，但保留用户数据
        characterRepository.deleteAll();
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

        // 创建测试世界
        World world = new World();
        world.setName("Test World");
        world.setDescription("Test World Description");
        world.setUser(user);
        world = worldRepository.save(world);

        // 设置认证上下文
        UserDetailsImpl userDetails = new UserDetailsImpl(user.getId(), user.getUsername(), user.getEmail(), user.getPassword(), user.getIsEnabled());
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    public void testCreateCharacter() throws Exception {
        // 获取当前用户
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        // 创建一个世界
        World world = new World();
        world.setName("Test World");
        world.setDescription("Test World Description");
        world.setUser(user);
        world = worldRepository.save(world);
        
        // 创建DTO对象
        String characterJson = "{\"name\":\"Test Character\",\"description\":\"This is a test character description.\",\"worldId\":" + world.getId() + "}";

        // 发送创建请求
        mockMvc.perform(MockMvcRequestBuilders.post("/api/characters")
                .contentType(MediaType.APPLICATION_JSON)
                .content(characterJson))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.name").value("Test Character"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.description").value("This is a test character description."))
                .andExpect(MockMvcResultMatchers.jsonPath("$.worldId").value(world.getId()));
    }

    @Test
    public void testGetAllCharacters() throws Exception {
        // 获取当前用户
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        // 创建一个世界
        World world = new World();
        world.setName("Test World");
        world.setDescription("Test World Description");
        world.setUser(user);
        world = worldRepository.save(world);
        
        // 首先创建几个角色
        for (int i = 0; i < 3; i++) {
            String characterJson = "{\"name\":\"Character " + i + "\",\"description\":\"Description for character " + i + "\",\"worldId\":" + world.getId() + "}";
            mockMvc.perform(MockMvcRequestBuilders.post("/api/characters")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(characterJson));
        }

        // 获取所有角色
        mockMvc.perform(MockMvcRequestBuilders.get("/api/characters")
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$").isArray())
                .andExpect(MockMvcResultMatchers.jsonPath("$.length()").value(3));
    }

    @Test
    public void testGetCharacterById() throws Exception {
        // 获取当前用户
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        // 创建一个世界
        World world = new World();
        world.setName("Test World");
        world.setDescription("Test World Description");
        world.setUser(user);
        world = worldRepository.save(world);
        
        // 首先创建一个角色
        String characterJson = "{\"name\":\"Get By Id Character\",\"description\":\"This character is for testing get by id functionality.\",\"worldId\":" + world.getId() + "}";

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/characters")
                .contentType(MediaType.APPLICATION_JSON)
                .content(characterJson))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 从响应中提取ID
        Long id = objectMapper.readTree(response).get("id").asLong();

        // 通过ID获取角色
        mockMvc.perform(MockMvcRequestBuilders.get("/api/characters/" + id)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(id))
                .andExpect(MockMvcResultMatchers.jsonPath("$.name").value("Get By Id Character"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.description").value("This character is for testing get by id functionality."));
    }

    @Test
    public void testUpdateCharacter() throws Exception {
        // 获取当前用户
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        // 创建一个世界
        World world = new World();
        world.setName("Test World");
        world.setDescription("Test World Description");
        world.setUser(user);
        world = worldRepository.save(world);
        
        // 首先创建一个角色
        String characterJson = "{\"name\":\"Update Test Character\",\"description\":\"Original description for update test.\",\"worldId\":" + world.getId() + "}";

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/characters")
                .contentType(MediaType.APPLICATION_JSON)
                .content(characterJson))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 从响应中提取ID
        Long id = objectMapper.readTree(response).get("id").asLong();

        // 创建更新请求DTO
        String updatedCharacterJson = "{\"name\":\"Updated Character\",\"description\":\"This description has been updated.\",\"worldId\":" + world.getId() + "}";

        // 发送更新请求
        mockMvc.perform(MockMvcRequestBuilders.put("/api/characters/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedCharacterJson))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").value(id))
                .andExpect(MockMvcResultMatchers.jsonPath("$.name").value("Updated Character"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.description").value("This description has been updated."));
    }

    @Test
    public void testDeleteCharacter() throws Exception {
        // 获取当前用户
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        // 创建一个世界
        World world = new World();
        world.setName("Test World");
        world.setDescription("Test World Description");
        world.setUser(user);
        world = worldRepository.save(world);
        
        // 首先创建一个角色
        String characterJson = "{\"name\":\"Delete Test Character\",\"description\":\"This character will be deleted.\",\"worldId\":" + world.getId() + "}";

        String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/characters")
                .contentType(MediaType.APPLICATION_JSON)
                .content(characterJson))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 从响应中提取ID
        Long id = objectMapper.readTree(response).get("id").asLong();

        // 发送删除请求
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/characters/" + id)
                .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isNoContent());

        // 验证角色已被删除
        mockMvc.perform(MockMvcRequestBuilders.get("/api/characters/" + id)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isInternalServerError());
    }
}
