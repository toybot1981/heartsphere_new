package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.ProviderResourcePool;
import com.heartsphere.billing.entity.ResourcePoolRecharge;
import com.heartsphere.billing.repository.ProviderResourcePoolRepository;
import com.heartsphere.billing.repository.ResourcePoolRechargeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 资源池管理服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResourcePoolService {

    private final ProviderResourcePoolRepository poolRepository;
    private final ResourcePoolRechargeRepository rechargeRepository;

    /**
     * 获取或创建资源池
     */
    @Transactional
    public ProviderResourcePool getOrCreatePool(Long providerId) {
        return poolRepository.findByProviderId(providerId)
                .orElseGet(() -> {
                    ProviderResourcePool pool = new ProviderResourcePool();
                    pool.setProviderId(providerId);
                    pool.setTotalBalance(BigDecimal.ZERO);
                    pool.setUsedAmount(BigDecimal.ZERO);
                    pool.setAvailableBalance(BigDecimal.ZERO);
                    pool.setWarningThreshold(new BigDecimal("10.0"));
                    pool.setIsLowBalance(false);
                    return poolRepository.save(pool);
                });
    }

    /**
     * 充值资源池
     */
    @Transactional
    public ResourcePoolRecharge recharge(Long providerId, BigDecimal amount, Long operatorId, String remark) {
        ProviderResourcePool pool = getOrCreatePool(providerId);
        
        BigDecimal balanceBefore = pool.getAvailableBalance();
        BigDecimal balanceAfter = balanceBefore.add(amount);
        
        // 更新资源池
        pool.setTotalBalance(pool.getTotalBalance().add(amount));
        pool.setAvailableBalance(balanceAfter);
        pool.setLastRechargeDate(LocalDateTime.now());
        pool.setIsLowBalance(false); // 充值后重置低余额状态
        poolRepository.save(pool);
        
        // 记录充值
        ResourcePoolRecharge recharge = new ResourcePoolRecharge();
        recharge.setProviderId(providerId);
        recharge.setRechargeAmount(amount);
        recharge.setBalanceBefore(balanceBefore);
        recharge.setBalanceAfter(balanceAfter);
        recharge.setRechargeType("manual");
        recharge.setOperatorId(operatorId);
        recharge.setRemark(remark);
        rechargeRepository.save(recharge);
        
        log.info("资源池充值: providerId={}, amount={}, balanceBefore={}, balanceAfter={}", 
                providerId, amount, balanceBefore, balanceAfter);
        
        return recharge;
    }

    /**
     * 扣除资源池余额（使用记录时调用）
     */
    @Transactional
    public void deductBalance(Long providerId, BigDecimal amount) {
        ProviderResourcePool pool = getOrCreatePool(providerId);
        
        BigDecimal newUsedAmount = pool.getUsedAmount().add(amount);
        BigDecimal newAvailableBalance = pool.getAvailableBalance().subtract(amount);
        
        if (newAvailableBalance.compareTo(BigDecimal.ZERO) < 0) {
            log.warn("资源池余额不足: providerId={}, availableBalance={}, deductAmount={}", 
                    providerId, pool.getAvailableBalance(), amount);
            newAvailableBalance = BigDecimal.ZERO;
        }
        
        pool.setUsedAmount(newUsedAmount);
        pool.setAvailableBalance(newAvailableBalance);
        pool.setLastCheckDate(LocalDateTime.now());
        poolRepository.save(pool);
    }

    /**
     * 计算余额百分比
     */
    public BigDecimal calculateBalancePercentage(ProviderResourcePool pool) {
        if (pool.getTotalBalance().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return pool.getAvailableBalance()
                .divide(pool.getTotalBalance(), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
    }

    /**
     * 检查资源池水位
     */
    @Transactional
    public boolean checkBalanceStatus(ProviderResourcePool pool) {
        BigDecimal percentage = calculateBalancePercentage(pool);
        BigDecimal threshold = pool.getWarningThreshold();
        
        boolean isLow = percentage.compareTo(threshold) < 0;
        if (pool.getIsLowBalance() != isLow) {
            pool.setIsLowBalance(isLow);
            pool.setLastCheckDate(LocalDateTime.now());
            poolRepository.save(pool);
        }
        
        return isLow;
    }

    /**
     * 获取资源池信息
     */
    public Optional<ProviderResourcePool> getPool(Long providerId) {
        return poolRepository.findByProviderId(providerId);
    }
}

