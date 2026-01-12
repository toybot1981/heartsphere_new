package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Dashboard统计数据DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatisticsDTO {
    // 总体统计
    private Long totalUsers;           // 注册用户总数
    private Long totalScenes;          // 用户构建的场景总数
    private Long totalScripts;         // 剧本总数
    private Long totalCharacters;      // 角色总数
    
    // 趋势数据
    private List<TrendData> trends;     // 趋势数据列表
    
    /**
     * 趋势数据
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendData {
        private String date;               // 日期（格式：YYYY-MM-DD 或 YYYY-MM 或 YYYY）
        private Long users;                // 该日期注册的用户数
        private Long scenes;               // 该日期创建的场景数
        private Long scripts;              // 该日期创建的剧本数
        private Long characters;          // 该日期创建的角色数
    }
}

