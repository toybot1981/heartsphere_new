package com.heartsphere.capability.service.visualization;

import com.heartsphere.capability.entity.CapabilityAssessment;
import com.heartsphere.capability.entity.CapabilityExperience;
import com.heartsphere.capability.entity.CapabilitySynergyLog;
import com.heartsphere.capability.entity.RoleCapabilityProfile;
import com.heartsphere.capability.repository.CapabilityAssessmentRepository;
import com.heartsphere.capability.repository.CapabilityExperienceRepository;
import com.heartsphere.capability.repository.CapabilitySynergyLogRepository;
import com.heartsphere.capability.repository.RoleCapabilityProfileRepository;
import com.heartsphere.capability.service.growth.CapabilityLevelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 能力可视化服务
 * 提供能力可视化所需的数据
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CapabilityVisualizationService {
    
    private final RoleCapabilityProfileRepository profileRepository;
    private final CapabilityExperienceRepository experienceRepository;
    private final CapabilityAssessmentRepository assessmentRepository;
    private final CapabilitySynergyLogRepository synergyLogRepository;
    private final CapabilityLevelService levelService;
    
    /**
     * 获取能力雷达图数据
     * 包含关系维度（挚友能力、导师能力）
     * 
     * @param characterId 角色ID
     * @return 雷达图数据
     */
    public RadarChartDataDTO getRadarChartData(Long characterId) {
        log.info("获取能力雷达图数据: characterId={}", characterId);
        
        Optional<RoleCapabilityProfile> profileOpt = profileRepository.findByCharacterId(characterId);
        
        if (profileOpt.isEmpty()) {
            // 返回默认数据
            return buildDefaultRadarChartData(characterId);
        }
        
        RoleCapabilityProfile profile = profileOpt.get();
        
        // 构建雷达图数据（5个维度）
        List<RadarDimension> dimensions = Arrays.asList(
            RadarDimension.builder()
                .name("技能")
                .code("SKILL")
                .score(profile.getSkillDimensionScore())
                .maxScore(100)
                .build(),
            RadarDimension.builder()
                .name("记忆")
                .code("MEMORY")
                .score(profile.getMemoryDimensionScore())
                .maxScore(100)
                .build(),
            RadarDimension.builder()
                .name("意识")
                .code("CONSCIOUSNESS")
                .score(profile.getConsciousnessDimensionScore())
                .maxScore(100)
                .build(),
            RadarDimension.builder()
                .name("协作")
                .code("COLLABORATION")
                .score(profile.getCollaborationDimensionScore())
                .maxScore(100)
                .build(),
            RadarDimension.builder()
                .name("关系")
                .code("RELATIONSHIP")
                .score(profile.getRelationshipDimensionScore())
                .maxScore(100)
                .subDimensions(Arrays.asList(
                    RadarSubDimension.builder()
                        .name("导师能力")
                        .code("MENTORSHIP")
                        .score(profile.getMentorshipCapabilityScore())
                        .build(),
                    RadarSubDimension.builder()
                        .name("挚友能力")
                        .code("COMPANIONSHIP")
                        .score(profile.getCompanionshipCapabilityScore())
                        .build()
                ))
                .build()
        );
        
        return RadarChartDataDTO.builder()
            .characterId(characterId)
            .dimensions(dimensions)
            .overallScore(profile.getOverallScore())
            .build();
    }
    
    /**
     * 获取能力成长轨迹数据
     * 包含关系发展阶段
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @return 成长轨迹数据
     */
    public GrowthTrajectoryDataDTO getGrowthTrajectoryData(Long characterId, Long userId) {
        log.info("获取能力成长轨迹数据: characterId={}, userId={}", characterId, userId);
        
        // 获取评估历史记录
        List<CapabilityAssessment> assessments = assessmentRepository
            .findByCharacterIdAndAssessmentTypeOrderByCreatedAtDesc(characterId, "FULL");
        
        // 构建成长轨迹点
        List<GrowthPoint> growthPoints = assessments.stream()
            .map(assessment -> GrowthPoint.builder()
                .timestamp(assessment.getCreatedAt())
                .skillScore(assessment.getSkillScore())
                .memoryScore(assessment.getMemoryScore())
                .consciousnessScore(assessment.getConsciousnessScore())
                .collaborationScore(assessment.getCollaborationScore())
                .relationshipScore(assessment.getRelationshipScore())
                .overallScore(assessment.getOverallScore())
                .build())
            .collect(Collectors.toList());
        
        // 获取能力经验值（用于计算成长速度）
        Optional<CapabilityExperience> experienceOpt = experienceRepository.findByCharacterId(characterId);
        long totalExperience = experienceOpt.map(CapabilityExperience::getTotalExperience).orElse(0L);
        
        return GrowthTrajectoryDataDTO.builder()
            .characterId(characterId)
            .userId(userId)
            .growthPoints(growthPoints)
            .totalExperience(totalExperience)
            .growthSpeed(calculateGrowthSpeed(growthPoints))
            .build();
    }
    
    /**
     * 获取能力使用统计数据
     * 包含模式切换统计
     * 
     * @param characterId 角色ID
     * @return 使用统计数据
     */
    public UsageStatisticsDTO getUsageStatistics(Long characterId) {
        log.info("获取能力使用统计数据: characterId={}", characterId);
        
        // 获取协同日志统计
        List<CapabilitySynergyLog> synergyLogs = synergyLogRepository
            .findByCharacterIdOrderByCreatedAtDesc(characterId);
        
        // 按类型统计
        Map<String, Long> synergyTypeCounts = synergyLogs.stream()
            .collect(Collectors.groupingBy(
                CapabilitySynergyLog::getSynergyType,
                Collectors.counting()
            ));
        
        // 计算平均协同效果
        double avgSynergyEffect = synergyLogs.stream()
            .mapToDouble(log -> log.getSynergyEffect().doubleValue())
            .average()
            .orElse(0.0);
        
        return UsageStatisticsDTO.builder()
            .characterId(characterId)
            .totalSynergies(synergyLogs.size())
            .synergyTypeCounts(synergyTypeCounts)
            .averageSynergyEffect(avgSynergyEffect)
            .build();
    }
    
    /**
     * 获取关系-能力协同可视化数据
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @return 协同可视化数据
     */
    public SynergyVisualizationDataDTO getSynergyVisualizationData(Long characterId, Long userId) {
        log.info("获取关系-能力协同可视化数据: characterId={}, userId={}", characterId, userId);
        
        // 获取关系-能力协同日志
        List<CapabilitySynergyLog> relationshipSynergies = synergyLogRepository
            .findByCharacterIdAndSynergyTypeOrderByCreatedAtDesc(characterId, "RELATIONSHIP_SKILL");
        
        relationshipSynergies.addAll(synergyLogRepository
            .findByCharacterIdAndSynergyTypeOrderByCreatedAtDesc(characterId, "RELATIONSHIP_MEMORY"));
        
        relationshipSynergies.addAll(synergyLogRepository
            .findByCharacterIdAndSynergyTypeOrderByCreatedAtDesc(characterId, "RELATIONSHIP_CONSCIOUSNESS"));
        
        // 构建协同数据点
        List<SynergyDataPoint> synergyPoints = relationshipSynergies.stream()
            .map(log -> SynergyDataPoint.builder()
                .timestamp(log.getCreatedAt())
                .synergyType(log.getSynergyType())
                .sourceDimension(log.getSourceDimension())
                .targetDimension(log.getTargetDimension())
                .effect(log.getSynergyEffect().doubleValue())
                .build())
            .collect(Collectors.toList());
        
        return SynergyVisualizationDataDTO.builder()
            .characterId(characterId)
            .userId(userId)
            .synergyPoints(synergyPoints)
            .totalSynergies(synergyPoints.size())
            .build();
    }
    
    /**
     * 构建默认雷达图数据
     */
    private RadarChartDataDTO buildDefaultRadarChartData(Long characterId) {
        List<RadarDimension> dimensions = Arrays.asList(
            RadarDimension.builder().name("技能").code("SKILL").score(0).maxScore(100).build(),
            RadarDimension.builder().name("记忆").code("MEMORY").score(0).maxScore(100).build(),
            RadarDimension.builder().name("意识").code("CONSCIOUSNESS").score(0).maxScore(100).build(),
            RadarDimension.builder().name("协作").code("COLLABORATION").score(0).maxScore(100).build(),
            RadarDimension.builder()
                .name("关系")
                .code("RELATIONSHIP")
                .score(0)
                .maxScore(100)
                .subDimensions(Arrays.asList(
                    RadarSubDimension.builder().name("导师能力").code("MENTORSHIP").score(0).build(),
                    RadarSubDimension.builder().name("挚友能力").code("COMPANIONSHIP").score(0).build()
                ))
                .build()
        );
        
        return RadarChartDataDTO.builder()
            .characterId(characterId)
            .dimensions(dimensions)
            .overallScore(0)
            .build();
    }
    
    /**
     * 计算成长速度
     */
    private double calculateGrowthSpeed(List<GrowthPoint> growthPoints) {
        if (growthPoints.size() < 2) {
            return 0.0;
        }
        
        // 计算最近两个点的得分差值
        GrowthPoint latest = growthPoints.get(0);
        GrowthPoint previous = growthPoints.get(growthPoints.size() - 1);
        
        long timeDiff = java.time.Duration.between(previous.getTimestamp(), latest.getTimestamp()).toDays();
        if (timeDiff == 0) {
            return 0.0;
        }
        
        int scoreDiff = latest.getOverallScore() - previous.getOverallScore();
        return (double) scoreDiff / timeDiff; // 每天增长分数
    }
    
    // DTO类定义
    @lombok.Data
    @lombok.Builder
    public static class RadarChartDataDTO {
        private Long characterId;
        private List<RadarDimension> dimensions;
        private Integer overallScore;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class RadarDimension {
        private String name;
        private String code;
        private Integer score;
        private Integer maxScore;
        private List<RadarSubDimension> subDimensions;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class RadarSubDimension {
        private String name;
        private String code;
        private Integer score;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class GrowthTrajectoryDataDTO {
        private Long characterId;
        private Long userId;
        private List<GrowthPoint> growthPoints;
        private Long totalExperience;
        private Double growthSpeed;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class GrowthPoint {
        private LocalDateTime timestamp;
        private Integer skillScore;
        private Integer memoryScore;
        private Integer consciousnessScore;
        private Integer collaborationScore;
        private Integer relationshipScore;
        private Integer overallScore;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class UsageStatisticsDTO {
        private Long characterId;
        private Integer totalSynergies;
        private Map<String, Long> synergyTypeCounts;
        private Double averageSynergyEffect;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class SynergyVisualizationDataDTO {
        private Long characterId;
        private Long userId;
        private List<SynergyDataPoint> synergyPoints;
        private Integer totalSynergies;
    }
    
    @lombok.Data
    @lombok.Builder
    public static class SynergyDataPoint {
        private LocalDateTime timestamp;
        private String synergyType;
        private String sourceDimension;
        private String targetDimension;
        private Double effect;
    }
}
