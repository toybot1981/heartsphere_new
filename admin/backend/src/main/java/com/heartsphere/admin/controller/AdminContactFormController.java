package com.heartsphere.admin.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * 管理员联系表单管理控制器
 * 从 main 后端获取联系表单数据
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/contact-forms")
@RequiredArgsConstructor
public class AdminContactFormController extends BaseAdminController {
    
    private final RestTemplate restTemplate;
    
    @Value("${main.backend.url:http://localhost:8081}")
    private String mainBackendUrl;
    
    /**
     * 获取所有联系表单（分页）
     */
    @GetMapping
    public ResponseEntity<Page<Map<String, Object>>> getAllContactForms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean unprocessed,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        try {
            // 构建请求URL
            String url = mainBackendUrl + "/api/admin/contact-forms?page=" + page + "&size=" + size;
            if (unprocessed != null) {
                url += "&unprocessed=" + unprocessed;
            }
            
            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<?> entity = new HttpEntity<>(headers);
            
            // 调用 main 后端 API
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("data")) {
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                List<Map<String, Object>> content = (List<Map<String, Object>>) data.get("content");
                Long totalElements = ((Number) data.get("totalElements")).longValue();
                
                Page<Map<String, Object>> pageResult = new PageImpl<>(content, Pageable.ofSize(size).withPage(page), totalElements);
                return ResponseEntity.ok(pageResult);
            }
            
            return ResponseEntity.ok(new PageImpl<>(List.of()));
        } catch (Exception e) {
            log.error("获取联系表单失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 获取单个联系表单详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getContactFormById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        try {
            String url = mainBackendUrl + "/api/admin/contact-forms/" + id;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<?> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("获取联系表单详情失败: id={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 标记联系表单为已处理
     */
    @PostMapping("/{id}/mark-processed")
    public ResponseEntity<Map<String, Object>> markAsProcessed(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        try {
            String url = mainBackendUrl + "/api/admin/contact-forms/" + id + "/mark-processed";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("标记联系表单为已处理失败: id={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
