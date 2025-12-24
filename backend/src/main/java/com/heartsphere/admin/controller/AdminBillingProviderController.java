package com.heartsphere.admin.controller;

import com.heartsphere.billing.entity.AIProvider;
import com.heartsphere.billing.repository.AIProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 计费管理 - 提供商管理控制器
 */
@RestController
@RequestMapping("/api/admin/billing/providers")
public class AdminBillingProviderController extends BaseAdminController {

    @Autowired
    private AIProviderRepository providerRepository;

    @GetMapping
    public ResponseEntity<List<AIProvider>> getAllProviders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(providerRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AIProvider> getProviderById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return providerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AIProvider> createProvider(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        AIProvider provider = new AIProvider();
        provider.setName((String) request.get("name"));
        provider.setDisplayName((String) request.get("displayName"));
        if (request.containsKey("enabled")) {
            provider.setEnabled((Boolean) request.get("enabled"));
        } else {
            provider.setEnabled(true);
        }
        
        return ResponseEntity.ok(providerRepository.save(provider));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AIProvider> updateProvider(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        return providerRepository.findById(id)
                .map(provider -> {
                    if (request.containsKey("displayName")) {
                        provider.setDisplayName((String) request.get("displayName"));
                    }
                    if (request.containsKey("enabled")) {
                        provider.setEnabled((Boolean) request.get("enabled"));
                    }
                    return ResponseEntity.ok(providerRepository.save(provider));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProvider(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        if (providerRepository.existsById(id)) {
            providerRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

