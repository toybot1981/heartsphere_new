package com.heartsphere.admin.controller;

import com.heartsphere.billing.entity.AICostDaily;
import com.heartsphere.billing.repository.AICostDailyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 计费管理 - 成本统计控制器
 */
@RestController
@RequestMapping("/api/admin/billing/cost")
public class AdminBillingCostController extends BaseAdminController {

    @Autowired
    private AICostDailyRepository costDailyRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_DATE;

    @GetMapping("/daily")
    public ResponseEntity<List<AICostDaily>> getDailyCostStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long providerId,
            @RequestParam(required = false) Long modelId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Specification<AICostDaily> spec = (root, query, cb) -> {
            java.util.List<Predicate> predicates = new java.util.ArrayList<>();
            
            if (startDate != null) {
                LocalDate start = LocalDate.parse(startDate, DATE_FORMATTER);
                predicates.add(cb.greaterThanOrEqualTo(root.get("statDate"), start));
            }
            if (endDate != null) {
                LocalDate end = LocalDate.parse(endDate, DATE_FORMATTER);
                predicates.add(cb.lessThanOrEqualTo(root.get("statDate"), end));
            }
            if (providerId != null) {
                predicates.add(cb.equal(root.get("providerId"), providerId));
            }
            if (modelId != null) {
                predicates.add(cb.equal(root.get("modelId"), modelId));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        List<AICostDaily> stats = costDailyRepository.findAll(spec);
        return ResponseEntity.ok(stats);
    }
}

