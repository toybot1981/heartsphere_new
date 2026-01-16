package com.heartsphere.util;

import com.heartsphere.entity.Membership;
import com.heartsphere.service.MembershipService;
import com.heartsphere.security.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * 游客访问检查工具类
 */
public class GuestAccessChecker {
    
    /**
     * 游客功能受限错误消息
     */
    public static final String GUEST_ACCESS_DENIED_MESSAGE = "此功能需要注册正式用户，请先注册";
    
    private final MembershipService membershipService;
    
    public GuestAccessChecker(MembershipService membershipService) {
        this.membershipService = membershipService;
    }
    
    /**
     * 检查当前用户是否为游客（体验会员）
     * @return true 如果是游客，false 如果是正式用户
     */
    public boolean isGuest() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return false;
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        Optional<Membership> membership = membershipService.getUserMembership(userId);
        if (membership.isEmpty()) {
            return false;
        }
        
        return "trial".equals(membership.get().getPlanType());
    }
    
    /**
     * 检查当前用户是否为正式用户（非体验会员）
     * @return true 如果是正式用户，false 如果是游客
     */
    public boolean isRegisteredUser() {
        return !isGuest();
    }
    
    /**
     * 静态方法：检查当前用户是否为游客
     * 注意：需要手动注入 MembershipService
     */
    public static boolean isGuest(MembershipService membershipService) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return false;
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        Optional<Membership> membership = membershipService.getUserMembership(userId);
        if (membership.isEmpty()) {
            return false;
        }
        
        return "trial".equals(membership.get().getPlanType());
    }
}
