package com.heartsphere.websearch.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.websearch.config.TavilyConfig;
import com.heartsphere.websearch.dto.TavilySearchRequest;
import com.heartsphere.websearch.dto.TavilySearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * Tavily API客户端
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TavilyClient {

    private final TavilyConfig tavilyConfig;
    private final ObjectMapper objectMapper;

    private OkHttpClient httpClient;

    /**
     * 获取HTTP客户端(懒加载)
     */
    private OkHttpClient getHttpClient() {
        if (httpClient == null) {
            httpClient = new OkHttpClient.Builder()
                    .connectTimeout(tavilyConfig.getTimeout(), TimeUnit.MILLISECONDS)
                    .readTimeout(tavilyConfig.getTimeout(), TimeUnit.MILLISECONDS)
                    .writeTimeout(tavilyConfig.getTimeout(), TimeUnit.MILLISECONDS)
                    .addInterceptor(new RetryInterceptor(tavilyConfig.getMaxRetries()))
                    .build();
        }
        return httpClient;
    }

    /**
     * 执行搜索
     *
     * @param request 搜索请求
     * @return 搜索响应
     * @throws IOException API调用失败
     */
    public TavilySearchResponse search(TavilySearchRequest request) throws IOException {
        String url = tavilyConfig.getBaseUrl() + "/search";

        log.debug("调用Tavily API: query={}, maxResults={}", request.getQuery(), request.getMaxResults());

        String jsonBody = objectMapper.writeValueAsString(request);
        RequestBody body = RequestBody.create(
                jsonBody,
                MediaType.parse("application/json; charset=utf-8")
        );

        Request httpRequest = new Request.Builder()
                .url(url)
                .post(body)
                .addHeader("Content-Type", "application/json")
                .build();

        try (Response response = getHttpClient().newCall(httpRequest).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                log.error("Tavily API调用失败: code={}, body={}", response.code(), errorBody);
                throw new IOException("Tavily API调用失败: " + response.code() + " - " + errorBody);
            }

            String responseBody = response.body().string();
            log.debug("Tavily API响应成功: query={}, results={}", request.getQuery(),
                    responseBody.length());

            return objectMapper.readValue(responseBody, TavilySearchResponse.class);
        }
    }

    /**
     * 重试拦截器
     */
    private static class RetryInterceptor implements Interceptor {
        private final int maxRetries;

        public RetryInterceptor(int maxRetries) {
            this.maxRetries = maxRetries;
        }

        @Override
        public Response intercept(Chain chain) throws IOException {
            Request request = chain.request();
            Response response = null;
            IOException lastException = null;

            for (int i = 0; i <= maxRetries; i++) {
                try {
                    response = chain.proceed(request);
                    if (response.isSuccessful()) {
                        return response;
                    }

                    // 对于4xx错误不重试
                    if (response.code() >= 400 && response.code() < 500) {
                        return response;
                    }

                    // 关闭响应以便重试
                    if (response != null) {
                        response.close();
                    }

                    // 指数退避
                    if (i < maxRetries) {
                        try {
                            Thread.sleep(1000L * (1L << i));
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            throw new IOException("重试被中断", e);
                        }
                    }
                } catch (IOException e) {
                    lastException = e;

                    if (i < maxRetries) {
                        try {
                            Thread.sleep(1000L * (1L << i));
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new IOException("重试被中断", ie);
                        }
                    }
                }
            }

            throw lastException != null ? lastException : new IOException("最大重试次数已用尽");
        }
    }
}
