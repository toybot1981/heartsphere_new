package com.heartsphere.ai.skill.engine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 技能评估上下文
 * 包含评估技能所需的所有信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillEvaluationContext {
    
    /**
     * 用户消息内容
     */
    private String userMessage;
    
    /**
     * AI 角色ID
     */
    private Long roleId;
    
    /**
     * 当前对话历史（最近N条）
     */
    private List<String> conversationHistory;
    
    /**
     * 相关的内存IDs（可能被触发的内存）
     */
    private List<Long> relatedMemoryIds;
    
    /**
     * 对话的上下文主题
     */
    private String contextTopic;
    
    /**
     * 用户的当前状态或需求
     */
    private String userState;
    
    /**
     * 时间戳
     */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    // ==================== 业务方法 ====================
    
    /**
     * 获取消息摘要（用于日志）
     */
    public String getMessageSummary() {
        if (userMessage == null) {
            return "";
        }
        int maxLength = 100;
        return userMessage.length() > maxLength ? 
            userMessage.substring(0, maxLength) + "..." : 
            userMessage;
    }
    
    /**
     * 判断是否有足够的上下文信息
     */
    public boolean hasEnoughContext() {
        return userMessage != null && !userMessage.isEmpty();
    }
}
