package com.heartsphere.admin.service.edu;

import com.heartsphere.admin.dto.edu.AdminEduStudentDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * 教育版学生管理服务接口
 */
public interface AdminEduStudentService {
    
    /**
     * 获取学生列表（分页、搜索）
     */
    Page<AdminEduStudentDTO> getStudents(Pageable pageable, String search, Integer ageGroup, String school);
    
    /**
     * 根据ID获取学生详情
     */
    AdminEduStudentDTO getStudentById(Long id);
    
    /**
     * 更新学生信息
     */
    AdminEduStudentDTO updateStudent(Long id, AdminEduStudentDTO dto);
    
    /**
     * 更新学生账户状态
     */
    AdminEduStudentDTO updateStudentStatus(Long id, Boolean isEnabled);
    
    /**
     * 删除学生账户
     */
    void deleteStudent(Long id);
    
    /**
     * 获取学生学习统计
     */
    java.util.Map<String, Object> getStudentStatistics(Long id);
}
