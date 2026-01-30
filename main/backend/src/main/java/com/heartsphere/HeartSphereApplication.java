package com.heartsphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = {"com.heartsphere", "com.heartsphere.shared"})
@EnableAsync
@EnableScheduling
@EnableJpaRepositories(
    basePackages = {
        "com.heartsphere.repository",
        "com.heartsphere.billing.repository",
        "com.heartsphere.aiagent.repository",
        "com.heartsphere.ai.skill.repository",
        "com.heartsphere.ai.mcp.repository",
        "com.heartsphere.heartconnect.repository",
        "com.heartsphere.heartconnect.portal.repository",
        "com.heartsphere.quickconnect.repository",
        "com.heartsphere.payment.repository",
        "com.heartsphere.emotion.repository",
        "com.heartsphere.capability.repository",
        "com.heartsphere.mailbox.repository",
        "com.heartsphere.memory.repository.jpa",
        "com.heartsphere.skill.repository",
        "com.heartsphere.plugin.repository",
        "com.heartsphere.plugin.plugins.photoalbum.repository",
        "com.heartsphere.shared.repository"
    }
)
public class HeartSphereApplication {

    public static void main(String[] args) {
        SpringApplication.run(HeartSphereApplication.class, args);
    }

}