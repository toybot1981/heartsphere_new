package com.heartsphere.mentis.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

/**
 * 任务执行请求DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskExecuteRequestDTO {
    private String sessionId;
    private String taskType; // COMMAND, SCRIPT, INTERACTIVE, COMPUTER_USE
    private String description;
    private String command;
    private Map<String, Object> parameters;
}
