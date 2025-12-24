package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.AIUsageRecord;
import com.heartsphere.billing.repository.AIUsageRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 使用记录服务
 * 负责记录AI API使用情况
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UsageRecordService {
    
    private final AIUsageRecordRepository usageRecordRepository;
    
    /**
     * 记录使用情况
     */
    @Transactional
    public void recordUsage(Long userId, Long providerId, Long modelId, String usageType,
                           Integer inputTokens, Integer outputTokens, Integer totalTokens,
                           Integer imageCount, Integer audioDuration, Integer videoDuration,
                           BigDecimal costAmount, Long tokenConsumed, String status, String errorMessage) {
        AIUsageRecord record = new AIUsageRecord();
        record.setUserId(userId);
        record.setProviderId(providerId);
        record.setModelId(modelId);
        record.setUsageType(usageType);
        record.setInputTokens(inputTokens != null ? inputTokens : 0);
        record.setOutputTokens(outputTokens != null ? outputTokens : 0);
        record.setTotalTokens(totalTokens != null ? totalTokens : 0);
        record.setImageCount(imageCount != null ? imageCount : 0);
        record.setAudioDuration(audioDuration != null ? audioDuration : 0);
        record.setVideoDuration(videoDuration != null ? videoDuration : 0);
        record.setCostAmount(costAmount);
        record.setTokenConsumed(tokenConsumed);
        record.setStatus(status != null ? status : "success");
        record.setRequestId(UUID.randomUUID().toString());
        record.setErrorMessage(errorMessage);
        
        usageRecordRepository.save(record);
        log.debug("记录AI使用: userId={}, providerId={}, modelId={}, usageType={}, cost={}, tokens={}",
            userId, providerId, modelId, usageType, costAmount, tokenConsumed);
    }
    
    /**
     * 记录文本生成使用
     */
    @Transactional
    public void recordTextGeneration(Long userId, Long providerId, Long modelId,
                                    Integer inputTokens, Integer outputTokens, Integer totalTokens,
                                    BigDecimal costAmount, Long tokenConsumed, boolean success, String errorMessage) {
        recordUsage(userId, providerId, modelId, "text_generation",
            inputTokens, outputTokens, totalTokens,
            null, null, null,
            costAmount, tokenConsumed,
            success ? "success" : "failed", errorMessage);
    }
    
    /**
     * 记录图片生成使用
     */
    @Transactional
    public void recordImageGeneration(Long userId, Long providerId, Long modelId,
                                     Integer imageCount, BigDecimal costAmount, Long tokenConsumed,
                                     boolean success, String errorMessage) {
        recordUsage(userId, providerId, modelId, "image_generation",
            null, null, null,
            imageCount, null, null,
            costAmount, tokenConsumed,
            success ? "success" : "failed", errorMessage);
    }
    
    /**
     * 记录音频处理使用
     */
    @Transactional
    public void recordAudioProcessing(Long userId, Long providerId, Long modelId, String audioType,
                                     Integer audioDuration, BigDecimal costAmount, Long tokenConsumed,
                                     boolean success, String errorMessage) {
        String usageType = "audio_tts".equals(audioType) ? "audio_tts" : "audio_stt";
        recordUsage(userId, providerId, modelId, usageType,
            null, null, null,
            null, audioDuration, null,
            costAmount, tokenConsumed,
            success ? "success" : "failed", errorMessage);
    }
    
    /**
     * 记录视频生成使用
     */
    @Transactional
    public void recordVideoGeneration(Long userId, Long providerId, Long modelId,
                                     Integer videoDuration, BigDecimal costAmount, Long tokenConsumed,
                                     boolean success, String errorMessage) {
        recordUsage(userId, providerId, modelId, "video_generation",
            null, null, null,
            null, null, videoDuration,
            costAmount, tokenConsumed,
            success ? "success" : "failed", errorMessage);
    }
}

