package com.heartsphere.mentis.service;

import com.heartsphere.mentis.entity.MentisMessage;
import com.heartsphere.mentis.entity.MentisSession;
import com.heartsphere.mentis.repository.MentisMessageRepository;
import com.heartsphere.mentis.repository.MentisSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Mentis 消息管理服务实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MentisMessageServiceImpl implements MentisMessageService {
    
    private final MentisMessageRepository messageRepository;
    private final MentisSessionRepository sessionRepository;
    
    @Override
    @Transactional
    public MentisMessage saveMessage(String sessionId, String role, String content, String messageType) {
        log.debug("保存消息: sessionId={}, role={}, type={}", sessionId, role, messageType);
        
        MentisSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("会话不存在: " + sessionId));
        
        MentisMessage message = new MentisMessage();
        message.setMessageId("msg_" + UUID.randomUUID().toString().replace("-", ""));
        message.setSession(session);
        message.setRole(role);
        message.setContent(content);
        message.setMessageType(messageType != null ? messageType : "TEXT");
        
        return messageRepository.save(message);
    }
    
    @Override
    @Transactional
    public MentisMessage saveMessage(MentisMessage message) {
        log.debug("保存消息: messageId={}", message.getMessageId());
        
        if (message.getMessageId() == null) {
            message.setMessageId("msg_" + UUID.randomUUID().toString().replace("-", ""));
        }
        
        return messageRepository.save(message);
    }
    
    @Override
    public MentisMessage getMessage(String messageId) {
        log.debug("获取消息: messageId={}", messageId);
        
        return messageRepository.findByMessageId(messageId)
                .orElseThrow(() -> new RuntimeException("消息不存在: " + messageId));
    }
    
    @Override
    public List<MentisMessage> getSessionMessages(String sessionId) {
        log.debug("获取会话消息列表: sessionId={}", sessionId);
        
        MentisSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("会话不存在: " + sessionId));
        
        try {
            return messageRepository.findBySession_IdOrderByCreatedAtAsc(session.getId());
        } catch (Exception e) {
            log.error("查询会话消息失败: sessionId={}, sessionDbId={}", sessionId, session.getId(), e);
            // 如果查询失败，返回空列表
            return new java.util.ArrayList<>();
        }
    }
    
    @Override
    public List<MentisMessage> getRecentMessages(String sessionId, int limit) {
        log.debug("获取最近消息: sessionId={}, limit={}", sessionId, limit);
        
        MentisSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("会话不存在: " + sessionId));
        
        Pageable pageable = PageRequest.of(0, limit);
        return messageRepository.findRecentMessagesBySessionId(session.getId(), pageable);
    }
    
    @Override
    public List<MentisMessage> getMessagesByRole(String sessionId, String role) {
        log.debug("根据角色获取消息: sessionId={}, role={}", sessionId, role);
        
        MentisSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("会话不存在: " + sessionId));
        
        return messageRepository.findBySession_IdAndRoleOrderByCreatedAtAsc(session.getId(), role);
    }
    
    @Override
    public List<MentisMessage> getMessagesByTaskId(String taskId) {
        log.debug("根据任务ID获取消息: taskId={}", taskId);
        
        return messageRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
    }
}
