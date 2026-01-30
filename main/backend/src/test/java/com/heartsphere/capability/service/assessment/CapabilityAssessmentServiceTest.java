package com.heartsphere.capability.service.assessment;

import com.heartsphere.capability.entity.CapabilityAssessment;
import com.heartsphere.capability.entity.RoleCapabilityProfile;
import com.heartsphere.capability.repository.CapabilityAssessmentRepository;
import com.heartsphere.capability.repository.RoleCapabilityProfileRepository;
import com.heartsphere.capability.service.integration.RoleCapabilityModelService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * 能力评估服务测试
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@ExtendWith(MockitoExtension.class)
class CapabilityAssessmentServiceTest {
    
    @Mock
    private CapabilityAssessmentRepository assessmentRepository;
    
    @Mock
    private RoleCapabilityProfileRepository profileRepository;
    
    @Mock
    private RoleCapabilityModelService capabilityModelService;
    
    @Mock
    private RelationshipCapabilityAssessmentService relationshipAssessmentService;
    
    @InjectMocks
    private CapabilityAssessmentService assessmentService;
    
    private Long characterId;
    private Long userId;
    private RoleCapabilityProfile profile;
    
    @BeforeEach
    void setUp() {
        characterId = 1L;
        userId = 100L;
        
        // 创建测试能力档案
        profile = RoleCapabilityProfile.builder()
            .characterId(characterId)
            .skillDimensionScore(70)
            .memoryDimensionScore(65)
            .consciousnessDimensionScore(60)
            .collaborationDimensionScore(75)
            .relationshipDimensionScore(0) // 初始为0，将通过评估更新
            .overallScore(0)
            .build();
    }
    
    @Test
    void testAssessAllCapabilities_Success() {
        // 准备关系能力评估结果
        RelationshipCapabilityAssessmentService.RelationshipCapabilityAssessmentDTO relationshipAssessment =
            RelationshipCapabilityAssessmentService.RelationshipCapabilityAssessmentDTO.builder()
                .relationshipScore(80)
                .mentorshipScore(75)
                .companionshipScore(85)
                .build();
        
        // Mock 服务调用
        when(capabilityModelService.getOrCreateProfile(characterId)).thenReturn(profile);
        when(relationshipAssessmentService.assessRelationshipCapability(characterId, userId))
            .thenReturn(relationshipAssessment);
        when(assessmentRepository.save(any(CapabilityAssessment.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        when(profileRepository.save(any(RoleCapabilityProfile.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行评估
        CapabilityAssessmentService.FullCapabilityAssessmentDTO result = 
            assessmentService.assessAllCapabilities(characterId, userId);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(characterId, result.getCharacterId());
        assertEquals(70, result.getSkillScore());
        assertEquals(65, result.getMemoryScore());
        assertEquals(60, result.getConsciousnessScore());
        assertEquals(75, result.getCollaborationScore());
        assertEquals(80, result.getRelationshipScore());
        assertEquals(75, result.getMentorshipScore());
        assertEquals(85, result.getCompanionshipScore());
        
        // 验证综合得分计算（5个维度平均分）
        int expectedOverall = (70 + 65 + 60 + 75 + 80) / 5; // 70
        assertEquals(expectedOverall, result.getOverallScore());
        
        // 验证服务调用
        verify(capabilityModelService, times(1)).getOrCreateProfile(characterId);
        verify(relationshipAssessmentService, times(1))
            .assessRelationshipCapability(characterId, userId);
        verify(assessmentRepository, times(1)).save(any(CapabilityAssessment.class));
        verify(profileRepository, times(1)).save(any(RoleCapabilityProfile.class));
    }
    
    @Test
    void testAssessAllCapabilities_UpdatesProfile() {
        // 准备关系能力评估结果
        RelationshipCapabilityAssessmentService.RelationshipCapabilityAssessmentDTO relationshipAssessment =
            RelationshipCapabilityAssessmentService.RelationshipCapabilityAssessmentDTO.builder()
                .relationshipScore(90)
                .mentorshipScore(85)
                .companionshipScore(95)
                .build();
        
        // Mock 服务调用
        when(capabilityModelService.getOrCreateProfile(characterId)).thenReturn(profile);
        when(relationshipAssessmentService.assessRelationshipCapability(characterId, userId))
            .thenReturn(relationshipAssessment);
        when(assessmentRepository.save(any(CapabilityAssessment.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        when(profileRepository.save(any(RoleCapabilityProfile.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行评估
        CapabilityAssessmentService.FullCapabilityAssessmentDTO result = 
            assessmentService.assessAllCapabilities(characterId, userId);
        
        // 验证档案已更新
        verify(profileRepository, times(1)).save(argThat(savedProfile -> 
            savedProfile.getRelationshipDimensionScore() == 90 &&
            savedProfile.getMentorshipCapabilityScore() == 85 &&
            savedProfile.getCompanionshipCapabilityScore() == 95 &&
            savedProfile.getOverallScore() == result.getOverallScore()
        ));
    }
    
    @Test
    void testGetLatestFullAssessment_Exists() {
        CapabilityAssessment assessment = CapabilityAssessment.builder()
            .characterId(characterId)
            .assessmentType("FULL")
            .overallScore(75)
            .build();
        
        when(assessmentRepository.findFirstByCharacterIdOrderByCreatedAtDesc(characterId))
            .thenReturn(Optional.of(assessment));
        
        Optional<CapabilityAssessment> result = assessmentService.getLatestFullAssessment(characterId);
        
        assertTrue(result.isPresent());
        assertEquals(characterId, result.get().getCharacterId());
        assertEquals("FULL", result.get().getAssessmentType());
        assertEquals(75, result.get().getOverallScore());
    }
    
    @Test
    void testGetLatestFullAssessment_NotExists() {
        when(assessmentRepository.findFirstByCharacterIdOrderByCreatedAtDesc(characterId))
            .thenReturn(Optional.empty());
        
        Optional<CapabilityAssessment> result = assessmentService.getLatestFullAssessment(characterId);
        
        assertFalse(result.isPresent());
    }
    
    @Test
    void testGetLatestFullAssessment_WrongType() {
        // 返回非FULL类型的评估
        CapabilityAssessment assessment = CapabilityAssessment.builder()
            .characterId(characterId)
            .assessmentType("PARTIAL")
            .overallScore(75)
            .build();
        
        when(assessmentRepository.findFirstByCharacterIdOrderByCreatedAtDesc(characterId))
            .thenReturn(Optional.of(assessment));
        
        Optional<CapabilityAssessment> result = assessmentService.getLatestFullAssessment(characterId);
        
        // 应该过滤掉非FULL类型的评估
        assertFalse(result.isPresent());
    }
}
