package com.heartsphere.heartconnect.portal.service;

import com.heartsphere.heartconnect.dto.ShareConfigDTO;
import com.heartsphere.heartconnect.entity.HeartSphereConnection;
import com.heartsphere.heartconnect.repository.HeartSphereConnectionRepository;
import com.heartsphere.heartconnect.service.ConnectionRequestService;
import com.heartsphere.heartconnect.service.ShareConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 共享配置查询服务实现
 * 作为适配器，调用现有的ShareConfigService和ConnectionRequestService
 */
@Service
public class ShareConfigQueryServiceImpl implements ShareConfigQueryService {
    
    @Autowired
    private ShareConfigService shareConfigService;
    
    @Autowired(required = false)
    private ConnectionRequestService connectionRequestService;
    
    @Autowired
    private HeartSphereConnectionRepository connectionRepository;
    
    @Override
    public ShareConfigDTO getShareConfigByCode(String shareCode) {
        return shareConfigService.getShareConfigByShareCode(shareCode);
    }
    
    @Override
    public boolean isUserConnected(Long userId, Long shareConfigId) {
        if (connectionRepository == null) {
            return false;
        }
        return connectionRepository.findByShareConfigIdAndVisitorIdAndConnectionStatus(
                shareConfigId, userId, HeartSphereConnection.ConnectionStatus.ACTIVE).isPresent();
    }
    
    @Override
    public boolean canUserAccess(Long userId, String shareCode) {
        try {
            ShareConfigDTO config = shareConfigService.getShareConfigByShareCode(shareCode);
            
            // 如果是主人自己，可以访问
            if (config.getUserId().equals(userId)) {
                return true;
            }
            
            // 检查访问权限
            if ("free".equalsIgnoreCase(config.getAccessPermission())) {
                return true; // 自由访问
            }
            
            if ("approval".equalsIgnoreCase(config.getAccessPermission())) {
                // 需要审批，检查是否已连接
                return isUserConnected(userId, config.getId());
            }
            
            if ("invite".equalsIgnoreCase(config.getAccessPermission())) {
                // 邀请制，检查是否已连接（被邀请后会有连接记录）
                return isUserConnected(userId, config.getId());
            }
            
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}
