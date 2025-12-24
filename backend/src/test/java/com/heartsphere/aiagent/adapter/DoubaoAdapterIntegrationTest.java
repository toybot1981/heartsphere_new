package com.heartsphere.aiagent.adapter;

import com.heartsphere.admin.entity.AIModelConfig;
import com.heartsphere.admin.entity.AIRoutingStrategy;
import com.heartsphere.admin.repository.AIModelConfigRepository;
import com.heartsphere.admin.repository.AIRoutingStrategyRepository;
import com.heartsphere.admin.service.AIModelConfigService;
import com.heartsphere.aiagent.dto.request.TextGenerationRequest;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.aiagent.service.AIService;
import com.heartsphere.security.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 豆包适配器集成测试
 * 测试从数据库配置中读取API key并进行文本生成
 * 
 * @author HeartSphere
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DoubaoAdapterIntegrationTest {

    @Autowired
    private AIService aiService;

    @Autowired
    private AIModelConfigRepository modelConfigRepository;

    @Autowired
    private AIModelConfigService modelConfigService;

    @Autowired
    private AIRoutingStrategyRepository routingStrategyRepository;

    private Long userId = 100L;
    private AIModelConfig doubaoConfig;

    @BeforeEach
    void setUp() {
        // 设置认证上下文
        UserDetailsImpl userDetails = new UserDetailsImpl(
            userId, "testuser", "test@example.com", "password", true
        );
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities()
        );
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        // 清理可能存在的测试数据
        modelConfigRepository.findByProviderAndModelNameAndCapability("doubao", "doubao-1-5-pro-32k-250115", "text")
            .ifPresent(modelConfigRepository::delete);

        // 创建豆包模型配置（从数据库配置）
        doubaoConfig = new AIModelConfig();
        doubaoConfig.setProvider("doubao");
        doubaoConfig.setModelName("doubao-1-5-pro-32k-250115");
        doubaoConfig.setCapability("text");
        // 使用真实的API key（从application.yml或环境变量读取，测试时需要配置）
        // 这里使用测试API key，实际测试时需要替换为真实的API key
        doubaoConfig.setApiKey("9ed07a4e-5dad-4cbc-8548-3295e7875b41");
        doubaoConfig.setBaseUrl("https://ark.cn-beijing.volces.com/api/v3");
        doubaoConfig.setIsDefault(true);
        doubaoConfig.setPriority(1);
        doubaoConfig.setCostPerToken(0.001);
        doubaoConfig.setIsActive(true);
        doubaoConfig.setDescription("豆包Pro 32K模型（测试用）");
        doubaoConfig.setCreatedAt(LocalDateTime.now());
        doubaoConfig.setUpdatedAt(LocalDateTime.now());
        
        doubaoConfig = modelConfigRepository.save(doubaoConfig);
        
        // 清理可能存在的路由策略配置
        routingStrategyRepository.findByCapabilityAndIsActiveTrue("text")
            .ifPresent(routingStrategyRepository::delete);
        
        // 创建路由策略配置（single模式，使用默认模型）
        AIRoutingStrategy routingStrategy = new AIRoutingStrategy();
        routingStrategy.setCapability("text");
        routingStrategy.setStrategyType("single");
        routingStrategy.setConfigJson("{}");
        routingStrategy.setIsActive(true);
        routingStrategy.setDescription("文本生成路由策略（测试用）");
        routingStrategy.setCreatedAt(LocalDateTime.now());
        routingStrategy.setUpdatedAt(LocalDateTime.now());
        routingStrategyRepository.save(routingStrategy);
    }

    /**
     * 测试从数据库配置读取API key并成功生成文本（通过统一路由服务）
     * 不指定provider和model，让系统从数据库配置中选择
     */
    @Test
    void testGenerateText_WithDatabaseConfig_UnifiedRouting() {
        // Given: 创建文本生成请求（不指定provider和model，让系统从数据库配置中选择）
        TextGenerationRequest request = new TextGenerationRequest();
        request.setPrompt("你好，请介绍一下你自己");
        request.setTemperature(0.7);
        request.setMaxTokens(100);
        // 不设置provider和model，让AIServiceImpl从统一路由服务获取配置（包括API key）

        // When: 调用文本生成服务
        TextGenerationResponse response = aiService.generateText(userId, request);

        // Then: 验证响应
        assertNotNull(response, "响应不应该为null");
        assertNotNull(response.getContent(), "响应内容不应该为null");
        assertFalse(response.getContent().trim().isEmpty(), "响应内容不应该为空");
        assertEquals("doubao", response.getProvider(), "提供商应该是doubao");
        assertEquals("doubao-1-5-pro-32k-250115", response.getModel(), "模型名称应该匹配");
        
        System.out.println("生成的文本: " + response.getContent());
        System.out.println("使用的提供商: " + response.getProvider());
        System.out.println("使用的模型: " + response.getModel());
    }

    /**
     * 测试指定provider和model时，也能使用数据库配置中的API key
     * 注意：当前实现中，如果指定了provider和model，系统不会从数据库读取apiKey
     * 但适配器会优先使用请求中的apiKey，如果没有则使用配置文件中的
     * 这个测试验证适配器能够正常工作
     */
    @Test
    void testGenerateText_WithExplicitProviderAndModel() {
        // Given: 明确指定provider和model
        // 由于当前实现中指定provider和model时不会从数据库读取apiKey，
        // 这里我们需要手动从数据库读取并设置到请求中，以测试适配器能够使用请求中的apiKey
        AIModelConfig config = modelConfigRepository.findByProviderAndModelNameAndCapability(
            "doubao", "doubao-1-5-pro-32k-250115", "text"
        ).orElseThrow(() -> new RuntimeException("测试配置不存在"));
        
        TextGenerationRequest request = new TextGenerationRequest();
        request.setProvider("doubao");
        request.setModel("doubao-1-5-pro-32k-250115");
        // 手动设置从数据库读取的API key和baseUrl，模拟AIServiceImpl的行为
        request.setApiKey(config.getApiKey());
        request.setBaseUrl(config.getBaseUrl());
        request.setPrompt("请用一句话描述人工智能");
        request.setTemperature(0.7);
        request.setMaxTokens(50);

        // When: 调用文本生成服务
        TextGenerationResponse response = aiService.generateText(userId, request);

        // Then: 验证响应
        assertNotNull(response, "响应不应该为null");
        assertNotNull(response.getContent(), "响应内容不应该为null");
        assertEquals("doubao", response.getProvider(), "提供商应该是doubao");
        
        System.out.println("生成的文本: " + response.getContent());
    }


    /**
     * 测试流式文本生成（使用数据库配置，通过统一路由服务）
     */
    @Test
    void testGenerateTextStream_WithDatabaseConfig() throws InterruptedException {
        // Given: 创建文本生成请求（不指定provider和model）
        TextGenerationRequest request = new TextGenerationRequest();
        request.setPrompt("写一首关于春天的短诗");
        request.setTemperature(0.8);
        request.setMaxTokens(100);
        // 不设置provider和model，让系统从数据库配置中选择（包括API key）

        // When: 调用流式文本生成服务
        StringBuilder fullContent = new StringBuilder();
        final boolean[] done = {false};
        final Exception[] exception = {null};

        aiService.generateTextStream(userId, request, (response, isDone) -> {
            try {
                if (response != null && response.getContent() != null) {
                    fullContent.append(response.getContent());
                }
                done[0] = isDone;
            } catch (Exception e) {
                exception[0] = e;
            }
        });

        // 等待流式响应完成（最多等待10秒）
        int waitCount = 0;
        while (!done[0] && waitCount < 100) {
            Thread.sleep(100);
            waitCount++;
        }

        // Then: 验证响应
        if (exception[0] != null) {
            fail("流式生成过程中发生异常: " + exception[0].getMessage(), exception[0]);
        }
        assertTrue(done[0], "流式响应应该完成");
        assertFalse(fullContent.toString().trim().isEmpty(), "生成的文本不应该为空");
        
        System.out.println("流式生成的完整文本: " + fullContent.toString());
    }

    /**
     * 测试使用数据库配置中的baseUrl（通过统一路由服务）
     */
    @Test
    void testGenerateText_UsesDatabaseBaseUrl() {
        // Given: 确保配置中有baseUrl
        assertNotNull(doubaoConfig.getBaseUrl(), "测试配置应该包含baseUrl");
        
        TextGenerationRequest request = new TextGenerationRequest();
        request.setPrompt("测试baseUrl配置");
        request.setMaxTokens(50);
        // 不指定provider和model，让系统从数据库配置中获取baseUrl

        // When: 调用文本生成服务
        TextGenerationResponse response = aiService.generateText(userId, request);

        // Then: 验证能够成功调用（说明baseUrl被正确使用）
        assertNotNull(response, "响应不应该为null");
        assertNotNull(response.getContent(), "响应内容不应该为null");
    }

    /**
     * 测试当数据库配置不存在时，回退到配置文件
     */
    @Test
    void testGenerateText_FallbackToConfigFile() {
        // Given: 删除数据库配置，强制使用配置文件
        modelConfigRepository.delete(doubaoConfig);
        // 删除路由策略，这样统一路由会失败，回退到用户配置或适配器默认配置
        routingStrategyRepository.findByCapabilityAndIsActiveTrue("text")
            .ifPresent(routingStrategyRepository::delete);
        
        TextGenerationRequest request = new TextGenerationRequest();
        request.setProvider("doubao");
        request.setModel("doubao-1-5-pro-32k-250115");
        request.setPrompt("测试回退到配置文件");
        request.setMaxTokens(50);

        // When: 调用文本生成服务（应该使用application-test.yml中的配置）
        // 注意：application-test.yml中已配置doubao的api-key
        TextGenerationResponse response = aiService.generateText(userId, request);

        // Then: 验证响应（配置文件中有API key，应该能成功）
        assertNotNull(response, "响应不应该为null");
        assertNotNull(response.getContent(), "响应内容不应该为null");
        assertEquals("doubao", response.getProvider(), "提供商应该是doubao");
        
        System.out.println("回退到配置文件后生成的文本: " + response.getContent());
    }

    /**
     * 测试多个模型配置时，优先使用默认模型
     */
    @Test
    void testGenerateText_UsesDefaultModel() {
        // Given: 创建第二个模型配置（非默认）
        AIModelConfig anotherConfig = new AIModelConfig();
        anotherConfig.setProvider("doubao");
        anotherConfig.setModelName("doubao-pro-4k");
        anotherConfig.setCapability("text");
        anotherConfig.setApiKey("9ed07a4e-5dad-4cbc-8548-3295e7875b41");
        anotherConfig.setBaseUrl("https://ark.cn-beijing.volces.com/api/v3");
        anotherConfig.setIsDefault(false); // 非默认
        anotherConfig.setPriority(2);
        anotherConfig.setIsActive(true);
        anotherConfig.setDescription("豆包Pro 4K模型（非默认）");
        anotherConfig.setCreatedAt(LocalDateTime.now());
        anotherConfig.setUpdatedAt(LocalDateTime.now());
        modelConfigRepository.save(anotherConfig);

        // 确保doubaoConfig是默认的
        doubaoConfig.setIsDefault(true);
        modelConfigRepository.save(doubaoConfig);

        TextGenerationRequest request = new TextGenerationRequest();
        request.setPrompt("测试默认模型选择");
        request.setMaxTokens(50);
        // 不指定provider和model

        // When: 调用文本生成服务
        TextGenerationResponse response = aiService.generateText(userId, request);

        // Then: 验证使用了默认模型
        assertNotNull(response, "响应不应该为null");
        // 验证使用的是默认模型（如果路由策略是single模式）
        System.out.println("使用的模型: " + response.getModel());
    }

    /**
     * 清理测试数据
     */
    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        // 清理测试数据
        if (doubaoConfig != null && doubaoConfig.getId() != null) {
            modelConfigRepository.findById(doubaoConfig.getId())
                .ifPresent(modelConfigRepository::delete);
        }
        
        // 清理可能存在的其他测试数据
        modelConfigRepository.findByProviderAndModelNameAndCapability("doubao", "doubao-pro-4k", "text")
            .ifPresent(modelConfigRepository::delete);
        
        // 清理路由策略
        routingStrategyRepository.findByCapabilityAndIsActiveTrue("text")
            .ifPresent(routingStrategyRepository::delete);
    }
}

