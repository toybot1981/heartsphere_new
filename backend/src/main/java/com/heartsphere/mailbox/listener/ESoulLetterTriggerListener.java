package com.heartsphere.mailbox.listener;

import com.heartsphere.mailbox.enums.ESoulLetterType;
import com.heartsphere.mailbox.service.ESoulLetterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * E-SOUL来信触发监听器
 * 在用户登录等事件时触发来信生成
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ESoulLetterTriggerListener {
    
    private final ESoulLetterService esoulLetterService;
    
    /**
     * 处理用户登录事件
     * 如果用户离线时间超过60秒，触发E-SOUL来信
     * 
     * @param userId 用户ID
     * @param lastLoginTime 上次登录时间（可以为null，表示首次登录）
     */
    @Async
    public void handleUserLogin(Long userId, LocalDateTime lastLoginTime) {
        log.info("处理用户登录事件 - userId={}, lastLoginTime={}", userId, lastLoginTime);
        
        // 检查是否应该触发来信
        if (!esoulLetterService.shouldTriggerLetter(userId)) {
            log.debug("不满足触发条件，跳过来信生成 - userId={}", userId);
            return;
        }
        
        // 如果提供了上次登录时间，检查离线时长
        if (lastLoginTime != null) {
            long offlineSeconds = ChronoUnit.SECONDS.between(lastLoginTime, LocalDateTime.now());
            
            // 离线时间少于60秒，不触发来信
            if (offlineSeconds < 60) {
                log.debug("离线时间不足60秒，不触发来信 - userId={}, offlineSeconds={}", userId, offlineSeconds);
                return;
            }
        }
        
        // 构建触发信息
        ESoulLetterService.ESoulLetterTrigger trigger = new ESoulLetterService.ESoulLetterTrigger();
        trigger.setTriggerReason(lastLoginTime != null 
            ? "用户登录（离线" + ChronoUnit.SECONDS.between(lastLoginTime, LocalDateTime.now()) + "秒）"
            : "用户首次登录");
        
        // 触发来信生成（异步执行，不阻塞登录流程）
        try {
            esoulLetterService.triggerLetter(userId, trigger);
            log.info("E-SOUL来信触发成功 - userId={}", userId);
        } catch (Exception e) {
            log.error("E-SOUL来信触发失败 - userId={}", userId, e);
            // 不抛出异常，避免影响登录流程
        }
    }
    
    /**
     * 手动触发来信（用于测试或特殊场景）
     * 
     * @param userId 用户ID
     * @param letterType 来信类型（可选）
     */
    @Async
    public void triggerLetterManually(Long userId, ESoulLetterType letterType) {
        log.info("手动触发E-SOUL来信 - userId={}, letterType={}", userId, letterType);
        
        ESoulLetterService.ESoulLetterTrigger trigger = new ESoulLetterService.ESoulLetterTrigger();
        trigger.setLetterType(letterType);
        trigger.setTriggerReason("手动触发");
        
        try {
            esoulLetterService.triggerLetter(userId, trigger);
        } catch (Exception e) {
            log.error("手动触发E-SOUL来信失败 - userId={}, letterType={}", userId, letterType, e);
        }
    }
}

