package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.SystemResourceDTO;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.service.SystemResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * 系统资源管理控制器
 */
@RestController
@RequestMapping("/api/admin/system/resources")
public class AdminResourceController extends BaseAdminController {

    private static final Logger logger = Logger.getLogger(AdminResourceController.class.getName());

    @Autowired
    private SystemResourceService systemResourceService;

    @GetMapping
    public ResponseEntity<List<SystemResourceDTO>> getAllResources(
            @RequestParam(required = false) String category,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            validateAdmin(authHeader);
            if (category != null && !category.isEmpty()) {
                return ResponseEntity.ok(systemResourceService.getResourcesByCategory(category));
            }
            return ResponseEntity.ok(systemResourceService.getAllResources());
        } catch (Exception e) {
            logger.severe("获取资源失败: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<SystemResourceDTO> getResourceById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemResourceService.getResourceById(id));
    }

    @PostMapping
    public ResponseEntity<SystemResourceDTO> createResource(
            @RequestParam("file") MultipartFile file,
            @RequestParam("category") String category,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "prompt", required = false) String prompt,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        SystemAdmin admin = validateAdmin(authHeader);
        return ResponseEntity.ok(systemResourceService.createResource(file, category, name, description, prompt, tags, admin.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SystemResourceDTO> updateResource(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(systemResourceService.updateResource(
                id,
                request.get("name"),
                request.get("description"),
                request.get("prompt"),
                request.get("tags"),
                request.get("url")
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        systemResourceService.deleteResource(id);
        return ResponseEntity.ok().build();
    }
}

