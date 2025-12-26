package com.heartsphere.repository;

import com.heartsphere.entity.JournalEntry;
import com.heartsphere.entity.User;
import com.heartsphere.repository.JournalEntryRepository;
import com.heartsphere.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * JournalEntryRepository单元测试
 * 验证N+1查询优化后的新方法
 *
 * @author HeartSphere Test Team
 */
@SpringBootTest
@Transactional
@Rollback
class JournalEntryRepositoryTest {

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    private User testUser;

    @BeforeEach
    void setUp() {
        // 创建测试用户
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser.setIsEnabled(true);
        testUser = userRepository.save(testUser);
    }

    @Test
    void testFindByUserIdWithAssociations() {
        // 准备测试数据 - 创建3个日志条目
        JournalEntry entry1 = createJournalEntry("Title 1", "Content 1");
        JournalEntry entry2 = createJournalEntry("Title 2", "Content 2");
        JournalEntry entry3 = createJournalEntry("Title 3", "Content 3");

        journalEntryRepository.save(entry1);
        journalEntryRepository.save(entry2);
        journalEntryRepository.save(entry3);

        // 清理缓存，确保从数据库查询而不是一级缓存
        entityManager.flush();
        entityManager.clear();

        // 使用新的JOIN FETCH查询方法
        List<JournalEntry> entries = journalEntryRepository.findByUserIdWithAssociations(testUser.getId());

        // 验证结果
        assertNotNull(entries, "返回的列表不应为null");
        assertEquals(3, entries.size(), "应该返回3个日志条目");

        // 验证关联实体已加载（不会触发LazyInitializationException）
        JournalEntry firstEntry = entries.get(0);
        assertNotNull(firstEntry.getUser(), "User应该已加载");
        assertNotNull(firstEntry.getUser().getUsername(), "User的username应该可访问");
        assertEquals("testuser", firstEntry.getUser().getUsername());

        // 验证排序（按entryDate降序）
        assertTrue(entries.get(0).getEntryDate().isAfter(entries.get(1).getEntryDate()) ||
                  entries.get(0).getEntryDate().isEqual(entries.get(1).getEntryDate()),
                  "应该按entryDate降序排列");
    }

    @Test
    void testFindByIdWithAssociations() {
        // 准备测试数据
        JournalEntry entry = createJournalEntry("Test Entry", "Test Content");
        entry = journalEntryRepository.save(entry);

        String entryId = entry.getId();

        // 清理缓存
        entityManager.flush();
        entityManager.clear();

        // 使用新的查询方法
        JournalEntry result = journalEntryRepository.findByIdWithAssociations(entryId);

        // 验证结果
        assertNotNull(result, "应该能找到日志条目");
        assertEquals(entryId, result.getId());
        assertEquals("Test Entry", result.getTitle());
        assertEquals("Test Content", result.getContent());

        // 验证关联实体已加载
        assertNotNull(result.getUser(), "User应该已加载");
        assertEquals(testUser.getId(), result.getUser().getId());
        assertEquals("testuser", result.getUser().getUsername());
    }

    @Test
    void testFindByIdWithAssociations_NotFound() {
        // 查询不存在的ID
        JournalEntry result = journalEntryRepository.findByIdWithAssociations("non-existent-id");

        // 验证返回null
        assertNull(result, "不存在的ID应该返回null");
    }

    @Test
    void testSearchByKeywordWithAssociations() {
        // 准备测试数据
        JournalEntry entry1 = createJournalEntry("Searchable Title", "Content with keyword test");
        JournalEntry entry2 = createJournalEntry("Another Entry", "Different content");
        JournalEntry entry3 = createJournalEntry("Tagged Entry", "Content about tags");
        entry3.setTags("keyword,test");

        journalEntryRepository.save(entry1);
        journalEntryRepository.save(entry2);
        journalEntryRepository.save(entry3);

        // 清理缓存
        entityManager.flush();
        entityManager.clear();

        // 搜索包含"keyword"的条目
        List<JournalEntry> results = journalEntryRepository.searchByKeywordWithAssociations(
            testUser.getId(), "keyword");

        // 验证搜索结果
        assertNotNull(results);
        assertEquals(2, results.size(), "应该找到2个包含keyword的条目");

        // 验证结果包含正确的条目
        assertTrue(results.stream().anyMatch(e -> "Searchable Title".equals(e.getTitle())),
                   "应该包含标题中匹配的条目");
        assertTrue(results.stream().anyMatch(e -> e.getTags() != null && e.getTags().contains("keyword")),
                   "应该包含标签中匹配的条目");

        // 验证关联实体已加载
        results.forEach(entry -> {
            assertNotNull(entry.getUser(), "User应该已加载");
        });
    }

    @Test
    void testSearchByKeyword_EmptyResult() {
        // 搜索不存在的关键词
        List<JournalEntry> results = journalEntryRepository.searchByKeywordWithAssociations(
            testUser.getId(), "nonexistent");

        // 验证返回空列表
        assertNotNull(results);
        assertTrue(results.isEmpty(), "不存在的关键词应该返回空列表");
    }

    @Test
    void testFindByTagWithAssociations() {
        // 准备测试数据
        JournalEntry entry1 = createJournalEntry("Entry 1", "Content 1");
        entry1.setTags("important,work,priority");

        JournalEntry entry2 = createJournalEntry("Entry 2", "Content 2");
        entry2.setTags("personal,life");

        JournalEntry entry3 = createJournalEntry("Entry 3", "Content 3");
        entry3.setTags("important,personal");

        journalEntryRepository.save(entry1);
        journalEntryRepository.save(entry2);
        journalEntryRepository.save(entry3);

        // 清理缓存
        entityManager.flush();
        entityManager.clear();

        // 按标签搜索
        List<JournalEntry> results = journalEntryRepository.findByTagWithAssociations(
            testUser.getId(), "important");

        // 验证搜索结果
        assertNotNull(results);
        assertEquals(2, results.size(), "应该找到2个包含'important'标签的条目");

        // 验证关联实体已加载
        results.forEach(entry -> {
            assertNotNull(entry.getUser(), "User应该已加载");
            assertNotNull(entry.getTags(), "Tags应该已加载");
            assertTrue(entry.getTags().contains("important"), "结果应该包含'important'标签");
        });
    }

    @Test
    void testFindByWorldIdWithAssociations() {
        // 准备测试数据 - 创建World
        com.heartsphere.entity.World world = new com.heartsphere.entity.World();
        world.setUser(testUser);
        world.setName("Test World");
        world = entityManager.merge(world);

        JournalEntry entry = createJournalEntry("World Entry", "Content for world");
        entry.setWorld(world);
        journalEntryRepository.save(entry);

        // 清理缓存
        entityManager.flush();
        entityManager.clear();

        // 按World查询
        List<JournalEntry> results = journalEntryRepository.findByWorldIdWithAssociations(world.getId());

        // 验证
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Test World", results.get(0).getWorld().getName());
        assertNotNull(results.get(0).getUser());
    }

    @Test
    void testFindByEraIdWithAssociations() {
        // 准备测试数据 - 创建Era
        com.heartsphere.entity.Era era = new com.heartsphere.entity.Era();
        era.setUser(testUser);
        era.setName("Test Era");
        era = entityManager.merge(era);

        JournalEntry entry = createJournalEntry("Era Entry", "Content for era");
        entry.setEra(era);
        journalEntryRepository.save(entry);

        // 清理缓存
        entityManager.flush();
        entityManager.clear();

        // 按Era查询
        List<JournalEntry> results = journalEntryRepository.findByEraIdWithAssociations(era.getId());

        // 验证
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Test Era", results.get(0).getEra().getName());
        assertNotNull(results.get(0).getUser());
    }

    @Test
    void testFindByCharacterIdWithAssociations() {
        // 准备测试数据 - 创建Character
        com.heartsphere.entity.Character character = new com.heartsphere.entity.Character();
        character.setUser(testUser);
        character.setName("Test Character");
        character = entityManager.merge(character);

        JournalEntry entry = createJournalEntry("Character Entry", "Content for character");
        entry.setCharacter(character);
        journalEntryRepository.save(entry);

        // 清理缓存
        entityManager.flush();
        entityManager.clear();

        // 按Character查询
        List<JournalEntry> results = journalEntryRepository.findByCharacterIdWithAssociations(character.getId());

        // 验证
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Test Character", results.get(0).getCharacter().getName());
        assertNotNull(results.get(0).getUser());
    }

    @Test
    void testLegacyFindByUser_Id() {
        // 测试旧方法仍然可用
        JournalEntry entry = createJournalEntry("Legacy Test", "Legacy Content");
        journalEntryRepository.save(entry);

        // 清理缓存
        entityManager.flush();
        entityManager.clear();

        // 使用旧方法查询
        List<JournalEntry> results = journalEntryRepository.findByUser_Id(testUser.getId());

        // 验证
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Legacy Test", results.get(0).getTitle());
    }

    /**
     * 辅助方法：创建测试用的JournalEntry
     */
    private JournalEntry createJournalEntry(String title, String content) {
        JournalEntry entry = new JournalEntry();
        entry.setTitle(title);
        entry.setContent(content);
        entry.setEntryDate(LocalDateTime.now());
        entry.setUser(testUser);
        return entry;
    }
}
