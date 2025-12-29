package com.heartsphere.heartconnect.service;

import com.heartsphere.entity.User;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.heartconnect.dto.CreateWarmMessageRequest;
import com.heartsphere.heartconnect.dto.WarmMessageDTO;
import com.heartsphere.heartconnect.entity.HeartSphereShareConfig;
import com.heartsphere.heartconnect.entity.WarmMessage;
import com.heartsphere.heartconnect.repository.HeartSphereShareConfigRepository;
import com.heartsphere.heartconnect.repository.WarmMessageRepository;
import com.heartsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
    
    /**
     * 创建暖心留言
     */
    @Transactional
    public WarmMessageDTO createWarmMessage(Long shareConfigId, Long visitorId, CreateWarmMessageRequest request) {
        // 验证共享配置存在
        if (!shareConfigRepository.existsById(shareConfigId)) {
            throw new ResourceNotFoundException("共享配置不存在");
        }
        
        // 验证访问者存在并获取用户名
        User visitor = userRepository.findById(visitorId)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        
        // 创建留言
        WarmMessage message = new WarmMessage();
        message.setShareConfigId(shareConfigId);
        message.setVisitorId(visitorId);
        message.setVisitorName(visitor.getUsername());
        message.setMessage(request.getMessage());
        
        message = warmMessageRepository.save(message);
        
        return convertToDTO(message);
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

