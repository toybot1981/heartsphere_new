package com.heartsphere.mentis.service;

import com.heartsphere.mentis.entity.MentisMessage;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Mentis 消息管理服务接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface MentisMessageService {
    
    /**
     * 保存消息
     * 
     * @param sessionId 会话ID
     * @param role 消息角色
     * @param content 消息内容
     * @param messageType 消息类型
     * @return 保存的消息
     */
    MentisMessage saveMessage(String sessionId, String role, String content, String messageType);
    
    /**
     * 保存消息（完整）
     * 
     * @param message 消息对象
     * @return 保存的消息
     */
    MentisMessage saveMessage(MentisMessage message);
    
    /**
     * 获取消息
     * 
     * @param messageId 消息ID
     * @return 消息
     */
    MentisMessage getMessage(String messageId);
    
    /**
     * 获取会话的所有消息
     * 
     * @param sessionId 会话ID
     * @return 消息列表
     */
    List<MentisMessage> getSessionMessages(String sessionId);
    
    /**
     * 获取会话的最近N条消息
     * 
     * @param sessionId 会话ID
     * @param limit 消息数量限制
     * @return 消息列表
     */
    List<MentisMessage> getRecentMessages(String sessionId, int limit);
    
    /**
     * 根据角色获取消息
     * 
     * @param sessionId 会话ID
     * @param role 消息角色
     * @return 消息列表
     */
    List<MentisMessage> getMessagesByRole(String sessionId, String role);
    
    /**
     * 根据任务ID获取相关消息
     * 
     * @param taskId 任务ID
     * @return 消息列表
     */
    List<MentisMessage> getMessagesByTaskId(String taskId);
}
