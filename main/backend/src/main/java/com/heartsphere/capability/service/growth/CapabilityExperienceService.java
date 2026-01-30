package com.heartsphere.capability.service.growth;

import com.heartsphere.capability.entity.CapabilityExperience;
import com.heartsphere.capability.repository.CapabilityExperienceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 能力经验服务
 * 管理角色的能力经验值
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CapabilityExperienceService {
    
    private final CapabilityExperienceRepository experienceRepository;
    
    /**
     * 获取或创建能力经验记录
     */
    @Transactional
    public CapabilityExperience getOrCreateExperience(Long characterId) {
        Optional<CapabilityExperience> experienceOpt = experienceRepository.findByCharacterId(characterId);
        
        if (experienceOpt.isPresent()) {
            return experienceOpt.get();
        }
        
        // 创建新的经验记录
        CapabilityExperience experience = CapabilityExperience.builder()
            .characterId(characterId)
            .build();
        
        return experienceRepository.save(experience);
    }
    
    /**
     * 增加技能经验值
     */
    @Transactional
    public void addSkillExperience(Long characterId, long experience) {
        CapabilityExperience exp = getOrCreateExperience(characterId);
        exp.setSkillExperience(exp.getSkillExperience() + experience);
        experienceRepository.save(exp);
        log.info("增加技能经验: characterId={}, experience={}, total={}", 
            characterId, experience, exp.getSkillExperience());
    }
    
    /**
     * 增加记忆经验值
     */
    @Transactional
    public void addMemoryExperience(Long characterId, long experience) {
        CapabilityExperience exp = getOrCreateExperience(characterId);
        exp.setMemoryExperience(exp.getMemoryExperience() + experience);
        experienceRepository.save(exp);
        log.info("增加记忆经验: characterId={}, experience={}, total={}", 
            characterId, experience, exp.getMemoryExperience());
    }
    
    /**
     * 增加意识经验值
     */
    @Transactional
    public void addConsciousnessExperience(Long characterId, long experience) {
        CapabilityExperience exp = getOrCreateExperience(characterId);
        exp.setConsciousnessExperience(exp.getConsciousnessExperience() + experience);
        experienceRepository.save(exp);
        log.info("增加意识经验: characterId={}, experience={}, total={}", 
            characterId, experience, exp.getConsciousnessExperience());
    }
    
    /**
     * 增加协作经验值
     */
    @Transactional
    public void addCollaborationExperience(Long characterId, long experience) {
        CapabilityExperience exp = getOrCreateExperience(characterId);
        exp.setCollaborationExperience(exp.getCollaborationExperience() + experience);
        experienceRepository.save(exp);
        log.info("增加协作经验: characterId={}, experience={}, total={}", 
            characterId, experience, exp.getCollaborationExperience());
    }
    
    /**
     * 增加关系维度经验值
     */
    @Transactional
    public void addRelationshipExperience(Long characterId, long experience) {
        CapabilityExperience exp = getOrCreateExperience(characterId);
        exp.setRelationshipExperience(exp.getRelationshipExperience() + experience);
        experienceRepository.save(exp);
        log.info("增加关系经验: characterId={}, experience={}, total={}", 
            characterId, experience, exp.getRelationshipExperience());
    }
    
    /**
     * 增加导师能力经验值
     */
    @Transactional
    public void addMentorshipExperience(Long characterId, long experience) {
        CapabilityExperience exp = getOrCreateExperience(characterId);
        exp.setMentorshipExperience(exp.getMentorshipExperience() + experience);
        experienceRepository.save(exp);
        log.info("增加导师经验: characterId={}, experience={}, total={}", 
            characterId, experience, exp.getMentorshipExperience());
    }
    
    /**
     * 增加挚友能力经验值
     */
    @Transactional
    public void addCompanionshipExperience(Long characterId, long experience) {
        CapabilityExperience exp = getOrCreateExperience(characterId);
        exp.setCompanionshipExperience(exp.getCompanionshipExperience() + experience);
        experienceRepository.save(exp);
        log.info("增加挚友经验: characterId={}, experience={}, total={}", 
            characterId, experience, exp.getCompanionshipExperience());
    }
    
    /**
     * 获取能力经验记录
     */
    public Optional<CapabilityExperience> getExperience(Long characterId) {
        return experienceRepository.findByCharacterId(characterId);
    }
}
