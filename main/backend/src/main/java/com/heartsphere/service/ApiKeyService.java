package com.heartsphere.service;

import com.heartsphere.entity.ApiKey;
import com.heartsphere.repository.ApiKeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.logging.Logger;

/**
 * API Key服务
 * 注意：此服务直接访问数据库，admin 只负责配置
 */
@Service
public class ApiKeyService {

    private static final Logger logger = Logger.getLogger(ApiKeyService.class.getName());
    private static final String API_KEY_PREFIX = "hs_";
    private static final String CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    @Autowired
    private ApiKeyRepository apiKeyRepository;

    /**
     * 验证API Key
     */
    public ApiKey validateApiKey(String apiKey) {
        // 移除前缀（如果有）
        String keyValue = apiKey.startsWith(API_KEY_PREFIX) 
            ? apiKey.substring(API_KEY_PREFIX.length()) 
            : apiKey;
        
        Optional<ApiKey> keyOpt = apiKeyRepository.findByApiKey(keyValue);
        if (keyOpt.isEmpty()) {
            throw new RuntimeException("无效的API Key");
        }
        
        ApiKey key = keyOpt.get();
        
        // 检查是否启用
        if (!key.getIsActive()) {
            throw new RuntimeException("API Key已被禁用");
        }
        
        // 检查是否过期
        if (key.getExpiresAt() != null && key.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("API Key已过期");
        }
        
        return key;
    }

    /**
     * 记录API Key使用
     */
    @Transactional
    public void recordApiKeyUsage(String apiKey) {
        String keyValue = apiKey.startsWith(API_KEY_PREFIX) 
            ? apiKey.substring(API_KEY_PREFIX.length()) 
            : apiKey;
        
        Optional<ApiKey> keyOpt = apiKeyRepository.findByApiKey(keyValue);
        if (keyOpt.isPresent()) {
            ApiKey key = keyOpt.get();
            key.setLastUsedAt(LocalDateTime.now());
            key.setUsageCount(key.getUsageCount() + 1);
            apiKeyRepository.save(key);
        }
    }

    /**
     * 生成API Key
     */
    private String generateApiKey() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 32; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}
