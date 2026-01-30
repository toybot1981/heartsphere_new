package com.heartsphere.capability.service.growth;

import com.heartsphere.capability.service.growth.CapabilityLevelService;
import com.heartsphere.memory.service.CharacterCompanionshipService;
import com.heartsphere.memory.util.RelationshipDepthCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * 能力-关系联动服务
 * 实现能力成长与关系发展相互促进的机制
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CapabilityRelationshipLinkageService {
    
    private final CapabilityLevelService levelService;
    private final RelationshipCapabilityGrowthService growthService;
    private final CharacterCompanionshipService companionshipService;
    
    /**
     * 根据关系阶段调整能力成长速度
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @param baseExperience 基础经验值
     * @return 调整后的经验值
     */
    @Transactional
    public long adjustExperienceByRelationshipStage(Long characterId, Long userId, long baseExperience) {
        // 获取当前关系阶段
        String relationshipStage = getCurrentRelationshipStage(characterId, userId);
        
        // 根据关系阶段调整经验值
        long adjustedExperience = growthService.adjustExperienceByRelationshipStage(
            characterId, relationshipStage, baseExperience);
        
        log.info("根据关系阶段调整经验: characterId={}, stage={}, base={}, adjusted={}", 
            characterId, relationshipStage, baseExperience, adjustedExperience);
        
        return adjustedExperience;
    }
    
    /**
     * 根据能力等级评估关系发展阶段
     * 能力等级提升可以降低关系阶段转换的阈值
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @return 是否应该重新评估关系阶段
     */
    @Transactional
    public boolean evaluateRelationshipStageByCapability(Long characterId, Long userId) {
        // 获取能力等级
        int mentorshipLevel = levelService.calculateMentorshipLevel(characterId);
        int companionshipLevel = levelService.calculateCompanionshipLevel(characterId);
        int relationshipLevel = levelService.calculateRelationshipLevel(characterId);
        
        // 如果导师能力等级达到高级（>=5级），更容易成为导师
        if (mentorshipLevel >= 5) {
            log.info("导师能力等级达到高级，可能触发关系阶段转换: characterId={}, level={}", 
                characterId, mentorshipLevel);
            // 这里可以触发关系阶段重新评估
            return true;
        }
        
        // 如果挚友能力等级达到高级（>=5级），更容易成为挚友
        if (companionshipLevel >= 5) {
            log.info("挚友能力等级达到高级，可能触发关系阶段转换: characterId={}, level={}", 
                characterId, companionshipLevel);
            return true;
        }
        
        return false;
    }
    
    /**
     * 获取当前关系阶段
     */
    public String getCurrentRelationshipStage(Long characterId, Long userId) {
        try {
            Map<String, Object> relationshipInfo = companionshipService.getRelationshipInfo(characterId, userId);
            Object stage = relationshipInfo.get("relationshipStage");
            return stage != null ? stage.toString() : "STRANGER";
        } catch (Exception e) {
            log.warn("获取关系阶段失败: characterId={}, userId={}", characterId, userId, e);
            return "STRANGER";
        }
    }
    
    /**
     * 记录能力-关系联动事件
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @param linkageType 联动类型: RELATIONSHIP_TO_CAPABILITY / CAPABILITY_TO_RELATIONSHIP
     * @param effect 联动效果
     */
    public void recordLinkageEvent(Long characterId, Long userId, String linkageType, double effect) {
        log.info("能力-关系联动事件: characterId={}, userId={}, type={}, effect={}", 
            characterId, userId, linkageType, effect);
        
        // TODO: 可以记录到能力协同日志表
        // capabilitySynergyLogRepository.save(...)
    }
}
