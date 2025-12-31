package com.heartsphere.heartconnect.interceptor;

import com.heartsphere.entity.User;
import com.heartsphere.heartconnect.context.SharedModeContext;
import com.heartsphere.heartconnect.entity.HeartSphereShareConfig;
import com.heartsphere.heartconnect.entity.HeartSphereConnection;
import com.heartsphere.heartconnect.entity.HeartSphereConnectionRequest;
import com.heartsphere.heartconnect.repository.HeartSphereShareConfigRepository;
import com.heartsphere.heartconnect.repository.HeartSphereConnectionRepository;
import com.heartsphere.heartconnect.repository.HeartSphereConnectionRequestRepository;
import com.heartsphere.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

/**
 * 共享模式拦截器
 * 检查请求头中的共享模式标识，设置共享模式上下文
 */
@Component
public class SharedModeInterceptor implements HandlerInterceptor {
    
    private static final Logger log = LoggerFactory.getLogger(SharedModeInterceptor.class);
    
    private static final String SHARED_MODE_HEADER = "X-Shared-Mode";
    private static final String SHARE_CONFIG_ID_HEADER = "X-Share-Config-Id";
    
    @Autowired
    private HeartSphereShareConfigRepository shareConfigRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private HeartSphereConnectionRepository connectionRepository;
    
    @Autowired
    private HeartSphereConnectionRequestRepository connectionRequestRepository;
    
    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        try {
            // 检查请求头中是否有共享模式标识
            String sharedMode = request.getHeader(SHARED_MODE_HEADER);
            String shareConfigIdStr = request.getHeader(SHARE_CONFIG_ID_HEADER);
            
            log.info("========== [SharedModeInterceptor] 处理请求 ==========");
            log.info("请求路径: {}", request.getRequestURI());
            log.info("请求头 X-Shared-Mode: {}", sharedMode);
            log.info("请求头 X-Share-Config-Id: {}", shareConfigIdStr);
            
            if ("true".equals(sharedMode) && shareConfigIdStr != null) {
                log.info("检测到共享模式请求头，开始处理: shareConfigId={}", shareConfigIdStr);
                try {
                    Long shareConfigId = Long.parseLong(shareConfigIdStr);
                    
                    // 验证共享配置存在
                    HeartSphereShareConfig shareConfig = shareConfigRepository.findById(shareConfigId)
                            .orElse(null);
                    
                    if (shareConfig != null && shareConfig.getShareStatus() != null && 
                        "ACTIVE".equals(shareConfig.getShareStatus().name())) {
                        
                        // 检查是否过期
                        if (shareConfig.getExpiresAt() != null && 
                            shareConfig.getExpiresAt().isBefore(LocalDateTime.now())) {
                            log.warn("共享配置已过期: shareConfigId={}", shareConfigId);
                            return true; // 继续处理，但不设置共享模式上下文
                        }
                        
                        // 获取当前用户（访问者）
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                        Long visitorId = null;
                        
                        if (authentication != null && authentication.isAuthenticated()) {
                            String username = authentication.getName();
                            User visitor = userRepository.findByUsername(username).orElse(null);
                            if (visitor != null) {
                                visitorId = visitor.getId();
                            }
                        }
                        
                        // 获取主人ID
                        Long ownerId = shareConfig.getUserId();
                        
                        // 验证访问权限
                        boolean hasAccess = false;
                        
                        if (visitorId != null && visitorId.equals(ownerId)) {
                            // 不能访问自己的共享配置
                            log.warn("用户尝试访问自己的共享配置: userId={}, shareConfigId={}", visitorId, shareConfigId);
                            return true;
                        }
                        
                        // 根据访问权限类型验证
                        HeartSphereShareConfig.AccessPermission accessPermission = shareConfig.getAccessPermission();
                        log.info("验证访问权限: shareConfigId={}, visitorId={}, accessPermission={}", 
                            shareConfigId, visitorId, accessPermission);
                        
                        if (accessPermission == HeartSphereShareConfig.AccessPermission.FREE) {
                            // 自由访问，直接允许（即使未登录也可以）
                            hasAccess = true;
                            log.info("自由访问权限，允许访问: shareConfigId={}, visitorId={}", shareConfigId, visitorId);
                        } else if (accessPermission == HeartSphereShareConfig.AccessPermission.APPROVAL) {
                            // 需要审批，检查是否有已批准的连接
                            if (visitorId != null) {
                                // 先检查是否有连接记录
                                var connectionOpt = connectionRepository
                                    .findByShareConfigIdAndVisitorIdAndConnectionStatus(
                                        shareConfigId,
                                        visitorId,
                                        HeartSphereConnection.ConnectionStatus.ACTIVE
                                    );
                                
                                hasAccess = connectionOpt.isPresent();
                                
                                if (hasAccess) {
                                    log.info("已批准的连接，允许访问: shareConfigId={}, visitorId={}", shareConfigId, visitorId);
                                } else {
                                    // 检查是否有待审批的请求
                                    var requestOpt = connectionRequestRepository
                                        .findByShareConfigIdAndRequesterId(shareConfigId, visitorId);
                                    
                                    if (requestOpt.isPresent()) {
                                        var connectionRequest = requestOpt.get();
                                        if (connectionRequest.getRequestStatus() == HeartSphereConnectionRequest.RequestStatus.PENDING) {
                                            log.warn("未找到已批准的连接，但有待审批的请求: shareConfigId={}, visitorId={}, requestId={}", 
                                                shareConfigId, visitorId, connectionRequest.getId());
                                        } else if (connectionRequest.getRequestStatus() == HeartSphereConnectionRequest.RequestStatus.APPROVED) {
                                            log.warn("请求已批准，但连接记录不存在: shareConfigId={}, visitorId={}, requestId={}", 
                                                shareConfigId, visitorId, connectionRequest.getId());
                                        } else {
                                            log.warn("未找到已批准的连接，请求状态: shareConfigId={}, visitorId={}, requestId={}, status={}", 
                                                shareConfigId, visitorId, connectionRequest.getId(), connectionRequest.getRequestStatus());
                                        }
                                    } else {
                                        log.warn("未找到已批准的连接，也没有连接请求: shareConfigId={}, visitorId={}", 
                                            shareConfigId, visitorId);
                                    }
                                }
                            } else {
                                log.warn("需要审批但用户未登录: shareConfigId={}", shareConfigId);
                            }
                        } else if (accessPermission == HeartSphereShareConfig.AccessPermission.INVITE) {
                            // 邀请连接，检查是否有已批准的连接
                            if (visitorId != null) {
                                hasAccess = connectionRepository
                                    .findByShareConfigIdAndVisitorIdAndConnectionStatus(
                                        shareConfigId,
                                        visitorId,
                                        HeartSphereConnection.ConnectionStatus.ACTIVE
                                    )
                                    .isPresent();
                                
                                if (hasAccess) {
                                    log.info("已邀请的连接，允许访问: shareConfigId={}, visitorId={}", shareConfigId, visitorId);
                                } else {
                                    log.warn("未找到已邀请的连接: shareConfigId={}, visitorId={}", shareConfigId, visitorId);
                                }
                            } else {
                                log.warn("需要邀请但用户未登录: shareConfigId={}", shareConfigId);
                            }
                        }
                        
                        // 如果有访问权限，设置共享模式上下文
                        if (hasAccess) {
                            SharedModeContext.SharedModeInfo info = 
                                new SharedModeContext.SharedModeInfo(
                                    true,
                                    shareConfigId,
                                    visitorId, // 可能为null（未登录的FREE类型）
                                    ownerId
                                );
                            SharedModeContext.set(info);
                            
                            log.info("✅ 设置共享模式上下文成功: shareConfigId={}, visitorId={}, ownerId={}, accessPermission={}", 
                                shareConfigId, visitorId, ownerId, accessPermission);
                        } else {
                            log.warn("❌ 访问权限验证失败: shareConfigId={}, visitorId={}, accessPermission={}", 
                                shareConfigId, visitorId, accessPermission);
                            
                            // 对于需要审批或邀请的共享配置，如果没有访问权限，返回 403
                            if (accessPermission == HeartSphereShareConfig.AccessPermission.APPROVAL || 
                                accessPermission == HeartSphereShareConfig.AccessPermission.INVITE) {
                                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                response.setContentType("application/json;charset=UTF-8");
                                response.getWriter().write("{\"error\":\"访问被拒绝：您还没有获得访问此共享心域的权限。请先发送连接请求并等待批准。\"}");
                                response.getWriter().flush();
                                return false; // 阻止请求继续处理
                            }
                        }
                    }
                } catch (NumberFormatException e) {
                    log.warn("无效的共享配置ID: {}", shareConfigIdStr);
                }
            }
            
            return true;
        } catch (Exception e) {
            log.error("处理共享模式拦截器失败", e);
            return true; // 继续处理请求，不中断
        }
    }
    
    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, 
                                @NonNull Object handler, @Nullable Exception ex) {
        // 请求完成后清除上下文
        SharedModeContext.clear();
    }
}

