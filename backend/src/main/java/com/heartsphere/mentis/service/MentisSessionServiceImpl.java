package com.heartsphere.mentis.service;

import com.heartsphere.mentis.entity.MentisSession;
import com.heartsphere.mentis.repository.MentisSessionRepository;
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
        log.debug("获取会话: sessionId={}", sessionId);
        
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
        log.debug("获取用户会话列表: userId={}", userId);
        
        return sessionRepository.findByUserIdOrderByLastActiveAtDesc(userId);
    }
    
    @Override
    @Transactional
    public void deleteSession(String sessionId) {
        log.info("删除会话: sessionId={}", sessionId);
        
        MentisSession session = getSession(sessionId);
        sessionRepository.delete(session);
    }
}
