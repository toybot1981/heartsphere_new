package com.heartsphere;

import com.heartsphere.security.UserDetailsImpl;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Collections;

@SpringBootTest
@ActiveProfiles("test")
public class TestConfig {

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public Authentication mockAuthentication() {
            // 创建一个模拟的用户详情
            UserDetailsImpl userDetails = new UserDetailsImpl(
                    1L, // id
                    "testuser", // username
                    "test@example.com", // email
                    "$2a$10$gHFHG4sSpI2g3kZZaamTruWFei7SbmWGZIRwPqRe5S08C/N8/ZEkq", // password
                    true // enabled
            );

            // 创建并设置认证信息
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            
            // 设置安全上下文
            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);
            
            return authentication;
        }
    }
}
