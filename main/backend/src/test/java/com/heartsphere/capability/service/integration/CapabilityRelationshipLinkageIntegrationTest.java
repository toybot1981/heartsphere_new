package com.heartsphere.capability.service.integration;

import com.heartsphere.capability.service.growth.CapabilityLevelService;
import com.heartsphere.capability.service.growth.CapabilityRelationshipLinkageService;
import com.heartsphere.capability.service.growth.RelationshipCapabilityGrowthService;
import com.heartsphere.memory.service.CharacterCompanionshipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * 能力-关系联动集成测试
 * 测试能力成长与关系发展之间的双向促进机制
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@ExtendWith(MockitoExtension.class)
class CapabilityRelationshipLinkageIntegrationTest {
    
    @Mock
    private CapabilityLevelService levelService;
    
    @Mock
    private RelationshipCapabilityGrowthService growthService;
    
    @Mock
    private CharacterCompanionshipService companionshipService;
    
    @InjectMocks
    private CapabilityRelationshipLinkageService linkageService;
    
    private Long characterId;
    private Long userId;
    
    @BeforeEach
    void setUp() {
        characterId = 1L;
        userId = 100L;
    }
    
    @Test
    void testAdjustExperienceByRelationshipStage_CloseFriend() {
        // 准备关系信息（挚友阶段）
        Map<String, Object> relationshipInfo = new HashMap<>();
        relationshipInfo.put("currentStage", "CLOSE_FRIEND");
        
        when(companionshipService.getRelationshipInfo(characterId, userId))
            .thenReturn(relationshipInfo);
        when(growthService.adjustExperienceByRelationshipStage(eq(characterId), eq("CLOSE_FRIEND"), anyLong()))
            .thenReturn(120L); // +20% 加成
        
        // 执行经验值调整
        long baseExperience = 100L;
        long adjustedExperience = linkageService.adjustExperienceByRelationshipStage(characterId, userId, baseExperience);
        
        // 验证经验值已调整
        assertEquals(120L, adjustedExperience);
        verify(growthService, times(1)).adjustExperienceByRelationshipStage(
            eq(characterId), eq("CLOSE_FRIEND"), eq(baseExperience));
    }
    
    @Test
    void testAdjustExperienceByRelationshipStage_Mentor() {
        // 准备关系信息（导师阶段）
        Map<String, Object> relationshipInfo = new HashMap<>();
        relationshipInfo.put("currentStage", "MENTOR");
        
        when(companionshipService.getRelationshipInfo(characterId, userId))
            .thenReturn(relationshipInfo);
        when(growthService.adjustExperienceByRelationshipStage(eq(characterId), eq("MENTOR"), anyLong()))
            .thenReturn(120L); // +20% 加成
        
        // 执行经验值调整
        long baseExperience = 100L;
        long adjustedExperience = linkageService.adjustExperienceByRelationshipStage(characterId, userId, baseExperience);
        
        // 验证经验值已调整
        assertEquals(120L, adjustedExperience);
        verify(growthService, times(1)).adjustExperienceByRelationshipStage(
            eq(characterId), eq("MENTOR"), eq(baseExperience));
    }
    
    @Test
    void testGetCurrentRelationshipStage() {
        // 准备关系信息
        Map<String, Object> relationshipInfo = new HashMap<>();
        relationshipInfo.put("currentStage", "CLOSE_FRIEND");
        
        when(companionshipService.getRelationshipInfo(characterId, userId))
            .thenReturn(relationshipInfo);
        
        // 执行获取关系阶段
        String stage = linkageService.getCurrentRelationshipStage(characterId, userId);
        
        // 验证结果
        assertEquals("CLOSE_FRIEND", stage);
        verify(companionshipService, times(1)).getRelationshipInfo(characterId, userId);
    }
}
