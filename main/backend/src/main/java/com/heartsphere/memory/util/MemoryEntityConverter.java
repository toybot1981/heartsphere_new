package com.heartsphere.memory.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.memory.entity.*;
import com.heartsphere.memory.model.*;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.UUID;

/**
 * 记忆实体转换工具类
 * 用于模型（Model）和实体（Entity）之间的转换
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Slf4j
public class MemoryEntityConverter {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    // ========== ChatMessage 转换 ==========
    
    public static ChatMessageEntity toEntity(ChatMessage message) {
        if (message == null) {
            return null;
        }
        
        try {
            ChatMessageEntity entity = ChatMessageEntity.builder()
                .id(message.getId() != null ? message.getId() : UUID.randomUUID().toString().replace("-", ""))
                .sessionId(message.getSessionId())
                .userId(message.getUserId())
                .role(message.getRole())
                .content(message.getContent())
                .timestamp(message.getTimestamp() != null ? message.getTimestamp() : System.currentTimeMillis())
                .importance(message.getImportance() != null ? message.getImportance().toString() : null)
                .metadata(message.getMetadata() != null ? objectMapper.writeValueAsString(message.getMetadata()) : null)
                .expiresAt(calculateExpiresAt(message.getTimestamp() != null ? message.getTimestamp() : System.currentTimeMillis()))
                .build();
            
            return entity;
        } catch (Exception e) {
            log.error("转换ChatMessage到Entity失败", e);
            return null;
        }
    }
    
    public static ChatMessage toModel(ChatMessageEntity entity) {
        if (entity == null) {
            return null;
        }
        
        try {
            Map<String, Object> metadata = null;
            if (entity.getMetadata() != null && !entity.getMetadata().isEmpty()) {
                metadata = objectMapper.readValue(entity.getMetadata(), new TypeReference<Map<String, Object>>() {});
            }
            
            Double importance = null;
            if (entity.getImportance() != null) {
                try {
                    importance = Double.parseDouble(entity.getImportance());
                } catch (NumberFormatException e) {
                    log.warn("无法解析重要性: {}", entity.getImportance());
                }
            }
            
            return ChatMessage.builder()
                .id(entity.getId())
                .sessionId(entity.getSessionId())
                .userId(entity.getUserId())
                .role(entity.getRole())
                .content(entity.getContent())
                .metadata(metadata)
                .timestamp(entity.getTimestamp())
                .importance(importance)
                .build();
        } catch (Exception e) {
            log.error("转换ChatMessageEntity到Model失败", e);
            return null;
        }
    }
    
    // ========== UserFact 转换 ==========
    
    public static UserFactEntity toEntity(UserFact fact) {
        if (fact == null) {
            return null;
        }
        
        try {
            String tags = null;
            if (fact.getTags() != null && !fact.getTags().isEmpty()) {
                tags = objectMapper.writeValueAsString(fact.getTags());
            }
            
            String metadata = null;
            if (fact.getMetadata() != null && !fact.getMetadata().isEmpty()) {
                metadata = objectMapper.writeValueAsString(fact.getMetadata());
            }
            
            UserFactEntity entity = UserFactEntity.builder()
                .id(fact.getId())
                .userId(fact.getUserId())
                .fact(fact.getFact())
                .category(fact.getCategory())
                .importance(fact.getImportance())
                .confidence(fact.getConfidence())
                .sourceSessionId(fact.getSourceSessionId())
                .createdAt(toLocalDateTime(fact.getCreatedAt()))
                .lastAccessedAt(toLocalDateTime(fact.getLastAccessedAt()))
                .accessCount(fact.getAccessCount())
                .tags(tags)
                .metadata(metadata)
                .build();
            
            return entity;
        } catch (Exception e) {
            log.error("转换UserFact到Entity失败", e);
            return null;
        }
    }
    
    public static UserFact toModel(UserFactEntity entity) {
        if (entity == null) {
            return null;
        }
        
        try {
            List<String> tags = null;
            if (entity.getTags() != null && !entity.getTags().isEmpty()) {
                tags = objectMapper.readValue(entity.getTags(), new TypeReference<List<String>>() {});
            }
            
            Map<String, Object> metadata = null;
            if (entity.getMetadata() != null && !entity.getMetadata().isEmpty()) {
                metadata = objectMapper.readValue(entity.getMetadata(), new TypeReference<Map<String, Object>>() {});
            }
            
            UserFact fact = UserFact.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .fact(entity.getFact())
                .category(entity.getCategory())
                .importance(entity.getImportance())
                .confidence(entity.getConfidence())
                .sourceSessionId(entity.getSourceSessionId())
                .createdAt(toInstant(entity.getCreatedAt()))
                .lastAccessedAt(toInstant(entity.getLastAccessedAt()))
                .accessCount(entity.getAccessCount())
                .tags(tags)
                .metadata(metadata)
                .build();
            
            return fact;
        } catch (Exception e) {
            log.error("转换UserFactEntity到Model失败", e);
            return null;
        }
    }
    
    // ========== UserPreference 转换 ==========
    
    public static UserPreferenceEntity toEntity(UserPreference preference) {
        if (preference == null) {
            return null;
        }
        
        try {
            String value = null;
            if (preference.getValue() != null) {
                if (preference.getValue() instanceof String) {
                    value = (String) preference.getValue();
                } else {
                    value = objectMapper.writeValueAsString(preference.getValue());
                }
            }
            
            UserPreferenceEntity entity = UserPreferenceEntity.builder()
                .id(preference.getId())
                .userId(preference.getUserId())
                .key(preference.getKey())
                .value(value)
                .type(preference.getType())
                .build();
            
            return entity;
        } catch (Exception e) {
            log.error("转换UserPreference到Entity失败", e);
            return null;
        }
    }
    
    public static UserPreference toModel(UserPreferenceEntity entity) {
        if (entity == null) {
            return null;
        }
        
        try {
            Object value = null;
            if (entity.getValue() != null && !entity.getValue().isEmpty()) {
                // 尝试解析为JSON，如果失败则作为字符串
                try {
                    value = objectMapper.readValue(entity.getValue(), Object.class);
                } catch (Exception e) {
                    value = entity.getValue();
                }
            }
            
            UserPreference preference = UserPreference.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .key(entity.getKey())
                .value(value)
                .type(entity.getType())
                .updatedAt(toInstant(entity.getUpdatedAt()))
                .build();
            
            return preference;
        } catch (Exception e) {
            log.error("转换UserPreferenceEntity到Model失败", e);
            return null;
        }
    }
    
    // ========== 工具方法 ==========
    
    private static LocalDateTime toLocalDateTime(Instant instant) {
        if (instant == null) {
            return null;
        }
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }
    
    private static Instant toInstant(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return localDateTime.atZone(ZoneId.systemDefault()).toInstant();
    }
    
    private static LocalDateTime calculateExpiresAt(Long timestamp) {
        if (timestamp == null) {
            return null;
        }
        // 7天后过期
        Instant expiresInstant = Instant.ofEpochMilli(timestamp).plusSeconds(7 * 24 * 3600);
        return toLocalDateTime(expiresInstant);
    }
}


