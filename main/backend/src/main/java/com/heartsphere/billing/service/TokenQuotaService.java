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
     * 获取用户配额（只读，如果不存在返回null）
     */
    @Transactional(readOnly = true)
    public UserTokenQuota getUserQuota(Long userId) {
        return quotaRepository.findByUserId(userId).orElse(null);
    }
    
    /**
     * 获取用户配额（如果不存在则创建）
     */
    @Transactional
    public UserTokenQuota getOrCreateUserQuota(Long userId) {
        return quotaRepository.findByUserId(userId)
            .orElseGet(() -> createUserQuota(userId));
    }
    
    /**
     * 创建用户配额（如果不存在）
     * 使用异常处理来处理并发情况下的重复插入
     */
    @Transactional
    public UserTokenQuota createUserQuota(Long userId) {
        log.info("[TokenQuotaService] createUserQuota - 开始创建用户配额, userId: {}", userId);
        
        // 先检查是否已存在（双重检查）
        Optional<UserTokenQuota> existingQuota = quotaRepository.findByUserId(userId);
        if (existingQuota.isPresent()) {
            log.info("[TokenQuotaService] createUserQuota - 配额已存在, userId: {}, quotaId: {}", userId, existingQuota.get().getId());
            return existingQuota.get();
        }
        
        try {
            UserTokenQuota quota = new UserTokenQuota();
            quota.setUserId(userId);
            quota.setLastResetDate(LocalDate.now());
            UserTokenQuota saved = quotaRepository.save(quota);
            log.info("[TokenQuotaService] createUserQuota - 配额创建成功, userId: {}, quotaId: {}", userId, saved.getId());
            return saved;
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // 如果因为唯一约束冲突而失败，说明在并发情况下另一个线程已经创建了
            log.warn("[TokenQuotaService] createUserQuota - 创建配额时发生唯一约束冲突（可能是并发创建）, userId: {}, 错误: {}, 尝试重新查询", 
                userId, e.getMessage());
            // 重新查询
            Optional<UserTokenQuota> quotaOpt = quotaRepository.findByUserId(userId);
            if (quotaOpt.isPresent()) {
                log.info("[TokenQuotaService] createUserQuota - 重新查询到配额, userId: {}, quotaId: {}", userId, quotaOpt.get().getId());
                return quotaOpt.get();
            } else {
                log.error("[TokenQuotaService] createUserQuota - 重新查询后仍未找到配额, userId: {}", userId);
                throw new RuntimeException("创建配额失败且重新查询未找到: " + userId, e);
            }
        }
    }
    
    /**
     * 检查配额是否充足
     */
    @Transactional
    public boolean hasEnoughQuota(Long userId, String quotaType, Long amount) {
        UserTokenQuota quota = getOrCreateUserQuota(userId);
        boolean hasEnough = checkQuotaAvailable(quota, quotaType, amount);
        if (hasEnough) {
            Long available = getBalanceAfter(quota, quotaType);
            log.info("[配额检查] 配额充足: userId={}, quotaType={}, required={}, available={}", 
                    userId, quotaType, amount, available);
        } else {
            Long available = getBalanceAfter(quota, quotaType);
            log.warn("[配额检查] 配额不足: userId={}, quotaType={}, required={}, available={}", 
                    userId, quotaType, amount, available);
        }
        return hasEnough;
    }
    
    /**
     * 检查配额是否可用
     */
    private boolean checkQuotaAvailable(UserTokenQuota quota, String quotaType, Long amount) {
        // 如果配额为null，说明还没有配额，返回false
        if (quota == null) {
            return false;
        }
        
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
        log.info("[TokenQuotaService] consumeQuota - 开始扣除配额, userId: {}, quotaType: {}, amount: {}", userId, quotaType, amount);
        
        // 使用悲观锁防止并发超扣
        Optional<UserTokenQuota> quotaOpt = quotaRepository.findByUserIdForUpdate(userId);
        UserTokenQuota quota;
        if (quotaOpt.isEmpty()) {
            log.info("[TokenQuotaService] consumeQuota - 配额不存在，尝试创建, userId: {}", userId);
            // 如果不存在，先创建（createUserQuota内部会处理并发情况）
            quota = createUserQuota(userId);
            // 重新查询以获取锁（因为新创建的可能还没有提交）
            quotaOpt = quotaRepository.findByUserIdForUpdate(userId);
            if (quotaOpt.isPresent()) {
                quota = quotaOpt.get();
                log.info("[TokenQuotaService] consumeQuota - 重新查询到配额（带锁）, userId: {}, quotaId: {}", userId, quota.getId());
            } else {
                log.warn("[TokenQuotaService] consumeQuota - 重新查询仍未找到配额（带锁）, userId: {}, 使用之前创建的配额", userId);
            }
        } else {
            quota = quotaOpt.get();
            log.info("[TokenQuotaService] consumeQuota - 查询到现有配额, userId: {}, quotaId: {}", userId, quota.getId());
        }
        
        // 再次检查配额
        if (!checkQuotaAvailable(quota, quotaType, amount)) {
            log.warn("配额不足: userId={}, quotaType={}, amount={}", userId, quotaType, amount);
            return false;
        }
        
        // 扣除前余额
        Long balanceBefore = getBalanceAfter(quota, quotaType);
        
        // 扣除配额（优先使用月度配额，不足时使用永久配额）
        deductQuota(quota, quotaType, amount);
        
        // 保存配额
        quotaRepository.save(quota);
        
        // 扣除后余额
        Long balanceAfter = getBalanceAfter(quota, quotaType);
        
        // 记录变动
        recordTransaction(userId, quotaType, amount, "consume", 
            balanceAfter, "AI服务使用");
        
        log.info("[配额扣除] 扣除成功: userId={}, quotaType={}, amount={}, balanceBefore={}, balanceAfter={}", 
                userId, quotaType, amount, balanceBefore, balanceAfter);
        
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
        if (quota == null) {
            return 0L;
        }
        
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
        UserTokenQuota quota = getOrCreateUserQuota(userId);
        
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

