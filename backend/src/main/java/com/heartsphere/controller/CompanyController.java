package com.heartsphere.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.dto.ContactFormDTO;
import com.heartsphere.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 公司官网控制器
 * 提供公司官网相关的REST API
 */
@Slf4j
@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    /**
     * 提交联系表单
     * POST /api/company/contact
     * 
     * @param contactForm 联系表单数据
     * @return 提交结果
     */
    @PostMapping("/contact")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitContactForm(
            @Valid @RequestBody ContactFormDTO contactForm) {
        log.info("收到联系表单提交请求: email={}", contactForm.getEmail());
        
        try {
            Map<String, Object> result = companyService.submitContactForm(contactForm);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("提交联系表单失败: email={}, error={}", contactForm.getEmail(), e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error(e.getMessage()));
        }
    }
}
