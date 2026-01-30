package com.heartsphere.capability.service.growth;

import com.heartsphere.memory.entity.CharacterGrowthEventEntity;
import com.heartsphere.memory.repository.jpa.CharacterGrowthEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 成长事件同步服务
 * 将历史成长事件转换为能力经验值
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GrowthEventSyncService {
    
    private final CharacterGrowthEventRepository growthEventRepository;
    private final RelationshipCapabilityGrowthService growthService;
    
    /**
     * 同步角色的所有历史成长事件
     * 
     * @param characterId 角色ID
     * @param userId 用户ID
     * @return 处理的成长事件数量
     */
    @Transactional
    public int syncGrowthEvents(Long characterId, Long userId) {
        log.info("开始同步成长事件: characterId={}, userId={}", characterId, userId);
        
        List<CharacterGrowthEventEntity> events = growthEventRepository
            .findByCharacterIdAndUserIdOrderByCreatedAtDesc(characterId, userId);
        
        int processedCount = 0;
        for (CharacterGrowthEventEntity event : events) {
            try {
                growthService.processGrowthEvent(event);
                processedCount++;
            } catch (Exception e) {
                log.error("处理成长事件失败: eventId={}, characterId={}", 
                    event.getId(), characterId, e);
            }
        }
        
        log.info("成长事件同步完成: characterId={}, userId={}, processed={}/{}", 
            characterId, userId, processedCount, events.size());
        
        return processedCount;
    }
    
    /**
     * 同步所有角色的成长事件（用于初始化）
     */
    @Transactional
    public int syncAllGrowthEvents() {
        log.info("开始同步所有角色的成长事件");
        
        // 获取所有唯一的角色ID和用户ID组合
        // 这里简化处理，实际应该分批处理
        List<CharacterGrowthEventEntity> allEvents = growthEventRepository.findAll();
        
        int processedCount = 0;
        for (CharacterGrowthEventEntity event : allEvents) {
            try {
                growthService.processGrowthEvent(event);
                processedCount++;
            } catch (Exception e) {
                log.error("处理成长事件失败: eventId={}", event.getId(), e);
            }
        }
        
        log.info("所有成长事件同步完成: processed={}/{}", processedCount, allEvents.size());
        return processedCount;
    }
}
