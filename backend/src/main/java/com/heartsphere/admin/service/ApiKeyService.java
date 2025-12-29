package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.ApiKeyDTO;
import com.heartsphere.admin.dto.CreateApiKeyRequest;
import com.heartsphere.admin.entity.ApiKey;
import com.heartsphere.admin.repository.ApiKeyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.logging.Logger;
import java.util.Random;

/**
 * API Key服务
 */
@Service
public class ApiKeyService {

    private static final Logger logger = Logger.getLogger(ApiKeyService.class.getName());
    private static final String API_KEY_PREFIX = "hs_";
    private static final String CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    @Autowired
    private ApiKeyRepository apiKeyRepository;

    /**
     * 创建API Key
     */
    @Transactional
    public ApiKeyDTO createApiKey(CreateApiKeyRequest request, Long adminId) {
        logger.info(String.format("管理员ID: %d 创建API Key，名称: %s", adminId, request.getKeyName()));
        
        // 检查名称是否已存在
        if (apiKeyRepository.existsByKeyName(request.getKeyName())) {
            throw new RuntimeException("API Key名称已存在");
        }
        
        ApiKey apiKey = new ApiKey();
        apiKey.setKeyName(request.getKeyName());
        apiKey.setApiKey(generateApiKey());
        apiKey.setUserId(request.getUserId());
        apiKey.setIsActive(true);
        apiKey.setExpiresAt(request.getExpiresAt());
        apiKey.setRateLimit(request.getRateLimit());
        apiKey.setDescription(request.getDescription());
        apiKey.setCreatedByAdminId(adminId);
        apiKey.setUsageCount(Long.valueOf(0));
        
        ApiKey saved = apiKeyRepository.save(apiKey);
        logger.info(String.format("成功创建API Key，ID: %d", saved.getId()));
        
        return toDTO(saved, true); // 创建时返回完整Key
    }

    /**
     * 获取所有API Key
     */
    public List<ApiKeyDTO> getAllApiKeys() {
        List<ApiKey> keys = apiKeyRepository.findAll();
        return keys.stream()
                .map(key -> toDTO(key, true)) // 管理后台返回完整Key以便复制
                .collect(Collectors.toList());
    }

    /**
     * 根据ID获取API Key（返回完整Key值）
     */
    public ApiKeyDTO getApiKeyById(Long id) {
        ApiKey apiKey = apiKeyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("API Key不存在"));
        return toDTO(apiKey, true); // 返回完整Key
    }

    /**
     * 启用/禁用API Key
     */
    @Transactional
    public ApiKeyDTO toggleApiKey(Long id, Boolean isActive) {
        ApiKey apiKey = apiKeyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("API Key不存在"));
        
        apiKey.setIsActive(isActive);
        ApiKey saved = apiKeyRepository.save(apiKey);
        logger.info(String.format("API Key ID: %d 状态更新为: %s", id, isActive ? "启用" : "禁用"));
        
        return toDTO(saved, false);
    }

    /**
     * 删除API Key
     */
    @Transactional
    public void deleteApiKey(Long id) {
        if (!apiKeyRepository.existsById(id)) {
            throw new RuntimeException("API Key不存在");
        }
        apiKeyRepository.deleteById(id);
        logger.info(String.format("API Key ID: %d 已删除", id));
    }

    /**
     * 验证API Key是否有效
     */
    public ApiKey validateApiKey(String apiKeyValue) {
        Optional<ApiKey> optional = apiKeyRepository.findByApiKey(apiKeyValue);
        if (optional.isEmpty()) {
            throw new RuntimeException("API Key无效");
        }
        
        ApiKey apiKey = optional.get();
        
        if (!apiKey.getIsActive()) {
            throw new RuntimeException("API Key已被禁用");
        }
        
        if (apiKey.getExpiresAt() != null && apiKey.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("API Key已过期");
        }
        
        return apiKey;
    }

    /**
     * 记录API Key使用
     */
    @Transactional
    public void recordApiKeyUsage(String apiKeyValue) {
        Optional<ApiKey> optional = apiKeyRepository.findByApiKey(apiKeyValue);
        if (optional.isPresent()) {
            ApiKey apiKey = optional.get();
            apiKey.setLastUsedAt(LocalDateTime.now());
            apiKey.setUsageCount(apiKey.getUsageCount() + 1);
            apiKeyRepository.save(apiKey);
        }
    }

    /**
     * 生成API Key
     * 格式: hs_<随机字符串48位>
     */
    private String generateApiKey() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder(API_KEY_PREFIX);
        for (int i = 0; i < 48; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        
        String key = sb.toString();
        // 确保唯一性
        while (apiKeyRepository.existsByApiKey(key)) {
            sb = new StringBuilder(API_KEY_PREFIX);
            for (int i = 0; i < 48; i++) {
                sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
            }
            key = sb.toString();
        }
        
        return key;
    }

    /**
     * 转换为DTO
     * @param includeFullKey 是否包含完整的API Key值（仅在创建时返回）
     */
    private ApiKeyDTO toDTO(ApiKey apiKey, boolean includeFullKey) {
        ApiKeyDTO dto = new ApiKeyDTO();
        dto.setId(apiKey.getId());
        dto.setKeyName(apiKey.getKeyName());
        if (includeFullKey) {
            dto.setApiKey(apiKey.getApiKey()); // 仅在创建时返回完整Key
        } else {
            dto.setApiKey(apiKey.getApiKey().substring(0, 8) + "..."); // 列表查询时只显示前8位
        }
        dto.setUserId(apiKey.getUserId());
        dto.setIsActive(apiKey.getIsActive());
        dto.setExpiresAt(apiKey.getExpiresAt());
        dto.setLastUsedAt(apiKey.getLastUsedAt());
        dto.setUsageCount(apiKey.getUsageCount());
        dto.setRateLimit(apiKey.getRateLimit());
        dto.setDescription(apiKey.getDescription());
        dto.setCreatedByAdminId(apiKey.getCreatedByAdminId());
        dto.setCreatedAt(apiKey.getCreatedAt());
        dto.setUpdatedAt(apiKey.getUpdatedAt());
        return dto;
    }
}

