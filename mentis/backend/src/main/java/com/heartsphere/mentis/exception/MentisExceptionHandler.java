package com.heartsphere.mentis.exception;

import com.heartsphere.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Mentis 全局异常处理器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestControllerAdvice(basePackages = "com.heartsphere.mentis")
public class MentisExceptionHandler {
    
    @ExceptionHandler(SessionNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleSessionNotFound(SessionNotFoundException e) {
        log.warn("会话不存在: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(404, e.getMessage()));
    }
    
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleTaskNotFound(TaskNotFoundException e) {
        log.warn("任务不存在: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(404, e.getMessage()));
    }
    
    @ExceptionHandler(VmException.class)
    public ResponseEntity<ApiResponse<Void>> handleVmException(VmException e) {
        log.error("虚拟机错误: {}", e.getMessage(), e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, e.getMessage()));
    }
    
    @ExceptionHandler(ExecutionException.class)
    public ResponseEntity<ApiResponse<Void>> handleExecutionException(ExecutionException e) {
        log.error("执行错误: {}", e.getMessage(), e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, e.getMessage()));
    }
    
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ApiResponse<Void>> handleSecurityException(SecurityException e) {
        log.warn("安全错误: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(403, e.getMessage()));
    }
    
    @ExceptionHandler(MentisException.class)
    public ResponseEntity<ApiResponse<Void>> handleMentisException(MentisException e) {
        log.error("Mentis错误: {}", e.getMessage(), e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, e.getMessage()));
    }
}
