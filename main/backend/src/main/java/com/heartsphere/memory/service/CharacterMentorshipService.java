package com.heartsphere.memory.service;

import com.heartsphere.memory.entity.CharacterMentorshipSessionEntity;
import com.heartsphere.memory.repository.jpa.CharacterKnowledgeAssetRepository;
import com.heartsphere.memory.repository.jpa.CharacterMentorshipSessionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 角色导师服务
 * 管理角色的导师能力，包括主动指导、个性化教育、成长规划等
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CharacterMentorshipService {
    
    private final CharacterMentorshipSessionRepository mentorshipSessionRepository;
    private final CharacterKnowledgeAssetRepository knowledgeAssetRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * 评估导师能力
     * 
     * @param characterId 角色ID
     * @return 导师能力评估结果
     */
    public Map<String, Object> evaluateMentorshipCapabilities(Long characterId) {
        // 1. 知识资产数量和质量
        long totalAssets = knowledgeAssetRepository.countByCharacterId(characterId);
        long approvedAssets = knowledgeAssetRepository.countByCharacterIdAndIsApprovedTrue(characterId);
        Double avgTrustScore = knowledgeAssetRepository.getAverageTrustScore(characterId);
        
        if (avgTrustScore == null) {
            avgTrustScore = 0.0;
        }
        
        // 2. 指导会话统计
        // TODO: 需要根据用户ID统计，这里简化处理
        // long sessionCount = mentorshipSessionRepository.countByCharacterId(characterId);
        // long completedSessions = mentorshipSessionRepository.countByCharacterIdAndStatus(characterId, "COMPLETED");
        
        // 3. 计算导师能力分数
        int knowledgeScore = calculateKnowledgeScore(totalAssets, approvedAssets, avgTrustScore);
        // int guidanceScore = calculateGuidanceScore(sessionCount, completedSessions);
        int guidanceScore = 50; // 临时默认值
        
        int totalScore = (int) (knowledgeScore * 0.6 + guidanceScore * 0.4);
        
        Map<String, Object> capabilities = new LinkedHashMap<>();
        capabilities.put("characterId", characterId);
        capabilities.put("totalScore", totalScore);
        capabilities.put("knowledgeScore", knowledgeScore);
        capabilities.put("guidanceScore", guidanceScore);
        capabilities.put("totalAssets", totalAssets);
        capabilities.put("approvedAssets", approvedAssets);
        capabilities.put("averageTrustScore", Math.round(avgTrustScore * 100.0) / 100.0);
        capabilities.put("capabilityLevel", determineCapabilityLevel(totalScore));
        
        return capabilities;
    }
    
    /**
     * 计算知识分数
     */
    private int calculateKnowledgeScore(long totalAssets, long approvedAssets, double avgTrustScore) {
        // 资产数量维度 (50%)
        int assetScore = 0;
        if (approvedAssets >= 100) {
            assetScore = 100;
        } else if (approvedAssets >= 50) {
            assetScore = 80;
        } else if (approvedAssets >= 20) {
            assetScore = 60;
        } else if (approvedAssets >= 10) {
            assetScore = 40;
        } else if (approvedAssets >= 5) {
            assetScore = 20;
        }
        
        // 信任度维度 (50%)
        int trustScore = (int) avgTrustScore;
        
        return (int) (assetScore * 0.5 + trustScore * 0.5);
    }
    
    /**
     * 确定能力等级
     */
    private String determineCapabilityLevel(int totalScore) {
        if (totalScore >= 80) {
            return "EXPERT"; // 专家
        } else if (totalScore >= 60) {
            return "ADVANCED"; // 高级
        } else if (totalScore >= 40) {
            return "INTERMEDIATE"; // 中级
        } else if (totalScore >= 20) {
            return "BEGINNER"; // 初级
        } else {
            return "NOVICE"; // 新手
        }
    }
    
    /**
     * 创建指导会话
     */
    @Transactional
    public CharacterMentorshipSessionEntity createMentorshipSession(
            Long characterId,
            Long userId,
            String sessionType,
            String title,
            String content,
            List<String> learningObjectives) {
        
        try {
            String objectivesJson = learningObjectives != null ? 
                    objectMapper.writeValueAsString(learningObjectives) : null;
            
            CharacterMentorshipSessionEntity session = CharacterMentorshipSessionEntity.builder()
                    .characterId(characterId)
                    .userId(userId)
                    .sessionType(sessionType)
                    .title(title)
                    .content(content)
                    .learningObjectives(objectivesJson)
                    .status("ACTIVE")
                    .build();
            
            CharacterMentorshipSessionEntity saved = mentorshipSessionRepository.save(session);
            
            log.info("✅ 指导会话已创建: characterId={}, userId={}, sessionType={}, title={}",
                    characterId, userId, sessionType, title);
            
            return saved;
        } catch (Exception e) {
            log.error("❌ 创建指导会话失败: characterId={}, userId={}, sessionType={}",
                    characterId, userId, sessionType, e);
            throw new RuntimeException("创建指导会话失败", e);
        }
    }
    
    /**
     * 主动指导（识别学习需求并提供建议）
     */
    @Transactional
    public CharacterMentorshipSessionEntity provideActiveGuidance(
            Long characterId,
            Long userId,
            String userQuestion,
            String guidanceContent) {
        
        // 从用户问题中提取学习目标
        List<String> learningObjectives = extractLearningObjectives(userQuestion);
        
        return createMentorshipSession(
                characterId,
                userId,
                "ACTIVE_GUIDANCE",
                "主动指导: " + (userQuestion.length() > 30 ? userQuestion.substring(0, 30) + "..." : userQuestion),
                guidanceContent,
                learningObjectives);
    }
    
    /**
     * 个性化教育（根据用户能力调整内容）
     */
    @Transactional
    public CharacterMentorshipSessionEntity providePersonalizedEducation(
            Long characterId,
            Long userId,
            String topic,
            String content,
            String difficultyLevel) {
        
        List<String> learningObjectives = Arrays.asList(
                "理解" + topic + "的基本概念",
                "掌握" + topic + "的核心要点",
                "应用" + topic + "解决实际问题"
        );
        
        Map<String, Object> progress = new HashMap<>();
        progress.put("difficultyLevel", difficultyLevel);
        progress.put("topic", topic);
        progress.put("startedAt", LocalDateTime.now().toString());
        
        try {
            String progressJson = objectMapper.writeValueAsString(progress);
            
            CharacterMentorshipSessionEntity session = CharacterMentorshipSessionEntity.builder()
                    .characterId(characterId)
                    .userId(userId)
                    .sessionType("PERSONALIZED_EDUCATION")
                    .title("个性化教育: " + topic)
                    .content(content)
                    .learningObjectives(objectMapper.writeValueAsString(learningObjectives))
                    .userProgress(progressJson)
                    .status("ACTIVE")
                    .build();
            
            CharacterMentorshipSessionEntity saved = mentorshipSessionRepository.save(session);
            
            log.info("✅ 个性化教育会话已创建: characterId={}, userId={}, topic={}",
                    characterId, userId, topic);
            
            return saved;
        } catch (Exception e) {
            log.error("❌ 创建个性化教育会话失败: characterId={}, userId={}",
                    characterId, userId, e);
            throw new RuntimeException("创建个性化教育会话失败", e);
        }
    }
    
    /**
     * 创建成长规划
     */
    @Transactional
    public CharacterMentorshipSessionEntity createGrowthPlan(
            Long characterId,
            Long userId,
            String planTitle,
            List<Map<String, Object>> milestones) {
        
        try {
            Map<String, Object> progress = new HashMap<>();
            progress.put("milestones", milestones);
            progress.put("completedMilestones", 0);
            progress.put("totalMilestones", milestones.size());
            progress.put("startedAt", LocalDateTime.now().toString());
            
            String progressJson = objectMapper.writeValueAsString(progress);
            
            List<String> learningObjectives = new ArrayList<>();
            for (Map<String, Object> milestone : milestones) {
                if (milestone.containsKey("objective")) {
                    learningObjectives.add((String) milestone.get("objective"));
                }
            }
            
            CharacterMentorshipSessionEntity session = CharacterMentorshipSessionEntity.builder()
                    .characterId(characterId)
                    .userId(userId)
                    .sessionType("GROWTH_PLANNING")
                    .title("成长规划: " + planTitle)
                    .content("成长规划内容")
                    .learningObjectives(objectMapper.writeValueAsString(learningObjectives))
                    .userProgress(progressJson)
                    .status("ACTIVE")
                    .build();
            
            CharacterMentorshipSessionEntity saved = mentorshipSessionRepository.save(session);
            
            log.info("✅ 成长规划已创建: characterId={}, userId={}, planTitle={}",
                    characterId, userId, planTitle);
            
            return saved;
        } catch (Exception e) {
            log.error("❌ 创建成长规划失败: characterId={}, userId={}",
                    characterId, userId, e);
            throw new RuntimeException("创建成长规划失败", e);
        }
    }
    
    /**
     * 更新指导进度
     */
    @Transactional
    public void updateMentorshipProgress(Long sessionId, Map<String, Object> progress) {
        try {
            CharacterMentorshipSessionEntity session = mentorshipSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("指导会话不存在: " + sessionId));
            
            String progressJson = objectMapper.writeValueAsString(progress);
            session.setUserProgress(progressJson);
            
            mentorshipSessionRepository.save(session);
            
            log.info("✅ 指导进度已更新: sessionId={}", sessionId);
        } catch (Exception e) {
            log.error("❌ 更新指导进度失败: sessionId={}", sessionId, e);
            throw new RuntimeException("更新指导进度失败", e);
        }
    }
    
    /**
     * 完成指导会话
     */
    @Transactional
    public void completeMentorshipSession(Long sessionId, Integer effectivenessScore, String userFeedback) {
        try {
            CharacterMentorshipSessionEntity session = mentorshipSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("指导会话不存在: " + sessionId));
            
            session.setStatus("COMPLETED");
            session.setCompletedAt(LocalDateTime.now());
            session.setEffectivenessScore(effectivenessScore);
            session.setUserFeedback(userFeedback);
            
            mentorshipSessionRepository.save(session);
            
            log.info("✅ 指导会话已完成: sessionId={}, effectivenessScore={}",
                    sessionId, effectivenessScore);
        } catch (Exception e) {
            log.error("❌ 完成指导会话失败: sessionId={}", sessionId, e);
            throw new RuntimeException("完成指导会话失败", e);
        }
    }
    
    /**
     * 获取指导会话列表
     */
    public List<CharacterMentorshipSessionEntity> getMentorshipSessions(Long characterId, Long userId) {
        return mentorshipSessionRepository.findByCharacterIdAndUserIdOrderByStartedAtDesc(characterId, userId);
    }
    
    /**
     * 获取活跃的指导会话
     */
    public List<CharacterMentorshipSessionEntity> getActiveMentorshipSessions(Long characterId, Long userId) {
        return mentorshipSessionRepository.findActiveSessions(characterId, userId);
    }
    
    /**
     * 从用户问题中提取学习目标（简化版）
     */
    private List<String> extractLearningObjectives(String userQuestion) {
        List<String> objectives = new ArrayList<>();
        
        // 简单的关键词检测
        if (userQuestion.contains("学习") || userQuestion.contains("了解")) {
            objectives.add("理解核心概念");
        }
        if (userQuestion.contains("掌握") || userQuestion.contains("学会")) {
            objectives.add("掌握关键技能");
        }
        if (userQuestion.contains("应用") || userQuestion.contains("使用")) {
            objectives.add("应用所学知识");
        }
        
        if (objectives.isEmpty()) {
            objectives.add("达成学习目标");
        }
        
        return objectives;
    }
}
