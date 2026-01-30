package com.heartsphere.admin.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Flyway 配置：在 migrate 前执行 repair，清除数据库中已应用但本地文件已删除的迁移记录。
 * 适用于迁移文件被有意删除或不在当前代码库中的情况。
 */
@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
