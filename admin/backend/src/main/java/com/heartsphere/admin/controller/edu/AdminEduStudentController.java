package com.heartsphere.admin.controller.edu;

import com.heartsphere.admin.controller.BaseAdminController;
import com.heartsphere.admin.dto.edu.AdminEduStudentDTO;
import com.heartsphere.admin.service.edu.AdminEduStudentService;
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
 * 教育版学生管理控制器
 * 用于在统一管理后台中管理教育版的学生数据
 */
@RestController
@RequestMapping("/api/admin/edu/students")
public class AdminEduStudentController extends BaseAdminController {

    @Autowired
    private AdminEduStudentService adminEduStudentService;

    /**
     * 获取学生列表（分页、搜索）
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllStudents(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer ageGroup,
            @RequestParam(required = false) String school
    ) {
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdminEduStudentDTO> students = adminEduStudentService.getStudents(pageable, search, ageGroup, school);
        
        Map<String, Object> response = new HashMap<>();
        response.put("students", students.getContent());
        response.put("totalElements", students.getTotalElements());
        response.put("totalPages", students.getTotalPages());
        response.put("currentPage", students.getNumber());
        response.put("pageSize", students.getSize());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取学生详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<AdminEduStudentDTO> getStudent(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id
    ) {
        validateAdmin(authHeader);
        AdminEduStudentDTO student = adminEduStudentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    /**
     * 更新学生信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<AdminEduStudentDTO> updateStudent(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id,
            @RequestBody AdminEduStudentDTO dto
    ) {
        validateAdmin(authHeader);
        AdminEduStudentDTO student = adminEduStudentService.updateStudent(id, dto);
        return ResponseEntity.ok(student);
    }

    /**
     * 启用/禁用学生账户
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<AdminEduStudentDTO> updateStudentStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id,
            @RequestBody Map<String, Boolean> request
    ) {
        validateAdmin(authHeader);
        Boolean isEnabled = request.get("isEnabled");
        
        if (isEnabled == null) {
            return ResponseEntity.badRequest().build();
        }
        
        AdminEduStudentDTO student = adminEduStudentService.updateStudentStatus(id, isEnabled);
        return ResponseEntity.ok(student);
    }

    /**
     * 删除学生账户
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id
    ) {
        validateAdmin(authHeader);
        adminEduStudentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 获取学生学习统计
     */
    @GetMapping("/{id}/statistics")
    public ResponseEntity<Map<String, Object>> getStudentStatistics(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id
    ) {
        validateAdmin(authHeader);
        Map<String, Object> statistics = adminEduStudentService.getStudentStatistics(id);
        return ResponseEntity.ok(statistics);
    }
}
