package com.heartsphere.admin.controller;

import com.heartsphere.billing.entity.AIUsageRecord;
import com.heartsphere.billing.repository.AIUsageRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 计费管理 - 使用记录查询控制器
 */
@RestController
@RequestMapping("/api/admin/billing/usage")
public class AdminBillingUsageController extends BaseAdminController {

    @Autowired
    private AIUsageRecordRepository usageRecordRepository;


    @GetMapping("/records")
    public ResponseEntity<Map<String, Object>> getUsageRecords(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long providerId,
            @RequestParam(required = false) Long modelId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Specification<AIUsageRecord> spec = (root, query, cb) -> {
            java.util.List<Predicate> predicates = new java.util.ArrayList<>();
            
            if (userId != null) {
                predicates.add(cb.equal(root.get("userId"), userId));
            }
            if (providerId != null) {
                predicates.add(cb.equal(root.get("providerId"), providerId));
            }
            if (modelId != null) {
                predicates.add(cb.equal(root.get("modelId"), modelId));
            }
            if (startDate != null) {
                LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            if (endDate != null) {
                LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        Page<AIUsageRecord> records = usageRecordRepository.findAll(spec, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("records", records.getContent());
        response.put("totalElements", records.getTotalElements());
        response.put("totalPages", records.getTotalPages());
        response.put("currentPage", records.getNumber());
        response.put("pageSize", records.getSize());
        
        return ResponseEntity.ok(response);
    }
}

