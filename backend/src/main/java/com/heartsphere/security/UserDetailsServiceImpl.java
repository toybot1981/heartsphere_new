package com.heartsphere.security;

import com.heartsphere.entity.User;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.SystemAdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemAdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 首先尝试从 User 表中查找
        java.util.Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            return UserDetailsImpl.build(userOpt.get());
        }

        // 如果 User 表中找不到，尝试从 SystemAdmin 表中查找
        java.util.Optional<SystemAdmin> adminOpt = adminRepository.findByUsername(username);
        if (adminOpt.isPresent()) {
            SystemAdmin admin = adminOpt.get();
            // 检查管理员账户是否激活
            if (!admin.getIsActive()) {
                throw new UsernameNotFoundException("Admin account is disabled: " + username);
            }
            return UserDetailsImpl.buildFromAdmin(admin);
        }

        // 如果都找不到，抛出异常
        throw new UsernameNotFoundException("User Not Found with username: " + username);
    }
}