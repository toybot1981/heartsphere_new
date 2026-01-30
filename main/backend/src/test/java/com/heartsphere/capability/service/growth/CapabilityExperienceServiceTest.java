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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 能力经验服务测试
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@ExtendWith(MockitoExtension.class)
class CapabilityExperienceServiceTest {
    
    @Mock
    private CapabilityExperienceRepository experienceRepository;
    
    @InjectMocks
    private CapabilityExperienceService experienceService;
    
    private Long characterId;
    
    @BeforeEach
    void setUp() {
        characterId = 1L;
    }
    
    @Test
    void testAddSkillExperience_NewExperience() {
        // 准备测试数据
        when(experienceRepository.findByCharacterId(characterId))
            .thenReturn(Optional.empty());
        when(experienceRepository.save(any(CapabilityExperience.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行测试
        experienceService.addSkillExperience(characterId, 10);
        
        // 验证方法调用
        verify(experienceRepository).findByCharacterId(characterId);
        verify(experienceRepository).save(any(CapabilityExperience.class));
    }
    
    @Test
    void testAddSkillExperience_ExistingExperience() {
        // 准备测试数据
        CapabilityExperience existing = CapabilityExperience.builder()
            .id(1L)
            .characterId(characterId)
            .skillExperience(50L)
            .build();
        
        when(experienceRepository.findByCharacterId(characterId))
            .thenReturn(Optional.of(existing));
        when(experienceRepository.save(any(CapabilityExperience.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行测试
        experienceService.addSkillExperience(characterId, 10);
        
        // 验证经验值已增加
        assertEquals(60L, existing.getSkillExperience());
        verify(experienceRepository).save(existing);
    }
    
    @Test
    void testAddRelationshipExperience() {
        // 准备测试数据
        when(experienceRepository.findByCharacterId(characterId))
            .thenReturn(Optional.empty());
        when(experienceRepository.save(any(CapabilityExperience.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行测试
        experienceService.addRelationshipExperience(characterId, 20);
        
        // 验证方法调用
        verify(experienceRepository).save(any(CapabilityExperience.class));
    }
    
    @Test
    void testAddMentorshipExperience() {
        // 准备测试数据
        when(experienceRepository.findByCharacterId(characterId))
            .thenReturn(Optional.empty());
        when(experienceRepository.save(any(CapabilityExperience.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        
        // 执行测试
        experienceService.addMentorshipExperience(characterId, 15);
        
        // 验证方法调用
        verify(experienceRepository).save(any(CapabilityExperience.class));
    }
}
