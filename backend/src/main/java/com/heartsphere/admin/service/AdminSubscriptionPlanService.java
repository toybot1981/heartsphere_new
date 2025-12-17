package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SubscriptionPlanDTO;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.repository.SubscriptionPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * 管理后台订阅计划服务
 */
@Service
public class AdminSubscriptionPlanService {

    private static final Logger logger = Logger.getLogger(AdminSubscriptionPlanService.class.getName());

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    /**
     * 获取所有订阅计划
     */
    public List<SubscriptionPlanDTO> getAllPlans() {
        return subscriptionPlanRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * 根据ID获取订阅计划
     */
    public SubscriptionPlanDTO getPlanById(Long id) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订阅计划不存在: " + id));
        return toDTO(plan);
    }

    /**
     * 创建订阅计划
     */
    @Transactional
    public SubscriptionPlanDTO createPlan(SubscriptionPlanDTO dto) {
        logger.info("创建订阅计划: " + dto.getName());
        
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(dto.getName());
        plan.setType(dto.getType());
        plan.setBillingCycle(dto.getBillingCycle());
        plan.setPrice(dto.getPrice());
        plan.setOriginalPrice(dto.getOriginalPrice());
        plan.setDiscountPercent(dto.getDiscountPercent());
        plan.setPointsPerMonth(dto.getPointsPerMonth() != null ? dto.getPointsPerMonth() : 0);
        plan.setMaxImagesPerMonth(dto.getMaxImagesPerMonth());
        plan.setMaxVideosPerMonth(dto.getMaxVideosPerMonth());
        plan.setMaxTextGenerationsPerMonth(dto.getMaxTextGenerationsPerMonth());
        plan.setMaxAudioGenerationsPerMonth(dto.getMaxAudioGenerationsPerMonth());
        plan.setAllowedAiModels(dto.getAllowedAiModels());
        plan.setMaxImageResolution(dto.getMaxImageResolution());
        plan.setMaxVideoDuration(dto.getMaxVideoDuration());
        plan.setAllowPriorityQueue(dto.getAllowPriorityQueue() != null ? dto.getAllowPriorityQueue() : false);
        plan.setAllowWatermarkRemoval(dto.getAllowWatermarkRemoval() != null ? dto.getAllowWatermarkRemoval() : false);
        plan.setAllowBatchProcessing(dto.getAllowBatchProcessing() != null ? dto.getAllowBatchProcessing() : false);
        plan.setAllowApiAccess(dto.getAllowApiAccess() != null ? dto.getAllowApiAccess() : false);
        plan.setMaxApiCallsPerDay(dto.getMaxApiCallsPerDay());
        plan.setAiBenefits(dto.getAiBenefits());
        plan.setFeatures(dto.getFeatures());
        plan.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        plan.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);

        SubscriptionPlan saved = subscriptionPlanRepository.save(plan);
        logger.info("订阅计划创建成功: ID=" + saved.getId());
        return toDTO(saved);
    }

    /**
     * 更新订阅计划
     */
    @Transactional
    public SubscriptionPlanDTO updatePlan(Long id, SubscriptionPlanDTO dto) {
        logger.info("更新订阅计划: ID=" + id);
        
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订阅计划不存在: " + id));

        plan.setName(dto.getName());
        plan.setType(dto.getType());
        plan.setBillingCycle(dto.getBillingCycle());
        plan.setPrice(dto.getPrice());
        plan.setOriginalPrice(dto.getOriginalPrice());
        plan.setDiscountPercent(dto.getDiscountPercent());
        plan.setPointsPerMonth(dto.getPointsPerMonth() != null ? dto.getPointsPerMonth() : 0);
        plan.setMaxImagesPerMonth(dto.getMaxImagesPerMonth());
        plan.setMaxVideosPerMonth(dto.getMaxVideosPerMonth());
        plan.setMaxTextGenerationsPerMonth(dto.getMaxTextGenerationsPerMonth());
        plan.setMaxAudioGenerationsPerMonth(dto.getMaxAudioGenerationsPerMonth());
        plan.setAllowedAiModels(dto.getAllowedAiModels());
        plan.setMaxImageResolution(dto.getMaxImageResolution());
        plan.setMaxVideoDuration(dto.getMaxVideoDuration());
        plan.setAllowPriorityQueue(dto.getAllowPriorityQueue() != null ? dto.getAllowPriorityQueue() : false);
        plan.setAllowWatermarkRemoval(dto.getAllowWatermarkRemoval() != null ? dto.getAllowWatermarkRemoval() : false);
        plan.setAllowBatchProcessing(dto.getAllowBatchProcessing() != null ? dto.getAllowBatchProcessing() : false);
        plan.setAllowApiAccess(dto.getAllowApiAccess() != null ? dto.getAllowApiAccess() : false);
        plan.setMaxApiCallsPerDay(dto.getMaxApiCallsPerDay());
        plan.setAiBenefits(dto.getAiBenefits());
        plan.setFeatures(dto.getFeatures());
        plan.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        plan.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);

        SubscriptionPlan saved = subscriptionPlanRepository.save(plan);
        logger.info("订阅计划更新成功: ID=" + saved.getId());
        return toDTO(saved);
    }

    /**
     * 删除订阅计划（软删除，设置为非激活状态）
     */
    @Transactional
    public void deletePlan(Long id) {
        logger.info("删除订阅计划: ID=" + id);
        
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订阅计划不存在: " + id));

        plan.setIsActive(false);
        subscriptionPlanRepository.save(plan);
        logger.info("订阅计划已禁用: ID=" + id);
    }

    /**
     * 转换为DTO
     */
    private SubscriptionPlanDTO toDTO(SubscriptionPlan plan) {
        SubscriptionPlanDTO dto = new SubscriptionPlanDTO();
        dto.setId(plan.getId());
        dto.setName(plan.getName());
        dto.setType(plan.getType());
        dto.setBillingCycle(plan.getBillingCycle());
        dto.setPrice(plan.getPrice());
        dto.setOriginalPrice(plan.getOriginalPrice());
        dto.setDiscountPercent(plan.getDiscountPercent());
        dto.setPointsPerMonth(plan.getPointsPerMonth());
        dto.setMaxImagesPerMonth(plan.getMaxImagesPerMonth());
        dto.setMaxVideosPerMonth(plan.getMaxVideosPerMonth());
        dto.setMaxTextGenerationsPerMonth(plan.getMaxTextGenerationsPerMonth());
        dto.setMaxAudioGenerationsPerMonth(plan.getMaxAudioGenerationsPerMonth());
        dto.setAllowedAiModels(plan.getAllowedAiModels());
        dto.setMaxImageResolution(plan.getMaxImageResolution());
        dto.setMaxVideoDuration(plan.getMaxVideoDuration());
        dto.setAllowPriorityQueue(plan.getAllowPriorityQueue());
        dto.setAllowWatermarkRemoval(plan.getAllowWatermarkRemoval());
        dto.setAllowBatchProcessing(plan.getAllowBatchProcessing());
        dto.setAllowApiAccess(plan.getAllowApiAccess());
        dto.setMaxApiCallsPerDay(plan.getMaxApiCallsPerDay());
        dto.setAiBenefits(plan.getAiBenefits());
        dto.setFeatures(plan.getFeatures());
        dto.setIsActive(plan.getIsActive());
        dto.setSortOrder(plan.getSortOrder());
        dto.setCreatedAt(plan.getCreatedAt());
        dto.setUpdatedAt(plan.getUpdatedAt());
        return dto;
    }
}

