package com.heartsphere.admin.controller;

import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.service.AdminAuthService;
import com.heartsphere.shared.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * 管理员控制器基类
 * 提供通用的管理员认证和异常处理功能
 */
public abstract class BaseAdminController {

    @Autowired
    protected AdminAuthService adminAuthService;

    /**
     * 验证管理员token（用于从Controller方法的@RequestHeader参数获取的场景）
     * @param authHeader Authorization请求头
     * @return 管理员实体
     * @throws RuntimeException 如果认证失败
     */
    protected SystemAdmin validateAdmin(String authHeader) {
        return validateAdminToken(authHeader);
    }

    /**
     * 验证管理员token（用于手动从HttpServletRequest获取header的场景）
     * @param authHeader Authorization请求头字符串
     * @return 管理员实体
     * @throws RuntimeException 如果认证失败
     */
    protected SystemAdmin validateAdminToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("需要管理员认证");
        }
        try {
            String token = authHeader.substring(7);
            return adminAuthService.validateToken(token);
        } catch (RuntimeException e) {
            // 将认证失败转换为 UnauthorizedException
            throw new UnauthorizedException("认证失败: " + e.getMessage());
        }
    }
}




