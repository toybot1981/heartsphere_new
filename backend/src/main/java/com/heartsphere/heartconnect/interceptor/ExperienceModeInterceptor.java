package com.heartsphere.heartconnect.interceptor;

import com.heartsphere.entity.User;
import com.heartsphere.heartconnect.context.ExperienceModeContext;
import com.heartsphere.heartconnect.entity.HeartSphereShareConfig;
import com.heartsphere.heartconnect.repository.HeartSphereShareConfigRepository;
import com.heartsphere.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 体验模式拦截器
 * 检查请求头中的体验模式标识，设置体验模式上下文
 */
@Component
public class ExperienceModeInterceptor implements HandlerInterceptor {
    
    private static final Logger log = LoggerFactory.getLogger(ExperienceModeInterceptor.class);
    
    private static final String EXPERIENCE_MODE_HEADER = "X-Experience-Mode";
    private static final String SHARE_CONFIG_ID_HEADER = "X-Share-Config-Id";
    
    @Autowired
    private HeartSphereShareConfigRepository shareConfigRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        try {
            // 检查请求头中是否有体验模式标识
            String experienceMode = request.getHeader(EXPERIENCE_MODE_HEADER);
            String shareConfigIdStr = request.getHeader(SHARE_CONFIG_ID_HEADER);
            
            if ("true".equals(experienceMode) && shareConfigIdStr != null) {
                try {
                    Long shareConfigId = Long.parseLong(shareConfigIdStr);
                    
                    // 验证共享配置存在
                    HeartSphereShareConfig shareConfig = shareConfigRepository.findById(shareConfigId)
                            .orElse(null);
                    
                    if (shareConfig != null && shareConfig.getShareStatus() != null && 
                        "ACTIVE".equals(shareConfig.getShareStatus().name())) {
                        // 获取当前用户（访问者）
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                        if (authentication != null && authentication.isAuthenticated()) {
                            String username = authentication.getName();
                            User visitor = userRepository.findByUsername(username).orElse(null);
                            
                            if (visitor != null) {
                                // 获取主人ID
                                Long ownerId = shareConfig.getUserId();
                                
                                // 设置体验模式上下文
                                ExperienceModeContext.ExperienceModeInfo info = 
                                    new ExperienceModeContext.ExperienceModeInfo(
                                        true,
                                        shareConfigId,
                                        visitor.getId(),
                                        ownerId
                                    );
                                ExperienceModeContext.set(info);
                                
                                log.debug("设置体验模式上下文: shareConfigId={}, visitorId={}, ownerId={}", 
                                    shareConfigId, visitor.getId(), ownerId);
                            }
                        }
                    }
                } catch (NumberFormatException e) {
                    log.warn("无效的共享配置ID: {}", shareConfigIdStr);
                }
            }
            
            return true;
        } catch (Exception e) {
            log.error("处理体验模式拦截器失败", e);
            return true; // 继续处理请求，不中断
        }
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                                Object handler, Exception ex) {
        // 请求完成后清除上下文
        ExperienceModeContext.clear();
    }
}

