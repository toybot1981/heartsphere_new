package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.entity.ChatMessageEntity;
import com.heartsphere.memory.entity.SessionEntity;
import com.heartsphere.memory.entity.WorkingMemoryEntity;
import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.repository.jpa.ChatMessageRepository;
import com.heartsphere.memory.repository.jpa.SessionRepository;
import com.heartsphere.memory.repository.jpa.WorkingMemoryRepository;
import com.heartsphere.memory.service.ShortMemoryService;
import com.heartsphere.memory.util.MemoryEntityConverter;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * MySQL短期记忆服务实现
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Service
@org.springframework.context.annotation.Primary
@RequiredArgsConstructor
@Slf4j
public class MySQLShortMemoryService implements ShortMemoryService {
    
    private final ChatMessageRepository chatMessageRepository;
    private final SessionRepository sessionRepository;
    private final WorkingMemoryRepository workingMemoryRepository;
    private final ObjectMapper objectMapper;
    
    // 配置参数
    private static final int MAX_MESSAGES_PER_SESSION = 100;      // 最多100条消息
    private static final int DEFAULT_MESSAGE_TTL_DAYS = 7;        // 7天过期
    
    // ========== 消息管理 ==========
    
    @Override
    @Transactional
    public void saveMessage(String sessionId, ChatMessage message) {
        try {
            // 如果没有ID，生成一个
            if (message.getId() == null || message.getId().isEmpty()) {
                message.setId(UUID.randomUUID().toString());
            }
            
            // 如果没有时间戳，设置当前时间
            if (message.getTimestamp() == null) {
                message.setTimestamp(System.currentTimeMillis());
            }
            
            // 设置会话ID
            message.setSessionId(sessionId);
            
            // 转换为实体并保存
            ChatMessageEntity entity = MemoryEntityConverter.toEntity(message);
            if (entity == null) {
                throw new RuntimeException("转换消息实体失败");
            }
            
            chatMessageRepository.save(entity);
            
            // 限制消息数量（遵循容量限制原则）
            long count = chatMessageRepository.countBySessionId(sessionId);
            if (count > MAX_MESSAGES_PER_SESSION) {
                // 删除最旧的消息
                Pageable pageable = PageRequest.of(0, (int)(count - MAX_MESSAGES_PER_SESSION));
                List<ChatMessageEntity> oldMessages = chatMessageRepository
                    .findBySessionIdOrderByTimestampDesc(sessionId, pageable);
                chatMessageRepository.deleteAll(oldMessages);
                log.debug("会话 {} 消息数量超过限制，删除最旧消息", sessionId);
            }
            
            // 更新或创建会话索引
            updateSessionIndex(sessionId, message.getUserId());
            
            log.debug("保存消息到短期记忆: sessionId={}, messageId={}", sessionId, message.getId());
        } catch (Exception e) {
            log.error("保存消息失败: sessionId={}", sessionId, e);
            throw new RuntimeException("保存消息失败", e);
        }
    }
    
    @Override
    public List<ChatMessage> getMessages(String sessionId, int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit);
            List<ChatMessageEntity> entities = chatMessageRepository
                .findBySessionIdOrderByTimestampDesc(sessionId, pageable);
            
            return entities.stream()
                .map(MemoryEntityConverter::toModel)
                .filter(msg -> msg != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("获取消息失败: sessionId={}", sessionId, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<ChatMessage> getMessages(String sessionId, Instant startTime, Instant endTime) {
        try {
            long startTimestamp = startTime.toEpochMilli();
            long endTimestamp = endTime.toEpochMilli();
            
            List<ChatMessageEntity> entities = chatMessageRepository
                .findBySessionIdAndTimestampBetween(sessionId, startTimestamp, endTimestamp);
            
            return entities.stream()
                .map(MemoryEntityConverter::toModel)
                .filter(msg -> msg != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("获取时间范围消息失败: sessionId={}", sessionId, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    @Transactional
    public void deleteMessage(String sessionId, String messageId) {
        try {
            chatMessageRepository.deleteBySessionIdAndId(sessionId, messageId);
            log.debug("删除消息: sessionId={}, messageId={}", sessionId, messageId);
        } catch (Exception e) {
            log.error("删除消息失败: sessionId={}, messageId={}", sessionId, messageId, e);
        }
    }
    
    @Override
    @Transactional
    public void clearSession(String sessionId) {
        try {
            // 删除所有消息
            chatMessageRepository.deleteBySessionId(sessionId);
            
            // 删除所有工作记忆
            workingMemoryRepository.deleteBySessionId(sessionId);
            
            log.debug("清空会话记忆: sessionId={}", sessionId);
        } catch (Exception e) {
            log.error("清空会话记忆失败: sessionId={}", sessionId, e);
        }
    }
    
    // ========== 工作记忆 ==========
    
    @Override
    @Transactional
    public void saveWorkingMemory(String sessionId, String key, Object value) {
        try {
            Optional<WorkingMemoryEntity> existing = workingMemoryRepository
                .findBySessionIdAndMemoryKey(sessionId, key);
            
            String valueJson = objectMapper.writeValueAsString(value);
            LocalDateTime expiresAt = LocalDateTime.now().plusHours(24);
            
            if (existing.isPresent()) {
                WorkingMemoryEntity entity = existing.get();
                entity.setMemoryValue(valueJson);
                entity.setExpiresAt(expiresAt);
                workingMemoryRepository.save(entity);
            } else {
                WorkingMemoryEntity entity = WorkingMemoryEntity.builder()
                    .sessionId(sessionId)
                    .memoryKey(key)
                    .memoryValue(valueJson)
                    .expiresAt(expiresAt)
                    .build();
                workingMemoryRepository.save(entity);
            }
            
            log.debug("保存工作记忆: sessionId={}, key={}", sessionId, key);
        } catch (Exception e) {
            log.error("保存工作记忆失败: sessionId={}, key={}", sessionId, key, e);
        }
    }
    
    @Override
    public <T> T getWorkingMemory(String sessionId, String key, Class<T> type) {
        try {
            Optional<WorkingMemoryEntity> entityOpt = workingMemoryRepository
                .findBySessionIdAndMemoryKey(sessionId, key);
            
            if (entityOpt.isEmpty()) {
                return null;
            }
            
            WorkingMemoryEntity entity = entityOpt.get();
            
            // 检查是否过期
            if (entity.getExpiresAt() != null && entity.getExpiresAt().isBefore(LocalDateTime.now())) {
                workingMemoryRepository.delete(entity);
                return null;
            }
            
            if (entity.getMemoryValue() == null || entity.getMemoryValue().isEmpty()) {
                return null;
            }
            
            return objectMapper.readValue(entity.getMemoryValue(), type);
        } catch (Exception e) {
            log.error("获取工作记忆失败: sessionId={}, key={}", sessionId, key, e);
            return null;
        }
    }
    
    @Override
    @Transactional
    public void deleteWorkingMemory(String sessionId, String key) {
        try {
            Optional<WorkingMemoryEntity> entityOpt = workingMemoryRepository
                .findBySessionIdAndMemoryKey(sessionId, key);
            
            if (entityOpt.isPresent()) {
                workingMemoryRepository.delete(entityOpt.get());
                log.debug("删除工作记忆: sessionId={}, key={}", sessionId, key);
            }
        } catch (Exception e) {
            log.error("删除工作记忆失败: sessionId={}, key={}", sessionId, key, e);
        }
    }
    
    // ========== 会话管理 ==========
    
    @Override
    public boolean sessionExists(String sessionId) {
        try {
            return chatMessageRepository.countBySessionId(sessionId) > 0;
        } catch (Exception e) {
            log.error("检查会话存在性失败: sessionId={}", sessionId, e);
            return false;
        }
    }
    
    @Override
    @Transactional
    public void deleteSession(String sessionId) {
        clearSession(sessionId);
        
        // 删除会话索引
        Optional<SessionEntity> sessionOpt = sessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isPresent()) {
            sessionRepository.delete(sessionOpt.get());
        }
    }
    
    @Override
    public List<String> getAllSessionIds(String userId) {
        try {
            return chatMessageRepository.findDistinctSessionIdsByUserId(userId);
        } catch (Exception e) {
            log.error("获取会话ID列表失败: userId={}", userId, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public int getMessageCount(String sessionId) {
        try {
            return (int) chatMessageRepository.countBySessionId(sessionId);
        } catch (Exception e) {
            log.error("获取消息数量失败: sessionId={}", sessionId, e);
            return 0;
        }
    }
    
    @Override
    public int getSessionCount(String userId) {
        try {
            return (int) chatMessageRepository.countDistinctSessionsByUserId(userId);
        } catch (Exception e) {
            log.error("获取会话数量失败: userId={}", userId, e);
            return 0;
        }
    }
    
    // ========== 私有方法 ==========
    
    /**
     * 更新或创建会话索引
     */
    @Transactional
    private void updateSessionIndex(String sessionId, String userId) {
        try {
            Optional<SessionEntity> existing = sessionRepository.findBySessionId(sessionId);
            
            LocalDateTime expiresAt = LocalDateTime.now().plusDays(DEFAULT_MESSAGE_TTL_DAYS);
            
            if (existing.isPresent()) {
                SessionEntity entity = existing.get();
                entity.setUpdatedAt(LocalDateTime.now());
                entity.setExpiresAt(expiresAt);
                sessionRepository.save(entity);
            } else {
                SessionEntity entity = SessionEntity.builder()
                    .sessionId(sessionId)
                    .userId(userId)
                    .expiresAt(expiresAt)
                    .build();
                sessionRepository.save(entity);
            }
        } catch (Exception e) {
            log.warn("更新会话索引失败: sessionId={}, userId={}", sessionId, userId, e);
        }
    }
}

