package com.heartsphere.quickconnect.controller;

import com.heartsphere.controller.BaseControllerTest;
import com.heartsphere.entity.Character;
import com.heartsphere.entity.User;
import com.heartsphere.entity.World;
import com.heartsphere.quickconnect.entity.UserFavorite;
import com.heartsphere.quickconnect.repository.UserFavoriteRepository;
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

/**
 * 收藏控制器集成测试
 */
public class FavoriteControllerTest extends BaseControllerTest {

    @Autowired
    private UserFavoriteRepository userFavoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private WorldRepository worldRepository;

    private User testUser;
    private Character testCharacter;

    @BeforeEach
    void setUp() {
        // 清空测试数据
        userFavoriteRepository.deleteAll();
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
        World world = new World();
        world.setName("Test World");
        world.setDescription("Test World Description");
        world.setUser(testUser);
        world = worldRepository.save(world);

        // 创建测试角色
        testCharacter = new Character();
        testCharacter.setName("Test Character");
        testCharacter.setDescription("Test Description");
        testCharacter.setWorld(world);
        testCharacter.setUser(testUser);
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
    public void testAddFavorite() throws Exception {
        String requestJson = String.format(
                "{\"characterId\":%d,\"sortOrder\":0}",
                testCharacter.getId()
        );

        mockMvc.perform(MockMvcRequestBuilders.post("/api/favorites")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.characterId").value(testCharacter.getId()));
    }

    @Test
    public void testRemoveFavorite() throws Exception {
        // 先添加收藏
        UserFavorite favorite = new UserFavorite();
        favorite.setUser(testUser);
        favorite.setCharacter(testCharacter);
        favorite.setSortOrder(0);
        userFavoriteRepository.save(favorite);

        // 删除收藏
        mockMvc.perform(MockMvcRequestBuilders.delete("/api/favorites/" + testCharacter.getId()))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200));
    }

    @Test
    public void testGetFavorites() throws Exception {
        // 先添加收藏
        UserFavorite favorite = new UserFavorite();
        favorite.setUser(testUser);
        favorite.setCharacter(testCharacter);
        favorite.setSortOrder(0);
        userFavoriteRepository.save(favorite);

        mockMvc.perform(MockMvcRequestBuilders.get("/api/favorites"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data").isArray());
    }

    @Test
    public void testCheckFavorite() throws Exception {
        // 先添加收藏
        UserFavorite favorite = new UserFavorite();
        favorite.setUser(testUser);
        favorite.setCharacter(testCharacter);
        favorite.setSortOrder(0);
        userFavoriteRepository.save(favorite);

        mockMvc.perform(MockMvcRequestBuilders.get("/api/favorites/check/" + testCharacter.getId()))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data").value(true));
    }

    @Test
    public void testGetFavoriteCount() throws Exception {
        // 先添加收藏
        UserFavorite favorite = new UserFavorite();
        favorite.setUser(testUser);
        favorite.setCharacter(testCharacter);
        favorite.setSortOrder(0);
        userFavoriteRepository.save(favorite);

        mockMvc.perform(MockMvcRequestBuilders.get("/api/favorites/count"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value(200))
                .andExpect(MockMvcResultMatchers.jsonPath("$.data").value(1));
    }
}




