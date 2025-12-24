package com.heartsphere.billing.config;

import com.heartsphere.billing.service.BillingInitializationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * 计费数据初始化器
 * 在应用启动后自动初始化计费数据
 */
@Slf4j
@Component
public class BillingDataInitializer implements CommandLineRunner {

    @Autowired
    private BillingInitializationService billingInitializationService;

    @Override
    public void run(String... args) {
        try {
            billingInitializationService.initializeBillingData();
        } catch (Exception e) {
            log.error("计费数据初始化失败", e);
            // 不抛出异常，避免影响应用启动
        }
    }
}

