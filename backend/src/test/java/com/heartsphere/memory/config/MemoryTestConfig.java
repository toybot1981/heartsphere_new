package com.heartsphere.memory.config;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Profile;

/**
 * 记忆系统测试配置
 * 排除不需要的组件，只加载记忆系统相关的组件
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@TestConfiguration
@Profile("test")
@EnableAutoConfiguration(exclude = {
    MailSenderAutoConfiguration.class
})
@ComponentScan(
    basePackages = {
        "com.heartsphere.memory",
        "com.heartsphere.config"  // 需要Redis和MongoDB配置
    },
    excludeFilters = {
        @ComponentScan.Filter(type = FilterType.REGEX, pattern = "com\\.heartsphere\\.admin\\..*"),
        @ComponentScan.Filter(type = FilterType.REGEX, pattern = "com\\.heartsphere\\.controller\\..*"),
        @ComponentScan.Filter(type = FilterType.REGEX, pattern = "com\\.heartsphere\\.service\\..*"),
        @ComponentScan.Filter(type = FilterType.REGEX, pattern = "com\\.heartsphere\\.security\\..*")
    }
)
public class MemoryTestConfig {
    // 测试配置类
}




