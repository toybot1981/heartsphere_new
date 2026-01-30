package com.heartsphere.memory.service;

import com.heartsphere.memory.entity.CharacterKnowledgeAssetEntity;
import com.heartsphere.memory.entity.CharacterLearningHistoryEntity;
import com.heartsphere.memory.repository.jpa.CharacterKnowledgeAssetRepository;
import com.heartsphere.memory.repository.jpa.CharacterLearningHistoryRepository;
import com.heartsphere.memory.util.ExperienceLevelCalculator;
import com.heartsphere.memory.util.SensitiveInfoDetector;
import com.heartsphere.memory.util.SimilarityCalculator;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 角色知识资产服务
 * 管理角色的知识资产生命周期：创建、查询、更新、反馈、审核等
 * 
 * @author HeartSphere
 * @date 2026-01-24
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CharacterKnowledgeAssetService {
    
    private final CharacterKnowledgeAssetRepository assetRepository;
    private final CharacterLearningHistoryRepository historyRepository;
    private final SensitiveInfoDetector sensitiveInfoDetector;
    private final SimilarityCalculator similarityCalculator;
    private final ExperienceLevelCalculator experienceLevelCalculator;
    private final ObjectMapper objectMapper;
    
    /**
     * 创建新的知识资产
     * 
     * @param characterId 角色ID
     * @param assetType 资产类型
     * @param title 标题
     * @param content 内容
     * @param summary 摘要
     * @param sourceConversationId 来源对话ID（可选）
     * @return 创建的资产
     */
    @Transactional
    public CharacterKnowledgeAssetEntity createAsset(
        Long characterId,
        String assetType,
        String title,
        String content,
        String summary,
        Long sourceConversationId) {
        
        log.info("创建知识资产 - 角色ID: {}, 类型: {}, 标题: {}", characterId, assetType, title);
        
        // 1. 检测隐私信息
        if (sensitiveInfoDetector.hasSensitiveInfo(content)) {
            log.warn("检测到隐私信息，阻止资产升级 - 角色ID: {}, 标题: {}", characterId, title);
            throw new IllegalArgumentException("内容包含隐私信息，无法升级为资产");
        }
        
        // 2. 检测相似资产
        List<CharacterKnowledgeAssetEntity> similarAssets = findSimilarAssets(characterId, summary, 0.8);
        if (!similarAssets.isEmpty()) {
            log.warn("检测到相似资产 - 角色ID: {}, 标题: {}, 相似资产数: {}", characterId, title, similarAssets.size());
            // 不完全阻止，但需要人工审核
        }
        
        // 3. 创建资产
        CharacterKnowledgeAssetEntity asset = CharacterKnowledgeAssetEntity.builder()
            .characterId(characterId)
            .assetType(assetType)
            .title(title)
            .content(content)
            .summary(summary != null ? summary : content.substring(0, Math.min(500, content.length())))
            .sourceConversationId(sourceConversationId)
            .trustScore(50)  // 初始信任度 50
            .usageCount(0)
            .positiveFeedbackCount(0)
            .negativeFeedbackCount(0)
            .isAutoPromoted(sourceConversationId != null)  // 从对话自动升级
            .isApproved(false)  // 默认需要审核
            .createdAt(LocalDateTime.now())
            .lastUsedAt(null)
            .build();
        
        asset = assetRepository.save(asset);
        
        // 4. 记录学习事件
        recordLearningEvent(characterId, "ASSET_PROMOTED", asset.getId(),
            "新知识资产被升级：" + title, Collections.singletonMap("assetType", assetType));
        
        return asset;
    }
    
    /**
     * 查找相似的资产
     */
    private List<CharacterKnowledgeAssetEntity> findSimilarAssets(Long characterId, String summary, double threshold) {
        if (summary == null || summary.isEmpty()) {
            return Collections.emptyList();
        }
        
        Pageable pageable = PageRequest.of(0, 10);
        List<CharacterKnowledgeAssetEntity> assets = assetRepository.findByCharacterIdOrderByCreatedAtDesc(characterId, pageable);
        
        return assets.stream()
            .filter(a -> {
                double similarity = similarityCalculator.calculateJaccardSimilarity(summary, a.getSummary());
                return similarity > threshold * 100;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * 根据关键词检索相关资产
     * 
     * @param characterId 角色ID
     * @param keywords 关键词
     * @param limit 返回数量限制
     * @return 相关资产列表（已排序）
     */
    public List<CharacterKnowledgeAssetEntity> getRelatedAssets(Long characterId, String keywords, int limit) {
        if (keywords == null || keywords.isEmpty()) {
            return Collections.emptyList();
        }
        
        Pageable pageable = PageRequest.of(0, limit * 3);  // 取更多候选
        List<CharacterKnowledgeAssetEntity> assets = assetRepository
            .findByCharacterIdAndIsApprovedTrueOrderByTrustScoreDesc(characterId, pageable);
        
        // 按相关性和信任度排序
        return assets.stream()
            .map(a -> new AbstractMap.SimpleEntry<>(a,
                calculateRelevance(keywords, a.getTitle(), a.getContent(), a.getTrustScore())))
            .filter(e -> e.getValue() > 0)
            .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
            .limit(limit)
            .map(AbstractMap.SimpleEntry::getKey)
            .collect(Collectors.toList());
    }
    
    /**
     * 计算相关性评分
     */
    private double calculateRelevance(String keywords, String title, String content, Integer trustScore) {
        double similarity = 0;
        
        // 标题匹配权重更高
        if (title != null && title.toLowerCase().contains(keywords.toLowerCase())) {
            similarity += 50;
        }
        
        // 内容匹配
        if (content != null) {
            double contentSim = similarityCalculator.calculateJaccardSimilarity(keywords, content);
            similarity += contentSim * 0.5;
        }
        
        // 信任度加权
        if (trustScore != null) {
            similarity *= (trustScore / 100.0);
        }
        
        return similarity;
    }
    
    /**
     * 提交反馈并更新资产信任度
     * 
     * @param assetId 资产ID
     * @param feedbackType "positive" 或 "negative"
     */
    @Transactional
    public void submitFeedback(Long assetId, String feedbackType) {
        CharacterKnowledgeAssetEntity asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new IllegalArgumentException("资产不存在"));
        
        log.info("提交资产反馈 - 资产ID: {}, 反馈类型: {}", assetId, feedbackType);
        
        if ("positive".equalsIgnoreCase(feedbackType)) {
            assetRepository.incrementPositiveFeedbackCount(assetId);
        } else if ("negative".equalsIgnoreCase(feedbackType)) {
            assetRepository.incrementNegativeFeedbackCount(assetId);
        }
        
        // 重新计算信任度
        recalculateTrustScore(asset);
        
        // 记录反馈事件
        recordLearningEvent(asset.getCharacterId(), "FEEDBACK_RECEIVED", assetId,
            "资产收到" + feedbackType + "评价", Collections.singletonMap("feedbackType", feedbackType));
    }
    
    /**
     * 重新计算信任度
     */
    @Transactional
    public void recalculateTrustScore(CharacterKnowledgeAssetEntity asset) {
        int totalFeedback = asset.getPositiveFeedbackCount() + asset.getNegativeFeedbackCount();
        
        if (totalFeedback == 0) {
            // 没有反馈，保持原样
            return;
        }
        
        // 信任度 = (正面 - 负面) / 总数 * 100
        int newScore = (int) ((asset.getPositiveFeedbackCount() - asset.getNegativeFeedbackCount()) 
            * 100.0 / totalFeedback);
        
        // 限制在 0-100 范围内
        newScore = Math.max(0, Math.min(100, newScore + 50));  // +50 使其在 0-100 范围
        
        assetRepository.updateTrustScore(asset.getId(), newScore, LocalDateTime.now());
        
        log.info("更新资产信任度 - 资产ID: {}, 新信任度: {}", asset.getId(), newScore);
    }
    
    /**
     * 批准资产
     */
    @Transactional
    public void approveAsset(Long assetId, String approvedBy) {
        assetRepository.approveAsset(assetId, approvedBy, LocalDateTime.now());
        
        log.info("资产已批准 - 资产ID: {}, 审核者: {}", assetId, approvedBy);
        
        CharacterKnowledgeAssetEntity asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new IllegalArgumentException("资产不存在"));
        
        recordLearningEvent(asset.getCharacterId(), "ASSET_UPDATED", assetId,
            "资产已通过审核", Collections.singletonMap("status", "approved"));
    }
    
    /**
     * 更新角色的经验等级
     */
    @Transactional
    public void updateCharacterExperienceLevel(Long characterId) {
        long assetCount = assetRepository.countByCharacterIdAndIsApprovedTrue(characterId);
        Double avgTrustScore = assetRepository.getAverageTrustScore(characterId);
        
        if (avgTrustScore == null) {
            avgTrustScore = 0.0;
        }
        
        ExperienceLevelCalculator.ExperienceLevel newLevel = 
            experienceLevelCalculator.calculateLevel(assetCount, avgTrustScore);
        
        log.info("更新角色经验等级 - 角色ID: {}, 资产数: {}, 平均信任度: {}, 新等级: {}", 
            characterId, assetCount, avgTrustScore, newLevel.name);
        
        recordLearningEvent(characterId, "LEVEL_UP", null,
            "角色晋升到" + newLevel.name, 
            Collections.singletonMap("newLevel", newLevel.level));
    }
    
    /**
     * 记录学习事件
     */
    private void recordLearningEvent(Long characterId, String eventType, Long assetId, 
                                     String description, Map<String, Object> metadata) {
        try {
            CharacterLearningHistoryEntity history = CharacterLearningHistoryEntity.builder()
                .characterId(characterId)
                .eventType(eventType)
                .assetId(assetId)
                .description(description)
                .metadata(objectMapper.writeValueAsString(metadata))
                .createdAt(LocalDateTime.now())
                .build();
            
            historyRepository.save(history);
        } catch (Exception e) {
            log.error("记录学习事件失败", e);
        }
    }
    
    /**
     * 应用自动衰减
     * 对 30+ 天未使用的资产降低相关性
     */
    @Transactional
    public void applyAutomaticDecay() {
        log.info("开始应用自动衰减...");
        
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minus(30, ChronoUnit.DAYS);
        Pageable pageable = PageRequest.of(0, 100);
        
        // 遍历所有角色的资产（简化实现）
        // 实际应该遍历所有角色
        // 这里只是展示逻辑，完整实现需要优化查询
    }
}
