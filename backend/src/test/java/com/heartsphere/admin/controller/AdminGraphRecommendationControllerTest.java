package com.heartsphere.admin.controller;

import com.heartsphere.aiagent.service.GraphRecommendationService;
import com.heartsphere.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * AdminGraphRecommendationController 集成测试
 */
@WebMvcTest(AdminGraphRecommendationController.class)
class AdminGraphRecommendationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GraphRecommendationService recommendationService;

    private String validToken;

    @BeforeEach
    void setUp() {
        // 注意：这里需要实际的token验证逻辑，可能需要mock BaseAdminController
        // 为了简化测试，我们假设token验证通过
        validToken = "valid_token";
    }

    @Test
    void testRecommendEntities_Success() throws Exception {
        // Given
        Map<String, Object> recommendation = new HashMap<>();
        recommendation.put("entityId", "1");
        recommendation.put("entityName", "测试实体");
        recommendation.put("entityType", "character");
        recommendation.put("score", 70.0);

        when(recommendationService.recommendEntitiesByContext(
            anyLong(), anyString(), anyList(), anyMap()
        )).thenReturn(Arrays.asList(recommendation));

        Map<String, Object> request = new HashMap<>();
        request.put("entityType", "character");
        request.put("existingEntityIds", Collections.emptyList());
        request.put("context", Collections.emptyMap());

        // When & Then
        mockMvc.perform(post("/api/admin/graph/recommendations/entities")
                .header("Authorization", "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"entityType\":\"character\",\"existingEntityIds\":[],\"context\":{}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].entityId").value("1"))
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void testRecommendEntities_EmptyResult() throws Exception {
        // Given
        when(recommendationService.recommendEntitiesByContext(
            anyLong(), anyString(), anyList(), anyMap()
        )).thenReturn(Collections.emptyList());

        // When & Then
        mockMvc.perform(post("/api/admin/graph/recommendations/entities")
                .header("Authorization", "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"entityType\":\"character\",\"existingEntityIds\":[],\"context\":{}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void testAutoDetectRelations_Success() throws Exception {
        // Given
        Map<String, Object> relation = new HashMap<>();
        relation.put("sourceEntityType", "character");
        relation.put("sourceEntityId", "1");
        relation.put("targetEntityType", "character");
        relation.put("targetEntityId", "2");
        relation.put("relationType", "FRIEND");
        relation.put("confidence", 60.0);

        when(recommendationService.autoDetectRelations(anyList(), anyMap()))
            .thenReturn(Arrays.asList(relation));

        // When & Then
        mockMvc.perform(post("/api/admin/graph/recommendations/relations")
                .header("Authorization", "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"entities\":[],\"context\":{}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].relationType").value("FRIEND"))
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void testSuggestOptimizations_Success() throws Exception {
        // Given
        Map<String, Object> suggestion = new HashMap<>();
        suggestion.put("type", "ISOLATED_NODE");
        suggestion.put("severity", "warning");
        suggestion.put("nodeId", "node1");
        suggestion.put("message", "节点 node1 没有连接到其他节点");
        suggestion.put("suggestion", "考虑将该节点连接到流程中，或删除未使用的节点");

        when(recommendationService.suggestOptimizations(anyList(), anyList()))
            .thenReturn(Arrays.asList(suggestion));

        // When & Then
        mockMvc.perform(post("/api/admin/graph/recommendations/optimizations")
                .header("Authorization", "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nodes\":[],\"edges\":[]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].type").value("ISOLATED_NODE"))
                .andExpect(jsonPath("$.items[0].severity").value("warning"))
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void testRecommendEntities_Unauthorized() throws Exception {
        // When & Then - 没有token应该返回401
        mockMvc.perform(post("/api/admin/graph/recommendations/entities")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"entityType\":\"character\",\"existingEntityIds\":[],\"context\":{}}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testAutoDetectRelations_Unauthorized() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/admin/graph/recommendations/relations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"entities\":[],\"context\":{}}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testSuggestOptimizations_Unauthorized() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/admin/graph/recommendations/optimizations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nodes\":[],\"edges\":[]}"))
                .andExpect(status().isUnauthorized());
    }
}
