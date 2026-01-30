package com.heartsphere.capability.service.integration;

import com.heartsphere.capability.entity.CapabilitySynergyLog;
import com.heartsphere.capability.repository.CapabilitySynergyLogRepository;
import com.heartsphere.capability.service.growth.CapabilityExperienceService;
import com.heartsphere.memory.service.CharacterCompanionshipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
 * 能力协同引擎测试
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@ExtendWith(MockitoExtension.class)
class CapabilitySynergyEngineTest {
    
    @Mock
    private CapabilitySynergyLogRepository synergyLogRepository;
    
    @Mock
    private CapabilityExperienceService experienceService;
    
    @Mock
    private CharacterCompanionshipService companionshipService;
    
    @InjectMocks
    private CapabilitySynergyEngine synergyEngine;
    
    private Long characterId;
    private Long userId;
    private Long skillId;
    
    @BeforeEach
    void setUp() {
        characterId = 1L;
        userId = 100L;
        skillId = 10L;
    }
    
    @Test
    void testProcessSkillMemorySynergy_Success() {
        // 执行协同
        synergyEngine.processSkillMemorySynergy(characterId, skillId, true);
        
        // 验证经验值增加
        verify(experienceService, times(1)).addSkillExperience(characterId, 5);
        verify(experienceService, times(1)).addMemoryExperience(characterId, 3);
        
        // 验证协同日志记录
        ArgumentCaptor<CapabilitySynergyLog> logCaptor = ArgumentCaptor.forClass(CapabilitySynergyLog.class);
        verify(synergyLogRepository, times(1)).save(logCaptor.capture());
        
        CapabilitySynergyLog log = logCaptor.getValue();
        assertEquals(characterId, log.getCharacterId());
        assertEquals("SKILL_MEMORY", log.getSynergyType());
        assertEquals("SKILL", log.getSourceDimension());
        assertEquals("MEMORY", log.getTargetDimension());
        assertEquals(0.7, log.getSynergyEffect().doubleValue(), 0.01);
    }
    
    @Test
    void testProcessSkillMemorySynergy_Failure() {
        // 执行协同（失败情况）
        synergyEngine.processSkillMemorySynergy(characterId, skillId, false);
        
        // 验证经验值未增加
        verify(experienceService, never()).addSkillExperience(any(), anyInt());
        verify(experienceService, never()).addMemoryExperience(any(), anyInt());
        
        // 验证未记录协同日志
        verify(synergyLogRepository, never()).save(any());
    }
    
    @Test
    void testProcessRelationshipSkillSynergy_MentorMode() {
        // 准备关系信息（导师模式）
        Map<String, Object> relationshipInfo = new HashMap<>();
        relationshipInfo.put("currentStage", "MENTOR");
        
        when(companionshipService.getRelationshipInfo(characterId, userId))
            .thenReturn(relationshipInfo);
        when(synergyLogRepository.save(any(CapabilitySynergyLog.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行协同（指导技能）
        synergyEngine.processRelationshipSkillSynergy(characterId, userId, skillId, "guidance");
        
        // 验证经验值增加
        verify(experienceService, times(1)).addMentorshipExperience(characterId, 10);
        verify(experienceService, times(1)).addRelationshipExperience(characterId, 5);
        
        // 验证协同日志记录
        ArgumentCaptor<CapabilitySynergyLog> logCaptor = ArgumentCaptor.forClass(CapabilitySynergyLog.class);
        verify(synergyLogRepository, times(1)).save(logCaptor.capture());
        
        CapabilitySynergyLog log = logCaptor.getValue();
        assertEquals("RELATIONSHIP_SKILL", log.getSynergyType());
        assertEquals(0.8, log.getSynergyEffect().doubleValue(), 0.01);
    }
    
    @Test
    void testProcessRelationshipSkillSynergy_CloseFriendMode() {
        // 准备关系信息（挚友模式）
        Map<String, Object> relationshipInfo = new HashMap<>();
        relationshipInfo.put("currentStage", "CLOSE_FRIEND");
        
        when(companionshipService.getRelationshipInfo(characterId, userId))
            .thenReturn(relationshipInfo);
        when(synergyLogRepository.save(any(CapabilitySynergyLog.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行协同（情感技能）
        synergyEngine.processRelationshipSkillSynergy(characterId, userId, skillId, "emotional");
        
        // 验证经验值增加
        verify(experienceService, times(1)).addCompanionshipExperience(characterId, 10);
        verify(experienceService, times(1)).addRelationshipExperience(characterId, 5);
        
        // 验证协同日志记录
        verify(synergyLogRepository, times(1)).save(any(CapabilitySynergyLog.class));
    }
    
    @Test
    void testProcessRelationshipSkillSynergy_NoMatch() {
        // 准备关系信息（陌生人）
        Map<String, Object> relationshipInfo = new HashMap<>();
        relationshipInfo.put("currentStage", "STRANGER");
        
        when(companionshipService.getRelationshipInfo(characterId, userId))
            .thenReturn(relationshipInfo);
        
        // 执行协同（不匹配的技能类型）
        synergyEngine.processRelationshipSkillSynergy(characterId, userId, skillId, "other");
        
        // 验证经验值未增加
        verify(experienceService, never()).addMentorshipExperience(any(), anyInt());
        verify(experienceService, never()).addCompanionshipExperience(any(), anyInt());
        verify(experienceService, never()).addRelationshipExperience(any(), anyInt());
        
        // 验证未记录协同日志
        verify(synergyLogRepository, never()).save(any());
    }
    
    @Test
    void testProcessRelationshipMemorySynergy_DeepRelationship() {
        // 准备关系信息（深度关系）
        Map<String, Object> relationshipInfo = new HashMap<>();
        relationshipInfo.put("currentStage", "CLOSE_FRIEND");
        
        when(companionshipService.getRelationshipInfo(characterId, userId))
            .thenReturn(relationshipInfo);
        when(synergyLogRepository.save(any(CapabilitySynergyLog.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行协同
        synergyEngine.processRelationshipMemorySynergy(characterId, userId);
        
        // 验证经验值增加
        verify(experienceService, times(1)).addMemoryExperience(characterId, 2);
        verify(experienceService, times(1)).addRelationshipExperience(characterId, 2);
        
        // 验证协同日志记录
        ArgumentCaptor<CapabilitySynergyLog> logCaptor = ArgumentCaptor.forClass(CapabilitySynergyLog.class);
        verify(synergyLogRepository, times(1)).save(logCaptor.capture());
        
        CapabilitySynergyLog log = logCaptor.getValue();
        assertEquals("RELATIONSHIP_MEMORY", log.getSynergyType());
        assertEquals(0.6, log.getSynergyEffect().doubleValue(), 0.01);
    }
    
    @Test
    void testProcessRelationshipConsciousnessSynergy_DeepRelationship() {
        // 准备关系信息（导师关系）
        Map<String, Object> relationshipInfo = new HashMap<>();
        relationshipInfo.put("currentStage", "MENTOR");
        
        when(companionshipService.getRelationshipInfo(characterId, userId))
            .thenReturn(relationshipInfo);
        when(synergyLogRepository.save(any(CapabilitySynergyLog.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行协同
        synergyEngine.processRelationshipConsciousnessSynergy(characterId, userId);
        
        // 验证经验值增加
        verify(experienceService, times(1)).addConsciousnessExperience(characterId, 3);
        verify(experienceService, times(1)).addRelationshipExperience(characterId, 2);
        
        // 验证协同日志记录
        ArgumentCaptor<CapabilitySynergyLog> logCaptor = ArgumentCaptor.forClass(CapabilitySynergyLog.class);
        verify(synergyLogRepository, times(1)).save(logCaptor.capture());
        
        CapabilitySynergyLog log = logCaptor.getValue();
        assertEquals("RELATIONSHIP_CONSCIOUSNESS", log.getSynergyType());
        assertEquals(0.7, log.getSynergyEffect().doubleValue(), 0.01);
    }
    
    @Test
    void testProcessRelationshipSkillSynergy_ExceptionHandling() {
        // Mock 服务抛出异常
        when(companionshipService.getRelationshipInfo(characterId, userId))
            .thenThrow(new RuntimeException("Service error"));
        
        // 执行协同（应该不抛出异常，而是静默处理）
        assertDoesNotThrow(() -> {
            synergyEngine.processRelationshipSkillSynergy(characterId, userId, skillId, "guidance");
        });
        
        // 验证未记录协同日志
        verify(synergyLogRepository, never()).save(any());
    }
}
