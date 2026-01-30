package com.heartsphere.capability.service.integration;

import com.heartsphere.capability.entity.RoleCapabilityProfile;
import com.heartsphere.capability.repository.RoleCapabilityProfileRepository;
import com.heartsphere.memory.service.CharacterCompanionshipService;
import com.heartsphere.memory.service.CharacterMentorshipService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * 关系能力整合服务测试
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@ExtendWith(MockitoExtension.class)
class RelationshipCapabilityIntegrationServiceTest {
    
    @Mock
    private CharacterMentorshipService mentorshipService;
    
    @Mock
    private CharacterCompanionshipService companionshipService;
    
    @Mock
    private RoleCapabilityProfileRepository profileRepository;
    
    @InjectMocks
    private RelationshipCapabilityIntegrationService integrationService;
    
    private Long characterId;
    private Long userId;
    
    @BeforeEach
    void setUp() {
        characterId = 1L;
        userId = 100L;
    }
    
    @Test
    void testIntegrateRelationshipCapability_NewProfile() {
        // 准备测试数据
        Map<String, Object> mentorshipAssessment = new HashMap<>();
        mentorshipAssessment.put("totalScore", 80);
        
        Map<String, Object> companionshipInfo = new HashMap<>();
        companionshipInfo.put("currentStage", "CLOSE_FRIEND");
        
        when(mentorshipService.evaluateMentorshipCapabilities(characterId))
            .thenReturn(mentorshipAssessment);
        when(companionshipService.getRelationshipInfo(characterId, userId))
            .thenReturn(companionshipInfo);
        when(profileRepository.findByCharacterId(characterId))
            .thenReturn(Optional.empty());
        when(profileRepository.save(any(RoleCapabilityProfile.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行测试
        RelationshipCapabilityIntegrationService.RelationshipCapabilityDTO result = 
            integrationService.integrateRelationshipCapability(characterId, userId);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(characterId, result.getCharacterId());
        assertEquals(80, result.getMentorshipScore());
        assertTrue(result.getCompanionshipScore() > 0);
        assertTrue(result.getRelationshipScore() > 0);
        
        // 验证方法调用
        verify(mentorshipService).evaluateMentorshipCapabilities(characterId);
        verify(companionshipService).getRelationshipInfo(characterId, userId);
        verify(profileRepository).save(any(RoleCapabilityProfile.class));
    }
    
    @Test
    void testIntegrateRelationshipCapability_ExistingProfile() {
        // 准备测试数据
        Map<String, Object> mentorshipAssessment = new HashMap<>();
        mentorshipAssessment.put("totalScore", 75);
        
        Map<String, Object> companionshipInfo = new HashMap<>();
        companionshipInfo.put("currentStage", "FRIEND");
        
        RoleCapabilityProfile existingProfile = RoleCapabilityProfile.builder()
            .id(1L)
            .characterId(characterId)
            .skillDimensionScore(50)
            .memoryDimensionScore(50)
            .consciousnessDimensionScore(50)
            .collaborationDimensionScore(50)
            .relationshipDimensionScore(0)
            .build();
        
        when(mentorshipService.evaluateMentorshipCapabilities(characterId))
            .thenReturn(mentorshipAssessment);
        when(companionshipService.getRelationshipInfo(characterId, userId))
            .thenReturn(companionshipInfo);
        when(profileRepository.findByCharacterId(characterId))
            .thenReturn(Optional.of(existingProfile));
        when(profileRepository.save(any(RoleCapabilityProfile.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行测试
        RelationshipCapabilityIntegrationService.RelationshipCapabilityDTO result = 
            integrationService.integrateRelationshipCapability(characterId, userId);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(characterId, result.getCharacterId());
        assertEquals(75, result.getMentorshipScore());
        
        // 验证档案已更新
        verify(profileRepository).save(any(RoleCapabilityProfile.class));
    }
}
