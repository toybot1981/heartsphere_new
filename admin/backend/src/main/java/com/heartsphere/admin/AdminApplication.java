package com.heartsphere.admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 统一管理后台后端应用主类
 */
@SpringBootApplication(scanBasePackages = {"com.heartsphere.admin", "com.heartsphere.shared"})
@EnableScheduling
// JPA配置已移至JpaConfig类，这里不再重复配置
@EntityScan(basePackages = {"com.heartsphere.admin.entity", "com.heartsphere.shared.entity"})
public class AdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdminApplication.class, args);
    }
}
