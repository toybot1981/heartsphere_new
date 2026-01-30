package com.heartsphere.capability.service.growth;

import com.heartsphere.capability.entity.CapabilityExperience;
import com.heartsphere.capability.repository.CapabilityExperienceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * 能力等级服务
 * 基于经验值计算能力等级
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CapabilityLevelService {
    
    private final CapabilityExperienceRepository experienceRepository;
    
    /**
     * 经验值到等级的转换规则
     * 每1000经验值 = 1级
     */
    private static final long EXPERIENCE_PER_LEVEL = 1000L;
    
    /**
     * 计算技能维度等级
     */
    public int calculateSkillLevel(Long characterId) {
        Optional<CapabilityExperience> expOpt = experienceRepository.findByCharacterId(characterId);
        if (expOpt.isEmpty()) {
            return 0;
        }
        return (int) (expOpt.get().getSkillExperience() / EXPERIENCE_PER_LEVEL);
    }
    
    /**
     * 计算记忆维度等级
     */
    public int calculateMemoryLevel(Long characterId) {
        Optional<CapabilityExperience> expOpt = experienceRepository.findByCharacterId(characterId);
        if (expOpt.isEmpty()) {
            return 0;
        }
        return (int) (expOpt.get().getMemoryExperience() / EXPERIENCE_PER_LEVEL);
    }
    
    /**
     * 计算意识维度等级
     */
    public int calculateConsciousnessLevel(Long characterId) {
        Optional<CapabilityExperience> expOpt = experienceRepository.findByCharacterId(characterId);
        if (expOpt.isEmpty()) {
            return 0;
        }
        return (int) (expOpt.get().getConsciousnessExperience() / EXPERIENCE_PER_LEVEL);
    }
    
    /**
     * 计算关系维度等级
     */
    public int calculateRelationshipLevel(Long characterId) {
        Optional<CapabilityExperience> expOpt = experienceRepository.findByCharacterId(characterId);
        if (expOpt.isEmpty()) {
            return 0;
        }
        return (int) (expOpt.get().getRelationshipExperience() / EXPERIENCE_PER_LEVEL);
    }
    
    /**
     * 计算导师能力等级
     */
    public int calculateMentorshipLevel(Long characterId) {
        Optional<CapabilityExperience> expOpt = experienceRepository.findByCharacterId(characterId);
        if (expOpt.isEmpty()) {
            return 0;
        }
        return (int) (expOpt.get().getMentorshipExperience() / EXPERIENCE_PER_LEVEL);
    }
    
    /**
     * 计算挚友能力等级
     */
    public int calculateCompanionshipLevel(Long characterId) {
        Optional<CapabilityExperience> expOpt = experienceRepository.findByCharacterId(characterId);
        if (expOpt.isEmpty()) {
            return 0;
        }
        return (int) (expOpt.get().getCompanionshipExperience() / EXPERIENCE_PER_LEVEL);
    }
    
    /**
     * 计算综合能力等级
     */
    public int calculateOverallLevel(Long characterId) {
        Optional<CapabilityExperience> expOpt = experienceRepository.findByCharacterId(characterId);
        if (expOpt.isEmpty()) {
            return 0;
        }
        CapabilityExperience exp = expOpt.get();
        long totalExp = exp.getTotalExperience();
        return (int) (totalExp / (EXPERIENCE_PER_LEVEL * 5)); // 5个维度平均
    }
}
