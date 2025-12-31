package com.heartsphere.mailbox.listener;

import com.heartsphere.mailbox.service.ResonanceMessageService;
import com.heartsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * 共鸣消息事件监听器
 * 监听心域连接系统的互动事件，自动创建共鸣消息
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ResonanceMessageEventListener {
    
    private final ResonanceMessageService resonanceMessageService;
    private final UserRepository userRepository;
    
    /**
     * 处理点赞事件
     * 当用户点赞其他用户的心域内容时，创建共鸣消息
     */
    @Async
    public void handleLikeEvent(Long senderId, Long receiverId, Long relatedId, String relatedType) {
        try {
            // 获取发送者信息
            userRepository.findById(senderId).ifPresent(sender -> {
                String senderName = sender.getUsername();
                String senderAvatar = sender.getAvatar();
                
                // 创建点赞消息
                resonanceMessageService.handleLike(
                    receiverId, senderId, senderName, senderAvatar, relatedId, relatedType
                );
                
                log.info("处理点赞事件 - senderId={}, receiverId={}, relatedId={}", 
                    senderId, receiverId, relatedId);
            });
        } catch (Exception e) {
            log.error("处理点赞事件失败 - senderId={}, receiverId={}", senderId, receiverId, e);
        }
    }
    
    /**
     * 处理评论事件
     */
    @Async
    public void handleCommentEvent(Long senderId, Long receiverId, Long relatedId, 
                                   String relatedType, String commentContent) {
        try {
            userRepository.findById(senderId).ifPresent(sender -> {
                String senderName = sender.getUsername();
                String senderAvatar = sender.getAvatar();
                
                resonanceMessageService.handleComment(
                    receiverId, senderId, senderName, senderAvatar, 
                    relatedId, relatedType, commentContent
                );
                
                log.info("处理评论事件 - senderId={}, receiverId={}, relatedId={}", 
                    senderId, receiverId, relatedId);
            });
        } catch (Exception e) {
            log.error("处理评论事件失败 - senderId={}, receiverId={}", senderId, receiverId, e);
        }
    }
    
    /**
     * 处理分享事件
     */
    @Async
    public void handleShareEvent(Long senderId, Long receiverId, Long relatedId, String relatedType) {
        try {
            userRepository.findById(senderId).ifPresent(sender -> {
                String senderName = sender.getUsername();
                String senderAvatar = sender.getAvatar();
                
                resonanceMessageService.handleShare(
                    receiverId, senderId, senderName, senderAvatar, relatedId, relatedType
                );
                
                log.info("处理分享事件 - senderId={}, receiverId={}, relatedId={}", 
                    senderId, receiverId, relatedId);
            });
        } catch (Exception e) {
            log.error("处理分享事件失败 - senderId={}, receiverId={}", senderId, receiverId, e);
        }
    }
    
    /**
     * 处理连接请求事件
     */
    @Async
    public void handleConnectionRequestEvent(Long senderId, Long receiverId, String requestMessage) {
        try {
            userRepository.findById(senderId).ifPresent(sender -> {
                String senderName = sender.getUsername();
                String senderAvatar = sender.getAvatar();
                
                resonanceMessageService.handleConnectionRequest(
                    receiverId, senderId, senderName, senderAvatar, requestMessage
                );
                
                log.info("处理连接请求事件 - senderId={}, receiverId={}", senderId, receiverId);
            });
        } catch (Exception e) {
            log.error("处理连接请求事件失败 - senderId={}, receiverId={}", senderId, receiverId, e);
        }
    }
}

