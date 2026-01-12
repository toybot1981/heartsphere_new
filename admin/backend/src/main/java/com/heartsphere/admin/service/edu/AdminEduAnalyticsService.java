package com.heartsphere.admin.service.edu;

import java.util.Map;

/**
 * 教育版数据分析服务接口
 */
public interface AdminEduAnalyticsService {
    
    /**
     * 获取教育版总体统计
     */
    Map<String, Object> getOverview();
    
    /**
     * 获取用户增长趋势
     */
    Map<String, Object> getUserGrowth(String startDate, String endDate);
    
    /**
     * 获取学习活动统计
     */
    Map<String, Object> getLearningActivities(String startDate, String endDate);
    
    /**
     * 获取作业完成情况统计
     */
    Map<String, Object> getHomeworkCompletion(String startDate, String endDate);
}
