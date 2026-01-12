package com.heartsphere.mentis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Mentis 超级智能体后端应用主类
 */
@SpringBootApplication(scanBasePackages = {"com.heartsphere.mentis", "com.heartsphere.shared"})
@EnableScheduling
@EntityScan(basePackages = {"com.heartsphere.mentis.entity", "com.heartsphere.mentis.demo.model", "com.heartsphere.shared.entity"})
@EnableJpaRepositories(basePackages = {"com.heartsphere.mentis.repository", "com.heartsphere.mentis.demo.repository", "com.heartsphere.shared.repository"})
public class MentisApplication {

    public static void main(String[] args) {
        SpringApplication.run(MentisApplication.class, args);
    }
}
