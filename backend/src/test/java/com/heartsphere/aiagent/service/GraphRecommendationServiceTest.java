package com.heartsphere.aiagent.service;

import com.heartsphere.entity.Character;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.ScenarioEvent;
import com.heartsphere.entity.ScenarioItem;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.ScenarioEventRepository;
import com.heartsphere.repository.ScenarioItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * GraphRecommendationService 单元测试
 */
@ExtendWith(MockitoExtension.class)
class GraphRecommendationServiceTest {

    @Mock
    private EraRepository eraRepository;

    @Mock
    private CharacterRepository characterRepository;

    @Mock
    private ScenarioEventRepository scenarioEventRepository;

    @Mock
    private ScenarioItemRepository scenarioItemRepository;

    @Mock
    private EntityRelationService entityRelationService;

    @InjectMocks
    private GraphRecommendationService recommendationService;

    private Long testUserId;
    private Era testEra;
    private Character testCharacter;
    private ScenarioEvent testEvent;
    private ScenarioItem testItem;

    @BeforeEach
    void setUp() {
        testUserId = 1L;

        // 创建测试数据
        testEra = new Era();
        testEra.setId(1L);
        testEra.setName("测试场景");
        testEra.setDescription("这是一个测试场景");

        testCharacter = new Character();
        testCharacter.setId(1L);
        testCharacter.setName("测试角色");
        testCharacter.setDescription("这是一个测试角色");

        testEvent = new ScenarioEvent();
        testEvent.setId(1L);
        testEvent.setName("测试事件");
        testEvent.setDescription("这是一个测试事件");

        testItem = new ScenarioItem();
        testItem.setId(1L);
        testItem.setName("测试物品");
        testItem.setDescription("这是一个测试物品");
    }

    // ========== 实体推荐测试 ==========

    @Test
    void testRecommendEntitiesByContext_UnknownType() {
        List<Map<String, Object>> result = recommendationService.recommendEntitiesByContext(
            testUserId, "unknown", Collections.emptyList(), Collections.emptyMap()
        );

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testRecommendErasByContext_WithUserEras() {
        // Given
        List<Era> userEras = Arrays.asList(testEra);
        when(eraRepository.findAllByUser_Id(testUserId)).thenReturn(userEras);

        // When
        List<Map<String, Object>> result = recommendationService.recommendEntitiesByContext(
            testUserId, "era", Collections.emptyList(), Collections.emptyMap()
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        Map<String, Object> rec = result.get(0);
        assertEquals("1", rec.get("entityId"));
        assertEquals("测试场景", rec.get("entityName"));
        assertEquals("era", rec.get("entityType"));
        assertEquals(50.0, rec.get("score"));
    }

    @Test
    void testRecommendErasByContext_ExcludeExisting() {
        // Given
        List<Era> userEras = Arrays.asList(testEra);
        when(eraRepository.findAllByUser_Id(testUserId)).thenReturn(userEras);

        // When - 已存在的实体ID应该被排除
        List<Map<String, Object>> result = recommendationService.recommendEntitiesByContext(
            testUserId, "era", Arrays.asList("1"), Collections.emptyMap()
        );

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testRecommendErasByContext_WithWorldId() {
        // Given
        Long worldId = 1L;
        List<Era> worldEras = Arrays.asList(testEra);
        when(eraRepository.findByWorld_Id(worldId)).thenReturn(worldEras);

        Map<String, Object> context = new HashMap<>();
        context.put("worldId", worldId);

        // When
        List<Map<String, Object>> result = recommendationService.recommendEntitiesByContext(
            testUserId, "era", Collections.emptyList(), context
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        Map<String, Object> rec = result.get(0);
        assertEquals(60.0, rec.get("score")); // 世界关联的分数更高
        assertEquals("同一世界中的场景", rec.get("reason"));
    }

    @Test
    void testRecommendCharactersByContext_WithEraId() {
        // Given
        Long eraId = 1L;
        List<Character> eraCharacters = Arrays.asList(testCharacter);
        when(characterRepository.findByEra_Id(eraId)).thenReturn(eraCharacters);
        when(characterRepository.findByUser_Id(testUserId)).thenReturn(Collections.emptyList());

        Map<String, Object> context = new HashMap<>();
        context.put("eraId", eraId);

        // When
        List<Map<String, Object>> result = recommendationService.recommendEntitiesByContext(
            testUserId, "character", Collections.emptyList(), context
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        Map<String, Object> rec = result.get(0);
        assertEquals("场景中的角色", rec.get("reason"));
        assertEquals(70.0, rec.get("score"));
    }

    @Test
    void testRecommendCharactersByContext_WithRelationRecommendation() {
        // Given
        when(characterRepository.findByEra_Id(anyLong())).thenReturn(Collections.emptyList());
        when(characterRepository.findByUser_Id(testUserId)).thenReturn(Collections.emptyList());

        // 模拟关系推荐
        Map<String, Object> relatedEntity = new HashMap<>();
        relatedEntity.put("entityId", "2");
        relatedEntity.put("entityName", "相关角色");
        when(entityRelationService.recommendRelatedEntities(eq("character"), eq("1"), eq(5)))
            .thenReturn(Arrays.asList(relatedEntity));

        // When
        List<Map<String, Object>> result = recommendationService.recommendEntitiesByContext(
            testUserId, "character", Arrays.asList("1"), Collections.emptyMap()
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        Map<String, Object> rec = result.get(0);
        assertEquals("2", rec.get("entityId"));
        assertEquals("关系推荐", rec.get("reason"));
        assertEquals(80.0, rec.get("score")); // 关系推荐的分数最高
    }

    @Test
    void testRecommendEventsByContext_WithEraId() {
        // Given
        Long eraId = 1L;
        List<ScenarioEvent> eraEvents = Arrays.asList(testEvent);
        when(scenarioEventRepository.findByEraIdOrSystem(eraId)).thenReturn(eraEvents);
        when(scenarioEventRepository.findByUser_IdAndIsDeletedFalse(testUserId))
            .thenReturn(Collections.emptyList());

        Map<String, Object> context = new HashMap<>();
        context.put("eraId", eraId);

        // When
        List<Map<String, Object>> result = recommendationService.recommendEntitiesByContext(
            testUserId, "event", Collections.emptyList(), context
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        Map<String, Object> rec = result.get(0);
        assertEquals("场景中的事件", rec.get("reason"));
        assertEquals(70.0, rec.get("score"));
    }

    @Test
    void testRecommendItemsByContext_WithEraId() {
        // Given
        Long eraId = 1L;
        List<ScenarioItem> eraItems = Arrays.asList(testItem);
        when(scenarioItemRepository.findByEraIdOrSystem(eraId)).thenReturn(eraItems);
        when(scenarioItemRepository.findByUser_IdAndIsDeletedFalse(testUserId))
            .thenReturn(Collections.emptyList());

        Map<String, Object> context = new HashMap<>();
        context.put("eraId", eraId);

        // When
        List<Map<String, Object>> result = recommendationService.recommendEntitiesByContext(
            testUserId, "item", Collections.emptyList(), context
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        Map<String, Object> rec = result.get(0);
        assertEquals("场景中的物品", rec.get("reason"));
        assertEquals(70.0, rec.get("score"));
    }

    @Test
    void testRecommendEntitiesByContext_LimitTo10() {
        // Given - 创建11个场景
        List<Era> eras = new ArrayList<>();
        for (int i = 1; i <= 11; i++) {
            Era era = new Era();
            era.setId((long) i);
            era.setName("场景" + i);
            eras.add(era);
        }
        when(eraRepository.findAllByUser_Id(testUserId)).thenReturn(eras);

        // When
        List<Map<String, Object>> result = recommendationService.recommendEntitiesByContext(
            testUserId, "era", Collections.emptyList(), Collections.emptyMap()
        );

        // Then
        assertNotNull(result);
        assertEquals(10, result.size()); // 应该限制为10个
    }

    // ========== 关系自动识别测试 ==========

    @Test
    void testAutoDetectRelations_EmptyEntities() {
        // When
        List<Map<String, Object>> result = recommendationService.autoDetectRelations(
            Collections.emptyList(), Collections.emptyMap()
        );

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testAutoDetectRelations_CharacterToCharacter_SameEra() {
        // Given
        Map<String, Object> char1 = new HashMap<>();
        char1.put("entityId", "1");
        char1.put("entityType", "character");
        char1.put("eraId", "100");

        Map<String, Object> char2 = new HashMap<>();
        char2.put("entityId", "2");
        char2.put("entityType", "character");
        char2.put("eraId", "100");

        List<Map<String, Object>> entities = Arrays.asList(char1, char2);

        // When
        List<Map<String, Object>> result = recommendationService.autoDetectRelations(
            entities, Collections.emptyMap()
        );

        // Then
        assertNotNull(result);
        assertEquals(3, result.size()); // 2个角色-场景关系 + 1个角色-角色关系

        // 检查角色-角色关系
        Optional<Map<String, Object>> charRelation = result.stream()
            .filter(r -> "FRIEND".equals(r.get("relationType")))
            .findFirst();
        assertTrue(charRelation.isPresent());
        Map<String, Object> relation = charRelation.get();
        assertEquals("character", relation.get("sourceEntityType"));
        assertEquals("1", relation.get("sourceEntityId"));
        assertEquals("character", relation.get("targetEntityType"));
        assertEquals("2", relation.get("targetEntityId"));
        assertEquals(60.0, relation.get("confidence"));
    }

    @Test
    void testAutoDetectRelations_CharacterToEra() {
        // Given
        Map<String, Object> character = new HashMap<>();
        character.put("entityId", "1");
        character.put("entityType", "character");
        character.put("eraId", "100");

        List<Map<String, Object>> entities = Arrays.asList(character);

        // When
        List<Map<String, Object>> result = recommendationService.autoDetectRelations(
            entities, Collections.emptyMap()
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());

        Map<String, Object> relation = result.get(0);
        assertEquals("character", relation.get("sourceEntityType"));
        assertEquals("1", relation.get("sourceEntityId"));
        assertEquals("era", relation.get("targetEntityType"));
        assertEquals("100", relation.get("targetEntityId"));
        assertEquals("LOCATED_IN", relation.get("relationType"));
        assertEquals(90.0, relation.get("confidence"));
    }

    @Test
    void testAutoDetectRelations_EventToEra() {
        // Given
        Map<String, Object> event = new HashMap<>();
        event.put("entityId", "1");
        event.put("entityType", "event");
        event.put("eraId", "100");

        List<Map<String, Object>> entities = Arrays.asList(event);

        // When
        List<Map<String, Object>> result = recommendationService.autoDetectRelations(
            entities, Collections.emptyMap()
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());

        Map<String, Object> relation = result.get(0);
        assertEquals("event", relation.get("sourceEntityType"));
        assertEquals("LOCATED_IN", relation.get("relationType"));
        assertEquals(90.0, relation.get("confidence"));
    }

    @Test
    void testAutoDetectRelations_ItemToEra() {
        // Given
        Map<String, Object> item = new HashMap<>();
        item.put("entityId", "1");
        item.put("entityType", "item");
        item.put("eraId", "100");

        List<Map<String, Object>> entities = Arrays.asList(item);

        // When
        List<Map<String, Object>> result = recommendationService.autoDetectRelations(
            entities, Collections.emptyMap()
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());

        Map<String, Object> relation = result.get(0);
        assertEquals("item", relation.get("sourceEntityType"));
        assertEquals("LOCATED_IN", relation.get("relationType"));
        assertEquals(90.0, relation.get("confidence"));
    }

    @Test
    void testAutoDetectRelations_SortedByConfidence() {
        // Given - 创建不同置信度的关系
        Map<String, Object> char1 = new HashMap<>();
        char1.put("entityId", "1");
        char1.put("entityType", "character");
        char1.put("eraId", "100");

        Map<String, Object> char2 = new HashMap<>();
        char2.put("entityId", "2");
        char2.put("entityType", "character");
        char2.put("eraId", "100");

        List<Map<String, Object>> entities = Arrays.asList(char1, char2);

        // When
        List<Map<String, Object>> result = recommendationService.autoDetectRelations(
            entities, Collections.emptyMap()
        );

        // Then - 应该按置信度降序排序
        assertNotNull(result);
        assertTrue(result.size() >= 2);
        double prevConfidence = Double.MAX_VALUE;
        for (Map<String, Object> relation : result) {
            double confidence = ((Number) relation.get("confidence")).doubleValue();
            assertTrue(confidence <= prevConfidence, "关系应该按置信度降序排序");
            prevConfidence = confidence;
        }
    }

    // ========== 流程优化建议测试 ==========

    @Test
    void testSuggestOptimizations_EmptyGraph() {
        // When
        List<Map<String, Object>> result = recommendationService.suggestOptimizations(
            Collections.emptyList(), Collections.emptyList()
        );

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testSuggestOptimizations_IsolatedNode() {
        // Given
        Map<String, Object> isolatedNode = new HashMap<>();
        isolatedNode.put("nodeId", "node1");
        isolatedNode.put("nodeType", "dialogue");

        List<Map<String, Object>> nodes = Arrays.asList(isolatedNode);
        List<Map<String, Object>> edges = Collections.emptyList();

        // When
        List<Map<String, Object>> result = recommendationService.suggestOptimizations(nodes, edges);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        Map<String, Object> suggestion = result.get(0);
        assertEquals("ISOLATED_NODE", suggestion.get("type"));
        assertEquals("warning", suggestion.get("severity"));
        assertEquals("node1", suggestion.get("nodeId"));
    }

    @Test
    void testSuggestOptimizations_IsolatedStartNode_ShouldNotReport() {
        // Given - 开始节点可以是孤立的
        Map<String, Object> startNode = new HashMap<>();
        startNode.put("nodeId", "start1");
        startNode.put("nodeType", "start");

        List<Map<String, Object>> nodes = Arrays.asList(startNode);
        List<Map<String, Object>> edges = Collections.emptyList();

        // When
        List<Map<String, Object>> result = recommendationService.suggestOptimizations(nodes, edges);

        // Then
        assertNotNull(result);
        // 开始节点不应该被报告为孤立节点
        assertTrue(result.stream().noneMatch(s -> "ISOLATED_NODE".equals(s.get("type"))));
    }

    @Test
    void testSuggestOptimizations_SelfLoop() {
        // Given
        Map<String, Object> node = new HashMap<>();
        node.put("nodeId", "node1");
        node.put("nodeType", "dialogue");

        Map<String, Object> edge = new HashMap<>();
        edge.put("sourceNodeId", "node1");
        edge.put("targetNodeId", "node1");

        List<Map<String, Object>> nodes = Arrays.asList(node);
        List<Map<String, Object>> edges = Arrays.asList(edge);

        // When
        List<Map<String, Object>> result = recommendationService.suggestOptimizations(nodes, edges);

        // Then
        assertNotNull(result);
        Optional<Map<String, Object>> suggestion = result.stream()
            .filter(s -> "SELF_LOOP".equals(s.get("type")))
            .findFirst();
        assertTrue(suggestion.isPresent());
        assertEquals("warning", suggestion.get().get("severity"));
        assertEquals("node1", suggestion.get().get("nodeId"));
    }

    @Test
    void testSuggestOptimizations_UndefinedNode() {
        // Given
        Map<String, Object> node = new HashMap<>();
        node.put("nodeId", "node1");
        node.put("nodeType", "dialogue");

        Map<String, Object> edge = new HashMap<>();
        edge.put("sourceNodeId", "node1");
        edge.put("targetNodeId", "undefined_node");

        List<Map<String, Object>> nodes = Arrays.asList(node);
        List<Map<String, Object>> edges = Arrays.asList(edge);

        // When
        List<Map<String, Object>> result = recommendationService.suggestOptimizations(nodes, edges);

        // Then
        assertNotNull(result);
        Optional<Map<String, Object>> suggestion = result.stream()
            .filter(s -> "UNDEFINED_NODE".equals(s.get("type")) && "undefined_node".equals(s.get("nodeId")))
            .findFirst();
        assertTrue(suggestion.isPresent());
        assertEquals("error", suggestion.get().get("severity"));
    }

    @Test
    void testSuggestOptimizations_MultipleStartNodes() {
        // Given
        Map<String, Object> start1 = new HashMap<>();
        start1.put("nodeId", "start1");
        start1.put("nodeType", "start");

        Map<String, Object> start2 = new HashMap<>();
        start2.put("nodeId", "start2");
        start2.put("nodeType", "start");

        List<Map<String, Object>> nodes = Arrays.asList(start1, start2);
        List<Map<String, Object>> edges = Collections.emptyList();

        // When
        List<Map<String, Object>> result = recommendationService.suggestOptimizations(nodes, edges);

        // Then
        assertNotNull(result);
        Optional<Map<String, Object>> suggestion = result.stream()
            .filter(s -> "MULTIPLE_START".equals(s.get("type")))
            .findFirst();
        assertTrue(suggestion.isPresent());
        assertEquals("warning", suggestion.get().get("severity"));
    }

    @Test
    void testSuggestOptimizations_NoEndNode() {
        // Given
        Map<String, Object> node = new HashMap<>();
        node.put("nodeId", "node1");
        node.put("nodeType", "dialogue");

        List<Map<String, Object>> nodes = Arrays.asList(node);
        List<Map<String, Object>> edges = Collections.emptyList();

        // When
        List<Map<String, Object>> result = recommendationService.suggestOptimizations(nodes, edges);

        // Then
        assertNotNull(result);
        Optional<Map<String, Object>> suggestion = result.stream()
            .filter(s -> "NO_END_NODE".equals(s.get("type")))
            .findFirst();
        assertTrue(suggestion.isPresent());
        assertEquals("warning", suggestion.get().get("severity"));
    }

    @Test
    void testSuggestOptimizations_IncompleteEraNodeConfig() {
        // Given
        Map<String, Object> config = new HashMap<>();
        // 缺少 eraId

        Map<String, Object> node = new HashMap<>();
        node.put("nodeId", "era1");
        node.put("nodeType", "era");
        node.put("config", config);

        List<Map<String, Object>> nodes = Arrays.asList(node);
        List<Map<String, Object>> edges = Collections.emptyList();

        // When
        List<Map<String, Object>> result = recommendationService.suggestOptimizations(nodes, edges);

        // Then
        assertNotNull(result);
        Optional<Map<String, Object>> suggestion = result.stream()
            .filter(s -> "INCOMPLETE_CONFIG".equals(s.get("type")) && "era1".equals(s.get("nodeId")))
            .findFirst();
        assertTrue(suggestion.isPresent());
        assertEquals("warning", suggestion.get().get("severity"));
    }

    @Test
    void testSuggestOptimizations_IncompleteCharacterNodeConfig() {
        // Given
        Map<String, Object> config = new HashMap<>();
        // 缺少 characterId

        Map<String, Object> node = new HashMap<>();
        node.put("nodeId", "char1");
        node.put("nodeType", "character");
        node.put("config", config);

        List<Map<String, Object>> nodes = Arrays.asList(node);
        List<Map<String, Object>> edges = Collections.emptyList();

        // When
        List<Map<String, Object>> result = recommendationService.suggestOptimizations(nodes, edges);

        // Then
        assertNotNull(result);
        Optional<Map<String, Object>> suggestion = result.stream()
            .filter(s -> "INCOMPLETE_CONFIG".equals(s.get("type")) && "char1".equals(s.get("nodeId")))
            .findFirst();
        assertTrue(suggestion.isPresent());
    }

    @Test
    void testSuggestOptimizations_IncompleteEntityRelationNodeConfig() {
        // Given
        Map<String, Object> config = new HashMap<>();
        // 缺少 sourceEntityId 或 targetEntityId

        Map<String, Object> node = new HashMap<>();
        node.put("nodeId", "rel1");
        node.put("nodeType", "entity_relation");
        node.put("config", config);

        List<Map<String, Object>> nodes = Arrays.asList(node);
        List<Map<String, Object>> edges = Collections.emptyList();

        // When
        List<Map<String, Object>> result = recommendationService.suggestOptimizations(nodes, edges);

        // Then
        assertNotNull(result);
        Optional<Map<String, Object>> suggestion = result.stream()
            .filter(s -> "INCOMPLETE_CONFIG".equals(s.get("type")) && "rel1".equals(s.get("nodeId")))
            .findFirst();
        assertTrue(suggestion.isPresent());
        assertEquals("error", suggestion.get().get("severity")); // 实体关联节点配置不完整是错误级别
    }

    @Test
    void testSuggestOptimizations_CompleteEntityRelationNode_NoSuggestion() {
        // Given
        Map<String, Object> config = new HashMap<>();
        config.put("sourceEntityId", "source1");
        config.put("targetEntityId", "target1");

        Map<String, Object> node = new HashMap<>();
        node.put("nodeId", "rel1");
        node.put("nodeType", "entity_relation");
        node.put("config", config);

        List<Map<String, Object>> nodes = Arrays.asList(node);
        List<Map<String, Object>> edges = Collections.emptyList();

        // When
        List<Map<String, Object>> result = recommendationService.suggestOptimizations(nodes, edges);

        // Then
        assertNotNull(result);
        // 配置完整的实体关联节点不应该有配置不完整的建议
        assertTrue(result.stream().noneMatch(s ->
            "INCOMPLETE_CONFIG".equals(s.get("type")) && "rel1".equals(s.get("nodeId"))
        ));
    }

    // ========== 边界情况测试 ==========

    @Test
    void testRecommendEntitiesByContext_NullUserId() {
        // When
        List<Map<String, Object>> result = recommendationService.recommendEntitiesByContext(
            null, "era", Collections.emptyList(), Collections.emptyMap()
        );

        // Then - 应该处理null而不抛出异常
        assertNotNull(result);
    }

    @Test
    void testRecommendEntitiesByContext_NullExistingIds() {
        // Given
        when(eraRepository.findAllByUser_Id(anyLong())).thenReturn(Collections.emptyList());

        // When
        List<Map<String, Object>> result = recommendationService.recommendEntitiesByContext(
            testUserId, "era", null, Collections.emptyMap()
        );

        // Then
        assertNotNull(result);
    }

    @Test
    void testAutoDetectRelations_NullEntities() {
        // When
        List<Map<String, Object>> result = recommendationService.autoDetectRelations(
            null, Collections.emptyMap()
        );

        // Then - 应该处理null而不抛出异常
        assertNotNull(result);
    }

    @Test
    void testSuggestOptimizations_NullNodes() {
        // When
        List<Map<String, Object>> result = recommendationService.suggestOptimizations(
            null, Collections.emptyList()
        );

        // Then - 应该处理null而不抛出异常
        assertNotNull(result);
    }

    @Test
    void testSuggestOptimizations_NullEdges() {
        // Given
        Map<String, Object> node = new HashMap<>();
        node.put("nodeId", "node1");
        node.put("nodeType", "dialogue");

        // When
        List<Map<String, Object>> result = recommendationService.suggestOptimizations(
            Arrays.asList(node), null
        );

        // Then - 应该处理null而不抛出异常
        assertNotNull(result);
    }
}
