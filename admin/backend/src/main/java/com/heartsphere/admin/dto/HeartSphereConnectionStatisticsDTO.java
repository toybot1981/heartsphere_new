package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 心域连接统计数据DTO
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeartSphereConnectionStatisticsDTO {
    
    // 用户统计
    private Long totalShareUsers; // 共享用户总数
    private Long totalConnectionUsers; // 连接用户总数
    private Long totalAccessUsers; // 访问用户总数
    private Long activeShareUsers; // 活跃共享用户数
    
    // 共享统计
    private Long totalShareConfigs; // 共享配置总数
    private Long activeShareConfigs; // 活跃共享配置数
    private Map<String, Long> shareTypeDistribution; // 共享类型分布
    private Map<String, Long> accessTypeDistribution; // 访问类型分布
    
    // 连接统计
    private Long totalConnectionRequests; // 连接请求总数
    private Long approvedRequests; // 已批准请求数
    private Long rejectedRequests; // 已拒绝请求数
    private Long pendingRequests; // 待处理请求数
    private Double connectionSuccessRate; // 连接成功率
    
    // 访问统计
    private Long totalAccessCount; // 访问总次数
    private Long totalAccessDuration; // 访问总时长（秒）
    private Double averageAccessDuration; // 平均访问时长（秒）
    private Long uniqueVisitors; // 独立访问者数
    
    // 留言统计
    private Long totalMessages; // 留言总数
    private Long approvedMessages; // 已审核留言数
    private Long rejectedMessages; // 已拒绝留言数
    private Map<String, Long> messageTypeDistribution; // 留言类型分布
    private Double replyRate; // 回复率
    
    // 趋势数据
    private Map<String, Long> dailyTrend; // 日趋势数据
    private Map<String, Long> weeklyTrend; // 周趋势数据
    private Map<String, Long> monthlyTrend; // 月趋势数据
}




