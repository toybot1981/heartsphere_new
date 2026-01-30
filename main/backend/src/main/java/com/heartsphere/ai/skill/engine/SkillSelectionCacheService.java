package com.heartsphere.ai.skill.engine;

import com.heartsphere.skill.entity.SkillDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 技能选择缓存服务
 * 管理 LLM 选择结果的缓存
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SkillSelectionCacheService {
    
    /**
     * 获取缓存的 LLM 选择结果
     * 注意：这个方法不使用 @Cacheable，因为我们需要手动控制缓存逻辑
     */
    public String getCachedResult(String cacheKey) {
        // 这个方法由调用方通过 Spring Cache 直接访问缓存
        // 如果缓存未命中，返回 null
        return null;
    }
    
    /**
     * 保存 LLM 选择结果到缓存
     */
    @CachePut(value = "llmSkillSelection", key = "#cacheKey")
    public String cacheResult(String cacheKey, String result) {
        log.debug("✅ 缓存 LLM 选择结果: cacheKey={}, resultLength={}", cacheKey, result.length());
        return result;
    }
    
    /**
     * 清除缓存
     */
    @CacheEvict(value = "llmSkillSelection", key = "#cacheKey")
    public void evictCache(String cacheKey) {
        log.debug("清除 LLM 选择结果缓存: cacheKey={}", cacheKey);
    }
    
    /**
     * 生成缓存键
     */
    public String generateCacheKey(
        String prompt,
        SkillEvaluationContext context,
        String level,
        List<SkillDefinition> skills) {
        
        try {
            StringBuilder keyBuilder = new StringBuilder();
            keyBuilder.append(level).append(":");
            keyBuilder.append(context.getUserMessage() != null ? context.getUserMessage().hashCode() : 0).append(":");
            
            // 添加技能ID列表
            if (skills != null && !skills.isEmpty()) {
                String skillIds = skills.stream()
                    .map(SkillDefinition::getSkillId)
                    .sorted()
                    .collect(Collectors.joining(","));
                keyBuilder.append(skillIds.hashCode());
            }
            
            // 使用 MD5 生成短键
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(keyBuilder.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return "llm_skill_selection:" + level + ":" + hexString.toString();
            
        } catch (Exception e) {
            log.warn("生成缓存键失败，使用提示词hash: {}", e.getMessage());
            return "llm_skill_selection:" + level + ":" + prompt.hashCode();
        }
    }
}
