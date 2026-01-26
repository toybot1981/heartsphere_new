package com.heartsphere.shared.exception;

import com.heartsphere.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.context.request.async.AsyncRequestTimeoutException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;

/**
 * 全局异常处理器（基础版本）
 * 各子项目可以继承或扩展此处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessException(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return ResponseEntity
                .status(e.getCode())
                .body(ApiResponse.error(e.getCode(), e.getMessage()));
    }

    /**
     * 处理资源未找到异常
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFoundException(ResourceNotFoundException e) {
        log.warn("资源未找到: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(404, e.getMessage()));
    }

    /**
     * 处理未授权异常
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Object>> handleUnauthorizedException(UnauthorizedException e) {
        log.warn("未授权: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(401, e.getMessage()));
    }

    /**
     * 处理禁止访问异常
     */
    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiResponse<Object>> handleForbiddenException(ForbiddenException e) {
        log.warn("禁止访问: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(403, e.getMessage()));
    }

    /**
     * 处理Spring Security认证异常
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(AuthenticationException e) {
        log.warn("认证失败: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(401, "认证失败: " + e.getMessage()));
    }

    /**
     * 处理Spring Security访问拒绝异常
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(AccessDeniedException e) {
        log.warn("访问被拒绝: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(403, "访问被拒绝: " + e.getMessage()));
    }

    /**
     * 处理参数验证异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        log.warn("参数验证失败: {}", errors);
        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .code(400)
                .message("参数验证失败")
                .data(errors)
                .timestamp(java.time.LocalDateTime.now())
                .build();
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    /**
     * 处理参数类型不匹配异常
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleTypeMismatchException(
            MethodArgumentTypeMismatchException e) {
        String typeName = "未知";
        if (e.getRequiredType() != null) {
            typeName = e.getRequiredType().getSimpleName();
        }
        String message = String.format("参数 '%s' 类型不匹配，期望类型: %s", e.getName(), typeName);
        log.warn("参数类型不匹配: {}", message);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(400, message));
    }

    /**
     * 处理非法参数异常
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("非法参数: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(400, e.getMessage()));
    }

    /**
     * 处理异步请求超时异常（SSE 连接超时是正常行为）
     */
    @ExceptionHandler(AsyncRequestTimeoutException.class)
    public ResponseEntity<ApiResponse<Object>> handleAsyncRequestTimeoutException(AsyncRequestTimeoutException e) {
        // SSE 连接超时是正常行为，不需要记录为错误
        log.info("异步请求超时（SSE 连接超时）: {}", e.getMessage());
        // 返回 204 No Content，表示请求已处理但无内容返回
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }

    /**
     * 处理所有其他未捕获的异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception e, WebRequest request) {
        // 检查是否是 SSE 连接（通过检查响应 Content-Type 或请求路径）
        if (isSseRequest(request)) {
            // SSE 连接中的异常不应该返回 JSON，因为响应头已经设置为 text/event-stream
            // 这些异常通常已经在 SessionRealtimeService 中处理了
            log.info("SSE 连接中的异常（已由 SessionRealtimeService 处理）: {}", e.getMessage());
            // 返回空响应，避免序列化错误
            return ResponseEntity
                    .status(HttpStatus.NO_CONTENT)
                    .build();
        }
        
        log.error("未处理的异常", e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, "服务器内部错误: " + e.getMessage()));
    }
    
    /**
     * 检查是否是 SSE 请求
     */
    private boolean isSseRequest(WebRequest request) {
        if (request instanceof ServletWebRequest) {
            ServletWebRequest servletRequest = (ServletWebRequest) request;
            HttpServletResponse response = servletRequest.getResponse();
            if (response != null) {
                String contentType = response.getContentType();
                if (contentType != null && contentType.contains("text/event-stream")) {
                    return true;
                }
            }
            // 也可以通过请求路径判断
            String requestPath = servletRequest.getRequest().getRequestURI();
            if (requestPath != null && (requestPath.contains("/sse") || requestPath.contains("/stream"))) {
                return true;
            }
        }
        return false;
    }
}
