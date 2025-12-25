package com.heartsphere.admin.controller;

import com.heartsphere.billing.entity.UserTokenQuota;
import com.heartsphere.billing.service.QuotaCalculationService;
import com.heartsphere.billing.service.TokenQuotaService;
import com.heartsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 计费管理 - 用户配额管理控制器
 */
@RestController
@RequestMapping("/api/admin/billing/quota")
public class AdminBillingQuotaController extends BaseAdminController {

    @Autowired
    private TokenQuotaService tokenQuotaService;
    
    @Autowired
    private QuotaCalculationService quotaCalculationService;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserTokenQuota> getUserQuota(
            @PathVariable Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        UserTokenQuota quota = tokenQuotaService.getUserQuota(userId);
        if (quota == null) {
            // 如果不存在，自动创建
            quota = tokenQuotaService.getOrCreateUserQuota(userId);
        }
        return ResponseEntity.ok(quota);
    }

    @PostMapping("/users/{userId}/grant")
    public ResponseEntity<UserTokenQuota> grantQuota(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        String quotaType = (String) request.get("quotaType");
        Long amount = ((Number) request.get("amount")).longValue();
        String source = (String) request.getOrDefault("source", "admin_grant");
        String description = (String) request.getOrDefault("description", "管理员手动分配");
        Long referenceId = request.containsKey("referenceId") ? ((Number) request.get("referenceId")).longValue() : null;
        
        tokenQuotaService.grantQuota(userId, quotaType, amount, source, referenceId, description);
        
        // grantQuota内部已经创建了配额，所以这里可以直接获取
        UserTokenQuota quota = tokenQuotaService.getUserQuota(userId);
        if (quota == null) {
            quota = tokenQuotaService.getOrCreateUserQuota(userId);
        }
        return ResponseEntity.ok(quota);
    }
    
    /**
     * 计算配额分配方案
     */
    @GetMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateQuotaDistribution(
            @RequestParam String provider,
            @RequestParam(defaultValue = "100000") Long textTokenPerUser,
            @RequestParam(defaultValue = "20") Integer imageCountPerUser,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Map<String, Object> result = quotaCalculationService.calculateQuotaDistribution(
                provider, textTokenPerUser, imageCountPerUser);
        
        // 添加用户总数
        long totalUsers = userRepository.count();
        result.put("totalUsers", totalUsers);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * 批量分配配额给所有用户
     */
    @PostMapping("/batch-grant")
    public ResponseEntity<Map<String, Object>> batchGrantQuota(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Long textTokenPerUser = request.containsKey("textTokenPerUser") 
                ? ((Number) request.get("textTokenPerUser")).longValue() 
                : 100000L;
        Integer imageCountPerUser = request.containsKey("imageCountPerUser")
                ? ((Number) request.get("imageCountPerUser")).intValue()
                : 20;
        String source = (String) request.getOrDefault("source", "batch_admin_grant");
        String description = (String) request.getOrDefault("description", "批量分配配额");
        
        Map<String, Object> result = new HashMap<>();
        int successCount = 0;
        int failCount = 0;
        
        // 获取所有用户ID
        List<Long> userIds = userRepository.findAll().stream()
                .map(user -> user.getId())
                .toList();
        
        result.put("totalUsers", userIds.size());
        
        // 批量分配
        for (Long userId : userIds) {
            try {
                // 分配文本Token配额
                if (textTokenPerUser > 0) {
                    tokenQuotaService.grantQuota(userId, "text_token", textTokenPerUser, 
                            source, null, description + " - 文本Token");
                }
                
                // 分配图片配额
                if (imageCountPerUser > 0) {
                    tokenQuotaService.grantQuota(userId, "image", imageCountPerUser.longValue(), 
                            source, null, description + " - 图片生成");
                }
                
                successCount++;
            } catch (Exception e) {
                failCount++;
                // 记录失败但不中断批量操作
            }
        }
        
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("textTokenPerUser", textTokenPerUser);
        result.put("imageCountPerUser", imageCountPerUser);
        
        return ResponseEntity.ok(result);
    }
}

