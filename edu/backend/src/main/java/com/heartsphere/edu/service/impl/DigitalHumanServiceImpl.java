package com.heartsphere.edu.service.impl;

import com.heartsphere.edu.dto.*;
import com.heartsphere.edu.entity.EduCharacter;
import com.heartsphere.edu.entity.EduCharacterInteraction;
import com.heartsphere.shared.exception.ResourceNotFoundException;
import com.heartsphere.edu.repository.EduCharacterRepository;
import com.heartsphere.edu.repository.EduCharacterInteractionRepository;
import com.heartsphere.edu.service.DigitalHumanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 数字人教育服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DigitalHumanServiceImpl implements DigitalHumanService {
    
    private final EduCharacterRepository characterRepository;
    private final EduCharacterInteractionRepository interactionRepository;
    
    @Override
    @Transactional
    public EduCharacter createCharacter(CreateCharacterRequest request) {
        log.info("创建数字人角色: name={}, type={}", request.getName(), request.getCharacterType());
        
        EduCharacter character = new EduCharacter();
        character.setName(request.getName());
        character.setAvatarUrl(request.getAvatarUrl());
        character.setBackgroundUrl(request.getBackgroundUrl());
        character.setDescription(request.getDescription());
        character.setBio(request.getBio());
        character.setCharacterType(request.getCharacterType());
        character.setAgeGroupSuitability(request.getAgeGroupSuitability());
        character.setSubjectTags(request.getSubjectTags());
        character.setTeachingSpecialty(request.getTeachingSpecialty());
        character.setDifficultyLevel(request.getDifficultyLevel() != null 
            ? request.getDifficultyLevel() 
            : EduCharacter.DifficultyLevel.INTERMEDIATE);
        character.setLanguageStyle(request.getLanguageStyle() != null 
            ? request.getLanguageStyle() 
            : EduCharacter.LanguageStyle.FRIENDLY);
        character.setPersonalityTraits(request.getPersonalityTraits());
        character.setFirstMessage(request.getFirstMessage());
        character.setSystemInstruction(request.getSystemInstruction());
        character.setVoiceName(request.getVoiceName());
        character.setThemeColor(request.getThemeColor());
        character.setColorAccent(request.getColorAccent());
        character.setStudentId(request.getStudentId());
        character.setTeacherId(request.getTeacherId());
        character.setIsEnabled(true);
        character.setIsDeleted(false);
        
        EduCharacter saved = characterRepository.save(character);
        log.info("数字人角色创建成功: id={}, name={}", saved.getId(), saved.getName());
        return saved;
    }
    
    @Override
    public Page<EduCharacter> getCharacters(CharacterQuery query, Pageable pageable) {
        log.info("查询数字人角色列表: query={}, pageable={}", query, pageable);
        
        // 如果有关键词搜索，使用搜索方法
        if (query.getSearchKeyword() != null && !query.getSearchKeyword().trim().isEmpty()) {
            return characterRepository.searchByKeyword(query.getSearchKeyword(), pageable);
        }
        
        // 如果有角色类型筛选
        if (query.getCharacterType() != null) {
            Page<EduCharacter> page = characterRepository.findByCharacterTypeAndIsDeletedFalseAndIsEnabledTrue(
                query.getCharacterType(), pageable);
            
            // 进一步筛选年龄组和学科（如果指定）
            return filterByAdditionalCriteria(page, query);
        }
        
        // 如果有学生ID筛选
        if (query.getStudentId() != null) {
            return characterRepository.findByStudentIdAndIsDeletedFalse(query.getStudentId(), pageable);
        }
        
        // 如果有教师ID筛选
        if (query.getTeacherId() != null) {
            return characterRepository.findByTeacherIdAndIsDeletedFalse(query.getTeacherId(), pageable);
        }
        
        // 默认返回所有启用的角色
        // TODO: 需要添加更复杂的查询逻辑来支持年龄组和学科标签筛选
        List<EduCharacter> allEnabled = characterRepository.findByIsDeletedFalseAndIsEnabledTrue();
        // 手动筛选（临时方案，后续可以优化为数据库查询）
        List<EduCharacter> filtered = allEnabled.stream()
            .filter(c -> matchesQuery(c, query))
            .collect(Collectors.toList());
        
        // 手动分页
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<EduCharacter> pageContent;
        if (start < filtered.size()) {
            pageContent = filtered.subList(Math.max(0, start), end);
        } else {
            pageContent = new ArrayList<>();
        }
        
        return new org.springframework.data.domain.PageImpl<>(
            pageContent, 
            pageable, 
            filtered.size()
        );
    }
    
    /**
     * 检查角色是否匹配查询条件
     */
    private boolean matchesQuery(EduCharacter character, CharacterQuery query) {
        // 年龄组筛选
        if (query.getAgeGroup() != null && character.getAgeGroupSuitability() != null) {
            if (!character.getAgeGroupSuitability().contains(query.getAgeGroup())) {
                return false;
            }
        }
        
        // 学科标签筛选
        if (query.getSubjectTags() != null && !query.getSubjectTags().isEmpty() 
            && character.getSubjectTags() != null) {
            boolean hasMatchingSubject = query.getSubjectTags().stream()
                .anyMatch(tag -> character.getSubjectTags().contains(tag));
            if (!hasMatchingSubject) {
                return false;
            }
        }
        
        // 难度等级筛选
        if (query.getDifficultyLevel() != null) {
            if (!character.getDifficultyLevel().equals(query.getDifficultyLevel())) {
                return false;
            }
        }
        
        // 启用状态筛选
        if (query.getIsEnabled() != null) {
            if (!character.getIsEnabled().equals(query.getIsEnabled())) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 对分页结果进行额外筛选
     */
    private Page<EduCharacter> filterByAdditionalCriteria(Page<EduCharacter> page, CharacterQuery query) {
        List<EduCharacter> filtered = page.getContent().stream()
            .filter(c -> matchesQuery(c, query))
            .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
            filtered,
            page.getPageable(),
            filtered.size()
        );
    }
    
    @Override
    public EduCharacter getCharacterById(Long id) {
        log.info("查询数字人角色详情: id={}", id);
        return characterRepository.findById(id)
            .filter(c -> !c.getIsDeleted())
            .orElseThrow(() -> new ResourceNotFoundException("数字人角色", id));
    }
    
    @Override
    public List<CharacterRecommendation> recommendCharacters(Long studentId, RecommendationCriteria criteria) {
        log.info("为学生推荐数字人角色: studentId={}, criteria={}", studentId, criteria);
        
        List<CharacterRecommendation> recommendations = new ArrayList<>();
        
        // TODO: 实现推荐算法
        // 1. 基于年龄组推荐
        // 2. 基于学科兴趣推荐
        // 3. 基于历史互动推荐（如果 includeHistory = true）
        
        // 临时实现：返回所有匹配年龄组的角色
        List<EduCharacter> allCharacters = characterRepository.findByIsDeletedFalseAndIsEnabledTrue();
        
        List<EduCharacter> filtered = allCharacters.stream()
            .filter(c -> {
                if (criteria.getAgeGroup() != null && c.getAgeGroupSuitability() != null) {
                    return c.getAgeGroupSuitability().contains(criteria.getAgeGroup());
                }
                return true;
            })
            .filter(c -> {
                if (criteria.getSubjectInterests() != null && !criteria.getSubjectInterests().isEmpty()
                    && c.getSubjectTags() != null) {
                    return criteria.getSubjectInterests().stream()
                        .anyMatch(tag -> c.getSubjectTags().contains(tag));
                }
                return true;
            })
            .limit(criteria.getLimit() != null ? criteria.getLimit() : 10)
            .collect(Collectors.toList());
        
        for (EduCharacter character : filtered) {
            String reason = buildRecommendationReason(character, criteria);
            double score = calculateRelevanceScore(character, criteria);
            recommendations.add(new CharacterRecommendation(character, reason, score));
        }
        
        // 按相关性分数排序
        recommendations.sort((a, b) -> Double.compare(b.getRelevanceScore(), a.getRelevanceScore()));
        
        return recommendations;
    }
    
    private String buildRecommendationReason(EduCharacter character, RecommendationCriteria criteria) {
        List<String> reasons = new ArrayList<>();
        
        if (criteria.getAgeGroup() != null && character.getAgeGroupSuitability() != null
            && character.getAgeGroupSuitability().contains(criteria.getAgeGroup())) {
            reasons.add("适合您的年龄段");
        }
        
        if (criteria.getSubjectInterests() != null && character.getSubjectTags() != null) {
            long matchingSubjects = criteria.getSubjectInterests().stream()
                .filter(tag -> character.getSubjectTags().contains(tag))
                .count();
            if (matchingSubjects > 0) {
                reasons.add("匹配您感兴趣的学科");
            }
        }
        
        if (character.getTotalInteractions() > 0) {
            reasons.add("受到其他学生欢迎");
        }
        
        return reasons.isEmpty() ? "推荐给您" : String.join("、", reasons);
    }
    
    private double calculateRelevanceScore(EduCharacter character, RecommendationCriteria criteria) {
        double score = 0.5; // 基础分数
        
        // 年龄组匹配 +0.2
        if (criteria.getAgeGroup() != null && character.getAgeGroupSuitability() != null
            && character.getAgeGroupSuitability().contains(criteria.getAgeGroup())) {
            score += 0.2;
        }
        
        // 学科匹配 +0.2
        if (criteria.getSubjectInterests() != null && character.getSubjectTags() != null) {
            long matchingSubjects = criteria.getSubjectInterests().stream()
                .filter(tag -> character.getSubjectTags().contains(tag))
                .count();
            if (matchingSubjects > 0) {
                score += Math.min(0.2, matchingSubjects * 0.1);
            }
        }
        
        // 受欢迎程度 +0.1
        if (character.getTotalInteractions() > 100) {
            score += 0.1;
        } else if (character.getTotalInteractions() > 50) {
            score += 0.05;
        }
        
        // 评分 +0.1
        if (character.getAverageRating() != null && character.getAverageRating().doubleValue() >= 4.0) {
            score += 0.1;
        } else if (character.getAverageRating() != null && character.getAverageRating().doubleValue() >= 3.5) {
            score += 0.05;
        }
        
        return Math.min(1.0, score);
    }
    
    @Override
    @Transactional
    public EduCharacterInteraction recordInteraction(RecordInteractionRequest request) {
        log.info("记录互动: studentId={}, characterId={}, type={}", 
            request.getStudentId(), request.getCharacterId(), request.getInteractionType());
        
        // 验证角色存在
        EduCharacter character = getCharacterById(request.getCharacterId());
        
        // 计算互动时长
        Integer durationMinutes = null;
        if (request.getStartTime() != null && request.getEndTime() != null) {
            durationMinutes = (int) Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        }
        
        EduCharacterInteraction interaction = new EduCharacterInteraction();
        interaction.setStudentId(request.getStudentId());
        interaction.setCharacterId(request.getCharacterId());
        interaction.setInteractionType(request.getInteractionType());
        interaction.setConversationContent(request.getConversationContent());
        interaction.setLearningTopics(request.getLearningTopics());
        interaction.setComprehensionLevel(request.getComprehensionLevel());
        interaction.setStudentRating(request.getStudentRating());
        interaction.setStudentFeedback(request.getStudentFeedback());
        interaction.setStartTime(request.getStartTime() != null ? request.getStartTime() : LocalDateTime.now());
        interaction.setEndTime(request.getEndTime());
        interaction.setDurationMinutes(durationMinutes);
        
        EduCharacterInteraction saved = interactionRepository.save(interaction);
        
        // 更新角色的统计信息
        updateCharacterStatistics(character.getId());
        
        log.info("互动记录保存成功: id={}", saved.getId());
        return saved;
    }
    
    /**
     * 更新角色的统计信息
     */
    @Transactional
    private void updateCharacterStatistics(Long characterId) {
        EduCharacter character = getCharacterById(characterId);
        
        // 总互动次数
        long totalInteractions = interactionRepository.countByCharacterId(characterId);
        character.setTotalInteractions((int) totalInteractions);
        
        // 唯一学生数量
        long uniqueStudents = interactionRepository.findByCharacterIdOrderByCreatedAtDesc(
            characterId, org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
            .getContent().stream()
            .map(EduCharacterInteraction::getStudentId)
            .distinct()
            .count();
        character.setUniqueStudents((int) uniqueStudents);
        
        // 平均评分
        List<EduCharacterInteraction> interactions = interactionRepository.findByCharacterIdOrderByCreatedAtDesc(
            characterId, org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
            .getContent();
        
        double avgRating = interactions.stream()
            .filter(i -> i.getStudentRating() != null)
            .mapToInt(EduCharacterInteraction::getStudentRating)
            .average()
            .orElse(0.0);
        
        character.setAverageRating(java.math.BigDecimal.valueOf(avgRating).setScale(2, java.math.RoundingMode.HALF_UP));
        
        characterRepository.save(character);
    }
    
    @Override
    public Page<EduCharacterInteraction> getStudentInteractions(Long studentId, InteractionQuery query, Pageable pageable) {
        log.info("查询学生互动历史: studentId={}, query={}", studentId, query);
        
        if (query.getCharacterId() != null && query.getInteractionType() != null) {
            // 同时按角色和类型筛选
            Page<EduCharacterInteraction> page = interactionRepository.findByStudentIdAndCharacterIdOrderByCreatedAtDesc(
                studentId, query.getCharacterId(), pageable);
            // 过滤掉不匹配的类型
            List<EduCharacterInteraction> filtered = page.getContent().stream()
                .filter(i -> i.getInteractionType().equals(query.getInteractionType()))
                .collect(Collectors.toList());
            return new org.springframework.data.domain.PageImpl<>(
                filtered, pageable, filtered.size());
        } else if (query.getCharacterId() != null) {
            return interactionRepository.findByStudentIdAndCharacterIdOrderByCreatedAtDesc(
                studentId, query.getCharacterId(), pageable);
        } else if (query.getInteractionType() != null) {
            Page<EduCharacterInteraction> page = interactionRepository.findByStudentIdAndInteractionTypeOrderByCreatedAtDesc(
                studentId, query.getInteractionType(), pageable);
            return page;
        } else if (query.getStartDate() != null && query.getEndDate() != null) {
            return interactionRepository.findByStudentIdAndDateRange(
                studentId, query.getStartDate(), query.getEndDate(), pageable);
        } else {
            return interactionRepository.findByStudentIdOrderByCreatedAtDesc(studentId, pageable);
        }
    }
    
    @Override
    public EduCharacterInteraction getInteractionById(Long id) {
        log.info("查询互动详情: id={}", id);
        return interactionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("互动记录", id));
    }
    
    @Override
    public CharacterStatistics getCharacterStatistics(Long characterId) {
        log.info("查询角色统计信息: characterId={}", characterId);
        
        EduCharacter character = getCharacterById(characterId);
        
        long totalInteractions = interactionRepository.countByCharacterId(characterId);
        long uniqueStudents = interactionRepository.findByCharacterIdOrderByCreatedAtDesc(
            characterId, org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
            .getContent().stream()
            .map(EduCharacterInteraction::getStudentId)
            .distinct()
            .count();
        
        Long totalDuration = interactionRepository.sumDurationByCharacterId(characterId);
        
        return new CharacterStatistics(
            characterId,
            character.getName(),
            totalInteractions,
            uniqueStudents,
            character.getAverageRating() != null ? character.getAverageRating() : java.math.BigDecimal.ZERO,
            totalDuration != null ? totalDuration : 0L
        );
    }
    
    @Override
    @Transactional
    public EduCharacter updateCharacter(Long id, UpdateCharacterRequest request) {
        log.info("更新数字人角色: id={}", id);
        
        EduCharacter character = getCharacterById(id);
        
        if (request.getName() != null) {
            character.setName(request.getName());
        }
        if (request.getAvatarUrl() != null) {
            character.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getBackgroundUrl() != null) {
            character.setBackgroundUrl(request.getBackgroundUrl());
        }
        if (request.getDescription() != null) {
            character.setDescription(request.getDescription());
        }
        if (request.getBio() != null) {
            character.setBio(request.getBio());
        }
        if (request.getCharacterType() != null) {
            character.setCharacterType(request.getCharacterType());
        }
        if (request.getAgeGroupSuitability() != null) {
            character.setAgeGroupSuitability(request.getAgeGroupSuitability());
        }
        if (request.getSubjectTags() != null) {
            character.setSubjectTags(request.getSubjectTags());
        }
        if (request.getTeachingSpecialty() != null) {
            character.setTeachingSpecialty(request.getTeachingSpecialty());
        }
        if (request.getDifficultyLevel() != null) {
            character.setDifficultyLevel(request.getDifficultyLevel());
        }
        if (request.getLanguageStyle() != null) {
            character.setLanguageStyle(request.getLanguageStyle());
        }
        if (request.getPersonalityTraits() != null) {
            character.setPersonalityTraits(request.getPersonalityTraits());
        }
        if (request.getFirstMessage() != null) {
            character.setFirstMessage(request.getFirstMessage());
        }
        if (request.getSystemInstruction() != null) {
            character.setSystemInstruction(request.getSystemInstruction());
        }
        if (request.getVoiceName() != null) {
            character.setVoiceName(request.getVoiceName());
        }
        if (request.getThemeColor() != null) {
            character.setThemeColor(request.getThemeColor());
        }
        if (request.getColorAccent() != null) {
            character.setColorAccent(request.getColorAccent());
        }
        if (request.getIsEnabled() != null) {
            character.setIsEnabled(request.getIsEnabled());
        }
        
        EduCharacter saved = characterRepository.save(character);
        log.info("数字人角色更新成功: id={}", saved.getId());
        return saved;
    }
    
    @Override
    @Transactional
    public void deleteCharacter(Long id) {
        log.info("删除数字人角色（软删除）: id={}", id);
        
        EduCharacter character = getCharacterById(id);
        character.setIsDeleted(true);
        character.setDeletedAt(LocalDateTime.now());
        
        characterRepository.save(character);
        log.info("数字人角色删除成功: id={}", id);
    }
}
