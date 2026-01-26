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
        log.info("[MySQLShortMemoryService] ========== 开始保存消息到短期记忆 ==========");
        log.info("[MySQLShortMemoryService] 输入参数: sessionId={}, messageId={}, userId={}, role={}, contentLength={}", 
            sessionId, message.getId(), message.getUserId(), message.getRole(),
            message.getContent() != null ? message.getContent().length() : 0);
        
        try {
            // 1. 生成消息ID（如果没有）
            if (message.getId() == null || message.getId().isEmpty()) {
                String newId = UUID.randomUUID().toString();
                message.setId(newId);
                log.info("[MySQLShortMemoryService] 步骤1: 生成消息ID: messageId={}", newId);
            } else {
                log.info("[MySQLShortMemoryService] 步骤1: 使用已有消息ID: messageId={}", message.getId());
            }
            
            // 2. 设置时间戳（如果没有）
            if (message.getTimestamp() == null) {
                Long timestamp = System.currentTimeMillis();
                message.setTimestamp(timestamp);
                log.info("[MySQLShortMemoryService] 步骤2: 设置时间戳: timestamp={}", timestamp);
            } else {
                log.info("[MySQLShortMemoryService] 步骤2: 使用已有时间戳: timestamp={}", message.getTimestamp());
            }
            
            // 3. 设置会话ID
            message.setSessionId(sessionId);
            log.info("[MySQLShortMemoryService] 步骤3: 设置会话ID: sessionId={}", sessionId);
            
            // 4. 转换为实体
            log.info("[MySQLShortMemoryService] 步骤4: 转换为实体");
            ChatMessageEntity entity = MemoryEntityConverter.toEntity(message);
            if (entity == null) {
                log.error("[MySQLShortMemoryService] ❌ 转换消息实体失败: messageId={}, sessionId={}", 
                    message.getId(), sessionId);
                throw new RuntimeException("转换消息实体失败");
            }
            log.info("[MySQLShortMemoryService] ✅ 实体转换成功: entityId={}, sessionId={}, userId={}, role={}", 
                entity.getId(), entity.getSessionId(), entity.getUserId(), entity.getRole());
            
            // 5. 保存到数据库
            log.info("[MySQLShortMemoryService] 步骤5: 保存到数据库");
            ChatMessageEntity savedEntity = chatMessageRepository.save(entity);
            log.info("[MySQLShortMemoryService] ✅ 消息已保存到数据库: entityId={}, sessionId={}, userId={}, role={}, timestamp={}, createdAt={}", 
                savedEntity.getId(), savedEntity.getSessionId(), savedEntity.getUserId(), 
                savedEntity.getRole(), savedEntity.getTimestamp(), savedEntity.getCreatedAt());
            
            // 6. 限制消息数量（遵循容量限制原则）
            log.info("[MySQLShortMemoryService] 步骤6: 检查消息数量限制");
            long count = chatMessageRepository.countBySessionId(sessionId);
            log.info("[MySQLShortMemoryService] 当前会话消息数量: sessionId={}, count={}, max={}", 
                sessionId, count, MAX_MESSAGES_PER_SESSION);
            if (count > MAX_MESSAGES_PER_SESSION) {
                int deleteCount = (int)(count - MAX_MESSAGES_PER_SESSION);
                Pageable pageable = PageRequest.of(0, deleteCount);
                List<ChatMessageEntity> oldMessages = chatMessageRepository
                    .findBySessionIdOrderByTimestampDesc(sessionId, pageable);
                chatMessageRepository.deleteAll(oldMessages);
                log.info("[MySQLShortMemoryService] ✅ 删除最旧消息: sessionId={}, deletedCount={}", sessionId, oldMessages.size());
            }
            
            // 7. 更新或创建会话索引
            log.info("[MySQLShortMemoryService] 步骤7: 更新会话索引");
            updateSessionIndex(sessionId, message.getUserId());
            log.info("[MySQLShortMemoryService] ✅ 会话索引已更新: sessionId={}, userId={}", sessionId, message.getUserId());
            
            log.info("[MySQLShortMemoryService] ✅ 保存消息到短期记忆成功: sessionId={}, messageId={}, userId={}, role={}", 
                sessionId, message.getId(), message.getUserId(), message.getRole());
            log.info("[MySQLShortMemoryService] ========== 保存消息到短期记忆完成 ==========");
        } catch (Exception e) {
            log.error("[MySQLShortMemoryService] ❌ 保存消息失败: sessionId={}, messageId={}, userId={}, role={}, error={}", 
                sessionId, message != null ? message.getId() : "null", 
                message != null ? message.getUserId() : "null",
                message != null ? message.getRole() : "null", 
                e.getMessage(), e);
            log.info("[MySQLShortMemoryService] ========== 保存消息到短期记忆失败 ==========");
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
            log.info("删除消息: sessionId={}, messageId={}", sessionId, messageId);
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
            
            log.info("清空会话记忆: sessionId={}", sessionId);
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
            
            log.info("保存工作记忆: sessionId={}, key={}", sessionId, key);
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
                log.info("删除工作记忆: sessionId={}, key={}", sessionId, key);
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

