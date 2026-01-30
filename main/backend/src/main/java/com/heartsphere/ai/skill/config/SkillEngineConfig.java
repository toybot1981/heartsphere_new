package com.heartsphere.ai.skill.config;

import com.heartsphere.ai.skill.engine.LLMSkillApplicationEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

/**
 * 技能引擎配置
 * 管理纯 LLM 驱动引擎的初始化
 * 
 * @author HeartSphere
 * @version 2.0
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class SkillEngineConfig {
    
    private final SkillSelectionConfig selectionConfig;
    private final LLMSkillApplicationEngine llmEngine;
    
    /**
     * 初始化引擎配置
     */
    @PostConstruct
    public void init() {
        if (selectionConfig.getLlmDriven().isEnabled()) {
            log.info("✅ 纯 LLM 驱动的技能应用引擎已启用");
        } else {
            log.warn("⚠️ LLM 驱动未启用，技能选择将返回空结果。请设置 skill.selection.llm-driven.enabled=true");
        }
    }
}
