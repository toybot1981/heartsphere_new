package com.heartsphere.mentis.exception;

/**
 * 会话不存在异常
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class SessionNotFoundException extends MentisException {
    
    public SessionNotFoundException(String sessionId) {
        super("SESSION_NOT_FOUND", "会话不存在: " + sessionId);
    }
}
