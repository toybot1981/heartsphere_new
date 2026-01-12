package com.heartsphere.company;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 公司官网后端应用主类
 */
@SpringBootApplication(scanBasePackages = "com.heartsphere.company")
public class CompanyApplication {

    public static void main(String[] args) {
        SpringApplication.run(CompanyApplication.class, args);
    }
}
