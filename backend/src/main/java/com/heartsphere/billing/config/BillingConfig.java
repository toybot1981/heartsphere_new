package com.heartsphere.billing.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

/**
 * 计费模块配置
 */
@Configuration
@EnableAspectJAutoProxy
@ComponentScan(basePackages = "com.heartsphere.billing")
public class BillingConfig {
    // 配置类，启用AOP
}

