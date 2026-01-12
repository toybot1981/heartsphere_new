package com.heartsphere.admin.controller.edu;

import com.heartsphere.admin.controller.BaseAdminController;
import com.heartsphere.admin.dto.edu.AdminEduTeacherDTO;
import com.heartsphere.admin.service.edu.AdminEduTeacherService;
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
 * 教育版教师管理控制器
 * 用于在统一管理后台中管理教育版的教师数据
 */
@RestController
@RequestMapping("/api/admin/edu/teachers")
public class AdminEduTeacherController extends BaseAdminController {

    @Autowired
    private AdminEduTeacherService adminEduTeacherService;

    /**
     * 获取教师列表（分页、搜索）
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTeachers(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdminEduTeacherDTO> teachers = adminEduTeacherService.getTeachers(pageable, search, status);
        
        Map<String, Object> response = new HashMap<>();
        response.put("teachers", teachers.getContent());
        response.put("totalElements", teachers.getTotalElements());
        response.put("totalPages", teachers.getTotalPages());
        response.put("currentPage", teachers.getNumber());
        response.put("pageSize", teachers.getSize());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取教师详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<AdminEduTeacherDTO> getTeacher(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id
    ) {
        validateAdmin(authHeader);
        AdminEduTeacherDTO teacher = adminEduTeacherService.getTeacherById(id);
        return ResponseEntity.ok(teacher);
    }

    /**
     * 审核教师申请
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<AdminEduTeacherDTO> approveTeacher(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id
    ) {
        validateAdmin(authHeader);
        AdminEduTeacherDTO teacher = adminEduTeacherService.approveTeacher(id);
        return ResponseEntity.ok(teacher);
    }

    /**
     * 拒绝教师申请
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<AdminEduTeacherDTO> rejectTeacher(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> request
    ) {
        validateAdmin(authHeader);
        String reason = request.get("reason");
        AdminEduTeacherDTO teacher = adminEduTeacherService.rejectTeacher(id, reason);
        return ResponseEntity.ok(teacher);
    }

    /**
     * 更新教师信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<AdminEduTeacherDTO> updateTeacher(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id,
            @RequestBody AdminEduTeacherDTO dto
    ) {
        validateAdmin(authHeader);
        AdminEduTeacherDTO teacher = adminEduTeacherService.updateTeacher(id, dto);
        return ResponseEntity.ok(teacher);
    }

    /**
     * 更新教师权限
     */
    @PutMapping("/{id}/permissions")
    public ResponseEntity<AdminEduTeacherDTO> updateTeacherPermissions(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> permissions
    ) {
        validateAdmin(authHeader);
        AdminEduTeacherDTO teacher = adminEduTeacherService.updateTeacherPermissions(id, permissions);
        return ResponseEntity.ok(teacher);
    }

    /**
     * 启用/禁用教师账户
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<AdminEduTeacherDTO> updateTeacherStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id,
            @RequestBody Map<String, Boolean> request
    ) {
        validateAdmin(authHeader);
        Boolean isEnabled = request.get("isEnabled");
        
        if (isEnabled == null) {
            return ResponseEntity.badRequest().build();
        }
        
        AdminEduTeacherDTO teacher = adminEduTeacherService.updateTeacherStatus(id, isEnabled);
        return ResponseEntity.ok(teacher);
    }
}
