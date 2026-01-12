package com.heartsphere.service;

import com.heartsphere.entity.InviteCode;
import com.heartsphere.repository.InviteCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.logging.Logger;

/**
 * 邀请码服务
 * 注意：此服务直接访问数据库，admin 只负责配置
 */
@Service
public class InviteCodeService {

    private static final Logger logger = Logger.getLogger(InviteCodeService.class.getName());

    @Autowired
    private InviteCodeRepository inviteCodeRepository;

    /**
     * 验证邀请码
     */
    @Transactional
    public boolean validateInviteCode(String code) {
        Optional<InviteCode> inviteCodeOpt = inviteCodeRepository.findByCode(code);
        if (inviteCodeOpt.isEmpty()) {
            return false;
        }

        InviteCode inviteCode = inviteCodeOpt.get();

        // 检查是否启用
        if (!inviteCode.getIsActive()) {
            logger.warning("邀请码已被禁用: " + code);
            return false;
        }

        // 检查是否过期
        if (inviteCode.getExpiresAt() != null && inviteCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            logger.warning("邀请码已过期: " + code);
            return false;
        }

        // 检查使用次数
        if (inviteCode.getMaxUses() != null && inviteCode.getUsedCount() >= inviteCode.getMaxUses()) {
            logger.warning("邀请码使用次数已达上限: " + code);
            return false;
        }

        // 增加使用次数
        inviteCode.setUsedCount(inviteCode.getUsedCount() + 1);
        inviteCodeRepository.save(inviteCode);

        logger.info("邀请码验证成功: " + code);
        return true;
    }

    /**
     * 使用邀请码（核销）
     */
    @Transactional
    public void useInviteCode(String code, Long userId) {
        logger.info(String.format("用户ID: %d 使用邀请码: %s", userId, code));
        Optional<InviteCode> inviteCodeOpt = inviteCodeRepository.findByCode(code);
        if (inviteCodeOpt.isEmpty()) {
            throw new RuntimeException("邀请码不存在: " + code);
        }
        
        InviteCode inviteCode = inviteCodeOpt.get();
        
        // 检查是否已使用（兼容旧字段）
        if (inviteCode.getIsUsed() != null && inviteCode.getIsUsed()) {
            throw new RuntimeException("邀请码已被使用: " + code);
        }
        
        // 检查是否启用
        if (inviteCode.getIsActive() != null && !inviteCode.getIsActive()) {
            throw new RuntimeException("邀请码已被禁用: " + code);
        }
        
        // 检查是否过期
        if (inviteCode.getExpiresAt() != null && inviteCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("邀请码已过期: " + code);
        }
        
        // 检查使用次数
        if (inviteCode.getMaxUses() != null && inviteCode.getUsedCount() >= inviteCode.getMaxUses()) {
            throw new RuntimeException("邀请码使用次数已达上限: " + code);
        }
        
        // 标记为已使用
        inviteCode.setIsUsed(true);
        inviteCode.setUsedByUserId(userId);
        inviteCode.setUsedAt(LocalDateTime.now());
        
        // 增加使用次数
        inviteCode.setUsedCount(inviteCode.getUsedCount() + 1);
        inviteCodeRepository.save(inviteCode);
        
        logger.info(String.format("邀请码 %s 已核销", code));
    }
}
