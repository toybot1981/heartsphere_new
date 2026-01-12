package com.heartsphere.admin.service.impl;

import com.heartsphere.admin.service.MentisSyncService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Mentis 同步服务实现
 */
@Service
@Slf4j
public class MentisSyncServiceImpl implements MentisSyncService {
    
    private final RestTemplate restTemplate;
    
    @Value("${mentis.backend.base-url:http://localhost:8082}")
    private String mentisBackendBaseUrl;
    
    public MentisSyncServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    @Override
    public void notifyMentisReload() {
        try {
            String url = mentisBackendBaseUrl + "/api/mentis/admin/reload-configs";
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            restTemplate.exchange(url, HttpMethod.POST, entity, Void.class);
            log.info("Successfully notified Mentis backend to reload configurations");
        } catch (Exception e) {
            log.warn("Failed to notify Mentis backend to reload configurations: {}", e.getMessage());
            // 不抛出异常，允许继续执行
        }
    }
}
