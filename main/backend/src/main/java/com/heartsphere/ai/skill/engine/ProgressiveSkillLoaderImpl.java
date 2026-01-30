package com.heartsphere.ai.skill.engine;

import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import com.heartsphere.skill.repository.SkillInstructionRepository;
import com.heartsphere.skill.repository.SkillResourceRepository;
import com.heartsphere.skill.service.SkillRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 渐进式技能加载器实现
 * 支持缓存优化
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ProgressiveSkillLoaderImpl implements ProgressiveSkillLoader {
    
    private final SkillRegistry skillRegistry;
    private final SkillDefinitionRepository skillDefinitionRepository;
    private final SkillInstructionRepository skillInstructionRepository;
    private final SkillResourceRepository skillResourceRepository;
    
    @Override
    @Cacheable(value = "skillLevel1", key = "#characterId")
    public List<SkillDefinition> loadLevel1(Long characterId) {
        log.debug("加载 Level 1（元数据）: characterId={}", characterId);
        return skillRegistry.getCharacterSkills(characterId);
    }
    
    @Override
    @Cacheable(value = "skillLevel2", key = "#skillId")
    public List<SkillInstruction> loadLevel2(String skillId) {
        log.debug("加载 Level 2（指令）: skillId={}", skillId);
        // 加载 Level 2 指令（instruction_level = 2）
        return skillInstructionRepository.findBySkillIdAndInstructionLevel(skillId, 2);
    }
    
    @Override
    public Map<String, List<SkillInstruction>> loadLevel2Batch(List<String> skillIds) {
        log.debug("批量加载 Level 2（指令）: skillIds={}", skillIds);
        // 批量查询所有指令
        List<SkillInstruction> allInstructions = skillInstructionRepository.findBySkillIdIn(skillIds);
        
        // 按技能ID分组，只保留 Level 2 指令
        return allInstructions.stream()
            .filter(instruction -> instruction.getInstructionLevel() == 2)
            .collect(Collectors.groupingBy(SkillInstruction::getSkillId));
    }
    
    @Override
    @Cacheable(value = "skillLevel3", key = "#skillId")
    public List<SkillResource> loadLevel3(String skillId) {
        log.debug("加载 Level 3（资源）: skillId={}", skillId);
        return skillResourceRepository.findBySkillId(skillId);
    }
    
    @Override
    public Map<String, List<SkillResource>> loadLevel3Batch(List<String> skillIds) {
        log.debug("批量加载 Level 3（资源）: skillIds={}", skillIds);
        // 批量查询所有资源
        List<SkillResource> allResources = skillResourceRepository.findBySkillIdIn(skillIds);
        
        // 按技能ID分组
        return allResources.stream()
            .collect(Collectors.groupingBy(SkillResource::getSkillId));
    }
}
