package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.AIModel;
import com.heartsphere.billing.entity.ProviderResourcePool;
import com.heartsphere.billing.repository.AIModelRepository;
import com.heartsphere.billing.repository.AIProviderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * 资费监控服务
 * 定时检查资源池水位并更新模型状态
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BillingMonitorService {

    private final ResourcePoolService resourcePoolService;
    private final BillingAlertService alertService;
    private final AIProviderRepository providerRepository;
    private final AIModelRepository modelRepository;

    /**
     * 定时检查资源池水位（每5分钟执行一次）
     */
    @Scheduled(fixedRate = 300000) // 5分钟
    @Transactional
    public void checkResourcePoolBalance() {
        log.info("开始检查资源池水位...");
        
        providerRepository.findAll().forEach(provider -> {
            try {
                ProviderResourcePool pool = resourcePoolService.getOrCreatePool(provider.getId());
                
                // 检查余额状态
                boolean isLow = resourcePoolService.checkBalanceStatus(pool);
                BigDecimal percentage = resourcePoolService.calculateBalancePercentage(pool);
                
                // 如果余额不足，创建提醒
                if (isLow) {
                    alertService.createLowBalanceAlert(pool, percentage);
                }
                
                // 更新模型状态
                updateModelStatus(provider.getId(), pool, percentage);
                
                log.debug("检查资源池: providerId={}, percentage={}%, isLow={}", 
                        provider.getId(), percentage, isLow);
            } catch (Exception e) {
                log.error("检查资源池失败: providerId={}", provider.getId(), e);
            }
        });
        
        log.info("资源池水位检查完成");
    }

    /**
     * 更新模型状态
     * 如果余额不足（<=0），禁用该提供商下的所有模型
     */
    @Transactional
    private void updateModelStatus(Long providerId, ProviderResourcePool pool, BigDecimal percentage) {
        List<AIModel> models = modelRepository.findByProviderId(providerId);
        
        // 如果余额为0或负数，禁用所有模型
        boolean shouldDisable = pool.getAvailableBalance().compareTo(BigDecimal.ZERO) <= 0;
        
        models.forEach(model -> {
            // 如果余额不足，且模型当前是启用状态，则禁用
            if (shouldDisable && model.getEnabled()) {
                model.setEnabled(false);
                modelRepository.save(model);
                log.warn("因资源池余额不足，禁用模型: providerId={}, modelId={}, modelName={}", 
                        providerId, model.getId(), model.getModelName());
            }
            // 如果余额充足（>0），且模型当前是禁用状态（且不是因为其他原因禁用的），则启用
            // 注意：这里只自动启用因余额不足而禁用的模型，其他原因禁用的模型不自动启用
            else if (!shouldDisable && !model.getEnabled() && percentage.compareTo(new BigDecimal("10")) > 0) {
                // 可以在这里添加逻辑判断模型是否是因为余额不足而禁用的
                // 为了安全，暂时不自动启用，需要管理员手动启用
            }
        });
    }

    /**
     * 手动触发检查（用于管理后台）
     */
    @Transactional
    public void manualCheck() {
        checkResourcePoolBalance();
    }
}

