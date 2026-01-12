package com.heartsphere.exception;

/**
 * 禁止访问异常
 */
public class ForbiddenException extends BusinessException {
    public ForbiddenException(String message) {
        super(403, message);
    }
}