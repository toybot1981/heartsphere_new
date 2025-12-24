package com.heartsphere.billing.exception;

/**
 * 配额不足异常
 */
public class QuotaInsufficientException extends RuntimeException {
    private final String quotaType;
    private final Long required;
    private final Long available;

    public QuotaInsufficientException(String quotaType, Long required, Long available) {
        super(String.format("配额不足: %s, 需要: %d, 可用: %d", quotaType, required, available));
        this.quotaType = quotaType;
        this.required = required;
        this.available = available;
    }

    public String getQuotaType() {
        return quotaType;
    }

    public Long getRequired() {
        return required;
    }

    public Long getAvailable() {
        return available;
    }
}

