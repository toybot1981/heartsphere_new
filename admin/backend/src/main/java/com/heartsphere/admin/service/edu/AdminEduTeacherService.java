package com.heartsphere.admin.service.edu;

import com.heartsphere.admin.dto.edu.AdminEduTeacherDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

/**
 * 教育版教师管理服务接口
 */
public interface AdminEduTeacherService {
    
    /**
     * 获取教师列表（分页、搜索）
     */
    Page<AdminEduTeacherDTO> getTeachers(Pageable pageable, String search, String status);
    
    /**
     * 根据ID获取教师详情
     */
    AdminEduTeacherDTO getTeacherById(Long id);
    
    /**
     * 审核通过教师申请
     */
    AdminEduTeacherDTO approveTeacher(Long id);
    
    /**
     * 拒绝教师申请
     */
    AdminEduTeacherDTO rejectTeacher(Long id, String reason);
    
    /**
     * 更新教师信息
     */
    AdminEduTeacherDTO updateTeacher(Long id, AdminEduTeacherDTO dto);
    
    /**
     * 更新教师权限
     */
    AdminEduTeacherDTO updateTeacherPermissions(Long id, Map<String, Object> permissions);
    
    /**
     * 更新教师账户状态
     */
    AdminEduTeacherDTO updateTeacherStatus(Long id, Boolean isEnabled);
}
