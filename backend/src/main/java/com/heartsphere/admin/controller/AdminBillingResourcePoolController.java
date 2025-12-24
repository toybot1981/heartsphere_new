package com.heartsphere.admin.controller;

import com.heartsphere.billing.entity.BillingAlert;
import com.heartsphere.billing.entity.ProviderResourcePool;
import com.heartsphere.billing.entity.ResourcePoolRecharge;
import com.heartsphere.billing.service.BillingAlertService;
import com.heartsphere.billing.service.BillingMonitorService;
import com.heartsphere.billing.service.ResourcePoolService;
import com.heartsphere.billing.repository.ProviderResourcePoolRepository;
import com.heartsphere.billing.repository.ResourcePoolRechargeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 计费管理 - 资源池管理控制器
 */
@RestController
@RequestMapping("/api/admin/billing/resource-pool")
public class AdminBillingResourcePoolController extends BaseAdminController {

    @Autowired
    private ResourcePoolService resourcePoolService;

    @Autowired
    private BillingAlertService alertService;

    @Autowired
    private BillingMonitorService monitorService;

    @Autowired
    private ProviderResourcePoolRepository poolRepository;

    @Autowired
    private ResourcePoolRechargeRepository rechargeRepository;

    /**
     * 获取所有资源池状态
     */
    @GetMapping
    public ResponseEntity<List<ProviderResourcePool>> getAllPools(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(poolRepository.findAll());
    }

    /**
     * 获取指定提供商的资源池状态
     */
    @GetMapping("/providers/{providerId}")
    public ResponseEntity<ProviderResourcePool> getPoolByProvider(
            @PathVariable Long providerId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return resourcePoolService.getPool(providerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 充值资源池
     */
    @PostMapping("/providers/{providerId}/recharge")
    public ResponseEntity<Map<String, Object>> recharge(
            @PathVariable Long providerId,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        String remark = (String) request.getOrDefault("remark", "");
        Long operatorId = request.containsKey("operatorId") ? 
                ((Number) request.get("operatorId")).longValue() : null;
        
        ResourcePoolRecharge recharge = resourcePoolService.recharge(providerId, amount, operatorId, remark);
        
        Map<String, Object> response = new HashMap<>();
        response.put("recharge", recharge);
        response.put("pool", resourcePoolService.getPool(providerId).orElse(null));
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取充值记录
     */
    @GetMapping("/providers/{providerId}/recharges")
    public ResponseEntity<Map<String, Object>> getRecharges(
            @PathVariable Long providerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ResourcePoolRecharge> recharges = rechargeRepository.findByProviderIdOrderByCreatedAtDesc(providerId, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("recharges", recharges.getContent());
        response.put("totalElements", recharges.getTotalElements());
        response.put("totalPages", recharges.getTotalPages());
        response.put("currentPage", recharges.getNumber());
        response.put("pageSize", recharges.getSize());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取资费提醒列表
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<BillingAlert>> getAlerts(
            @RequestParam(required = false) Boolean isResolved,
            @RequestParam(required = false) Long providerId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        List<BillingAlert> alerts;
        if (providerId != null) {
            alerts = alertService.getProviderAlerts(providerId, 
                    isResolved != null ? isResolved : false);
        } else {
            alerts = isResolved != null && !isResolved 
                    ? alertService.getUnresolvedAlerts()
                    : alertService.getUnresolvedAlerts();
        }
        
        return ResponseEntity.ok(alerts);
    }

    /**
     * 解决提醒
     */
    @PostMapping("/alerts/{alertId}/resolve")
    public ResponseEntity<Void> resolveAlert(
            @PathVariable Long alertId,
            @RequestBody(required = false) Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Long resolvedBy = request != null && request.containsKey("resolvedBy") ?
                ((Number) request.get("resolvedBy")).longValue() : null;
        
        alertService.resolveAlert(alertId, resolvedBy);
        return ResponseEntity.noContent().build();
    }

    /**
     * 手动触发资源池检查
     */
    @PostMapping("/check")
    public ResponseEntity<Map<String, String>> manualCheck(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        monitorService.manualCheck();
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "资源池检查已完成");
        return ResponseEntity.ok(response);
    }
}

