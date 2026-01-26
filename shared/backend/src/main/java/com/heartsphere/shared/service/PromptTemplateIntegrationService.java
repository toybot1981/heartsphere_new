package com.heartsphere.shared.service;

import com.heartsphere.shared.dto.PromptRenderResponse;
import com.heartsphere.shared.entity.PromptTemplate;
import com.heartsphere.shared.repository.PromptTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 提示词模板集成服务
 * 提供统一的接口供业务代码使用提示词模板
 * 
 * 此服务已从 admin 模块迁移到 shared 模块，供 mentis、client、edu 等客户端项目共享使用。
 */
@Service
public class PromptTemplateIntegrationService {
    
    private static final Logger logger = LoggerFactory.getLogger(PromptTemplateIntegrationService.class);
    
    @Autowired
    private PromptTemplateRepository templateRepository;
    
    @Autowired
    private PromptRenderService renderService;
    
    /**
     * 根据分类代码获取启用的模板
     */
    public Optional<PromptTemplate> getTemplateByCategory(String categoryCode) {
        try {
            return templateRepository.findByCategoryCodeAndIsActiveTrue(categoryCode)
                    .stream()
                    .findFirst(); // 如果有多个，返回第一个
        } catch (Exception e) {
            // 如果表不存在或其他数据库错误，返回空Optional，使用默认提示词
            logger.warn("获取模板失败（可能表不存在），分类: {}, 错误: {}", categoryCode, e.getMessage());
            return Optional.empty();
        }
    }
    
    /**
     * 根据分类代码和名称获取模板
     */
    public Optional<PromptTemplate> getTemplateByCategoryAndName(String categoryCode, String name) {
        try {
            return templateRepository.findByCategoryCodeAndIsActiveTrue(categoryCode)
                    .stream()
                    .filter(t -> name.equals(t.getName()))
                    .findFirst();
        } catch (Exception e) {
            // 如果表不存在或其他数据库错误，返回空Optional
            logger.warn("获取模板失败（可能表不存在），分类: {}, 名称: {}, 错误: {}", 
                    categoryCode, name, e.getMessage());
            return Optional.empty();
        }
    }
    
    /**
     * 渲染模板并返回系统提示词和用户提示词
     * 
     * @param categoryCode 分类代码
     * @param variables 变量值
     * @return 渲染结果，如果模板不存在返回null
     */
    public PromptRenderResponse renderTemplate(String categoryCode, Map<String, Object> variables) {
        try {
            Optional<PromptTemplate> templateOpt = getTemplateByCategory(categoryCode);
            if (templateOpt.isEmpty()) {
                logger.info("未找到启用的模板，分类: {}，将使用默认提示词", categoryCode);
                return null;
            }
            
            PromptTemplate template = templateOpt.get();
            return renderService.render(template, variables != null ? variables : new HashMap<>());
        } catch (Exception e) {
            // 捕获所有异常（包括数据库错误），返回null以使用默认提示词
            logger.warn("渲染模板时发生错误，分类: {}, 错误: {}, 将使用默认提示词", 
                    categoryCode, e.getMessage());
            return null;
        }
    }
    
    /**
     * 渲染模板并返回系统提示词和用户提示词（带默认值）
     * 
     * @param categoryCode 分类代码
     * @param variables 变量值
     * @param defaultSystemPrompt 默认系统提示词（模板不存在时使用）
     * @param defaultUserPrompt 默认用户提示词（模板不存在时使用）
     * @return 渲染结果，包含系统提示词和用户提示词
     */
    public PromptRenderResponse renderTemplateWithFallback(
            String categoryCode,
            Map<String, Object> variables,
            String defaultSystemPrompt,
            String defaultUserPrompt) {
        
        PromptRenderResponse response = renderTemplate(categoryCode, variables);
        
        if (response == null) {
            // 使用默认值
            response = new PromptRenderResponse();
            response.setSystemPrompt(defaultSystemPrompt);
            response.setUserPrompt(defaultUserPrompt);
            response.setUsedVariables(variables != null ? variables : new HashMap<>());
            logger.info("使用默认提示词，分类: {}", categoryCode);
        }
        
        return response;
    }
    
    /**
     * 获取系统提示词（带默认值）
     */
    public String getSystemPrompt(String categoryCode, Map<String, Object> variables, String defaultPrompt) {
        PromptRenderResponse response = renderTemplateWithFallback(categoryCode, variables, defaultPrompt, "");
        return response.getSystemPrompt();
    }
    
    /**
     * 获取用户提示词（带默认值）
     */
    public String getUserPrompt(String categoryCode, Map<String, Object> variables, String defaultPrompt) {
        PromptRenderResponse response = renderTemplateWithFallback(categoryCode, variables, "", defaultPrompt);
        return response.getUserPrompt();
    }
    
    /**
     * 获取完整的提示词对（系统提示词和用户提示词）
     */
    public PromptRenderResponse getPrompts(
            String categoryCode,
            Map<String, Object> variables,
            String defaultSystemPrompt,
            String defaultUserPrompt) {
        return renderTemplateWithFallback(categoryCode, variables, defaultSystemPrompt, defaultUserPrompt);
    }
}
