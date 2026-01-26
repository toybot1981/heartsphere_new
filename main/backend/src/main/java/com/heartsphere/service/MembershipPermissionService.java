package com.heartsphere.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.billing.dto.PermissionInfo;
import com.heartsphere.billing.enums.QuotaType;
import com.heartsphere.entity.Membership;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 会员权限验证服务
 * 负责检查用户的功能权限、模型权限和配额限制
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipPermissionService {

    private final SubscriptionPlanRepository planRepository;
    private final MembershipService membershipService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 获取用户的订阅计划（带缓存，避免重复查询）
     */
    @Transactional(readOnly = true)
    private SubscriptionPlan getUserPlan(Long userId) {
        Membership membership = membershipService.getUserMembership(userId)
                .orElseGet(() -> membershipService.getOrCreateFreeMembership(userId));
        
        return planRepository.findById(membership.getPlanId())
                .orElseThrow(() -> new RuntimeException("订阅计划不存在: " + membership.getPlanId()));
    }

    // ==================== 功能权限检查 ====================

    /**
     * 是否可以使用API
     */
    @Transactional(readOnly = true)
    public boolean canUseApi(Long userId) {
        SubscriptionPlan plan = getUserPlan(userId);
        boolean allowed = plan.getAllowApiAccess() != null && plan.getAllowApiAccess();
        log.info("API访问权限检查: userId={}, allowed={}", userId, allowed);
        return allowed;
    }

    /**
     * 是否可以使用优先队列
     */
    @Transactional(readOnly = true)
    public boolean canUsePriorityQueue(Long userId) {
        SubscriptionPlan plan = getUserPlan(userId);
        boolean allowed = plan.getAllowPriorityQueue() != null && plan.getAllowPriorityQueue();
        log.info("优先队列权限检查: userId={}, allowed={}", userId, allowed);
        return allowed;
    }

    /**
     * 是否可以去除水印
     */
    @Transactional(readOnly = true)
    public boolean canRemoveWatermark(Long userId) {
        SubscriptionPlan plan = getUserPlan(userId);
        boolean allowed = plan.getAllowWatermarkRemoval() != null && plan.getAllowWatermarkRemoval();
        log.info("去水印权限检查: userId={}, allowed={}", userId, allowed);
        return allowed;
    }

    /**
     * 是否可以批量处理
     */
    @Transactional(readOnly = true)
    public boolean canBatchProcess(Long userId) {
        SubscriptionPlan plan = getUserPlan(userId);
        boolean allowed = plan.getAllowBatchProcessing() != null && plan.getAllowBatchProcessing();
        log.info("批量处理权限检查: userId={}, allowed={}", userId, allowed);
        return allowed;
    }

    /**
     * 是否可以使用团队协作
     */
    @Transactional(readOnly = true)
    public boolean canUseTeamCollaboration(Long userId) {
        SubscriptionPlan plan = getUserPlan(userId);
        boolean allowed = plan.getAllowTeamCollaboration() != null && plan.getAllowTeamCollaboration();
        log.info("团队协作权限检查: userId={}, allowed={}", userId, allowed);
        return allowed;
    }

    // ==================== 模型权限检查 ====================

    /**
     * 是否可以使用指定模型
     */
    @Transactional(readOnly = true)
    public boolean canUseModel(Long userId, String modelName) {
        if (modelName == null || modelName.trim().isEmpty()) {
            log.warn("模型名称为空: userId={}", userId);
            return false;
        }

        SubscriptionPlan plan = getUserPlan(userId);
        List<String> allowedModels = getAllowedModels(plan);
        
        // 如果允许的模型列表为空，表示无限制（向后兼容）
        if (allowedModels == null || allowedModels.isEmpty()) {
            log.info("允许的模型列表为空，默认允许所有模型: userId={}, modelName={}", userId, modelName);
            return true;
        }

        boolean allowed = allowedModels.contains(modelName);
        log.info("模型权限检查: userId={}, modelName={}, allowed={}", userId, modelName, allowed);
        return allowed;
    }

    /**
     * 获取允许使用的模型列表
     */
    @Transactional(readOnly = true)
    public List<String> getAllowedModels(Long userId) {
        SubscriptionPlan plan = getUserPlan(userId);
        return getAllowedModels(plan);
    }

    /**
     * 从订阅计划中解析允许的模型列表
     */
    private List<String> getAllowedModels(SubscriptionPlan plan) {
        String allowedAiModelsJson = plan.getAllowedAiModels();
        
        if (allowedAiModelsJson == null || allowedAiModelsJson.trim().isEmpty()) {
            return new ArrayList<>(); // 返回空列表表示无限制（向后兼容）
        }

        try {
            List<String> models = objectMapper.readValue(
                    allowedAiModelsJson, 
                    new TypeReference<List<String>>() {}
            );
            log.info("解析允许的模型列表: planId={}, models={}", plan.getId(), models);
            return models;
        } catch (Exception e) {
            log.error("解析允许的模型列表失败: planId={}, json={}, error={}", 
                    plan.getId(), allowedAiModelsJson, e.getMessage(), e);
            // 解析失败时返回空列表，表示无限制（容错处理）
            return new ArrayList<>();
        }
    }

    // ==================== 配额限制检查 ====================

    /**
     * 获取单次使用配额上限
     * @param userId 用户ID
     * @param quotaType 配额类型
     * @return 单次使用上限，null表示无限制
     */
    @Transactional(readOnly = true)
    public Long getMaxSingleUseQuota(Long userId, QuotaType quotaType) {
        SubscriptionPlan plan = getUserPlan(userId);
        
        switch (quotaType) {
            case TEXT_TOKEN:
                // 文本Token单次使用上限（可以从plan的max_text_generations_per_month或配置中获取）
                // 这里暂时返回null表示无限制，可以根据实际需求调整
                return null;
                
            case IMAGE:
                // 图片单次使用上限（批量处理时）
                // 可以从plan配置中获取，暂时返回null
                return null;
                
            case VIDEO:
                // 视频单次使用上限（秒）
                Integer maxVideoDuration = plan.getMaxVideoDuration();
                return maxVideoDuration != null ? maxVideoDuration.longValue() : null;
                
            case API_CALL:
                // API调用单次使用上限（通常为1）
                return 1L;
                
            default:
                log.warn("未知的配额类型: userId={}, quotaType={}", userId, quotaType);
                return null;
        }
    }

    /**
     * 获取最大图片分辨率
     */
    @Transactional(readOnly = true)
    public String getMaxImageResolution(Long userId) {
        SubscriptionPlan plan = getUserPlan(userId);
        String resolution = plan.getMaxImageResolution();
        log.info("最大图片分辨率: userId={}, resolution={}", userId, resolution);
        return resolution;
    }

    /**
     * 获取最大视频时长（秒）
     */
    @Transactional(readOnly = true)
    public Integer getMaxVideoDuration(Long userId) {
        SubscriptionPlan plan = getUserPlan(userId);
        Integer duration = plan.getMaxVideoDuration();
        log.info("最大视频时长: userId={}, duration={}", userId, duration);
        return duration;
    }

    /**
     * 获取最大图片分辨率（返回标准格式，如 "1024x1024"）
     * 如果plan中存储的是 "2k", "4k" 等，可以转换为实际像素值
     */
    @Transactional(readOnly = true)
    public String getMaxImageResolutionFormatted(Long userId) {
        String resolution = getMaxImageResolution(userId);
        
        if (resolution == null || resolution.trim().isEmpty()) {
            return "1024x1024"; // 默认分辨率
        }

        // 处理常见分辨率格式
        resolution = resolution.toLowerCase().trim();
        switch (resolution) {
            case "512":
            case "512x512":
                return "512x512";
            case "1024":
            case "1k":
            case "1024x1024":
                return "1024x1024";
            case "2k":
            case "2048":
            case "2048x2048":
                return "2048x2048";
            case "4k":
            case "4096":
            case "4096x4096":
                return "4096x4096";
            case "8k":
            case "8192":
            case "8192x8192":
                return "8192x8192";
            default:
                // 如果已经是标准格式（如 "1024x1024"），直接返回
                if (resolution.contains("x")) {
                    return resolution;
                }
                // 否则返回默认值
                return "1024x1024";
        }
    }

    // ==================== 综合权限检查 ====================

    /**
     * 检查用户是否有权限使用指定功能
     * @param userId 用户ID
     * @param feature 功能名称（api_access, priority_queue, watermark_removal, batch_processing, team_collaboration）
     * @return 是否有权限
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(Long userId, String feature) {
        if (feature == null || feature.trim().isEmpty()) {
            return false;
        }

        switch (feature.toLowerCase()) {
            case "api_access":
            case "api":
                return canUseApi(userId);
            case "priority_queue":
            case "priority":
                return canUsePriorityQueue(userId);
            case "watermark_removal":
            case "watermark":
                return canRemoveWatermark(userId);
            case "batch_processing":
            case "batch":
                return canBatchProcess(userId);
            case "team_collaboration":
            case "team":
                return canUseTeamCollaboration(userId);
            default:
                log.warn("未知的功能权限: userId={}, feature={}", userId, feature);
                return false;
        }
    }

    /**
     * 获取用户的完整权限信息（用于前端显示）
     */
    @Transactional(readOnly = true)
    public PermissionInfo getPermissionInfo(Long userId) {
        SubscriptionPlan plan = getUserPlan(userId);
        
        return PermissionInfo.builder()
                .userId(userId)
                .planType(plan.getType())
                .canUseApi(plan.getAllowApiAccess() != null && plan.getAllowApiAccess())
                .canUsePriorityQueue(plan.getAllowPriorityQueue() != null && plan.getAllowPriorityQueue())
                .canRemoveWatermark(plan.getAllowWatermarkRemoval() != null && plan.getAllowWatermarkRemoval())
                .canBatchProcess(plan.getAllowBatchProcessing() != null && plan.getAllowBatchProcessing())
                .canUseTeamCollaboration(plan.getAllowTeamCollaboration() != null && plan.getAllowTeamCollaboration())
                .allowedModels(getAllowedModels(plan))
                .maxImageResolution(getMaxImageResolution(userId))
                .maxVideoDuration(getMaxVideoDuration(userId))
                .build();
    }

}
