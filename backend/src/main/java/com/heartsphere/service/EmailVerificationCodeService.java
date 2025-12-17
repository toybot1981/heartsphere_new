package com.heartsphere.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

/**
 * 邮箱验证码管理服务
 * 使用内存存储验证码，生产环境建议使用Redis
 */
@Slf4j
@Service
public class EmailVerificationCodeService {

    // 验证码存储：邮箱 -> 验证码信息
    private final Map<String, VerificationCodeInfo> codeStorage = new ConcurrentHashMap<>();
    
    // 验证码有效期（毫秒）
    private static final long CODE_EXPIRY_TIME = 10 * 60 * 1000; // 10分钟
    
    // 验证码长度
    private static final int CODE_LENGTH = 6;
    
    // 发送间隔（毫秒）- 防止频繁发送
    private static final long SEND_INTERVAL = 60 * 1000; // 1分钟

    /**
     * 验证码信息
     */
    private static class VerificationCodeInfo {
        String code;
        long createTime;
        long lastSendTime;
        int sendCount;

        VerificationCodeInfo(String code) {
            this.code = code;
            this.createTime = System.currentTimeMillis();
            this.lastSendTime = System.currentTimeMillis();
            this.sendCount = 1;
        }
    }

    /**
     * 生成验证码
     */
    private String generateCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }

    /**
     * 生成并存储验证码
     * @param email 邮箱地址
     * @return 验证码
     */
    public String generateAndStoreCode(String email) {
        // 检查发送间隔
        VerificationCodeInfo existingInfo = codeStorage.get(email);
        if (existingInfo != null) {
            long timeSinceLastSend = System.currentTimeMillis() - existingInfo.lastSendTime;
            if (timeSinceLastSend < SEND_INTERVAL) {
                long remainingSeconds = (SEND_INTERVAL - timeSinceLastSend) / 1000;
                throw new RuntimeException("验证码发送过于频繁，请" + remainingSeconds + "秒后再试");
            }
            
            // 如果验证码未过期，可以继续使用
            if (System.currentTimeMillis() - existingInfo.createTime < CODE_EXPIRY_TIME) {
                existingInfo.lastSendTime = System.currentTimeMillis();
                existingInfo.sendCount++;
                log.info("重新发送验证码: email={}, count={}", email, existingInfo.sendCount);
                return existingInfo.code;
            }
        }

        // 生成新验证码
        String code = generateCode();
        VerificationCodeInfo info = new VerificationCodeInfo(code);
        codeStorage.put(email, info);
        log.info("生成新验证码: email={}", email);
        return code;
    }

    /**
     * 验证验证码
     * @param email 邮箱地址
     * @param code 验证码
     * @return 是否验证成功
     */
    public boolean verifyCode(String email, String code) {
        VerificationCodeInfo info = codeStorage.get(email);
        if (info == null) {
            log.warn("验证码不存在: email={}", email);
            return false;
        }

        // 检查是否过期
        long timeSinceCreation = System.currentTimeMillis() - info.createTime;
        if (timeSinceCreation > CODE_EXPIRY_TIME) {
            codeStorage.remove(email);
            log.warn("验证码已过期: email={}", email);
            return false;
        }

        // 验证码匹配
        boolean isValid = info.code.equals(code);
        if (isValid) {
            // 验证成功后删除验证码（一次性使用）
            codeStorage.remove(email);
            log.info("验证码验证成功: email={}", email);
        } else {
            log.warn("验证码错误: email={}", email);
        }
        return isValid;
    }

    /**
     * 删除验证码（用于清理）
     */
    public void removeCode(String email) {
        codeStorage.remove(email);
    }

    /**
     * 清理过期验证码（定期调用）
     */
    public void cleanExpiredCodes() {
        long now = System.currentTimeMillis();
        codeStorage.entrySet().removeIf(entry -> {
            boolean expired = now - entry.getValue().createTime > CODE_EXPIRY_TIME;
            if (expired) {
                log.debug("清理过期验证码: email={}", entry.getKey());
            }
            return expired;
        });
    }
}
