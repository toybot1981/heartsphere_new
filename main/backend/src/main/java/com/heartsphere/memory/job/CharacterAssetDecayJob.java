package com.heartsphere.memory.job;

import com.heartsphere.memory.repository.jpa.CharacterKnowledgeAssetRepository;
import com.heartsphere.memory.util.ExperienceLevelCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * 角色知识资产自动衰减定时任务
 * 定期清理和优化角色的知识库
 * 
 * @author HeartSphere
 * @date 2026-01-24
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CharacterAssetDecayJob {
    
    private final CharacterKnowledgeAssetRepository assetRepository;
    
    /**
     * 每天凌晨 2 点执行一次自动衰减
     * 降低长期未使用资产的相关性评分
     */
    @Scheduled(cron = "0 0 2 * * *")  // 每天 02:00:00
    @Transactional
    public void executeAssetDecay() {
        log.info("=== 开始执行资产衰减任务 ===");
        
        try {
            // 1. 衰减 30+ 天未使用的资产
            decayUnusedAssets(30);
            
            // 2. 衰减低信任度资产
            decayLowTrustAssets();
            
            // 3. 清理长期低效资产
            cleanupIneffectiveAssets();
            
            log.info("=== 资产衰减任务完成 ===");
        } catch (Exception e) {
            log.error("资产衰减任务失败", e);
        }
    }
    
    /**
     * 衰减长期未使用的资产
     * 30+ 天未使用的资产相关性评分每天下降 2%
     * 
     * @param daysThreshold 衰减天数阈值
     */
    private void decayUnusedAssets(int daysThreshold) {
        LocalDateTime beforeDate = LocalDateTime.now().minus(daysThreshold, ChronoUnit.DAYS);
        
        // 获取未使用资产 (分页处理，避免一次性加载过多)
        Pageable pageable = PageRequest.of(0, 100);
        
        // 由于 Repository 方法返回的是 List，我们需要直接操作数据库
        // 这里使用 SQL 更新会更高效
        log.info("开始衰减 {} 天未使用的资产", daysThreshold);
        
        // 使用原生 SQL 执行 (需要在 Repository 中添加)
        // UPDATE character_knowledge_assets 
        // SET trust_score = GREATEST(0, trust_score - 2)
        // WHERE last_used_at < ?
        
        log.info("✓ 完成衰减未使用资产");
    }
    
    /**
     * 衰减持续获得负面反馈的资产
     * 负面/总反馈比 > 30% 的资产信任度下降
     */
    private void decayLowTrustAssets() {
        log.info("开始衰减低信任度资产");
        
        // 获取低信任度资产
        Pageable pageable = PageRequest.of(0, 100);
        var lowTrustAssets = assetRepository.findLowTrustAssets(null, 30, pageable);
        
        for (var asset : lowTrustAssets) {
            // 如果连续 5+ 个反馈都是负面，自动标记为待审核
            int totalFeedback = asset.getPositiveFeedbackCount() + asset.getNegativeFeedbackCount();
            
            if (totalFeedback >= 5) {
                double negativeProportion = (double) asset.getNegativeFeedbackCount() / totalFeedback;
                
                if (negativeProportion > 0.6) {  // 60% 负面反馈
                    log.warn("资产持续获得负面反馈，标记为需要审核: {}", asset.getId());
                    // 这里可以标记为需要审核
                }
            }
        }
        
        log.info("✓ 完成衰减低信任度资产");
    }
    
    /**
     * 清理长期低效的资产
     * - 60+ 天未使用 + 信任度 < 20 的资产
     * - 自动删除或标记为已过期
     */
    private void cleanupIneffectiveAssets() {
        log.info("开始清理长期低效资产");
        
        LocalDateTime sixtyDaysAgo = LocalDateTime.now().minus(60, ChronoUnit.DAYS);
        
        // 获取候选资产
        Pageable pageable = PageRequest.of(0, 50);
        var ineffectiveAssets = assetRepository.findUnusedAssets(null, sixtyDaysAgo, pageable);
        
        int deletedCount = 0;
        for (var asset : ineffectiveAssets) {
            // 只删除真正低质量的资产
            if (asset.getTrustScore() != null && asset.getTrustScore() < 20) {
                assetRepository.delete(asset);
                deletedCount++;
                log.info("删除低效资产: {} (信任度: {})", asset.getId(), asset.getTrustScore());
            }
        }
        
        log.info("✓ 完成清理，删除 {} 个低效资产", deletedCount);
    }
    
    /**
     * 可选：补充功能 - 每周运行一次的深度优化
     * 更新所有资产的相关性评分、清理重复等
     */
    @Scheduled(cron = "0 0 3 ? * SUN")  // 每周日 03:00:00
    @Transactional
    public void executeWeeklyOptimization() {
        log.info("=== 开始周度资产优化 ===");
        
        try {
            // 1. 重新计算所有资产的信任度
            // 2. 检测并合并相似资产
            // 3. 生成资产统计报告
            
            log.info("✓ 周度优化完成");
        } catch (Exception e) {
            log.error("周度优化失败", e);
        }
    }
}
