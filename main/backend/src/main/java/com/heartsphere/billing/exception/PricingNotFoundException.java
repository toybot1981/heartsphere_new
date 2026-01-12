package com.heartsphere.billing.exception;

/**
 * 资费配置未找到异常
 */
public class PricingNotFoundException extends RuntimeException {
    public PricingNotFoundException(String message) {
        super(message);
    }

    public PricingNotFoundException(Long modelId, String pricingType) {
        super(String.format("未找到模型资费配置: modelId=%d, pricingType=%s", modelId, pricingType));
    }
}

