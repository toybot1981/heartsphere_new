package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.ProviderResourcePool;
import com.heartsphere.billing.repository.AIProviderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

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
                
                // 注意：模型状态现在通过ai_model_config管理，不再自动禁用/启用
                // 管理员可以通过管理后台手动管理模型状态
                
                log.debug("检查资源池: providerId={}, percentage={}%, isLow={}", 
                        provider.getId(), percentage, isLow);
            } catch (Exception e) {
                log.error("检查资源池失败: providerId={}", provider.getId(), e);
            }
        });
        
        log.info("资源池水位检查完成");
    }


    /**
     * 手动触发检查（用于管理后台）
     */
    @Transactional
    public void manualCheck() {
        checkResourcePoolBalance();
    }
}

