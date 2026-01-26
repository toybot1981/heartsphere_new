package com.heartsphere.skill.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.skill.entity.CharacterSkillBinding;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.repository.CharacterSkillBindingRepository;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * 技能注册表服务
 * 
 * 负责技能的注册、发现、缓存和转换
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SkillRegistry {
    
    private final SkillDefinitionRepository skillDefinitionRepository;
    private final CharacterSkillBindingRepository characterSkillBindingRepository;
    private final ObjectMapper objectMapper;
    
    // 技能缓存：skillId -> SkillDefinition
    private final Map<String, SkillDefinition> skillCache = new ConcurrentHashMap<>();
    
    // 角色技能缓存：characterId -> Set<skillId>
    private final Map<Long, Set<String>> characterSkillCache = new ConcurrentHashMap<>();
    
    /**
     * 初始化：异步加载所有技能到缓存
     * 改为异步加载，避免阻塞应用启动
     */
    @PostConstruct
    public void init() {
        log.info("开始异步初始化技能注册表...");
        // 异步加载，不阻塞启动
        new Thread(() -> {
            try {
                loadAllSkills();
                log.info("技能注册表初始化完成，共加载 {} 个技能", skillCache.size());
            } catch (Exception e) {
                log.error("技能注册表初始化失败", e);
            }
        }, "skill-registry-init").start();
    }
    
    /**
     * 加载所有技能到缓存
     */
    @Transactional(readOnly = true)
    public void loadAllSkills() {
        List<SkillDefinition> skills = skillDefinitionRepository.findAll();
        skillCache.clear();
        skills.forEach(skill -> {
            skillCache.put(skill.getSkillId(), skill);
            log.info("加载技能: {}", skill.getSkillId());
        });
    }
    
    /**
     * 获取技能定义
     */
    public Optional<SkillDefinition> getSkill(String skillId) {
        SkillDefinition skill = skillCache.get(skillId);
        if (skill == null) {
            // 尝试从数据库加载（可能新添加的技能）
            Optional<SkillDefinition> dbSkill = skillDefinitionRepository.findBySkillId(skillId);
            if (dbSkill.isPresent()) {
                skill = dbSkill.get();
                skillCache.put(skillId, skill);
                log.info("从数据库加载技能到缓存: {}", skillId);
            } else {
                log.warn("技能不存在: {}", skillId);
            }
            return dbSkill;
        }
        return Optional.of(skill);
    }
    
    /**
     * 获取角色可用的技能列表
     * 只返回已装备且启用的技能
     */
    @Transactional(readOnly = true)
    public List<SkillDefinition> getCharacterSkills(Long characterId) {
        // 先从缓存获取
        Set<String> cachedSkillIds = characterSkillCache.get(characterId);
        if (cachedSkillIds != null && !cachedSkillIds.isEmpty()) {
            return cachedSkillIds.stream()
                .map(skillCache::get)
                .filter(Objects::nonNull)
                .filter(skill -> skill.getSkillType().equals("ACTIVE") || skill.getSkillType().equals("AUTOMATIC"))
                .collect(Collectors.toList());
        }
        
        // 从数据库加载
        List<CharacterSkillBinding> bindings = characterSkillBindingRepository
            .findByCharacterIdAndIsEnabledTrue(characterId);
        
        List<String> skillIds = bindings.stream()
            .map(CharacterSkillBinding::getSkillId)
            .collect(Collectors.toList());
        
        // 更新缓存
        characterSkillCache.put(characterId, new HashSet<>(skillIds));
        
        // 查询技能定义
        List<SkillDefinition> skills = skillDefinitionRepository.findBySkillIdIn(skillIds);
        
        // 按优先级排序
        Map<String, Integer> priorityMap = bindings.stream()
            .collect(Collectors.toMap(
                CharacterSkillBinding::getSkillId,
                CharacterSkillBinding::getPriority
            ));
        
        return skills.stream()
            .filter(skill -> skill.getSkillType().equals("ACTIVE") || skill.getSkillType().equals("AUTOMATIC"))
            .sorted(Comparator.comparing((SkillDefinition skill) -> 
                priorityMap.getOrDefault(skill.getSkillId(), 0)
            ).reversed())
            .collect(Collectors.toList());
    }
    
    /**
     * 将技能转换为 Function Definition（用于 Function Calling）
     */
    public List<FunctionDefinition> toFunctionDefinitions(List<SkillDefinition> skills) {
        return skills.stream()
            .map(this::toFunctionDefinition)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    /**
     * 将单个技能转换为 Function Definition
     */
    private FunctionDefinition toFunctionDefinition(SkillDefinition skill) {
        try {
            // 检查是否有 function_schema
            if (skill.getFunctionSchema() == null || skill.getFunctionSchema().isEmpty()) {
                log.warn("技能 {} 没有 function_schema，跳过", skill.getSkillId());
                return null;
            }
            
            // 解析 function_schema
            Map<String, Object> schema = objectMapper.readValue(
                skill.getFunctionSchema(),
                new TypeReference<Map<String, Object>>() {}
            );
            
            return FunctionDefinition.builder()
                .name(skill.getSkillId())
                .description(skill.getDescription() != null ? skill.getDescription() : skill.getName())
                .parameters(schema)
                .build();
                
        } catch (Exception e) {
            log.error("转换技能 {} 为 Function Definition 失败", skill.getSkillId(), e);
            return null;
        }
    }
    
    /**
     * 检查关键词是否匹配自动触发条件
     */
    public List<SkillDefinition> findAutoTriggerSkills(Long characterId, String userInput) {
        List<SkillDefinition> characterSkills = getCharacterSkills(characterId);
        String lowerInput = userInput.toLowerCase();
        
        return characterSkills.stream()
            .filter(skill -> {
                if (skill.getAutoTriggerKeywords() == null || skill.getAutoTriggerKeywords().isEmpty()) {
                    return false;
                }
                try {
                    List<String> keywords = objectMapper.readValue(
                        skill.getAutoTriggerKeywords(),
                        new TypeReference<List<String>>() {}
                    );
                    return keywords.stream()
                        .anyMatch(keyword -> lowerInput.contains(keyword.toLowerCase()));
                } catch (Exception e) {
                    log.error("解析自动触发关键词失败: {}", skill.getSkillId(), e);
                    return false;
                }
            })
            .collect(Collectors.toList());
    }
    
    /**
     * 清除角色技能缓存
     */
    public void clearCharacterSkillCache(Long characterId) {
        characterSkillCache.remove(characterId);
        log.info("清除角色技能缓存: characterId={}", characterId);
    }
    
    /**
     * 清除所有缓存
     */
    public void clearAllCache() {
        skillCache.clear();
        characterSkillCache.clear();
        log.info("清除所有技能缓存");
    }
    
    /**
     * 刷新技能缓存
     */
    @Transactional(readOnly = true)
    public void refreshSkillCache() {
        loadAllSkills();
        log.info("刷新技能缓存完成");
    }
    
    /**
     * Function Definition 内部类
     */
    @lombok.Data
    @lombok.Builder
    public static class FunctionDefinition {
        private String name;
        private String description;
        private Map<String, Object> parameters;
    }
}
