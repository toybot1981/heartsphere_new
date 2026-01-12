package com.heartsphere.admin.service.edu;

import com.heartsphere.admin.dto.edu.AdminEduContentDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

/**
 * 教育版内容管理服务接口
 */
public interface AdminEduContentService {
    
    /**
     * 获取内容审核队列
     */
    Page<AdminEduContentDTO> getReviewQueue(Pageable pageable, String type, String status);
    
    /**
     * 审核通过内容
     */
    AdminEduContentDTO approveContent(Long id);
    
    /**
     * 审核拒绝内容
     */
    AdminEduContentDTO rejectContent(Long id, String reason);
    
    /**
     * 根据ID获取内容详情
     */
    AdminEduContentDTO getContentById(Long id);
    
    /**
     * 更新内容信息
     */
    AdminEduContentDTO updateContent(Long id, AdminEduContentDTO dto);
    
    /**
     * 删除内容
     */
    void deleteContent(Long id);
    
    /**
     * 获取内容统计数据
     */
    Map<String, Object> getContentStatistics();
}
