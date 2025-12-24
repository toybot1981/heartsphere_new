package com.heartsphere.admin.controller;

import com.heartsphere.billing.entity.AIModel;
import com.heartsphere.billing.repository.AIModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 计费管理 - 模型管理控制器
 */
@RestController
@RequestMapping("/api/admin/billing/models")
public class AdminBillingModelController extends BaseAdminController {

    @Autowired
    private AIModelRepository modelRepository;

    @GetMapping
    public ResponseEntity<List<AIModel>> getAllModels(
            @RequestParam(required = false) Long providerId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        if (providerId != null) {
            return ResponseEntity.ok(modelRepository.findByProviderId(providerId));
        }
        return ResponseEntity.ok(modelRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AIModel> getModelById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return modelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AIModel> createModel(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        AIModel model = new AIModel();
        model.setProviderId(((Number) request.get("providerId")).longValue());
        model.setModelCode((String) request.get("modelCode"));
        model.setModelName((String) request.get("modelName"));
        model.setModelType((String) request.get("modelType"));
        if (request.containsKey("enabled")) {
            model.setEnabled((Boolean) request.get("enabled"));
        } else {
            model.setEnabled(true);
        }
        
        return ResponseEntity.ok(modelRepository.save(model));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AIModel> updateModel(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        return modelRepository.findById(id)
                .map(model -> {
                    if (request.containsKey("providerId")) {
                        model.setProviderId(((Number) request.get("providerId")).longValue());
                    }
                    if (request.containsKey("modelCode")) {
                        model.setModelCode((String) request.get("modelCode"));
                    }
                    if (request.containsKey("modelName")) {
                        model.setModelName((String) request.get("modelName"));
                    }
                    if (request.containsKey("modelType")) {
                        model.setModelType((String) request.get("modelType"));
                    }
                    if (request.containsKey("enabled")) {
                        model.setEnabled((Boolean) request.get("enabled"));
                    }
                    return ResponseEntity.ok(modelRepository.save(model));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModel(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        if (modelRepository.existsById(id)) {
            modelRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

