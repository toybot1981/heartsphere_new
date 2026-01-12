package com.heartsphere.admin.util;

import com.heartsphere.admin.config.EduBackendProperties;
import com.heartsphere.admin.exception.EduBackendException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * 教育版后端 HTTP 客户端
 * 用于调用 edu 后端的 API
 * 
 * 注意：当 edu 后端实现后，此客户端将调用实际的 API
 * 当前由于 edu 后端未实现，所有调用都会抛出 EduBackendException
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EduBackendClient {

    private final RestTemplate restTemplate;
    private final EduBackendProperties eduBackendProperties;

    /**
     * GET 请求
     */
    public <T> T get(String path, Class<T> responseType, Map<String, Object> queryParams) {
        return get(path, responseType, queryParams, null);
    }

    /**
     * GET 请求（带认证）
     * @param path API 路径
     * @param responseType 响应类型 Class<T>
     * @param queryParams 查询参数
     * @param adminToken 管理员 token
     * @return 响应数据
     */
    public <T> T get(String path, Class<T> responseType, Map<String, Object> queryParams, String adminToken) {
        String url = buildUrl(path);
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url);
        if (queryParams != null) {
            queryParams.forEach((key, value) -> {
                if (value != null) {
                    builder.queryParam(key, value);
                }
            });
        }
        
        HttpHeaders headers = createHeaders(adminToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);
        
        try {
            log.debug("Calling edu backend GET: {}", builder.toUriString());
            ResponseEntity<T> response = restTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.GET,
                    entity,
                    responseType
            );
            T body = response.getBody();
            if (body == null) {
                throw new EduBackendException("教育版后端返回空响应: " + path);
            }
            return body;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new EduBackendException(e.getStatusCode().value(), e.getResponseBodyAsString(), e);
        } catch (ResourceAccessException e) {
            throw new EduBackendException("无法连接到教育版后端服务: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new EduBackendException("调用教育版后端服务时发生错误: " + e.getMessage(), e);
        }
    }

    /**
     * GET 请求（使用 ParameterizedTypeReference，支持泛型类型）
     * @param path API 路径
     * @param responseType 响应类型 ParameterizedTypeReference<T>
     * @param queryParams 查询参数
     * @param adminToken 管理员 token
     * @return 响应数据
     */
    public <T> T get(String path, ParameterizedTypeReference<T> responseType, Map<String, Object> queryParams, String adminToken) {
        String url = buildUrl(path);
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url);
        if (queryParams != null) {
            queryParams.forEach((key, value) -> {
                if (value != null) {
                    builder.queryParam(key, value);
                }
            });
        }
        
        HttpHeaders headers = createHeaders(adminToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);
        
        try {
            log.debug("Calling edu backend GET (ParameterizedTypeReference): {}", builder.toUriString());
            ResponseEntity<T> response = restTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.GET,
                    entity,
                    responseType
            );
            T body = response.getBody();
            if (body == null) {
                throw new EduBackendException("教育版后端返回空响应: " + path);
            }
            return body;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new EduBackendException(e.getStatusCode().value(), e.getResponseBodyAsString(), e);
        } catch (ResourceAccessException e) {
            throw new EduBackendException("无法连接到教育版后端服务: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new EduBackendException("调用教育版后端服务时发生错误: " + e.getMessage(), e);
        }
    }

    /**
     * GET 请求（返回分页结果）
     */
    public <T> org.springframework.data.domain.Page<T> getPage(
            String path,
            ParameterizedTypeReference<org.springframework.data.domain.Page<T>> responseType,
            Map<String, Object> queryParams,
            String adminToken
    ) {
        String url = buildUrl(path);
        
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url);
        if (queryParams != null) {
            queryParams.forEach((key, value) -> {
                if (value != null) {
                    builder.queryParam(key, value);
                }
            });
        }
        
        HttpHeaders headers = createHeaders(adminToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);
        
        try {
            log.debug("Calling edu backend GET (Page): {}", builder.toUriString());
            ResponseEntity<org.springframework.data.domain.Page<T>> response = restTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.GET,
                    entity,
                    responseType
            );
            return response.getBody();
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new EduBackendException(e.getStatusCode().value(), e.getResponseBodyAsString(), e);
        } catch (ResourceAccessException e) {
            throw new EduBackendException("无法连接到教育版后端服务: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new EduBackendException("调用教育版后端服务时发生错误: " + e.getMessage(), e);
        }
    }

    /**
     * POST 请求（使用 ParameterizedTypeReference，支持泛型类型）
     */
    public <T> T post(String path, Object requestBody, ParameterizedTypeReference<T> responseType, String adminToken) {
        String url = buildUrl(path);
        HttpHeaders headers = createHeaders(adminToken);
        HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            log.debug("Calling edu backend POST (ParameterizedTypeReference): {}", url);
            ResponseEntity<T> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    responseType
            );
            T body = response.getBody();
            if (body == null) {
                throw new EduBackendException("教育版后端返回空响应: " + path);
            }
            return body;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new EduBackendException(e.getStatusCode().value(), e.getResponseBodyAsString(), e);
        } catch (ResourceAccessException e) {
            throw new EduBackendException("无法连接到教育版后端服务: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new EduBackendException("调用教育版后端服务时发生错误: " + e.getMessage(), e);
        }
    }

    /**
     * POST 请求（使用 Class 类型）
     */
    public <T> T post(String path, Object requestBody, Class<T> responseType, String adminToken) {
        String url = buildUrl(path);
        HttpHeaders headers = createHeaders(adminToken);
        HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            log.debug("Calling edu backend POST: {}", url);
            ResponseEntity<T> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    responseType
            );
            T body = response.getBody();
            if (body == null) {
                throw new EduBackendException("教育版后端返回空响应: " + path);
            }
            return body;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new EduBackendException(e.getStatusCode().value(), e.getResponseBodyAsString(), e);
        } catch (ResourceAccessException e) {
            throw new EduBackendException("无法连接到教育版后端服务: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new EduBackendException("调用教育版后端服务时发生错误: " + e.getMessage(), e);
        }
    }

    /**
     * PUT 请求（使用 Class 类型）
     */
    public <T> T put(String path, Object requestBody, Class<T> responseType, String adminToken) {
        String url = buildUrl(path);
        HttpHeaders headers = createHeaders(adminToken);
        HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            log.debug("Calling edu backend PUT: {}", url);
            ResponseEntity<T> response = restTemplate.exchange(
                    url,
                    HttpMethod.PUT,
                    entity,
                    responseType
            );
            T body = response.getBody();
            if (body == null) {
                throw new EduBackendException("教育版后端返回空响应: " + path);
            }
            return body;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new EduBackendException(e.getStatusCode().value(), e.getResponseBodyAsString(), e);
        } catch (ResourceAccessException e) {
            throw new EduBackendException("无法连接到教育版后端服务: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new EduBackendException("调用教育版后端服务时发生错误: " + e.getMessage(), e);
        }
    }

    /**
     * PUT 请求（使用 ParameterizedTypeReference，支持泛型类型）
     */
    public <T> T put(String path, Object requestBody, ParameterizedTypeReference<T> responseType, String adminToken) {
        String url = buildUrl(path);
        HttpHeaders headers = createHeaders(adminToken);
        HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            log.debug("Calling edu backend PUT (ParameterizedTypeReference): {}", url);
            ResponseEntity<T> response = restTemplate.exchange(
                    url,
                    HttpMethod.PUT,
                    entity,
                    responseType
            );
            T body = response.getBody();
            if (body == null) {
                throw new EduBackendException("教育版后端返回空响应: " + path);
            }
            return body;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new EduBackendException(e.getStatusCode().value(), e.getResponseBodyAsString(), e);
        } catch (ResourceAccessException e) {
            throw new EduBackendException("无法连接到教育版后端服务: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new EduBackendException("调用教育版后端服务时发生错误: " + e.getMessage(), e);
        }
    }

    /**
     * PATCH 请求（使用 ParameterizedTypeReference，支持泛型类型）
     */
    public <T> T patch(String path, Object requestBody, ParameterizedTypeReference<T> responseType, String adminToken) {
        String url = buildUrl(path);
        HttpHeaders headers = createHeaders(adminToken);
        HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            log.debug("Calling edu backend PATCH (ParameterizedTypeReference): {}", url);
            ResponseEntity<T> response = restTemplate.exchange(
                    url,
                    HttpMethod.PATCH,
                    entity,
                    responseType
            );
            T body = response.getBody();
            if (body == null) {
                throw new EduBackendException("教育版后端返回空响应: " + path);
            }
            return body;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new EduBackendException(e.getStatusCode().value(), e.getResponseBodyAsString(), e);
        } catch (ResourceAccessException e) {
            throw new EduBackendException("无法连接到教育版后端服务: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new EduBackendException("调用教育版后端服务时发生错误: " + e.getMessage(), e);
        }
    }

    /**
     * PATCH 请求（使用 Class 类型）
     */
    public <T> T patch(String path, Object requestBody, Class<T> responseType, String adminToken) {
        String url = buildUrl(path);
        HttpHeaders headers = createHeaders(adminToken);
        HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);
        
        try {
            log.debug("Calling edu backend PATCH: {}", url);
            ResponseEntity<T> response = restTemplate.exchange(
                    url,
                    HttpMethod.PATCH,
                    entity,
                    responseType
            );
            T body = response.getBody();
            if (body == null) {
                throw new EduBackendException("教育版后端返回空响应: " + path);
            }
            return body;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new EduBackendException(e.getStatusCode().value(), e.getResponseBodyAsString(), e);
        } catch (ResourceAccessException e) {
            throw new EduBackendException("无法连接到教育版后端服务: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new EduBackendException("调用教育版后端服务时发生错误: " + e.getMessage(), e);
        }
    }

    /**
     * DELETE 请求
     */
    public void delete(String path, String adminToken) {
        String url = buildUrl(path);
        HttpHeaders headers = createHeaders(adminToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);
        
        try {
            log.debug("Calling edu backend DELETE: {}", url);
            restTemplate.exchange(
                    url,
                    HttpMethod.DELETE,
                    entity,
                    Void.class
            );
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            throw new EduBackendException(e.getStatusCode().value(), e.getResponseBodyAsString(), e);
        } catch (ResourceAccessException e) {
            throw new EduBackendException("无法连接到教育版后端服务: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new EduBackendException("调用教育版后端服务时发生错误: " + e.getMessage(), e);
        }
    }

    /**
     * 构建完整 URL
     */
    private String buildUrl(String path) {
        String baseUrl = eduBackendProperties.getBaseUrl();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        return baseUrl + path;
    }

    /**
     * 创建 HTTP 请求头
     */
    private HttpHeaders createHeaders(String adminToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (adminToken != null && !adminToken.isEmpty()) {
            // 如果 edu 后端需要认证，将 admin token 传递给 edu 后端
            // 注意：这里可能需要转换为 edu 后端能识别的格式
            headers.set("Authorization", "Bearer " + adminToken);
        }
        return headers;
    }
}
