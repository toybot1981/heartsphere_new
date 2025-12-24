package com.heartsphere.admin.controller;

import com.heartsphere.billing.entity.UserTokenQuota;
import com.heartsphere.billing.service.TokenQuotaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 计费管理 - 用户配额管理控制器
 */
@RestController
@RequestMapping("/api/admin/billing/quota")
public class AdminBillingQuotaController extends BaseAdminController {

    @Autowired
    private TokenQuotaService tokenQuotaService;

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserTokenQuota> getUserQuota(
            @PathVariable Long userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(tokenQuotaService.getUserQuota(userId));
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
        
        return ResponseEntity.ok(tokenQuotaService.getUserQuota(userId));
    }
}

