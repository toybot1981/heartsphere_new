package com.heartsphere.admin.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * SSH 密钥加密服务
 */
@Service
public class SshKeyEncryptionService {
    
    private static final Logger logger = LoggerFactory.getLogger(SshKeyEncryptionService.class);
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 16;
    private static final int KEY_SIZE = 256;
    
    @Value("${ssh.encryption.master-key:}")
    private String masterKeyBase64;
    
    private SecretKey masterKey;
    
    /**
     * 初始化主密钥
     */
    private SecretKey getMasterKey() {
        if (masterKey != null) {
            return masterKey;
        }
        
        if (masterKeyBase64 != null && !masterKeyBase64.isEmpty()) {
            try {
                byte[] keyBytes = Base64.getDecoder().decode(masterKeyBase64);
                masterKey = new SecretKeySpec(keyBytes, ALGORITHM);
                logger.info("Master key loaded from configuration");
            } catch (Exception e) {
                logger.error("Failed to load master key from configuration", e);
                throw new RuntimeException("无法加载主加密密钥", e);
            }
        } else {
            // 开发环境：使用固定密钥（生产环境必须配置）
            logger.warn("Master key not configured, using default key (NOT SECURE FOR PRODUCTION)");
            String defaultKey = "dev-master-key-32-bytes-long!!"; // 32 bytes
            masterKey = new SecretKeySpec(defaultKey.getBytes(StandardCharsets.UTF_8), ALGORITHM);
        }
        
        return masterKey;
    }
    
    /**
     * 加密 SSH 私钥
     */
    public String encryptKey(String privateKey) {
        if (privateKey == null || privateKey.isEmpty()) {
            return null;
        }
        
        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            SecretKey key = getMasterKey();
            
            // 生成随机 IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            
            cipher.init(Cipher.ENCRYPT_MODE, key, gcmSpec);
            byte[] encrypted = cipher.doFinal(privateKey.getBytes(StandardCharsets.UTF_8));
            
            // 组合 IV + 加密数据
            byte[] combined = new byte[GCM_IV_LENGTH + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, GCM_IV_LENGTH);
            System.arraycopy(encrypted, 0, combined, GCM_IV_LENGTH, encrypted.length);
            
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            logger.error("Failed to encrypt SSH key", e);
            throw new RuntimeException("加密 SSH 密钥失败", e);
        }
    }
    
    /**
     * 解密 SSH 私钥
     */
    public String decryptKey(String encryptedKey) {
        if (encryptedKey == null || encryptedKey.isEmpty()) {
            return null;
        }
        
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedKey);
            
            // 提取 IV 和加密数据
            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, GCM_IV_LENGTH);
            
            byte[] encrypted = new byte[combined.length - GCM_IV_LENGTH];
            System.arraycopy(combined, GCM_IV_LENGTH, encrypted, 0, encrypted.length);
            
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            SecretKey key = getMasterKey();
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            
            cipher.init(Cipher.DECRYPT_MODE, key, gcmSpec);
            byte[] decrypted = cipher.doFinal(encrypted);
            
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("Failed to decrypt SSH key", e);
            throw new RuntimeException("解密 SSH 密钥失败", e);
        }
    }
    
    /**
     * 加密密码短语
     */
    public String encryptPassphrase(String passphrase) {
        // 使用不同的密钥派生（简化实现，生产环境应使用 PBKDF2）
        return encryptKey(passphrase);
    }
    
    /**
     * 解密密码短语
     */
    public String decryptPassphrase(String encryptedPassphrase) {
        return decryptKey(encryptedPassphrase);
    }
}
