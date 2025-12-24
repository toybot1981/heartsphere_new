package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.BillingAlert;
import com.heartsphere.billing.entity.ProviderResourcePool;
import com.heartsphere.billing.repository.BillingAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 资费提醒服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BillingAlertService {

    private final BillingAlertRepository alertRepository;

    /**
     * 创建低余额提醒
     */
    @Transactional
    public BillingAlert createLowBalanceAlert(ProviderResourcePool pool, BigDecimal percentage) {
        // 检查是否已有未解决的提醒
        List<BillingAlert> existingAlerts = alertRepository.findByProviderIdAndIsResolvedOrderByCreatedAtDesc(
                pool.getProviderId(), false);
        
        // 如果已有未解决的提醒，不重复创建
        if (!existingAlerts.isEmpty()) {
            BillingAlert latest = existingAlerts.get(0);
            if (latest.getAlertType().equals("low_balance") || latest.getAlertType().equals("insufficient_balance")) {
                log.debug("提供商 {} 已有未解决的余额提醒，跳过创建", pool.getProviderId());
                return latest;
            }
        }

        String alertType = percentage.compareTo(BigDecimal.ZERO) <= 0 ? "insufficient_balance" : "low_balance";
        String alertLevel = percentage.compareTo(BigDecimal.ZERO) <= 0 ? "critical" : "warning";
        
        String message = String.format("提供商资源池余额不足！当前余额：%.2f%%，可用余额：¥%.2f。请及时充值！",
                percentage, pool.getAvailableBalance());

        BillingAlert alert = new BillingAlert();
        alert.setProviderId(pool.getProviderId());
        alert.setAlertType(alertType);
        alert.setAlertLevel(alertLevel);
        alert.setBalancePercentage(percentage);
        alert.setAvailableBalance(pool.getAvailableBalance());
        alert.setMessage(message);
        alert.setIsResolved(false);
        
        BillingAlert saved = alertRepository.save(alert);
        log.warn("创建资费提醒: providerId={}, type={}, level={}, percentage={}%", 
                pool.getProviderId(), alertType, alertLevel, percentage);
        
        return saved;
    }

    /**
     * 解决提醒
     */
    @Transactional
    public void resolveAlert(Long alertId, Long resolvedBy) {
        alertRepository.findById(alertId).ifPresent(alert -> {
            alert.setIsResolved(true);
            alert.setResolvedAt(LocalDateTime.now());
            alert.setResolvedBy(resolvedBy);
            alertRepository.save(alert);
            log.info("解决资费提醒: alertId={}, resolvedBy={}", alertId, resolvedBy);
        });
    }

    /**
     * 获取未解决的提醒列表
     */
    public List<BillingAlert> getUnresolvedAlerts() {
        return alertRepository.findByIsResolvedOrderByCreatedAtDesc(false);
    }

    /**
     * 获取提供商的提醒列表
     */
    public List<BillingAlert> getProviderAlerts(Long providerId, Boolean isResolved) {
        return alertRepository.findByProviderIdAndIsResolvedOrderByCreatedAtDesc(providerId, isResolved);
    }
}

