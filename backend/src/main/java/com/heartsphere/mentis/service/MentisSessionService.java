package com.heartsphere.mentis.service;

import com.heartsphere.mentis.entity.MentisSession;

import java.util.List;

/**
 * Mentis 会话管理服务接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface MentisSessionService {
    
    /**
     * 创建新会话
     * 
     * @param userId 用户ID
     * @param title 会话标题
     * @return 创建的会话
     */
    MentisSession createSession(Long userId, String title);
    
    /**
     * 获取会话
     * 
     * @param sessionId 会话ID
     * @return 会话
     */
    MentisSession getSession(String sessionId);
    
    /**
     * 更新会话状态
     * 
     * @param sessionId 会话ID
     * @param status 新状态
     */
    void updateSessionStatus(String sessionId, String status);
    
    /**
     * 获取用户的所有会话
     * 
     * @param userId 用户ID
     * @return 会话列表
     */
    List<MentisSession> getUserSessions(Long userId);
    
    /**
     * 删除会话
     * 
     * @param sessionId 会话ID
     */
    void deleteSession(String sessionId);
}
