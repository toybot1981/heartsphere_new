package com.heartsphere.repository;

import com.heartsphere.entity.User;
import com.heartsphere.entity.World;
import com.heartsphere.repository.WorldRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
public class WorldRepositoryTest {

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private User anotherUser;

    @BeforeEach
    void setUp() {
        // 清空所有数据
        worldRepository.deleteAll();
        userRepository.deleteAll();

        // 创建测试用户
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");
        testUser.setIsEnabled(true);
        testUser = userRepository.save(testUser);

        // 创建另一个测试用户用于验证权限
        anotherUser = new User();
        anotherUser.setUsername("anotheruser");
        anotherUser.setEmail("another@example.com");
        anotherUser.setPassword("password456");
        anotherUser.setIsEnabled(true);
        anotherUser = userRepository.save(anotherUser);

        // 创建属于testUser的世界
        World world1 = new World();
        world1.setName("World 1");
        world1.setDescription("First world of test user");
        world1.setUser(testUser);
        worldRepository.save(world1);

        World world2 = new World();
        world2.setName("World 2");
        world2.setDescription("Second world of test user");
        world2.setUser(testUser);
        worldRepository.save(world2);

        // 创建属于anotherUser的世界
        World world3 = new World();
        world3.setName("World 3");
        world3.setDescription("World of another user");
        world3.setUser(anotherUser);
        worldRepository.save(world3);
    }

    @Test
    void testFindByUserId() {
        // 测试查找testUser的世界
        List<World> testUserWorlds = worldRepository.findByUserId(testUser.getId());
        assertThat(testUserWorlds).hasSize(2);
        assertThat(testUserWorlds).extracting(World::getName).containsExactlyInAnyOrder("World 1", "World 2");
        assertThat(testUserWorlds).extracting(world -> world.getUser().getId()).containsOnly(testUser.getId());

        // 测试查找anotherUser的世界
        List<World> anotherUserWorlds = worldRepository.findByUserId(anotherUser.getId());
        assertThat(anotherUserWorlds).hasSize(1);
        assertThat(anotherUserWorlds.get(0).getName()).isEqualTo("World 3");
        assertThat(anotherUserWorlds.get(0).getUser().getId()).isEqualTo(anotherUser.getId());

        // 测试查找不存在用户的世界
        List<World> nonExistentUserWorlds = worldRepository.findByUserId(999L);
        assertThat(nonExistentUserWorlds).isEmpty();
    }

    @Test
    void testSaveAndFindById() {
        // 测试保存新世界
        World newWorld = new World();
        newWorld.setName("New World");
        newWorld.setDescription("A newly created world");
        newWorld.setUser(testUser);
        World savedWorld = worldRepository.save(newWorld);

        // 测试通过ID查找
        Optional<World> foundWorld = worldRepository.findById(savedWorld.getId());
        assertThat(foundWorld).isPresent();
        assertThat(foundWorld.get().getName()).isEqualTo("New World");
        assertThat(foundWorld.get().getUser().getId()).isEqualTo(testUser.getId());
    }

    @Test
    void testDelete() {
        // 获取testUser的一个世界
        List<World> testUserWorlds = worldRepository.findByUserId(testUser.getId());
        assertThat(testUserWorlds).hasSize(2);

        // 删除一个世界
        worldRepository.delete(testUserWorlds.get(0));

        // 验证删除后数量减少
        List<World> remainingWorlds = worldRepository.findByUserId(testUser.getId());
        assertThat(remainingWorlds).hasSize(1);
        assertThat(remainingWorlds).extracting(World::getName).doesNotContain(testUserWorlds.get(0).getName());
    }
}