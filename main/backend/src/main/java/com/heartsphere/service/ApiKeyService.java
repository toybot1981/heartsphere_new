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
        // 尝试两种方式查找：
        // 1. 直接使用传入的 API Key（可能包含 hs_ 前缀）
        // 2. 如果失败，尝试移除前缀后查找（兼容旧数据）
        Optional<ApiKey> keyOpt = apiKeyRepository.findByApiKey(apiKey);
        
        // 如果直接查找失败，尝试移除前缀后查找
        if (keyOpt.isEmpty() && apiKey.startsWith(API_KEY_PREFIX)) {
            String keyValue = apiKey.substring(API_KEY_PREFIX.length());
            keyOpt = apiKeyRepository.findByApiKey(keyValue);
        }
        
        // 如果还是失败，尝试添加前缀后查找（兼容数据库中存储的是去掉前缀的情况）
        if (keyOpt.isEmpty() && !apiKey.startsWith(API_KEY_PREFIX)) {
            String keyWithPrefix = API_KEY_PREFIX + apiKey;
            keyOpt = apiKeyRepository.findByApiKey(keyWithPrefix);
        }
        
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
        // 尝试多种方式查找 API Key（与 validateApiKey 保持一致）
        Optional<ApiKey> keyOpt = apiKeyRepository.findByApiKey(apiKey);
        
        if (keyOpt.isEmpty() && apiKey.startsWith(API_KEY_PREFIX)) {
            String keyValue = apiKey.substring(API_KEY_PREFIX.length());
            keyOpt = apiKeyRepository.findByApiKey(keyValue);
        }
        
        if (keyOpt.isEmpty() && !apiKey.startsWith(API_KEY_PREFIX)) {
            String keyWithPrefix = API_KEY_PREFIX + apiKey;
            keyOpt = apiKeyRepository.findByApiKey(keyWithPrefix);
        }
        
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
