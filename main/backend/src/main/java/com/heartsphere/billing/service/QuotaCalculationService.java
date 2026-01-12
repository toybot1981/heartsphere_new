package com.heartsphere.billing.service;

// TODO: 临时注释，等待将 AIModelConfig 迁移到 shared 模块
// import com.heartsphere.admin.entity.AIModelConfig;
// import com.heartsphere.admin.repository.AIModelConfigRepository;
import com.heartsphere.billing.entity.ProviderResourcePool;
import com.heartsphere.billing.repository.AIProviderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

/**
 * 配额计算服务
 * 根据资源池余额计算可分配的用户配额
 * 
 * TODO: 需要将 AIModelConfig 迁移到 shared 模块，以恢复对 AI 模型配置的访问
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QuotaCalculationService {
    
    private final ResourcePoolService resourcePoolService;
    private final AIProviderRepository providerRepository;
    // TODO: 临时注释，等待将 AIModelConfig 迁移到 shared 模块
    // private final AIModelConfigRepository modelConfigRepository;
    private final PricingService pricingService;
    
    /**
     * 计算配额分配方案
     * @param providerName 提供商名称（如 doubao）
     * @param textTokenPerUser 每个用户的文本Token配额
     * @param imageCountPerUser 每个用户的图片配额
     * @return 计算结果
     */
    @Transactional(readOnly = true)
    public Map<String, Object> calculateQuotaDistribution(String providerName, Long textTokenPerUser, Integer imageCountPerUser) {
        Map<String, Object> result = new HashMap<>();
        
        // 1. 获取提供商和资源池信息
        var providerOpt = providerRepository.findByName(providerName);
        if (providerOpt.isEmpty()) {
            result.put("error", "提供商不存在: " + providerName);
            return result;
        }
        
        var provider = providerOpt.get();
        var poolOpt = resourcePoolService.getPool(provider.getId());
        if (poolOpt.isEmpty()) {
            result.put("error", "资源池不存在: " + providerName);
            return result;
        }
        
        ProviderResourcePool pool = poolOpt.get();
        BigDecimal availableBalance = pool.getAvailableBalance();
        
        result.put("providerId", provider.getId());
        result.put("providerName", providerName);
        result.put("availableBalance", availableBalance);
        result.put("textTokenPerUser", textTokenPerUser);
        result.put("imageCountPerUser", imageCountPerUser);
        
        // 2. 计算每个用户的配额成本
        // TODO: 临时使用默认价格估算，等待将 AIModelConfig 迁移到 shared 模块
        BigDecimal textCostPerUser = BigDecimal.ZERO;
        BigDecimal imageCostPerUser = BigDecimal.ZERO;
        
        // 计算文本Token成本（使用默认价格估算：0.0008元/1k tokens）
        if (textTokenPerUser > 0) {
            BigDecimal tokenCount = BigDecimal.valueOf(textTokenPerUser);
            BigDecimal thousandTokens = tokenCount.divide(BigDecimal.valueOf(1000), 6, RoundingMode.CEILING);
            textCostPerUser = new BigDecimal("0.0008").multiply(thousandTokens);
            result.put("textCostPerUser", textCostPerUser);
            result.put("textCostEstimated", true);
            log.warn("[配额计算] 使用默认价格估算文本Token成本（等待将 AIModelConfig 迁移到 shared 模块）");
        }
        
        // 计算图片生成成本（使用默认价格估算：0.012元/张）
        if (imageCountPerUser > 0) {
            imageCostPerUser = new BigDecimal("0.012").multiply(BigDecimal.valueOf(imageCountPerUser));
            result.put("imageCostPerUser", imageCostPerUser);
            result.put("imageCostEstimated", true);
            log.warn("[配额计算] 使用默认价格估算图片生成成本（等待将 AIModelConfig 迁移到 shared 模块）");
        }
        
        BigDecimal totalCostPerUser = textCostPerUser.add(imageCostPerUser);
        result.put("totalCostPerUser", totalCostPerUser);
        
        // 3. 计算可分配用户数
        if (totalCostPerUser.compareTo(BigDecimal.ZERO) > 0) {
            int maxUsers = availableBalance.divide(totalCostPerUser, 0, RoundingMode.DOWN).intValue();
            result.put("maxUsers", maxUsers);
            result.put("totalCostForAllUsers", totalCostPerUser.multiply(BigDecimal.valueOf(maxUsers)));
            result.put("remainingBalance", availableBalance.subtract(totalCostPerUser.multiply(BigDecimal.valueOf(maxUsers))));
        } else {
            result.put("maxUsers", 0);
            result.put("totalCostForAllUsers", BigDecimal.ZERO);
            result.put("remainingBalance", availableBalance);
        }
        
        // 4. 获取所有用户数量
        // 这里需要通过UserRepository查询，暂时不实现，可以在管理接口中传入
        
        log.info("[配额计算] 计算结果: provider={}, availableBalance={}, costPerUser={}, maxUsers={}", 
                providerName, availableBalance, totalCostPerUser, result.get("maxUsers"));
        
        return result;
    }
}

