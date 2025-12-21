package com.heartsphere.admin.controller;

import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.service.AdminAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * 管理员控制器基类
 * 提供通用的管理员认证和异常处理功能
 */
@CrossOrigin(origins = "*")
public abstract class BaseAdminController {

    @Autowired
    protected AdminAuthService adminAuthService;

    /**
     * 验证管理员token
     * @param authHeader Authorization请求头
     * @return 管理员实体
     * @throws RuntimeException 如果认证失败
     */
    protected SystemAdmin validateAdmin(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("需要管理员认证");
        }
        String token = authHeader.substring(7);
        return adminAuthService.validateToken(token);
    }
}

