package com.heartsphere.capability.service.growth;

import com.heartsphere.memory.entity.CharacterGrowthEventEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * 成长事件处理器
 * 监听成长事件，转换为能力经验值
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GrowthEventProcessor {
    
    private final RelationshipCapabilityGrowthService growthService;
    
    /**
     * 监听成长事件
     * 异步处理，不阻塞主流程
     */
    @Async
    @EventListener
    public void handleGrowthEvent(CharacterGrowthEventEntity event) {
        try {
            log.info("收到成长事件: characterId={}, eventType={}, category={}", 
                event.getCharacterId(), event.getEventType(), event.getEventCategory());
            
            growthService.processGrowthEvent(event);
            
            log.info("成长事件处理完成: characterId={}", event.getCharacterId());
        } catch (Exception e) {
            log.error("处理成长事件失败: characterId={}, eventType={}", 
                event.getCharacterId(), event.getEventType(), e);
        }
    }
}
