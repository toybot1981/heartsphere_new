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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.DefaultTransactionDefinition;

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
    
    @Autowired
    private org.springframework.transaction.PlatformTransactionManager transactionManager;
    
    /**
     * 创建独立事务模板（REQUIRES_NEW传播行为）
     * 用于创建mailbox消息，确保即使失败也不影响主事务
     */
    private TransactionTemplate createNewTransactionTemplate() {
        DefaultTransactionDefinition def = new DefaultTransactionDefinition();
        def.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        return new TransactionTemplate(transactionManager, def);
    }
    
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
     * 使用编程式事务管理（TransactionTemplate）确保即使失败也不影响主事务
     * 这样可以更精确地控制事务行为，避免事务被标记为 rollback-only
     */
    private void createMailboxMessage(Long ownerId, User visitor, HeartSphereShareConfig shareConfig, 
                                     WarmMessage warmMessage, String messageContent) {
        // 使用编程式事务管理，在独立事务中执行（REQUIRES_NEW）
        // 如果执行失败，不会影响主事务
        TransactionTemplate newTransactionTemplate = createNewTransactionTemplate();
        try {
            newTransactionTemplate.executeWithoutResult(status -> {
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
                    // 在独立事务中捕获异常，记录日志但不抛出
                    // 这样不会影响主事务，也不会将事务标记为 rollback-only
                    System.err.println("创建mailbox消息失败（已隔离）: " + e.getMessage());
                    e.printStackTrace();
                    // 标记事务为回滚，但不会影响主事务
                    status.setRollbackOnly();
                    // 不重新抛出异常，避免影响主事务
                }
            });
        } catch (Exception e) {
            // 捕获 TransactionTemplate 执行时的异常，确保不影响主事务
            // 这种情况通常不会发生，因为异常已经在 executeWithoutResult 内部处理
            System.err.println("TransactionTemplate 执行异常（已隔离）: " + e.getMessage());
            e.printStackTrace();
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

