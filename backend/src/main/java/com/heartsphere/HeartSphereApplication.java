package com.heartsphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.heartsphere"})
public class HeartSphereApplication {

    public static void main(String[] args) {
        SpringApplication.run(HeartSphereApplication.class, args);
    }

}