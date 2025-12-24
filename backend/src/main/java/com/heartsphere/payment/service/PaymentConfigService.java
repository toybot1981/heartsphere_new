package com.heartsphere.payment.service;

import com.heartsphere.payment.entity.PaymentConfig;
import com.heartsphere.payment.repository.PaymentConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 支付配置服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentConfigService {

    private final PaymentConfigRepository configRepository;

    /**
     * 获取所有支付配置
     */
    public List<PaymentConfig> getAllConfigs() {
        return configRepository.findAll();
    }

    /**
     * 根据支付类型获取配置
     */
    public Optional<PaymentConfig> getConfigByType(String paymentType) {
        return configRepository.findByPaymentType(paymentType);
    }

    /**
     * 获取启用的支付配置
     */
    public Optional<PaymentConfig> getEnabledConfig(String paymentType) {
        return configRepository.findByPaymentTypeAndIsEnabledTrue(paymentType);
    }

    /**
     * 保存或更新支付配置
     */
    @Transactional
    public PaymentConfig saveConfig(PaymentConfig config) {
        // 如果已存在同类型的配置，则更新
        Optional<PaymentConfig> existing = configRepository.findByPaymentType(config.getPaymentType());
        if (existing.isPresent()) {
            PaymentConfig existingConfig = existing.get();
            existingConfig.setAppId(config.getAppId());
            existingConfig.setMerchantPrivateKey(config.getMerchantPrivateKey());
            existingConfig.setAlipayPublicKey(config.getAlipayPublicKey());
            existingConfig.setGatewayUrl(config.getGatewayUrl());
            existingConfig.setSignType(config.getSignType());
            existingConfig.setCharset(config.getCharset());
            existingConfig.setFormat(config.getFormat());
            existingConfig.setNotifyUrl(config.getNotifyUrl());
            existingConfig.setReturnUrl(config.getReturnUrl());
            existingConfig.setIsEnabled(config.getIsEnabled());
            existingConfig.setIsSandbox(config.getIsSandbox());
            existingConfig.setDescription(config.getDescription());
            log.info("更新支付配置: paymentType={}", config.getPaymentType());
            return configRepository.save(existingConfig);
        } else {
            log.info("创建支付配置: paymentType={}", config.getPaymentType());
            return configRepository.save(config);
        }
    }

    /**
     * 删除支付配置
     */
    @Transactional
    public void deleteConfig(@org.springframework.lang.NonNull Long id) {
        configRepository.deleteById(id);
        log.info("删除支付配置: id={}", id);
    }
}

