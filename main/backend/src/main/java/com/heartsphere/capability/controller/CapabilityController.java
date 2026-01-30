package com.heartsphere.capability.controller;

import com.heartsphere.capability.entity.RoleCapabilityProfile;
import com.heartsphere.capability.entity.CapabilityExperience;
import com.heartsphere.capability.entity.CapabilitySynergyLog;
import com.heartsphere.capability.service.assessment.CapabilityAssessmentService;
import com.heartsphere.capability.service.assessment.CapabilityOptimizationService;
import com.heartsphere.capability.service.assessment.RelationshipCapabilityAssessmentService;
import com.heartsphere.capability.service.integration.CapabilitySynergyEngine;
import com.heartsphere.capability.service.integration.CapabilitySynergyService;
import com.heartsphere.capability.service.growth.CapabilityExperienceService;
import com.heartsphere.capability.service.growth.CapabilityLevelService;
import com.heartsphere.capability.service.growth.GrowthEventSyncService;
import com.heartsphere.capability.service.integration.RelationshipCapabilityIntegrationService;
import com.heartsphere.capability.service.integration.RoleCapabilityModelService;
import com.heartsphere.capability.service.personalization.CapabilityPersonalizationService;
import com.heartsphere.capability.service.personalization.CapabilityCombinationService;
import com.heartsphere.capability.service.visualization.CapabilityVisualizationService;
import com.heartsphere.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 角色能力体系控制器
 * 提供能力体系相关的API接口
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@RestController
@RequestMapping("/api/capability/v1/character")
@RequiredArgsConstructor
@Tag(name = "角色能力体系", description = "角色能力体系相关API")
public class CapabilityController {
    
    private final RoleCapabilityModelService capabilityModelService;
    private final RelationshipCapabilityIntegrationService relationshipIntegrationService;
    private final CapabilityExperienceService experienceService;
    private final CapabilityLevelService levelService;
    private final GrowthEventSyncService syncService;
    private final CapabilityAssessmentService assessmentService;
    private final RelationshipCapabilityAssessmentService relationshipAssessmentService;
    private final CapabilityOptimizationService optimizationService;
    private final CapabilitySynergyEngine synergyEngine;
    private final CapabilitySynergyService synergyService;
    private final CapabilityPersonalizationService personalizationService;
    private final CapabilityCombinationService combinationService;
    private final CapabilityVisualizationService visualizationService;
    
    /**
     * 获取角色能力档案
     */
    @GetMapping("/{characterId}/profile")
    @Operation(summary = "获取角色能力档案", description = "获取角色的多维度能力评估结果")
    public ResponseEntity<ApiResponse<RoleCapabilityProfile>> getCapabilityProfile(
            @PathVariable Long characterId) {
        try {
            Optional<RoleCapabilityProfile> profileOpt = capabilityModelService.getProfile(characterId);
            
            if (profileOpt.isEmpty()) {
                // 如果不存在，创建新的档案
                RoleCapabilityProfile profile = capabilityModelService.getOrCreateProfile(characterId);
                return ResponseEntity.ok(ApiResponse.success(profile));
            }
            
            return ResponseEntity.ok(ApiResponse.success(profileOpt.get()));
        } catch (Exception e) {
            log.error("获取角色能力档案失败: characterId={}", characterId, e);
            return ResponseEntity.ok(ApiResponse.error("获取角色能力档案失败: " + e.getMessage()));
        }
    }
    
    /**
     * 整合关系维度能力
     */
    @PostMapping("/{characterId}/relationship/integrate")
    @Operation(summary = "整合关系维度能力", description = "整合导师和挚友能力到关系维度")
    public ResponseEntity<ApiResponse<RelationshipCapabilityIntegrationService.RelationshipCapabilityDTO>> integrateRelationshipCapability(
            @PathVariable Long characterId,
            @RequestParam Long userId) {
        try {
            RelationshipCapabilityIntegrationService.RelationshipCapabilityDTO result = 
                relationshipIntegrationService.integrateRelationshipCapability(characterId, userId);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("整合关系维度能力失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("整合关系维度能力失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取角色能力经验值
     */
    @GetMapping("/{characterId}/experience")
    @Operation(summary = "获取角色能力经验值", description = "获取角色在各维度的经验值")
    public ResponseEntity<ApiResponse<CapabilityExperience>> getCapabilityExperience(
            @PathVariable Long characterId) {
        try {
            return experienceService.getExperience(characterId)
                .map(exp -> ResponseEntity.ok(ApiResponse.success(exp)))
                .orElseGet(() -> {
                    // 如果不存在，创建新的经验记录
                    CapabilityExperience exp = experienceService.getOrCreateExperience(characterId);
                    return ResponseEntity.ok(ApiResponse.success(exp));
                });
        } catch (Exception e) {
            log.error("获取角色能力经验值失败: characterId={}", characterId, e);
            return ResponseEntity.ok(ApiResponse.error("获取角色能力经验值失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取角色能力等级
     */
    @GetMapping("/{characterId}/levels")
    @Operation(summary = "获取角色能力等级", description = "获取角色在各维度的能力等级")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getCapabilityLevels(
            @PathVariable Long characterId) {
        try {
            Map<String, Integer> levels = Map.of(
                "skill", levelService.calculateSkillLevel(characterId),
                "memory", levelService.calculateMemoryLevel(characterId),
                "consciousness", levelService.calculateConsciousnessLevel(characterId),
                "relationship", levelService.calculateRelationshipLevel(characterId),
                "mentorship", levelService.calculateMentorshipLevel(characterId),
                "companionship", levelService.calculateCompanionshipLevel(characterId),
                "overall", levelService.calculateOverallLevel(characterId)
            );
            return ResponseEntity.ok(ApiResponse.success(levels));
        } catch (Exception e) {
            log.error("获取角色能力等级失败: characterId={}", characterId, e);
            return ResponseEntity.ok(ApiResponse.error("获取角色能力等级失败: " + e.getMessage()));
        }
    }
    
    /**
     * 同步成长事件
     */
    @PostMapping("/{characterId}/sync-growth-events")
    @Operation(summary = "同步成长事件", description = "将历史成长事件转换为能力经验值")
    public ResponseEntity<ApiResponse<Integer>> syncGrowthEvents(
            @PathVariable Long characterId,
            @RequestParam Long userId) {
        try {
            int processedCount = syncService.syncGrowthEvents(characterId, userId);
            return ResponseEntity.ok(ApiResponse.success(processedCount));
        } catch (Exception e) {
            log.error("同步成长事件失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("同步成长事件失败: " + e.getMessage()));
        }
    }
    
    /**
     * 评估关系维度能力
     */
    @PostMapping("/{characterId}/relationship/assess")
    @Operation(summary = "评估关系维度能力", description = "整合导师和挚友能力评估")
    public ResponseEntity<ApiResponse<RelationshipCapabilityAssessmentService.RelationshipCapabilityAssessmentDTO>> assessRelationshipCapability(
            @PathVariable Long characterId,
            @RequestParam Long userId) {
        try {
            RelationshipCapabilityAssessmentService.RelationshipCapabilityAssessmentDTO result = 
                relationshipAssessmentService.assessRelationshipCapability(characterId, userId);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("评估关系维度能力失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("评估关系维度能力失败: " + e.getMessage()));
        }
    }
    
    /**
     * 全面能力评估
     */
    @PostMapping("/{characterId}/assess")
    @Operation(summary = "全面能力评估", description = "评估所有维度的能力")
    public ResponseEntity<ApiResponse<CapabilityAssessmentService.FullCapabilityAssessmentDTO>> assessAllCapabilities(
            @PathVariable Long characterId,
            @RequestParam Long userId) {
        try {
            CapabilityAssessmentService.FullCapabilityAssessmentDTO result = 
                assessmentService.assessAllCapabilities(characterId, userId);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("全面能力评估失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("全面能力评估失败: " + e.getMessage()));
        }
    }
    
    /**
     * 生成能力优化建议
     */
    @GetMapping("/{characterId}/optimization-suggestions")
    @Operation(summary = "生成能力优化建议", description = "基于评估结果生成优化建议")
    public ResponseEntity<ApiResponse<List<CapabilityOptimizationService.OptimizationSuggestion>>> getOptimizationSuggestions(
            @PathVariable Long characterId) {
        try {
            List<CapabilityOptimizationService.OptimizationSuggestion> suggestions = 
                optimizationService.generateOptimizationSuggestions(characterId);
            return ResponseEntity.ok(ApiResponse.success(suggestions));
        } catch (Exception e) {
            log.error("生成能力优化建议失败: characterId={}", characterId, e);
            return ResponseEntity.ok(ApiResponse.error("生成能力优化建议失败: " + e.getMessage()));
        }
    }
    
    /**
     * 查询能力协同历史
     */
    @GetMapping("/{characterId}/synergy/history")
    @Operation(summary = "查询能力协同历史", description = "查询角色的能力协同历史记录")
    public ResponseEntity<ApiResponse<Page<CapabilitySynergyLog>>> getSynergyHistory(
            @PathVariable Long characterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<CapabilitySynergyLog> history = synergyService.getSynergyHistory(characterId, pageable);
            return ResponseEntity.ok(ApiResponse.success(history));
        } catch (Exception e) {
            log.error("查询能力协同历史失败: characterId={}", characterId, e);
            return ResponseEntity.ok(ApiResponse.error("查询能力协同历史失败: " + e.getMessage()));
        }
    }
    
    /**
     * 查询指定类型的协同日志
     */
    @GetMapping("/{characterId}/synergy/type/{synergyType}")
    @Operation(summary = "查询指定类型的协同日志", description = "查询指定协同类型的日志")
    public ResponseEntity<ApiResponse<List<CapabilitySynergyLog>>> getSynergyByType(
            @PathVariable Long characterId,
            @PathVariable String synergyType) {
        try {
            List<CapabilitySynergyLog> logs = synergyService.getSynergyByType(characterId, synergyType);
            return ResponseEntity.ok(ApiResponse.success(logs));
        } catch (Exception e) {
            log.error("查询协同日志失败: characterId={}, type={}", characterId, synergyType, e);
            return ResponseEntity.ok(ApiResponse.error("查询协同日志失败: " + e.getMessage()));
        }
    }
    
    /**
     * 统计能力协同效果
     */
    @GetMapping("/{characterId}/synergy/statistics")
    @Operation(summary = "统计能力协同效果", description = "统计角色的能力协同效果")
    public ResponseEntity<ApiResponse<CapabilitySynergyService.SynergyStatisticsDTO>> getSynergyStatistics(
            @PathVariable Long characterId) {
        try {
            CapabilitySynergyService.SynergyStatisticsDTO statistics = 
                synergyService.getSynergyStatistics(characterId);
            return ResponseEntity.ok(ApiResponse.success(statistics));
        } catch (Exception e) {
            log.error("统计能力协同效果失败: characterId={}", characterId, e);
            return ResponseEntity.ok(ApiResponse.error("统计能力协同效果失败: " + e.getMessage()));
        }
    }
    
    /**
     * 手动触发关系-技能协同
     */
    @PostMapping("/{characterId}/synergy/relationship-skill")
    @Operation(summary = "触发关系-技能协同", description = "手动触发关系-技能协同处理")
    public ResponseEntity<ApiResponse<String>> triggerRelationshipSkillSynergy(
            @PathVariable Long characterId,
            @RequestParam Long userId,
            @RequestParam Long skillId,
            @RequestParam(required = false) String skillType) {
        try {
            synergyEngine.processRelationshipSkillSynergy(characterId, userId, skillId, skillType);
            return ResponseEntity.ok(ApiResponse.success("关系-技能协同已触发"));
        } catch (Exception e) {
            log.error("触发关系-技能协同失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("触发关系-技能协同失败: " + e.getMessage()));
        }
    }
    
    /**
     * 基于关系定位的能力个性化
     */
    @PostMapping("/{characterId}/personalize")
    @Operation(summary = "能力个性化", description = "基于关系定位实现能力个性化")
    public ResponseEntity<ApiResponse<CapabilityPersonalizationService.PersonalizationConfigDTO>> personalizeCapability(
            @PathVariable Long characterId,
            @RequestParam Long userId) {
        try {
            CapabilityPersonalizationService.PersonalizationConfigDTO config = 
                personalizationService.personalizeByRelationship(characterId, userId);
            return ResponseEntity.ok(ApiResponse.success(config));
        } catch (Exception e) {
            log.error("能力个性化失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("能力个性化失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取能力发展建议
     */
    @GetMapping("/{characterId}/development-suggestions")
    @Operation(summary = "获取能力发展建议", description = "基于当前能力状态和关系阶段提供发展建议")
    public ResponseEntity<ApiResponse<List<CapabilityPersonalizationService.DevelopmentSuggestion>>> getDevelopmentSuggestions(
            @PathVariable Long characterId,
            @RequestParam Long userId) {
        try {
            List<CapabilityPersonalizationService.DevelopmentSuggestion> suggestions = 
                personalizationService.getDevelopmentSuggestions(characterId, userId);
            return ResponseEntity.ok(ApiResponse.success(suggestions));
        } catch (Exception e) {
            log.error("获取能力发展建议失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("获取能力发展建议失败: " + e.getMessage()));
        }
    }
    
    /**
     * 推荐能力组合
     */
    @GetMapping("/{characterId}/combination/recommend")
    @Operation(summary = "推荐能力组合", description = "基于关系阶段和场景推荐最优能力组合")
    public ResponseEntity<ApiResponse<CapabilityCombinationService.CapabilityCombinationDTO>> recommendCombination(
            @PathVariable Long characterId,
            @RequestParam Long userId,
            @RequestParam(required = false) String scenario) {
        try {
            CapabilityCombinationService.CapabilityCombinationDTO combination = 
                combinationService.recommendCombination(characterId, userId, scenario);
            return ResponseEntity.ok(ApiResponse.success(combination));
        } catch (Exception e) {
            log.error("推荐能力组合失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("推荐能力组合失败: " + e.getMessage()));
        }
    }
    
    /**
     * 评估能力组合效果
     */
    @PostMapping("/{characterId}/combination/evaluate")
    @Operation(summary = "评估能力组合效果", description = "评估能力组合的使用效果")
    public ResponseEntity<ApiResponse<CapabilityCombinationService.CombinationEffectDTO>> evaluateCombination(
            @PathVariable Long characterId,
            @RequestBody CapabilityCombinationService.CapabilityCombinationDTO combination) {
        try {
            CapabilityCombinationService.CombinationEffectDTO effect = 
                combinationService.evaluateCombinationEffect(characterId, combination);
            return ResponseEntity.ok(ApiResponse.success(effect));
        } catch (Exception e) {
            log.error("评估能力组合效果失败: characterId={}", characterId, e);
            return ResponseEntity.ok(ApiResponse.error("评估能力组合效果失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取能力雷达图数据
     */
    @GetMapping("/{characterId}/visualization/radar")
    @Operation(summary = "获取能力雷达图数据", description = "获取包含关系维度的能力雷达图数据")
    public ResponseEntity<ApiResponse<CapabilityVisualizationService.RadarChartDataDTO>> getRadarChartData(
            @PathVariable Long characterId) {
        try {
            CapabilityVisualizationService.RadarChartDataDTO data = 
                visualizationService.getRadarChartData(characterId);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            log.error("获取能力雷达图数据失败: characterId={}", characterId, e);
            return ResponseEntity.ok(ApiResponse.error("获取能力雷达图数据失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取能力成长轨迹数据
     */
    @GetMapping("/{characterId}/visualization/growth-trajectory")
    @Operation(summary = "获取能力成长轨迹数据", description = "获取包含关系发展阶段的能力成长轨迹")
    public ResponseEntity<ApiResponse<CapabilityVisualizationService.GrowthTrajectoryDataDTO>> getGrowthTrajectoryData(
            @PathVariable Long characterId,
            @RequestParam Long userId) {
        try {
            CapabilityVisualizationService.GrowthTrajectoryDataDTO data = 
                visualizationService.getGrowthTrajectoryData(characterId, userId);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            log.error("获取能力成长轨迹数据失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("获取能力成长轨迹数据失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取能力使用统计数据
     */
    @GetMapping("/{characterId}/visualization/usage-statistics")
    @Operation(summary = "获取能力使用统计数据", description = "获取包含模式切换统计的能力使用数据")
    public ResponseEntity<ApiResponse<CapabilityVisualizationService.UsageStatisticsDTO>> getUsageStatistics(
            @PathVariable Long characterId) {
        try {
            CapabilityVisualizationService.UsageStatisticsDTO data = 
                visualizationService.getUsageStatistics(characterId);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            log.error("获取能力使用统计数据失败: characterId={}", characterId, e);
            return ResponseEntity.ok(ApiResponse.error("获取能力使用统计数据失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取关系-能力协同可视化数据
     */
    @GetMapping("/{characterId}/visualization/synergy")
    @Operation(summary = "获取关系-能力协同可视化数据", description = "获取关系-能力协同效果数据")
    public ResponseEntity<ApiResponse<CapabilityVisualizationService.SynergyVisualizationDataDTO>> getSynergyVisualizationData(
            @PathVariable Long characterId,
            @RequestParam Long userId) {
        try {
            CapabilityVisualizationService.SynergyVisualizationDataDTO data = 
                visualizationService.getSynergyVisualizationData(characterId, userId);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            log.error("获取关系-能力协同可视化数据失败: characterId={}, userId={}", characterId, userId, e);
            return ResponseEntity.ok(ApiResponse.error("获取关系-能力协同可视化数据失败: " + e.getMessage()));
        }
    }
}
