package com.heartsphere.admin.dto;

import lombok.Data;
import java.util.List;

/**
 * DevOps 工作台统计数据 DTO
 */
@Data
public class DevOpsStatisticsDTO {
    private Long totalExecutions;
    private Long successExecutions;
    private Long failedExecutions;
    private Long runningExecutions;
    private List<RunningTaskInfo> runningTasks;

    @Data
    public static class RunningTaskInfo {
        private Long executionId;
        private String scriptName;
        private String status;
    }
}
