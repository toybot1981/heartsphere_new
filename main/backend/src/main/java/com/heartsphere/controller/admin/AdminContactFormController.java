package com.heartsphere.controller.admin;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.entity.ContactForm;
import com.heartsphere.service.ContactFormService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 管理员联系表单管理控制器（main 后端）
 * 供 admin 后端调用
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/contact-forms")
@RequiredArgsConstructor
public class AdminContactFormController {
    
    private final ContactFormService contactFormService;
    
    /**
     * 获取所有联系表单（分页）
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ContactForm>>> getAllContactForms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean unprocessed) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ContactForm> contactForms;
            
            if (unprocessed != null && unprocessed) {
                contactForms = contactFormService.getUnprocessedContactForms(pageable);
            } else {
                contactForms = contactFormService.getAllContactForms(pageable);
            }
            
            return ResponseEntity.ok(ApiResponse.success(contactForms));
        } catch (Exception e) {
            log.error("获取联系表单失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取联系表单失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取单个联系表单详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactForm>> getContactFormById(@PathVariable Long id) {
        try {
            ContactForm contactForm = contactFormService.getContactFormById(id);
            return ResponseEntity.ok(ApiResponse.success(contactForm));
        } catch (Exception e) {
            log.error("获取联系表单详情失败: id={}", id, e);
            return ResponseEntity.ok(ApiResponse.error("获取联系表单详情失败: " + e.getMessage()));
        }
    }
    
    /**
     * 标记联系表单为已处理
     */
    @PostMapping("/{id}/mark-processed")
    public ResponseEntity<ApiResponse<ContactForm>> markAsProcessed(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String processNotes = request.getOrDefault("processNotes", "");
            ContactForm contactForm = contactFormService.markAsProcessed(id, processNotes);
            return ResponseEntity.ok(ApiResponse.success(contactForm));
        } catch (Exception e) {
            log.error("标记联系表单为已处理失败: id={}", id, e);
            return ResponseEntity.ok(ApiResponse.error("标记失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取未处理联系表单数量
     */
    @GetMapping("/unprocessed/count")
    public ResponseEntity<ApiResponse<Long>> getUnprocessedCount() {
        try {
            Long count = contactFormService.getUnprocessedCount();
            return ResponseEntity.ok(ApiResponse.success(count));
        } catch (Exception e) {
            log.error("获取未处理联系表单数量失败", e);
            return ResponseEntity.ok(ApiResponse.error("获取数量失败: " + e.getMessage()));
        }
    }
}
