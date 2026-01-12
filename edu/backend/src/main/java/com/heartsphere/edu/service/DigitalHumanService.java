package com.heartsphere.edu.service;

import com.heartsphere.edu.dto.*;
import com.heartsphere.edu.entity.EduCharacter;
import com.heartsphere.edu.entity.EduCharacterInteraction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 数字人教育服务接口
 */
public interface DigitalHumanService {
    
    /**
     * 创建教育数字人角色
     */
    EduCharacter createCharacter(CreateCharacterRequest request);
    
    /**
     * 获取数字人角色列表（支持多条件筛选）
     */
    Page<EduCharacter> getCharacters(CharacterQuery query, Pageable pageable);
    
    /**
     * 根据ID获取数字人角色详情
     */
    EduCharacter getCharacterById(Long id);
    
    /**
     * 为学生推荐数字人角色
     */
    List<CharacterRecommendation> recommendCharacters(Long studentId, RecommendationCriteria criteria);
    
    /**
     * 记录学生与数字人的互动
     */
    EduCharacterInteraction recordInteraction(RecordInteractionRequest request);
    
    /**
     * 获取学生的互动历史
     */
    Page<EduCharacterInteraction> getStudentInteractions(Long studentId, InteractionQuery query, Pageable pageable);
    
    /**
     * 根据ID获取互动详情
     */
    EduCharacterInteraction getInteractionById(Long id);
    
    /**
     * 获取数字人的互动统计
     */
    CharacterStatistics getCharacterStatistics(Long characterId);
    
    /**
     * 更新数字人角色信息
     */
    EduCharacter updateCharacter(Long id, UpdateCharacterRequest request);
    
    /**
     * 删除数字人角色（软删除）
     */
    void deleteCharacter(Long id);
}
