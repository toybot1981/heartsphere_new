package com.heartsphere.mentis.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 聊天响应DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDTO {
    private String sessionId;
    private String messageId;
    private String response;
    private String taskId; // 如果有任务被创建
    private String executionId; // 任务执行ID，用于查询任务进度
    private String taskStatus; // 任务状态
    private Map<String, Object> result; // 任务执行结果
    private List<MentisMessageDTO> conversationHistory; // 对话历史
    private Map<String, Object> vmState; // 虚拟机状态（如果相关）
    
    // 技能信息（当角色触发技能时显示）
    private String skillId;      // 技能ID
    private String skillName;    // 技能名称
}
