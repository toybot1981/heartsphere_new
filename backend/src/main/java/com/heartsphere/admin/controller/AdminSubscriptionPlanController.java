package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.SubscriptionPlanDTO;
import com.heartsphere.admin.service.AdminSubscriptionPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 订阅计划管理控制器
 */
@RestController
@RequestMapping("/api/admin/system/subscription-plans")
public class AdminSubscriptionPlanController extends BaseAdminController {

    @Autowired
    private AdminSubscriptionPlanService adminSubscriptionPlanService;

    @GetMapping(produces = "application/json;charset=UTF-8")
    public ResponseEntity<List<SubscriptionPlanDTO>> getAllSubscriptionPlans(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        List<SubscriptionPlanDTO> plans = adminSubscriptionPlanService.getAllPlans();
        return ResponseEntity.ok()
                .header("Content-Type", "application/json;charset=UTF-8")
                .body(plans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionPlanDTO> getSubscriptionPlanById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(adminSubscriptionPlanService.getPlanById(id));
    }

    @PostMapping
    public ResponseEntity<SubscriptionPlanDTO> createSubscriptionPlan(
            @RequestBody SubscriptionPlanDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(adminSubscriptionPlanService.createPlan(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionPlanDTO> updateSubscriptionPlan(
            @PathVariable Long id,
            @RequestBody SubscriptionPlanDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(adminSubscriptionPlanService.updatePlan(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscriptionPlan(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        adminSubscriptionPlanService.deletePlan(id);
        return ResponseEntity.ok().build();
    }
}

