package com.heartsphere.aistudio.context.config;

import com.heartsphere.aistudio.context.memory.ChatMemory;
import com.heartsphere.aistudio.context.memory.RedisChatMemory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Context Engine 配置类
 */
@Configuration
public class ContextEngineConfig {

    /**
     * 配置 Redis Template
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // 使用 String 序列化器作为 key 的序列化器
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        // 使用 JSON 序列化器作为 value 的序列化器
        GenericJackson2JsonRedisSerializer jsonSerializer =
            new GenericJackson2JsonRedisSerializer();
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }

    /**
     * 配置 ObjectMapper（用于 JSON 序列化）
     */
    @Bean
    public ObjectMapper contextObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // 注册 JavaTimeModule 以支持 Java 8 时间类型
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    /**
     * 配置 ChatMemory（使用 Redis 实现）
     */
    @Bean
    @ConditionalOnMissingBean
    public ChatMemory chatMemory(
            RedisTemplate<String, Object> redisTemplate,
            ObjectMapper contextObjectMapper) {

        return new RedisChatMemory(redisTemplate, contextObjectMapper);
    }
}
