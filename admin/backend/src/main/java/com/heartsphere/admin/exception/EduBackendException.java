package com.heartsphere.admin.exception;

/**
 * 教育版后端调用异常
 */
public class EduBackendException extends RuntimeException {
    
    private final int statusCode;
    private final String errorMessage;

    public EduBackendException(String message) {
        super(message);
        this.statusCode = 0;
        this.errorMessage = message;
    }

    public EduBackendException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = 0;
        this.errorMessage = message;
    }

    public EduBackendException(int statusCode, String errorMessage) {
        super(String.format("Edu backend error [%d]: %s", statusCode, errorMessage));
        this.statusCode = statusCode;
        this.errorMessage = errorMessage;
    }

    public EduBackendException(int statusCode, String errorMessage, Throwable cause) {
        super(String.format("Edu backend error [%d]: %s", statusCode, errorMessage), cause);
        this.statusCode = statusCode;
        this.errorMessage = errorMessage;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
