package com.heartsphere.heartconnect.service;

import com.heartsphere.entity.User;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.heartconnect.dto.CreateWarmMessageRequest;
import com.heartsphere.heartconnect.dto.WarmMessageDTO;
import com.heartsphere.heartconnect.entity.HeartSphereShareConfig;
import com.heartsphere.heartconnect.entity.WarmMessage;
import com.heartsphere.heartconnect.repository.HeartSphereShareConfigRepository;
import com.heartsphere.heartconnect.repository.WarmMessageRepository;
import com.heartsphere.mailbox.dto.CreateMessageRequest;
import com.heartsphere.mailbox.enums.MessageCategory;
import com.heartsphere.mailbox.enums.MessageType;
import com.heartsphere.mailbox.enums.SenderType;
import com.heartsphere.mailbox.service.MailboxMessageService;
import com.heartsphere.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 暖心留言服务
 */
@Service
public class WarmMessageService {
    
    @Autowired
    private WarmMessageRepository warmMessageRepository;
    
    @Autowired
    private HeartSphereShareConfigRepository shareConfigRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private MailboxMessageService mailboxMessageService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * 创建暖心留言
     */
    @Transactional
    public WarmMessageDTO createWarmMessage(Long shareConfigId, Long visitorId, CreateWarmMessageRequest request) {
        // 验证共享配置存在并获取配置信息
        HeartSphereShareConfig shareConfig = shareConfigRepository.findById(shareConfigId)
                .orElseThrow(() -> new ResourceNotFoundException("共享配置不存在"));
        
        // 验证访问者存在并获取用户名
        User visitor = userRepository.findById(visitorId)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        
        // 获取共享配置的主人（接收者）
        Long ownerId = shareConfig.getUserId();
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("共享配置主人不存在"));
        
        // 创建留言
        WarmMessage message = new WarmMessage();
        message.setShareConfigId(shareConfigId);
        message.setVisitorId(visitorId);
        message.setVisitorName(visitor.getUsername());
        message.setMessage(request.getMessage());
        
        message = warmMessageRepository.save(message);
        
        // 同时创建mailbox消息（在单独的事务中，避免影响主事务）
        try {
            createMailboxMessage(ownerId, visitor, shareConfig, message, request.getMessage());
        } catch (Exception e) {
            // 如果创建mailbox消息失败，记录日志但不影响留言创建
            // 因为留言已经保存成功，mailbox消息只是辅助功能
            System.err.println("创建mailbox消息失败: " + e.getMessage());
            e.printStackTrace();
        }
        
        return convertToDTO(message);
    }
    
    /**
     * 创建mailbox消息（在单独的事务中）
     * 使用 REQUIRES_NEW 确保即使失败也不影响主事务
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    private void createMailboxMessage(Long ownerId, User visitor, HeartSphereShareConfig shareConfig, 
                                     WarmMessage warmMessage, String messageContent) {
        try {
            CreateMessageRequest mailboxRequest = new CreateMessageRequest();
            mailboxRequest.setReceiverId(ownerId);
            mailboxRequest.setSenderType(SenderType.USER);
            mailboxRequest.setSenderId(visitor.getId());
            mailboxRequest.setSenderName(visitor.getUsername());
            mailboxRequest.setSenderAvatar(visitor.getAvatar());
            mailboxRequest.setMessageType(MessageType.WARM_MESSAGE);
            mailboxRequest.setMessageCategory(MessageCategory.WARM_MESSAGE);
            mailboxRequest.setTitle("来自" + visitor.getUsername() + "的暖心留言");
            mailboxRequest.setContent(messageContent);
            
            // 设置关联信息
            mailboxRequest.setRelatedId(shareConfig.getId());
            mailboxRequest.setRelatedType("share_config");
            
            // 设置扩展数据
            Map<String, Object> contentData = new HashMap<>();
            contentData.put("warmMessageId", warmMessage.getId());
            contentData.put("shareCode", shareConfig.getShareCode());
            contentData.put("shareConfigId", shareConfig.getId());
            contentData.put("visitorId", visitor.getId());
            contentData.put("visitorName", visitor.getUsername());
            try {
                mailboxRequest.setContentData(objectMapper.writeValueAsString(contentData));
            } catch (Exception e) {
                // 如果JSON序列化失败，不设置contentData
            }
            
            mailboxMessageService.createMessage(mailboxRequest);
        } catch (Exception e) {
            // 在 REQUIRES_NEW 事务中捕获异常，避免传播到主事务
            // 记录日志但不抛出异常
            System.err.println("创建mailbox消息失败（已隔离）: " + e.getMessage());
            e.printStackTrace();
            // 不重新抛出异常，确保不影响主事务
        }
    }
    
    /**
     * 获取共享配置的所有留言（主人查看）
     */
    public List<WarmMessageDTO> getWarmMessages(Long shareConfigId, Long ownerId) {
        // 验证权限
        HeartSphereShareConfig shareConfig = shareConfigRepository.findById(shareConfigId)
                .orElseThrow(() -> new ResourceNotFoundException("共享配置不存在"));
        
        if (!shareConfig.getUserId().equals(ownerId)) {
            throw new ResourceNotFoundException("无权查看此共享配置的留言");
        }
        
        List<WarmMessage> messages = warmMessageRepository.findByShareConfigIdOrderByCreatedAtDesc(shareConfigId);
        return messages.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    /**
     * 转换为DTO
     */
    private WarmMessageDTO convertToDTO(WarmMessage message) {
        WarmMessageDTO dto = new WarmMessageDTO();
        dto.setId(message.getId());
        dto.setShareConfigId(message.getShareConfigId());
        dto.setVisitorId(message.getVisitorId());
        dto.setVisitorName(message.getVisitorName());
        dto.setMessage(message.getMessage());
        if (message.getCreatedAt() != null) {
            dto.setCreatedAt(java.time.Instant.from(message.getCreatedAt().atZone(java.time.ZoneId.systemDefault())).toEpochMilli());
        }
        return dto;
    }
}

