package com.heartsphere.mentis.service;

import com.heartsphere.mentis.entity.MentisSession;
import com.heartsphere.mentis.repository.MentisMessageRepository;
import com.heartsphere.mentis.repository.MentisSessionRepository;
import com.heartsphere.mentis.repository.MentisTaskRepository;
import com.heartsphere.mentis.vm.VmManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Mentis 会话管理服务实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MentisSessionServiceImpl implements MentisSessionService {
    
    private final MentisSessionRepository sessionRepository;
    private final MentisTaskRepository taskRepository;
    private final MentisMessageRepository messageRepository;
    private final VmManager vmManager;
    
    @Override
    @Transactional
    public MentisSession createSession(Long userId, String title) {
        log.info("创建会话: userId={}, title={}", userId, title);
        
        MentisSession session = new MentisSession();
        session.setSessionId("mentis_" + UUID.randomUUID().toString().replace("-", ""));
        session.setUserId(userId);
        session.setTitle(title);
        session.setStatus("ACTIVE");
        session.setVmStatus("IDLE");
        
        return sessionRepository.save(session);
    }
    
    @Override
    public MentisSession getSession(String sessionId) {
        log.info("获取会话: sessionId={}", sessionId);
        
        return sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("会话不存在: " + sessionId));
    }
    
    @Override
    @Transactional
    public void updateSessionStatus(String sessionId, String status) {
        log.info("更新会话状态: sessionId={}, status={}", sessionId, status);
        
        MentisSession session = getSession(sessionId);
        session.setStatus(status);
        sessionRepository.save(session);
    }
    
    @Override
    public List<MentisSession> getUserSessions(Long userId) {
        log.info("获取用户会话列表: userId={}", userId);
        
        return sessionRepository.findByUserIdOrderByLastActiveAtDesc(userId);
    }
    
    @Override
    @Transactional
    public void deleteSession(String sessionId) {
        log.info("删除会话及其所有相关数据: sessionId={}", sessionId);
        
        MentisSession session = getSession(sessionId);
        Long sessionDbId = session.getId();
        
        try {
            // 1. 删除关联的虚拟机资源
            try {
                vmManager.deleteVmForSession(sessionId);
                log.info("已删除会话的虚拟机资源: sessionId={}", sessionId);
            } catch (Exception e) {
                log.warn("删除会话的虚拟机资源失败（继续删除其他数据）: sessionId={}", sessionId, e);
            }
            
            // 2. 删除所有关联的任务
            try {
                List<com.heartsphere.mentis.entity.MentisTask> tasks = 
                    taskRepository.findBySession_IdOrderByCreatedAtDesc(sessionDbId);
                if (!tasks.isEmpty()) {
                    taskRepository.deleteAll(tasks);
                    log.info("已删除会话的所有任务: sessionId={}, taskCount={}", sessionId, tasks.size());
                }
            } catch (Exception e) {
                log.warn("删除会话的任务失败（继续删除其他数据）: sessionId={}", sessionId, e);
            }
            
            // 3. 删除所有关联的消息
            try {
                List<com.heartsphere.mentis.entity.MentisMessage> messages = 
                    messageRepository.findBySession_IdOrderByCreatedAtAsc(sessionDbId);
                if (!messages.isEmpty()) {
                    messageRepository.deleteAll(messages);
                    log.info("已删除会话的所有消息: sessionId={}, messageCount={}", sessionId, messages.size());
                }
            } catch (Exception e) {
                log.warn("删除会话的消息失败（继续删除其他数据）: sessionId={}", sessionId, e);
            }
            
            // 4. 最后删除会话本身（级联删除应该已经处理了，但显式删除更安全）
            sessionRepository.delete(session);
            log.info("会话删除完成: sessionId={}", sessionId);
            
        } catch (Exception e) {
            log.error("删除会话时发生错误: sessionId={}", sessionId, e);
            throw new RuntimeException("删除会话失败: " + e.getMessage(), e);
        }
    }
}
