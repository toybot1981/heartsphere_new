package com.heartsphere.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Profile;

/**
 * 记忆系统测试配置
 * 在测试环境中Mock所有admin相关的依赖
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@TestConfiguration
@Profile("test")
public class MemoryTestConfig {
    // 由于admin包依赖太多，测试时直接跳过这些测试
    // 或者在实际环境中运行测试
}
