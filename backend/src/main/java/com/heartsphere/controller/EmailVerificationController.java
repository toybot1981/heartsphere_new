package com.heartsphere.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.exception.BusinessException;
import com.heartsphere.service.EmailService;
import com.heartsphere.service.EmailVerificationCodeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 邮箱验证码控制器
 */
@Slf4j
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth/email")
public class EmailVerificationController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private EmailVerificationCodeService emailVerificationCodeService;

    /**
     * 发送邮箱验证码
     */
    @PostMapping("/send-code")
    public ResponseEntity<ApiResponse<Object>> sendVerificationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.trim().isEmpty()) {
            throw new BusinessException("邮箱地址不能为空");
        }

        // 简单的邮箱格式验证
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new BusinessException("邮箱格式不正确");
        }

        try {
            // 生成验证码
            String code = emailVerificationCodeService.generateAndStoreCode(email);
            
            // 发送邮件
            emailService.sendVerificationCode(email, code);
            
            log.info("验证码发送成功: email={}", email);
            return ResponseEntity.ok(ApiResponse.success("验证码已发送，请查收邮件"));
        } catch (RuntimeException e) {
            throw new BusinessException(e.getMessage());
        } catch (Exception e) {
            log.error("发送验证码失败: email={}, error={}", email, e.getMessage(), e);
            throw new BusinessException("验证码发送失败，请稍后重试");
        }
    }

    /**
     * 验证邮箱验证码（可选，注册时会自动验证）
     */
    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse<Object>> verifyCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        
        if (email == null || email.trim().isEmpty()) {
            throw new BusinessException("邮箱地址不能为空");
        }
        
        if (code == null || code.trim().isEmpty()) {
            throw new BusinessException("验证码不能为空");
        }

        boolean isValid = emailVerificationCodeService.verifyCode(email, code.trim());
        
        if (isValid) {
            return ResponseEntity.ok(ApiResponse.success("验证码正确"));
        } else {
            throw new BusinessException("验证码错误或已过期");
        }
    }
}



