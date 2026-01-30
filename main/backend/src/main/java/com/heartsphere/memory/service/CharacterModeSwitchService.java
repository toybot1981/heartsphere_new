package com.heartsphere.memory.service;

import com.heartsphere.memory.entity.CharacterGrowthEventEntity;
import com.heartsphere.memory.repository.jpa.CharacterGrowthEventRepository;
import com.heartsphere.memory.service.ContextAwarenessService.ResponseMode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 角色模式切换服务
 * 管理角色在挚友模式和导师模式之间的智能切换
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CharacterModeSwitchService {
    
    private final ContextAwarenessService contextAwarenessService;
    private final CharacterGrowthEventRepository growthEventRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * 智能模式切换
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @param userMessage 用户消息
     * @param conversationHistory 对话历史
     * @param userEmotionState 用户情绪状态
     * @param currentMode 当前模式
     * @return 推荐模式和切换信息
     */
    @Transactional
    public Map<String, Object> intelligentModeSwitch(
            Long characterId,
            Long userId,
            String userMessage,
            List<String> conversationHistory,
            String userEmotionState,
            ResponseMode currentMode) {
        
        // 1. 分析情境
        Map<String, Object> context = contextAwarenessService.analyzeContext(
                userMessage, conversationHistory, userEmotionState);
        
        ResponseMode recommendedMode = (ResponseMode) context.get("recommendedMode");
        double confidence = (double) context.get("confidence");
        
        // 2. 判断是否需要切换
        boolean shouldSwitch = shouldSwitchMode(currentMode, recommendedMode, confidence);
        
        Map<String, Object> result = new HashMap<>();
        result.put("currentMode", currentMode != null ? currentMode.getName() : "NEUTRAL");
        result.put("recommendedMode", recommendedMode.getName());
        result.put("shouldSwitch", shouldSwitch);
        result.put("confidence", confidence);
        result.put("context", context);
        
        // 3. 如果需要切换，记录切换事件
        if (shouldSwitch) {
            recordModeSwitch(characterId, userId, currentMode, recommendedMode, userMessage);
            result.put("transitionMessage", generateTransitionMessage(currentMode, recommendedMode));
        }
        
        return result;
    }
    
    /**
     * 判断是否应该切换模式
     */
    private boolean shouldSwitchMode(ResponseMode currentMode, ResponseMode recommendedMode, double confidence) {
        // 如果当前模式为空，使用推荐模式
        if (currentMode == null) {
            return true;
        }
        
        // 如果推荐模式与当前模式相同，不需要切换
        if (currentMode.equals(recommendedMode)) {
            return false;
        }
        
        // 如果置信度低于阈值，不切换（避免频繁切换）
        if (confidence < 0.6) {
            return false;
        }
        
        // 其他情况，切换到推荐模式
        return true;
    }
    
    /**
     * 记录模式切换事件
     */
    @Transactional
    public void recordModeSwitch(
            Long characterId,
            Long userId,
            ResponseMode fromMode,
            ResponseMode toMode,
            String triggerMessage) {
        
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("fromMode", fromMode != null ? fromMode.getName() : "NEUTRAL");
            metadata.put("toMode", toMode.getName());
            metadata.put("triggerMessage", triggerMessage);
            metadata.put("timestamp", LocalDateTime.now().toString());
            
            String metadataJson = objectMapper.writeValueAsString(metadata);
            
            CharacterGrowthEventEntity event = CharacterGrowthEventEntity.builder()
                    .characterId(characterId)
                    .userId(userId)
                    .eventType("RELATIONSHIP_PROGRESS")
                    .eventCategory("COMPANIONSHIP")
                    .title("模式切换: " + (fromMode != null ? fromMode.getName() : "NEUTRAL") + " → " + toMode.getName())
                    .description("角色响应模式切换")
                    .metadata(metadataJson)
                    .build();
            
            growthEventRepository.save(event);
            
            log.info("✅ 模式切换已记录: characterId={}, userId={}, fromMode={}, toMode={}",
                    characterId, userId, fromMode != null ? fromMode.getName() : "NEUTRAL", toMode.getName());
        } catch (Exception e) {
            log.error("❌ 记录模式切换失败: characterId={}, userId={}",
                    characterId, userId, e);
        }
    }
    
    /**
     * 生成模式切换过渡消息
     */
    private String generateTransitionMessage(ResponseMode fromMode, ResponseMode toMode) {
        if (fromMode == null) {
            return "我将以" + toMode.getName() + "的方式与你交流。";
        }
        
        if (toMode == ResponseMode.COMPANION) {
            return "我理解你的感受，让我以朋友的身份陪伴你。";
        } else if (toMode == ResponseMode.MENTOR) {
            return "让我以导师的身份为你提供指导。";
        } else {
            return "让我们继续交流。";
        }
    }
    
    /**
     * 判断是否需要主动介入
     */
    public boolean shouldIntervene(
            Long characterId,
            Long userId,
            String userMessage,
            String userEmotionState,
            long timeSinceLastInteraction) {
        
        return contextAwarenessService.shouldIntervene(
                userMessage, userEmotionState, timeSinceLastInteraction);
    }
    
    /**
     * 生成主动介入建议
     */
    public String generateInterventionSuggestion(
            Long characterId,
            Long userId,
            String userMessage,
            String userEmotionState) {
        
        // 分析情境，确定最佳模式
        Map<String, Object> context = contextAwarenessService.analyzeContext(
                userMessage, null, userEmotionState);
        
        ResponseMode recommendedMode = (ResponseMode) context.get("recommendedMode");
        
        return contextAwarenessService.generateInterventionSuggestion(
                userMessage, userEmotionState, recommendedMode);
    }
}
