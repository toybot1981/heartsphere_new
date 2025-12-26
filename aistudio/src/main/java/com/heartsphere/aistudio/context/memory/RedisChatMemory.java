package com.heartsphere.aistudio.context.memory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aistudio.context.model.ContextMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Redis ChatMemory 实现
 * 使用 Redis List 结构存储对话历史
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisChatMemory implements ChatMemory {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String KEY_PREFIX = "chat:memory:";
    private static final int DEFAULT_MAX_MESSAGES = 100; // Redis 存储上限
    private static final Duration DEFAULT_TTL = Duration.ofDays(7); // 默认7天过期

    /**
     * 获取完整的 Redis key
     */
    private String getKey(String sessionId) {
        return KEY_PREFIX + sessionId;
    }

    @Override
    public void add(String sessionId, List<ContextMessage> messages) {
        if (messages == null || messages.isEmpty()) {
            return;
        }

        String key = getKey(sessionId);

        try {
            // 序列化消息
            List<String> serializedMessages = messages.stream()
                .map(this::serializeMessage)
                .collect(Collectors.toList());

            // 添加到 Redis List（右侧）
            redisTemplate.opsForList().rightPushAll(key, serializedMessages.toArray());

            // 设置过期时间
            redisTemplate.expire(key, DEFAULT_TTL);

            // 检查是否超过上限，超过则压缩
            Long size = redisTemplate.opsForList().size(key);
            if (size != null && size > DEFAULT_MAX_MESSAGES) {
                log.debug("Session {} has {} messages, exceeding limit of {}, triggering compression",
                    sessionId, size, DEFAULT_MAX_MESSAGES);
                compressOldMessages(sessionId);
            }

            log.debug("Added {} messages to session {}", messages.size(), sessionId);
        } catch (Exception e) {
            log.error("Failed to add messages to session {}", sessionId, e);
            throw new RuntimeException("Failed to add messages to Redis", e);
        }
    }

    @Override
    public List<ContextMessage> get(String sessionId, int lastN) {
        String key = getKey(sessionId);

        try {
            Long size = redisTemplate.opsForList().size(key);
            if (size == null || size == 0) {
                return List.of();
            }

            // 计算起始位置
            long start = Math.max(0, size - lastN);

            // 从 Redis 获取消息
            List<Object> rawMessages = redisTemplate.opsForList().range(key, start, -1);

            if (rawMessages == null || rawMessages.isEmpty()) {
                return List.of();
            }

            // 反序列化
            return rawMessages.stream()
                .map(this::deserializeMessage)
                .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to get messages from session {}", sessionId, e);
            return List.of();
        }
    }

    @Override
    public List<ContextMessage> get(String sessionId, Instant since, Instant until) {
        String key = getKey(sessionId);

        try {
            List<Object> rawMessages = redisTemplate.opsForList().range(key, 0, -1);

            if (rawMessages == null || rawMessages.isEmpty()) {
                return List.of();
            }

            // 反序列化并过滤时间范围
            return rawMessages.stream()
                .map(this::deserializeMessage)
                .filter(msg -> {
                    Instant timestamp = msg.getTimestamp();
                    return !timestamp.isBefore(since) && !timestamp.isAfter(until);
                })
                .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to get messages from session {} by time range", sessionId, e);
            return List.of();
        }
    }

    @Override
    public int size(String sessionId) {
        String key = getKey(sessionId);
        Long size = redisTemplate.opsForList().size(key);
        return size != null ? size.intValue() : 0;
    }

    @Override
    public void clear(String sessionId) {
        String key = getKey(sessionId);
        redisTemplate.delete(key);
        log.debug("Cleared messages for session {}", sessionId);
    }

    @Override
    public boolean exists(String sessionId) {
        String key = getKey(sessionId);
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    @Override
    public void delete(String sessionId) {
        clear(sessionId);
    }

    @Override
    public List<String> getAllSessionIds() {
        try {
            Set<String> keys = redisTemplate.keys(KEY_PREFIX + "*");
            if (keys == null || keys.isEmpty()) {
                return List.of();
            }

            // 移除前缀，返回纯 sessionId
            return keys.stream()
                .map(key -> key.substring(KEY_PREFIX.length()))
                .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to get all session IDs", e);
            return List.of();
        }
    }

    /**
     * 压缩旧消息
     * 当消息数量超过上限时，将旧消息移除并可能生成摘要
     */
    private void compressOldMessages(String sessionId) {
        int keepSize = (int) (DEFAULT_MAX_MESSAGES * 0.7); // 保留70%
        String key = getKey(sessionId);

        // 保留最近的消息
        redisTemplate.opsForList().trim(key, -keepSize, -1);

        log.info("Compressed session {} to keep only the most recent {} messages",
            sessionId, keepSize);

        // TODO: 这里可以触发异步摘要生成任务
        // 将被移除的消息发送到 LLM 生成摘要
    }

    /**
     * 序列化消息为 JSON
     */
    private String serializeMessage(ContextMessage message) {
        try {
            return objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            log.error("Failed to serialize message", e);
            throw new RuntimeException("Failed to serialize message", e);
        }
    }

    /**
     * 从 JSON 反序列化消息
     */
    private ContextMessage deserializeMessage(Object raw) {
        try {
            String json = (String) raw;
            return objectMapper.readValue(json, ContextMessage.class);
        } catch (Exception e) {
            log.error("Failed to deserialize message", e);
            throw new RuntimeException("Failed to deserialize message", e);
        }
    }
}
