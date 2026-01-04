package com.heartsphere.skill.service;

import com.heartsphere.skill.entity.CharacterSkillBinding;
import com.heartsphere.skill.entity.SkillConflict;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillPrerequisite;
import com.heartsphere.skill.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 角色技能服务
 * 
 * 负责角色技能的装备、卸载、验证等操作
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CharacterSkillService {
    
    private final CharacterSkillBindingRepository characterSkillBindingRepository;
    private final CharacterSkillRepository characterSkillRepository;
    private final SkillDefinitionRepository skillDefinitionRepository;
    private final SkillPrerequisiteRepository skillPrerequisiteRepository;
    private final SkillConflictRepository skillConflictRepository;
    private final SkillRegistry skillRegistry;
    
    /**
     * 装备技能
     */
    @Transactional
    public CharacterSkillBinding equipSkill(Long characterId, String skillId, EquipSkillRequest request) {
        log.info("装备技能: characterId={}, skillId={}", characterId, skillId);
        
        // 1. 检查技能是否存在
        SkillDefinition skill = skillDefinitionRepository.findBySkillId(skillId)
            .orElseThrow(() -> new SkillNotFoundException("技能不存在: " + skillId));
        
        // 2. 检查是否已装备
        if (characterSkillBindingRepository.existsByCharacterIdAndSkillId(characterId, skillId)) {
            throw new SkillAlreadyEquippedException("技能已装备: " + skillId);
        }
        
        // 3. 检查前置条件
        checkPrerequisites(characterId, skillId);
        
        // 4. 检查冲突
        checkConflicts(characterId, skillId);
        
        // 5. 创建装备关系
        CharacterSkillBinding binding = CharacterSkillBinding.builder()
            .characterId(characterId)
            .skillId(skillId)
            .isEnabled(request.getIsEnabled() != null ? request.getIsEnabled() : true)
            .autoTrigger(request.getAutoTrigger() != null ? request.getAutoTrigger() : false)
            .priority(request.getPriority() != null ? request.getPriority() : 0)
            .usageCount(0)
            .equippedAt(LocalDateTime.now())
            .build();
        
        CharacterSkillBinding saved = characterSkillBindingRepository.save(binding);
        
        // 6. 清除缓存
        skillRegistry.clearCharacterSkillCache(characterId);
        
        log.info("技能装备成功: characterId={}, skillId={}", characterId, skillId);
        return saved;
    }
    
    /**
     * 卸载技能
     */
    @Transactional
    public void unequipSkill(Long characterId, String skillId) {
        log.info("卸载技能: characterId={}, skillId={}", characterId, skillId);
        
        // 检查是否存在
        CharacterSkillBinding binding = characterSkillBindingRepository
            .findByCharacterIdAndSkillId(characterId, skillId)
            .orElseThrow(() -> new SkillNotEquippedException("技能未装备: " + skillId));
        
        // 删除装备关系
        characterSkillBindingRepository.delete(binding);
        
        // 清除缓存
        skillRegistry.clearCharacterSkillCache(characterId);
        
        log.info("技能卸载成功: characterId={}, skillId={}", characterId, skillId);
    }
    
    /**
     * 获取角色已装备的技能
     */
    @Transactional(readOnly = true)
    public List<CharacterSkillBinding> getEquippedSkills(Long characterId) {
        return characterSkillBindingRepository.findByCharacterId(characterId);
    }
    
    /**
     * 获取角色已装备且启用的技能
     */
    @Transactional(readOnly = true)
    public List<CharacterSkillBinding> getEnabledSkills(Long characterId) {
        return characterSkillBindingRepository.findByCharacterIdAndIsEnabledTrue(characterId);
    }
    
    /**
     * 启用/禁用技能
     */
    @Transactional
    public void toggleSkill(Long characterId, String skillId, boolean enabled) {
        CharacterSkillBinding binding = characterSkillBindingRepository
            .findByCharacterIdAndSkillId(characterId, skillId)
            .orElseThrow(() -> new SkillNotEquippedException("技能未装备: " + skillId));
        
        binding.setIsEnabled(enabled);
        characterSkillBindingRepository.save(binding);
        
        // 清除缓存
        skillRegistry.clearCharacterSkillCache(characterId);
        
        log.info("技能{}成功: characterId={}, skillId={}", enabled ? "启用" : "禁用", characterId, skillId);
    }
    
    /**
     * 设置自动触发
     */
    @Transactional
    public void setAutoTrigger(Long characterId, String skillId, boolean autoTrigger) {
        CharacterSkillBinding binding = characterSkillBindingRepository
            .findByCharacterIdAndSkillId(characterId, skillId)
            .orElseThrow(() -> new SkillNotEquippedException("技能未装备: " + skillId));
        
        binding.setAutoTrigger(autoTrigger);
        characterSkillBindingRepository.save(binding);
        
        // 清除缓存
        skillRegistry.clearCharacterSkillCache(characterId);
        
        log.info("设置自动触发: characterId={}, skillId={}, autoTrigger={}", characterId, skillId, autoTrigger);
    }
    
    /**
     * 设置优先级
     */
    @Transactional
    public void setPriority(Long characterId, String skillId, Integer priority) {
        CharacterSkillBinding binding = characterSkillBindingRepository
            .findByCharacterIdAndSkillId(characterId, skillId)
            .orElseThrow(() -> new SkillNotEquippedException("技能未装备: " + skillId));
        
        binding.setPriority(priority);
        characterSkillBindingRepository.save(binding);
        
        // 清除缓存
        skillRegistry.clearCharacterSkillCache(characterId);
        
        log.info("设置优先级: characterId={}, skillId={}, priority={}", characterId, skillId, priority);
    }
    
    /**
     * 检查前置条件
     */
    private void checkPrerequisites(Long characterId, String skillId) {
        List<SkillPrerequisite> prerequisites = skillPrerequisiteRepository.findBySkillId(skillId);
        
        for (SkillPrerequisite prereq : prerequisites) {
            // 检查前置技能
            if (prereq.getPrerequisiteSkillId() != null) {
                Optional<CharacterSkillBinding> prereqBinding = characterSkillBindingRepository
                    .findByCharacterIdAndSkillId(characterId, prereq.getPrerequisiteSkillId());
                
                if (prereqBinding.isEmpty()) {
                    throw new PrerequisiteNotMetException(
                        "缺少前置技能: " + prereq.getPrerequisiteSkillId()
                    );
                }
                
                // 检查前置技能等级（如果有 character_skills 记录）
                if (prereq.getPrerequisiteLevel() > 0) {
                    characterSkillRepository.findByCharacterIdAndSkillId(characterId, prereq.getPrerequisiteSkillId())
                        .ifPresent(characterSkill -> {
                            if (characterSkill.getCurrentLevel() < prereq.getPrerequisiteLevel()) {
                                throw new PrerequisiteNotMetException(
                                    String.format("前置技能等级不足: %s (需要 %d 级，当前 %d 级)",
                                        prereq.getPrerequisiteSkillId(),
                                        prereq.getPrerequisiteLevel(),
                                        characterSkill.getCurrentLevel())
                                );
                            }
                        });
                }
            }
            
            // TODO: 检查角色等级、物品等其他前置条件
        }
    }
    
    /**
     * 检查冲突
     */
    private void checkConflicts(Long characterId, String skillId) {
        // 获取角色已装备的技能
        List<String> equippedSkillIds = characterSkillBindingRepository
            .findSkillIdsByCharacterId(characterId);
        
        // 检查是否与新技能冲突
        for (String equippedSkillId : equippedSkillIds) {
            Optional<SkillConflict> conflict = skillConflictRepository
                .findConflictBetween(skillId, equippedSkillId);
            
            if (conflict.isPresent()) {
                SkillConflict c = conflict.get();
                if ("MUTUAL_EXCLUSIVE".equals(c.getConflictType())) {
                    throw new SkillConflictException(
                        String.format("技能冲突: %s 与 %s 互斥。原因: %s",
                            skillId, equippedSkillId, c.getConflictReason())
                    );
                }
            }
        }
    }
    
    /**
     * 装备技能请求
     */
    @lombok.Data
    @lombok.Builder
    public static class EquipSkillRequest {
        private Boolean isEnabled;
        private Boolean autoTrigger;
        private Integer priority;
    }
    
    /**
     * 技能未找到异常
     */
    public static class SkillNotFoundException extends RuntimeException {
        public SkillNotFoundException(String message) {
            super(message);
        }
    }
    
    /**
     * 技能已装备异常
     */
    public static class SkillAlreadyEquippedException extends RuntimeException {
        public SkillAlreadyEquippedException(String message) {
            super(message);
        }
    }
    
    /**
     * 技能未装备异常
     */
    public static class SkillNotEquippedException extends RuntimeException {
        public SkillNotEquippedException(String message) {
            super(message);
        }
    }
    
    /**
     * 前置条件未满足异常
     */
    public static class PrerequisiteNotMetException extends RuntimeException {
        public PrerequisiteNotMetException(String message) {
            super(message);
        }
    }
    
    /**
     * 技能冲突异常
     */
    public static class SkillConflictException extends RuntimeException {
        public SkillConflictException(String message) {
            super(message);
        }
    }
}
