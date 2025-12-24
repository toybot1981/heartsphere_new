package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.TokenQuotaTransaction;
import com.heartsphere.billing.entity.UserTokenQuota;
import com.heartsphere.billing.repository.TokenQuotaTransactionRepository;
import com.heartsphere.billing.repository.UserTokenQuotaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Token配额服务
 * 负责配额查询、检查和扣费
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TokenQuotaService {
    
    private final UserTokenQuotaRepository quotaRepository;
    private final TokenQuotaTransactionRepository transactionRepository;
    
    /**
     * 获取用户配额
     */
    @Transactional(readOnly = true)
    public UserTokenQuota getUserQuota(Long userId) {
        return quotaRepository.findByUserId(userId)
            .orElseGet(() -> createUserQuota(userId));
    }
    
    /**
     * 创建用户配额（如果不存在）
     */
    @Transactional
    public UserTokenQuota createUserQuota(Long userId) {
        UserTokenQuota quota = new UserTokenQuota();
        quota.setUserId(userId);
        quota.setLastResetDate(LocalDate.now());
        return quotaRepository.save(quota);
    }
    
    /**
     * 检查配额是否充足
     */
    @Transactional(readOnly = true)
    public boolean hasEnoughQuota(Long userId, String quotaType, Long amount) {
        UserTokenQuota quota = getUserQuota(userId);
        return checkQuotaAvailable(quota, quotaType, amount);
    }
    
    /**
     * 检查配额是否可用
     */
    private boolean checkQuotaAvailable(UserTokenQuota quota, String quotaType, Long amount) {
        switch (quotaType) {
            case "text_token":
                long availableMonthly = quota.getTextTokenMonthlyQuota() - quota.getTextTokenMonthlyUsed();
                long availableTotal = quota.getTextTokenTotal() - quota.getTextTokenUsed();
                return (availableMonthly + availableTotal) >= amount;
                
            case "image":
                int availableImageMonthly = quota.getImageQuotaMonthly() - quota.getImageQuotaMonthlyUsed();
                int availableImageTotal = quota.getImageQuotaTotal() - quota.getImageQuotaUsed();
                return (availableImageMonthly + availableImageTotal) >= amount;
                
            case "audio":
                int availableAudioMonthly = quota.getAudioQuotaMonthly() - quota.getAudioQuotaMonthlyUsed();
                int availableAudioTotal = quota.getAudioQuotaTotal() - quota.getAudioQuotaUsed();
                return (availableAudioMonthly + availableAudioTotal) >= amount;
                
            case "video":
                int availableVideoMonthly = quota.getVideoQuotaMonthly() - quota.getVideoQuotaMonthlyUsed();
                int availableVideoTotal = quota.getVideoQuotaTotal() - quota.getVideoQuotaUsed();
                return (availableVideoMonthly + availableVideoTotal) >= amount;
                
            default:
                log.warn("未知的配额类型: {}", quotaType);
                return false;
        }
    }
    
    /**
     * 扣除配额
     * @return 是否成功扣除
     */
    @Transactional
    public boolean consumeQuota(Long userId, String quotaType, Long amount) {
        // 使用悲观锁防止并发超扣
        Optional<UserTokenQuota> quotaOpt = quotaRepository.findByUserIdForUpdate(userId);
        UserTokenQuota quota;
        if (quotaOpt.isEmpty()) {
            // 如果不存在，先创建
            quota = createUserQuota(userId);
            // 重新查询以获取锁（因为新创建的可能还没有提交）
            quota = quotaRepository.findByUserIdForUpdate(userId).orElse(quota);
        } else {
            quota = quotaOpt.get();
        }
        
        // 再次检查配额
        if (!checkQuotaAvailable(quota, quotaType, amount)) {
            log.warn("配额不足: userId={}, quotaType={}, amount={}", userId, quotaType, amount);
            return false;
        }
        
        // 扣除配额（优先使用月度配额，不足时使用永久配额）
        deductQuota(quota, quotaType, amount);
        
        // 保存配额
        quotaRepository.save(quota);
        
        // 记录变动
        recordTransaction(userId, quotaType, amount, "consume", 
            getBalanceAfter(quota, quotaType), "AI服务使用");
        
        return true;
    }
    
    /**
     * 扣除配额（内部方法）
     */
    private void deductQuota(UserTokenQuota quota, String quotaType, Long amount) {
        switch (quotaType) {
            case "text_token":
                long monthlyAvailable = quota.getTextTokenMonthlyQuota() - quota.getTextTokenMonthlyUsed();
                if (monthlyAvailable >= amount) {
                    quota.setTextTokenMonthlyUsed(quota.getTextTokenMonthlyUsed() + amount);
                } else {
                    // 先用完月度配额
                    quota.setTextTokenMonthlyUsed(quota.getTextTokenMonthlyQuota());
                    // 剩余使用永久配额
                    long remaining = amount - monthlyAvailable;
                    quota.setTextTokenUsed(quota.getTextTokenUsed() + remaining);
                }
                break;
                
            case "image":
                int imageMonthlyAvailable = quota.getImageQuotaMonthly() - quota.getImageQuotaMonthlyUsed();
                if (imageMonthlyAvailable >= amount) {
                    quota.setImageQuotaMonthlyUsed(quota.getImageQuotaMonthlyUsed() + amount.intValue());
                } else {
                    quota.setImageQuotaMonthlyUsed(quota.getImageQuotaMonthly());
                    int remaining = amount.intValue() - imageMonthlyAvailable;
                    quota.setImageQuotaUsed(quota.getImageQuotaUsed() + remaining);
                }
                break;
                
            case "audio":
                int audioMonthlyAvailable = quota.getAudioQuotaMonthly() - quota.getAudioQuotaMonthlyUsed();
                if (audioMonthlyAvailable >= amount) {
                    quota.setAudioQuotaMonthlyUsed(quota.getAudioQuotaMonthlyUsed() + amount.intValue());
                } else {
                    quota.setAudioQuotaMonthlyUsed(quota.getAudioQuotaMonthly());
                    int remaining = amount.intValue() - audioMonthlyAvailable;
                    quota.setAudioQuotaUsed(quota.getAudioQuotaUsed() + remaining);
                }
                break;
                
            case "video":
                int videoMonthlyAvailable = quota.getVideoQuotaMonthly() - quota.getVideoQuotaMonthlyUsed();
                if (videoMonthlyAvailable >= amount) {
                    quota.setVideoQuotaMonthlyUsed(quota.getVideoQuotaMonthlyUsed() + amount.intValue());
                } else {
                    quota.setVideoQuotaMonthlyUsed(quota.getVideoQuotaMonthly());
                    int remaining = amount.intValue() - videoMonthlyAvailable;
                    quota.setVideoQuotaUsed(quota.getVideoQuotaUsed() + remaining);
                }
                break;
        }
    }
    
    /**
     * 获取余额（扣除后）
     */
    private Long getBalanceAfter(UserTokenQuota quota, String quotaType) {
        switch (quotaType) {
            case "text_token":
                long monthlyAvailable = quota.getTextTokenMonthlyQuota() - quota.getTextTokenMonthlyUsed();
                long totalAvailable = quota.getTextTokenTotal() - quota.getTextTokenUsed();
                return monthlyAvailable + totalAvailable;
            case "image":
                return (long) ((quota.getImageQuotaMonthly() - quota.getImageQuotaMonthlyUsed()) +
                              (quota.getImageQuotaTotal() - quota.getImageQuotaUsed()));
            case "audio":
                return (long) ((quota.getAudioQuotaMonthly() - quota.getAudioQuotaMonthlyUsed()) +
                              (quota.getAudioQuotaTotal() - quota.getAudioQuotaUsed()));
            case "video":
                return (long) ((quota.getVideoQuotaMonthly() - quota.getVideoQuotaMonthlyUsed()) +
                              (quota.getVideoQuotaTotal() - quota.getVideoQuotaUsed()));
            default:
                return 0L;
        }
    }
    
    /**
     * 分配配额
     */
    @Transactional
    public void grantQuota(Long userId, String quotaType, Long amount, String source, Long referenceId, String description) {
        UserTokenQuota quota = quotaRepository.findByUserId(userId)
            .orElseGet(() -> createUserQuota(userId));
        
        // 增加配额
        addQuota(quota, quotaType, amount);
        
        quotaRepository.save(quota);
        
        // 记录变动
        recordTransaction(userId, quotaType, amount, "grant",
            getBalanceAfter(quota, quotaType), source, referenceId, description);
    }
    
    /**
     * 增加配额（内部方法）
     */
    private void addQuota(UserTokenQuota quota, String quotaType, Long amount) {
        switch (quotaType) {
            case "text_token":
                quota.setTextTokenTotal(quota.getTextTokenTotal() + amount);
                break;
            case "image":
                quota.setImageQuotaTotal(quota.getImageQuotaTotal() + amount.intValue());
                break;
            case "audio":
                quota.setAudioQuotaTotal(quota.getAudioQuotaTotal() + amount.intValue());
                break;
            case "video":
                quota.setVideoQuotaTotal(quota.getVideoQuotaTotal() + amount.intValue());
                break;
        }
    }
    
    /**
     * 记录配额变动
     */
    private void recordTransaction(Long userId, String quotaType, Long amount, String transactionType,
                                  Long balanceAfter, String description) {
        recordTransaction(userId, quotaType, amount, transactionType, balanceAfter, null, null, description);
    }
    
    /**
     * 记录配额变动（完整参数）
     */
    private void recordTransaction(Long userId, String quotaType, Long amount, String transactionType,
                                  Long balanceAfter, String source, Long referenceId, String description) {
        TokenQuotaTransaction transaction = new TokenQuotaTransaction();
        transaction.setUserId(userId);
        transaction.setQuotaType(quotaType);
        transaction.setAmount(amount);
        transaction.setTransactionType(transactionType);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setSource(source);
        transaction.setReferenceId(referenceId);
        transaction.setDescription(description);
        transactionRepository.save(transaction);
    }
}

