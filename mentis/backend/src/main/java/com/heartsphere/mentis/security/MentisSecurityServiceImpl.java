package com.heartsphere.mentis.security;

import com.heartsphere.mentis.repository.MentisSessionRepository;
import com.heartsphere.mentis.repository.MentisTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Mentis 安全服务实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MentisSecurityServiceImpl implements MentisSecurityService {
    
    private final MentisSessionRepository sessionRepository;
    private final MentisTaskRepository taskRepository;
    
    @Override
    public boolean hasSessionAccess(Long userId, String sessionId) {
        log.debug("验证会话访问权限: userId={}, sessionId={}", userId, sessionId);
        
        return sessionRepository.findBySessionId(sessionId)
                .map(session -> session.getUserId().equals(userId))
                .orElse(false);
    }
    
    @Override
    public boolean hasTaskExecutePermission(Long userId, String taskId) {
        log.debug("验证任务执行权限: userId={}, taskId={}", userId, taskId);
        
        return taskRepository.findByTaskId(taskId)
                .map(task -> {
                    Long sessionUserId = task.getSession().getUserId();
                    return sessionUserId.equals(userId);
                })
                .orElse(false);
    }
    
    @Override
    public boolean hasVmManagementPermission(Long userId, String sessionId) {
        log.debug("验证虚拟机管理权限: userId={}, sessionId={}", userId, sessionId);
        
        // 有会话访问权限就有虚拟机管理权限
        return hasSessionAccess(userId, sessionId);
    }
    
    @Override
    public void recordSecurityOperation(Long userId, String action, String resource, boolean result) {
        log.info("记录安全操作: userId={}, action={}, resource={}, result={}", 
                userId, action, resource, result);
        
        // TODO: 记录到审计日志
    }
}
