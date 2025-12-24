package com.heartsphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HeartSphereApplication {

    public static void main(String[] args) {
        SpringApplication.run(HeartSphereApplication.class, args);
    }

}