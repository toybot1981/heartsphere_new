package com.heartsphere.mentis.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

/**
 * 聊天请求DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequestDTO {
    private String sessionId;
    private String message;
    private String taskType; // COMMAND, SCRIPT, INTERACTIVE, COMPUTER_USE
    private Map<String, Object> parameters;
    private Boolean enableComputerUse = true; // 是否启用computer-use能力
}
