package com.heartsphere.edu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 教育版后端应用主类
 */
@SpringBootApplication(scanBasePackages = "com.heartsphere.edu")
@EnableScheduling
@EnableJpaRepositories(basePackages = "com.heartsphere.edu.repository")
public class EduApplication {

    public static void main(String[] args) {
        SpringApplication.run(EduApplication.class, args);
    }
}
