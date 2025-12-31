package com.heartsphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableJpaRepositories(
    basePackages = {
        "com.heartsphere.repository",
        "com.heartsphere.billing.repository",
        "com.heartsphere.aiagent.repository",
        "com.heartsphere.heartconnect.repository",
        "com.heartsphere.quickconnect.repository",
        "com.heartsphere.admin.repository",
        "com.heartsphere.payment.repository",
        "com.heartsphere.emotion.repository",
        "com.heartsphere.mailbox.repository",
        "com.heartsphere.memory.repository",
        "com.heartsphere.memory.repository.jpa"
    }
)
public class HeartSphereApplication {

    public static void main(String[] args) {
        SpringApplication.run(HeartSphereApplication.class, args);
    }

}