package com.heartsphere.admin.controller.edu;

import com.heartsphere.admin.controller.BaseAdminController;
import com.heartsphere.admin.dto.edu.AdminEduContentDTO;
import com.heartsphere.admin.service.edu.AdminEduContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 教育版内容管理控制器
 * 用于在统一管理后台中管理教育版的内容（场景、角色、课程等）
 */
@RestController
@RequestMapping("/api/admin/edu/content")
public class AdminEduContentController extends BaseAdminController {

    @Autowired
    private AdminEduContentService adminEduContentService;

    /**
     * 获取内容审核队列
     */
    @GetMapping("/review-queue")
    public ResponseEntity<Map<String, Object>> getReviewQueue(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status
    ) {
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<AdminEduContentDTO> content = adminEduContentService.getReviewQueue(pageable, type, status);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", content.getContent());
        response.put("totalElements", content.getTotalElements());
        response.put("totalPages", content.getTotalPages());
        response.put("currentPage", content.getNumber());
        response.put("pageSize", content.getSize());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 审核内容（通过）
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<AdminEduContentDTO> approveContent(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id
    ) {
        validateAdmin(authHeader);
        AdminEduContentDTO content = adminEduContentService.approveContent(id);
        return ResponseEntity.ok(content);
    }

    /**
     * 审核内容（拒绝）
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<AdminEduContentDTO> rejectContent(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> request
    ) {
        validateAdmin(authHeader);
        String reason = request.get("reason");
        AdminEduContentDTO content = adminEduContentService.rejectContent(id, reason);
        return ResponseEntity.ok(content);
    }

    /**
     * 获取内容详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<AdminEduContentDTO> getContent(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id
    ) {
        validateAdmin(authHeader);
        AdminEduContentDTO content = adminEduContentService.getContentById(id);
        return ResponseEntity.ok(content);
    }

    /**
     * 更新内容分类和推荐状态
     */
    @PutMapping("/{id}")
    public ResponseEntity<AdminEduContentDTO> updateContent(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id,
            @RequestBody AdminEduContentDTO dto
    ) {
        validateAdmin(authHeader);
        AdminEduContentDTO content = adminEduContentService.updateContent(id, dto);
        return ResponseEntity.ok(content);
    }

    /**
     * 删除内容
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id
    ) {
        validateAdmin(authHeader);
        adminEduContentService.deleteContent(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 获取内容统计数据
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getContentStatistics(
            @RequestHeader("Authorization") String authHeader
    ) {
        validateAdmin(authHeader);
        Map<String, Object> statistics = adminEduContentService.getContentStatistics();
        return ResponseEntity.ok(statistics);
    }
}
