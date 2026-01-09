package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.*;
import com.heartsphere.admin.entity.PromptTemplate;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.PromptTemplateRepository;
import com.heartsphere.admin.service.PromptAIGenerateService;
import com.heartsphere.admin.service.PromptCategoryService;
import com.heartsphere.admin.service.PromptTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 提示词管理控制器（管理员专用）
 */
@RestController
@RequestMapping("/api/admin/prompts")
public class AdminPromptController extends BaseAdminController {
    
    @Autowired
    private PromptTemplateService templateService;
    
    @Autowired
    private PromptCategoryService categoryService;
    
    @Autowired
    private PromptAIGenerateService aiGenerateService;
    
    @Autowired
    private PromptTemplateRepository templateRepository;
    
    // ==================== 模板管理 ====================
    
    /**
     * 获取模板列表
     * GET /api/admin/prompts/templates
     */
    @GetMapping("/templates")
    public ResponseEntity<Map<String, Object>> getTemplates(
            @RequestParam(required = false) String categoryCode,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<PromptTemplateDTO> templates = templateService.getTemplates(categoryCode, keyword, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("templates", templates.getContent());
        response.put("totalElements", templates.getTotalElements());
        response.put("totalPages", templates.getTotalPages());
        response.put("currentPage", templates.getNumber());
        response.put("pageSize", templates.getSize());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取模板详情
     * GET /api/admin/prompts/templates/{id}
     */
    @GetMapping("/templates/{id}")
    public ResponseEntity<PromptTemplateDTO> getTemplateById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        PromptTemplateDTO template = templateService.getTemplateById(id);
        return ResponseEntity.ok(template);
    }
    
    /**
     * 创建模板
     * POST /api/admin/prompts/templates
     */
    @PostMapping("/templates")
    public ResponseEntity<PromptTemplateDTO> createTemplate(
            @RequestBody PromptTemplateDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        SystemAdmin admin = validateAdmin(authHeader);
        
        PromptTemplateDTO template = templateService.createTemplate(dto, admin.getId());
        return ResponseEntity.ok(template);
    }
    
    /**
     * 更新模板
     * PUT /api/admin/prompts/templates/{id}
     */
    @PutMapping("/templates/{id}")
    public ResponseEntity<PromptTemplateDTO> updateTemplate(
            @PathVariable Long id,
            @RequestBody PromptTemplateDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        PromptTemplateDTO template = templateService.updateTemplate(id, dto);
        return ResponseEntity.ok(template);
    }
    
    /**
     * 删除模板
     * DELETE /api/admin/prompts/templates/{id}
     */
    @DeleteMapping("/templates/{id}")
    public ResponseEntity<Void> deleteTemplate(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        templateService.deleteTemplate(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 复制模板
     * POST /api/admin/prompts/templates/{id}/copy
     */
    @PostMapping("/templates/{id}/copy")
    public ResponseEntity<PromptTemplateDTO> copyTemplate(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        SystemAdmin admin = validateAdmin(authHeader);
        
        PromptTemplateDTO original = templateService.getTemplateById(id);
        original.setId(null);
        original.setName(original.getName() + " (副本)");
        
        PromptTemplateDTO template = templateService.createTemplate(original, admin.getId());
        return ResponseEntity.ok(template);
    }
    
    // ==================== 模板渲染 ====================
    
    /**
     * 渲染模板
     * POST /api/admin/prompts/templates/{id}/render
     */
    @PostMapping("/templates/{id}/render")
    public ResponseEntity<PromptRenderResponse> renderTemplate(
            @PathVariable Long id,
            @RequestBody PromptRenderRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        request.setTemplateId(id);
        PromptRenderResponse response = templateService.renderTemplate(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 预览模板（使用示例数据）
     * GET /api/admin/prompts/templates/{id}/preview
     */
    @GetMapping("/templates/{id}/preview")
    public ResponseEntity<PromptRenderResponse> previewTemplate(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        PromptRenderResponse response = templateService.previewTemplate(id);
        return ResponseEntity.ok(response);
    }
    
    // ==================== AI生成 ====================
    
    /**
     * AI生成提示词
     * POST /api/admin/prompts/templates/{id}/generate
     */
    @PostMapping("/templates/{id}/generate")
    public ResponseEntity<PromptGenerateResponse> generatePrompt(
            @PathVariable Long id,
            @RequestBody PromptGenerateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        PromptTemplate template = templateRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("模板不存在或已禁用"));
        
        request.setTemplateId(id);
        PromptGenerateResponse response = aiGenerateService.generatePrompt(template, request);
        return ResponseEntity.ok(response);
    }
    
    // ==================== 分类管理 ====================
    
    /**
     * 获取所有分类
     * GET /api/admin/prompts/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<PromptCategoryDTO>> getCategories(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        List<PromptCategoryDTO> categories = categoryService.getAllActiveCategories();
        return ResponseEntity.ok(categories);
    }
    
    /**
     * 创建分类
     * POST /api/admin/prompts/categories
     */
    @PostMapping("/categories")
    public ResponseEntity<PromptCategoryDTO> createCategory(
            @RequestBody PromptCategoryDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        PromptCategoryDTO category = categoryService.createCategory(dto);
        return ResponseEntity.ok(category);
    }
    
    /**
     * 更新分类
     * PUT /api/admin/prompts/categories/{id}
     */
    @PutMapping("/categories/{id}")
    public ResponseEntity<PromptCategoryDTO> updateCategory(
            @PathVariable Long id,
            @RequestBody PromptCategoryDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        PromptCategoryDTO category = categoryService.updateCategory(id, dto);
        return ResponseEntity.ok(category);
    }
    
    /**
     * 删除分类
     * DELETE /api/admin/prompts/categories/{id}
     */
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}
