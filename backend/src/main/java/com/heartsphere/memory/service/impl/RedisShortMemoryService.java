package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.memory.service.ShortMemoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Redis短期记忆服务实现
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RedisShortMemoryService implements ShortMemoryService {
    
    @Qualifier("memoryRedisTemplate")
    private final RedisTemplate<String, Object> redisTemplate;
    
    // Key前缀
    private static final String MESSAGE_KEY_PREFIX = "short:msg:";
    private static final String WORKING_MEMORY_PREFIX = "short:work:";
    private static final String SESSION_INDEX_PREFIX = "short:sessions:";
    
    // 配置参数（可以从配置文件读取）
    private static final int DEFAULT_MESSAGE_TTL = 3600 * 24 * 7; // 7天
    private static final int MAX_MESSAGES_PER_SESSION = 100;      // 最多100条消息
    
    @Override
    public void saveMessage(String sessionId, ChatMessage message) {
        try {
            String key = MESSAGE_KEY_PREFIX + sessionId;
            
            // 如果没有ID，生成一个
            if (message.getId() == null || message.getId().isEmpty()) {
                message.setId(UUID.randomUUID().toString());
            }
            
            // 如果没有时间戳，设置当前时间
            if (message.getTimestamp() == null) {
                message.setTimestamp(System.currentTimeMillis());
            }
            
            // 使用List存储消息，按时间顺序（右端插入）
            redisTemplate.opsForList().rightPush(key, message);
            
            // 限制消息数量（遵循容量限制原则）
            Long size = redisTemplate.opsForList().size(key);
            if (size != null && size > MAX_MESSAGES_PER_SESSION) {
                // 超过限制，删除最旧的消息（左端弹出）
                redisTemplate.opsForList().leftPop(key);
                log.debug("会话 {} 消息数量超过限制，删除最旧消息", sessionId);
            }
            
            // 设置过期时间（自动清理）
            redisTemplate.expire(key, Duration.ofSeconds(DEFAULT_MESSAGE_TTL));
            
            // 更新会话索引
            if (message.getUserId() != null) {
                String sessionIndexKey = SESSION_INDEX_PREFIX + message.getUserId();
                redisTemplate.opsForSet().add(sessionIndexKey, sessionId);
                redisTemplate.expire(sessionIndexKey, Duration.ofSeconds(DEFAULT_MESSAGE_TTL));
            }
            
            log.debug("保存消息到短期记忆: sessionId={}, messageId={}", sessionId, message.getId());
        } catch (Exception e) {
            log.error("保存消息失败: sessionId={}", sessionId, e);
            throw new RuntimeException("保存消息失败", e);
        }
    }
    
    @Override
    public List<ChatMessage> getMessages(String sessionId, int limit) {
        try {
            String key = MESSAGE_KEY_PREFIX + sessionId;
            
            Long size = redisTemplate.opsForList().size(key);
            if (size == null || size == 0) {
                return Collections.emptyList();
            }
            
            // 计算起始位置（从后往前取）
            int start = Math.max(0, (int)(size - limit));
            
            // 获取指定范围的消息
            List<Object> messages = redisTemplate.opsForList().range(key, start, -1);
            
            if (messages == null) {
                return Collections.emptyList();
            }
            
            return messages.stream()
                .map(msg -> (ChatMessage) msg)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("获取消息失败: sessionId={}", sessionId, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<ChatMessage> getMessages(String sessionId, Instant startTime, Instant endTime) {
        try {
            // 获取所有消息
            List<ChatMessage> allMessages = getMessages(sessionId, MAX_MESSAGES_PER_SESSION);
            
            // 过滤时间范围
            return allMessages.stream()
                .filter(msg -> {
                    if (msg.getTimestamp() == null) {
                        return false;
                    }
                    Instant msgTime = Instant.ofEpochMilli(msg.getTimestamp());
                    return !msgTime.isBefore(startTime) && !msgTime.isAfter(endTime);
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("获取时间范围消息失败: sessionId={}", sessionId, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public void deleteMessage(String sessionId, String messageId) {
        try {
            String key = MESSAGE_KEY_PREFIX + sessionId;
            List<Object> messages = redisTemplate.opsForList().range(key, 0, -1);
            
            if (messages != null) {
                for (Object msg : messages) {
                    ChatMessage message = (ChatMessage) msg;
                    if (messageId.equals(message.getId())) {
                        redisTemplate.opsForList().remove(key, 1, message);
                        log.debug("删除消息: sessionId={}, messageId={}", sessionId, messageId);
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.error("删除消息失败: sessionId={}, messageId={}", sessionId, messageId, e);
        }
    }
    
    @Override
    public void clearSession(String sessionId) {
        try {
            // 删除消息列表
            String messageKey = MESSAGE_KEY_PREFIX + sessionId;
            redisTemplate.delete(messageKey);
            
            // 删除所有工作记忆
            String workingMemoryPattern = WORKING_MEMORY_PREFIX + sessionId + ":*";
            Set<String> keys = redisTemplate.keys(workingMemoryPattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
            
            log.debug("清空会话记忆: sessionId={}", sessionId);
        } catch (Exception e) {
            log.error("清空会话记忆失败: sessionId={}", sessionId, e);
        }
    }
    
    @Override
    public void saveWorkingMemory(String sessionId, String key, Object value) {
        try {
            String redisKey = WORKING_MEMORY_PREFIX + sessionId + ":" + key;
            
            // 直接保存值，而不是包装在WorkingMemory中
            // 这样可以简化序列化和反序列化
            Duration ttl = Duration.ofHours(24);
            redisTemplate.opsForValue().set(redisKey, value, ttl);
            
            log.debug("保存工作记忆: sessionId={}, key={}", sessionId, key);
        } catch (Exception e) {
            log.error("保存工作记忆失败: sessionId={}, key={}", sessionId, key, e);
        }
    }
    
    @Override
    public <T> T getWorkingMemory(String sessionId, String key, Class<T> type) {
        try {
            String redisKey = WORKING_MEMORY_PREFIX + sessionId + ":" + key;
            Object obj = redisTemplate.opsForValue().get(redisKey);
            
            if (obj == null) {
                return null;
            }
            
            // 直接返回类型转换后的值
            return type.cast(obj);
        } catch (Exception e) {
            log.error("获取工作记忆失败: sessionId={}, key={}", sessionId, key, e);
            return null;
        }
    }
    
    @Override
    public void deleteWorkingMemory(String sessionId, String key) {
        try {
            String redisKey = WORKING_MEMORY_PREFIX + sessionId + ":" + key;
            redisTemplate.delete(redisKey);
            log.debug("删除工作记忆: sessionId={}, key={}", sessionId, key);
        } catch (Exception e) {
            log.error("删除工作记忆失败: sessionId={}, key={}", sessionId, key, e);
        }
    }
    
    @Override
    public boolean sessionExists(String sessionId) {
        try {
            String key = MESSAGE_KEY_PREFIX + sessionId;
            Long size = redisTemplate.opsForList().size(key);
            return size != null && size > 0;
        } catch (Exception e) {
            log.error("检查会话存在性失败: sessionId={}", sessionId, e);
            return false;
        }
    }
    
    @Override
    public void deleteSession(String sessionId) {
        clearSession(sessionId);
    }
    
    @Override
    public List<String> getAllSessionIds(String userId) {
        try {
            String sessionIndexKey = SESSION_INDEX_PREFIX + userId;
            Set<Object> sessionIds = redisTemplate.opsForSet().members(sessionIndexKey);
            
            if (sessionIds == null) {
                return Collections.emptyList();
            }
            
            return sessionIds.stream()
                .map(Object::toString)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("获取会话ID列表失败: userId={}", userId, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public int getMessageCount(String sessionId) {
        try {
            String key = MESSAGE_KEY_PREFIX + sessionId;
            Long size = redisTemplate.opsForList().size(key);
            return size != null ? size.intValue() : 0;
        } catch (Exception e) {
            log.error("获取消息数量失败: sessionId={}", sessionId, e);
            return 0;
        }
    }
    
    @Override
    public int getSessionCount(String userId) {
        try {
            String sessionIndexKey = SESSION_INDEX_PREFIX + userId;
            Long size = redisTemplate.opsForSet().size(sessionIndexKey);
            return size != null ? size.intValue() : 0;
        } catch (Exception e) {
            log.error("获取会话数量失败: userId={}", userId, e);
            return 0;
        }
    }
    
    /**
     * 工作记忆内部类
     */
    @lombok.Data
    @lombok.Builder
    private static class WorkingMemory {
        private String sessionId;
        private String key;
        private Object value;
        private Long timestamp;
        private Long ttl;
    }
}

