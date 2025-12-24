package com.heartsphere.admin.controller;

import com.heartsphere.billing.entity.AIModelPricing;
import com.heartsphere.billing.repository.AIModelPricingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * 计费管理 - 资费配置管理控制器
 */
@RestController
@RequestMapping("/api/admin/billing/pricing")
public class AdminBillingPricingController extends BaseAdminController {

    @Autowired
    private AIModelPricingRepository pricingRepository;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    @GetMapping
    public ResponseEntity<List<AIModelPricing>> getAllPricing(
            @RequestParam(required = false) Long modelId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        if (modelId != null) {
            return ResponseEntity.ok(pricingRepository.findByModelId(modelId));
        }
        return ResponseEntity.ok(pricingRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AIModelPricing> getPricingById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return pricingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AIModelPricing> createPricing(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        AIModelPricing pricing = new AIModelPricing();
        pricing.setModelId(((Number) request.get("modelId")).longValue());
        pricing.setPricingType((String) request.get("pricingType"));
        
        Object unitPriceObj = request.get("unitPrice");
        if (unitPriceObj instanceof Number) {
            pricing.setUnitPrice(new BigDecimal(unitPriceObj.toString()));
        }
        
        pricing.setUnit((String) request.get("unit"));
        
        if (request.containsKey("minChargeUnit")) {
            Object minChargeUnitObj = request.get("minChargeUnit");
            if (minChargeUnitObj instanceof Number) {
                pricing.setMinChargeUnit(new BigDecimal(minChargeUnitObj.toString()));
            }
        }
        
        if (request.containsKey("effectiveDate")) {
            String effectiveDateStr = (String) request.get("effectiveDate");
            pricing.setEffectiveDate(LocalDateTime.parse(effectiveDateStr, DATE_TIME_FORMATTER));
        } else {
            pricing.setEffectiveDate(LocalDateTime.now());
        }
        
        if (request.containsKey("expiryDate") && request.get("expiryDate") != null) {
            String expiryDateStr = (String) request.get("expiryDate");
            pricing.setExpiryDate(LocalDateTime.parse(expiryDateStr, DATE_TIME_FORMATTER));
        }
        
        if (request.containsKey("isActive")) {
            pricing.setIsActive((Boolean) request.get("isActive"));
        } else {
            pricing.setIsActive(true);
        }
        
        return ResponseEntity.ok(pricingRepository.save(pricing));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AIModelPricing> updatePricing(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        return pricingRepository.findById(id)
                .map(pricing -> {
                    if (request.containsKey("modelId")) {
                        pricing.setModelId(((Number) request.get("modelId")).longValue());
                    }
                    if (request.containsKey("pricingType")) {
                        pricing.setPricingType((String) request.get("pricingType"));
                    }
                    if (request.containsKey("unitPrice")) {
                        Object unitPriceObj = request.get("unitPrice");
                        if (unitPriceObj instanceof Number) {
                            pricing.setUnitPrice(new BigDecimal(unitPriceObj.toString()));
                        }
                    }
                    if (request.containsKey("unit")) {
                        pricing.setUnit((String) request.get("unit"));
                    }
                    if (request.containsKey("minChargeUnit")) {
                        Object minChargeUnitObj = request.get("minChargeUnit");
                        if (minChargeUnitObj instanceof Number) {
                            pricing.setMinChargeUnit(new BigDecimal(minChargeUnitObj.toString()));
                        }
                    }
                    if (request.containsKey("effectiveDate")) {
                        String effectiveDateStr = (String) request.get("effectiveDate");
                        pricing.setEffectiveDate(LocalDateTime.parse(effectiveDateStr, DATE_TIME_FORMATTER));
                    }
                    if (request.containsKey("expiryDate")) {
                        Object expiryDateObj = request.get("expiryDate");
                        if (expiryDateObj == null) {
                            pricing.setExpiryDate(null);
                        } else {
                            String expiryDateStr = expiryDateObj.toString();
                            pricing.setExpiryDate(LocalDateTime.parse(expiryDateStr, DATE_TIME_FORMATTER));
                        }
                    }
                    if (request.containsKey("isActive")) {
                        pricing.setIsActive((Boolean) request.get("isActive"));
                    }
                    return ResponseEntity.ok(pricingRepository.save(pricing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePricing(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        if (pricingRepository.existsById(id)) {
            pricingRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

