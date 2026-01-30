package com.heartsphere.capability.service.growth;

import com.heartsphere.capability.entity.CapabilityExperience;
import com.heartsphere.capability.repository.CapabilityExperienceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * 能力等级服务测试
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@ExtendWith(MockitoExtension.class)
class CapabilityLevelServiceTest {
    
    @Mock
    private CapabilityExperienceRepository experienceRepository;
    
    @InjectMocks
    private CapabilityLevelService levelService;
    
    private Long characterId;
    
    @BeforeEach
    void setUp() {
        characterId = 1L;
    }
    
    @Test
    void testCalculateSkillLevel_NoExperience() {
        // 准备测试数据
        when(experienceRepository.findByCharacterId(characterId))
            .thenReturn(Optional.empty());
        
        // 执行测试
        int level = levelService.calculateSkillLevel(characterId);
        
        // 验证结果
        assertEquals(0, level);
    }
    
    @Test
    void testCalculateSkillLevel_WithExperience() {
        // 准备测试数据
        CapabilityExperience experience = CapabilityExperience.builder()
            .characterId(characterId)
            .skillExperience(2500L) // 2.5级
            .build();
        
        when(experienceRepository.findByCharacterId(characterId))
            .thenReturn(Optional.of(experience));
        
        // 执行测试
        int level = levelService.calculateSkillLevel(characterId);
        
        // 验证结果（每1000经验值 = 1级）
        assertEquals(2, level);
    }
    
    @Test
    void testCalculateMentorshipLevel() {
        // 准备测试数据
        CapabilityExperience experience = CapabilityExperience.builder()
            .characterId(characterId)
            .mentorshipExperience(5000L) // 5级
            .build();
        
        when(experienceRepository.findByCharacterId(characterId))
            .thenReturn(Optional.of(experience));
        
        // 执行测试
        int level = levelService.calculateMentorshipLevel(characterId);
        
        // 验证结果
        assertEquals(5, level);
    }
    
    @Test
    void testCalculateOverallLevel() {
        // 准备测试数据
        CapabilityExperience experience = CapabilityExperience.builder()
            .characterId(characterId)
            .skillExperience(1000L)
            .memoryExperience(1000L)
            .consciousnessExperience(1000L)
            .collaborationExperience(1000L)
            .relationshipExperience(1000L)
            .totalExperience(5000L)
            .build();
        
        when(experienceRepository.findByCharacterId(characterId))
            .thenReturn(Optional.of(experience));
        
        // 执行测试
        int level = levelService.calculateOverallLevel(characterId);
        
        // 验证结果（总经验值 / (1000 * 5)）
        assertEquals(1, level);
    }
}
