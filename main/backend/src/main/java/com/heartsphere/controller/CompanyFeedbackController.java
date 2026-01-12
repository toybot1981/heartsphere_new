package com.heartsphere.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.dto.CompanyFeedbackDTO;
import com.heartsphere.entity.CompanyFeedback;
import com.heartsphere.service.CompanyFeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 公司官网反馈收集控制器
 * 提供反馈提交接口，不需要任何校验
 */
@Slf4j
@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyFeedbackController {

    private final CompanyFeedbackService feedbackService;

    /**
     * 提交反馈
     * POST /api/company/feedback
     * 
     * @param dto 反馈数据
     * @return 提交结果
     */
    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitFeedback(
            @RequestBody CompanyFeedbackDTO dto) {
        log.info("收到反馈提交请求: name={}, email={}", dto.getName(), dto.getEmail());
        
        try {
            CompanyFeedback feedback = feedbackService.saveFeedback(dto);
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", feedback.getId());
            result.put("success", true);
            result.put("message", "反馈提交成功");
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("提交反馈失败: error={}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.error("提交失败，请稍后重试"));
        }
    }
}
