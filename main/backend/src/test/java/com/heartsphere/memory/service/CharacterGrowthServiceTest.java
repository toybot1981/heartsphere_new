package com.heartsphere.memory.service;

import com.heartsphere.memory.entity.CharacterGrowthEventEntity;
import com.heartsphere.memory.repository.jpa.CharacterGrowthEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 角色成长服务测试
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@ExtendWith(MockitoExtension.class)
class CharacterGrowthServiceTest {
    
    @Mock
    private CharacterGrowthEventRepository growthEventRepository;
    
    @Mock
    private ObjectMapper objectMapper;
    
    @InjectMocks
    private CharacterGrowthService growthService;
    
    private Long characterId;
    private Long userId;
    
    @BeforeEach
    void setUp() {
        characterId = 1L;
        userId = 100L;
    }
    
    @Test
    void testRecordGrowthEvent() throws Exception {
        // 准备测试数据
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("test", "value");
        
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"test\":\"value\"}");
        
        CharacterGrowthEventEntity savedEvent = CharacterGrowthEventEntity.builder()
                .id(1L)
                .characterId(characterId)
                .userId(userId)
                .eventType("LEARNING")
                .eventCategory("SELF_GROWTH")
                .title("测试事件")
                .description("测试描述")
                .build();
        
        when(growthEventRepository.save(any(CharacterGrowthEventEntity.class)))
                .thenReturn(savedEvent);
        
        // 执行测试
        CharacterGrowthEventEntity result = growthService.recordGrowthEvent(
                characterId,
                userId,
                "LEARNING",
                "SELF_GROWTH",
                "测试事件",
                "测试描述",
                metadata
        );
        
        // 验证结果
        assertNotNull(result);
        assertEquals(characterId, result.getCharacterId());
        assertEquals(userId, result.getUserId());
        assertEquals("LEARNING", result.getEventType());
        
        verify(growthEventRepository, times(1)).save(any(CharacterGrowthEventEntity.class));
    }
    
    @Test
    void testTriggerSelfReflection() throws Exception {
        // 准备测试数据
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        
        CharacterGrowthEventEntity savedEvent = CharacterGrowthEventEntity.builder()
                .id(1L)
                .characterId(characterId)
                .userId(userId)
                .eventType("REFLECTION")
                .build();
        
        when(growthEventRepository.save(any(CharacterGrowthEventEntity.class)))
                .thenReturn(savedEvent);
        
        // 执行测试
        growthService.triggerSelfReflection(characterId, userId, "AUTO");
        
        // 验证结果
        verify(growthEventRepository, times(1)).save(any(CharacterGrowthEventEntity.class));
    }
    
    @Test
    void testRecordAbilityUpgrade() throws Exception {
        // 准备测试数据
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");
        
        CharacterGrowthEventEntity savedEvent = CharacterGrowthEventEntity.builder()
                .id(1L)
                .characterId(characterId)
                .userId(userId)
                .eventType("ABILITY_UPGRADE")
                .build();
        
        when(growthEventRepository.save(any(CharacterGrowthEventEntity.class)))
                .thenReturn(savedEvent);
        
        // 执行测试
        growthService.recordAbilityUpgrade(characterId, userId, "COMMUNICATION", "沟通能力提升");
        
        // 验证结果
        verify(growthEventRepository, times(1)).save(any(CharacterGrowthEventEntity.class));
    }
    
    @Test
    void testGetGrowthEvents() {
        // 准备测试数据
        List<CharacterGrowthEventEntity> events = new ArrayList<>();
        events.add(CharacterGrowthEventEntity.builder()
                .id(1L)
                .characterId(characterId)
                .userId(userId)
                .eventType("LEARNING")
                .build());
        
        when(growthEventRepository.findByCharacterIdAndUserIdOrderByCreatedAtDesc(characterId, userId))
                .thenReturn(events);
        
        // 执行测试
        List<CharacterGrowthEventEntity> result = growthService.getGrowthEvents(characterId, userId);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(growthEventRepository, times(1))
                .findByCharacterIdAndUserIdOrderByCreatedAtDesc(characterId, userId);
    }
    
    @Test
    void testGetGrowthTrajectory() {
        // 准备测试数据
        List<CharacterGrowthEventEntity> events = new ArrayList<>();
        CharacterGrowthEventEntity event1 = CharacterGrowthEventEntity.builder()
                .id(1L)
                .characterId(characterId)
                .userId(userId)
                .eventType("LEARNING")
                .eventCategory("SELF_GROWTH")
                .build();
        CharacterGrowthEventEntity event2 = CharacterGrowthEventEntity.builder()
                .id(2L)
                .characterId(characterId)
                .userId(userId)
                .eventType("REFLECTION")
                .eventCategory("SELF_GROWTH")
                .build();
        events.add(event1);
        events.add(event2);
        
        when(growthEventRepository.findByCharacterIdAndUserIdOrderByCreatedAtDesc(characterId, userId))
                .thenReturn(events);
        
        // 执行测试
        Map<String, Object> result = growthService.getGrowthTrajectory(characterId, userId);
        
        // 验证结果
        assertNotNull(result);
        assertEquals(characterId, result.get("characterId"));
        assertEquals(userId, result.get("userId"));
        assertEquals(2, result.get("totalEvents"));
        assertNotNull(result.get("events"));
        assertNotNull(result.get("eventTypeStats"));
    }
}
