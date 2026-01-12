package com.heartsphere.memory.config;

import com.heartsphere.memory.service.MemoryExtractor;
import com.heartsphere.memory.service.impl.LLMMemoryExtractor;
import com.heartsphere.memory.service.impl.RuleBasedMemoryExtractor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * 记忆提取器配置
 * 根据配置选择使用LLM提取器或规则提取器
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Configuration
@RequiredArgsConstructor
public class MemoryExtractorConfig {
    
    private final LLMMemoryExtractor llmMemoryExtractor;
    private final RuleBasedMemoryExtractor ruleBasedMemoryExtractor;
    
    @Value("${heartsphere.memory.extraction.enable-llm-extraction:true}")
    private boolean enableLlmExtraction;
    
    /**
     * 创建组合提取器
     * 优先使用LLM提取器，如果失败则使用规则提取器
     */
    @Bean
    @Primary
    public MemoryExtractor memoryExtractor() {
        return new CompositeMemoryExtractor(llmMemoryExtractor, ruleBasedMemoryExtractor, enableLlmExtraction);
    }
    
    /**
     * 组合提取器
     * 结合LLM和规则提取器，提供降级机制
     */
    @RequiredArgsConstructor
    private static class CompositeMemoryExtractor implements MemoryExtractor {
        private final LLMMemoryExtractor llmExtractor;
        private final RuleBasedMemoryExtractor ruleExtractor;
        private final boolean preferLlm;
        
        @Override
        public java.util.List<com.heartsphere.memory.model.UserFact> extractFacts(
                String userId, java.util.List<com.heartsphere.memory.model.ChatMessage> messages) {
            if (preferLlm) {
                try {
                    java.util.List<com.heartsphere.memory.model.UserFact> facts = 
                        llmExtractor.extractFacts(userId, messages);
                    if (facts != null && !facts.isEmpty()) {
                        return facts;
                    }
                } catch (Exception e) {
                    // LLM提取失败，降级到规则提取
                }
            }
            // 使用规则提取器
            return ruleExtractor.extractFacts(userId, messages);
        }
        
        @Override
        public java.util.List<com.heartsphere.memory.model.UserPreference> extractPreferences(
                String userId, java.util.List<com.heartsphere.memory.model.ChatMessage> messages) {
            if (preferLlm) {
                try {
                    java.util.List<com.heartsphere.memory.model.UserPreference> preferences = 
                        llmExtractor.extractPreferences(userId, messages);
                    if (preferences != null && !preferences.isEmpty()) {
                        return preferences;
                    }
                } catch (Exception e) {
                    // LLM提取失败，降级到规则提取
                }
            }
            return ruleExtractor.extractPreferences(userId, messages);
        }
        
        @Override
        public java.util.List<com.heartsphere.memory.model.UserMemory> extractMemories(
                String userId, java.util.List<com.heartsphere.memory.model.ChatMessage> messages) {
            if (preferLlm) {
                try {
                    java.util.List<com.heartsphere.memory.model.UserMemory> memories = 
                        llmExtractor.extractMemories(userId, messages);
                    if (memories != null && !memories.isEmpty()) {
                        return memories;
                    }
                } catch (Exception e) {
                    // LLM提取失败，降级到规则提取
                }
            }
            return ruleExtractor.extractMemories(userId, messages);
        }
        
        @Override
        public java.util.List<com.heartsphere.memory.model.UserFact> validateAndCleanFacts(
                java.util.List<com.heartsphere.memory.model.UserFact> facts) {
            // 使用LLM提取器的验证逻辑
            return llmExtractor.validateAndCleanFacts(facts);
        }
        
        @Override
        public java.util.List<com.heartsphere.memory.model.UserPreference> validateAndCleanPreferences(
                java.util.List<com.heartsphere.memory.model.UserPreference> preferences) {
            // 使用LLM提取器的验证逻辑
            return llmExtractor.validateAndCleanPreferences(preferences);
        }
        
        @Override
        public java.util.List<com.heartsphere.memory.model.character.CharacterInteractionMemory> extractCharacterInteractionMemories(
                String characterId, String userId, java.util.List<com.heartsphere.memory.model.ChatMessage> messages) {
            if (preferLlm) {
                try {
                    java.util.List<com.heartsphere.memory.model.character.CharacterInteractionMemory> memories = 
                        llmExtractor.extractCharacterInteractionMemories(characterId, userId, messages);
                    if (memories != null && !memories.isEmpty()) {
                        return memories;
                    }
                } catch (Exception e) {
                    // LLM提取失败，降级到规则提取
                }
            }
            return ruleExtractor.extractCharacterInteractionMemories(characterId, userId, messages);
        }
        
        @Override
        public java.util.List<com.heartsphere.memory.model.character.CharacterSceneMemory> extractCharacterSceneMemories(
                String characterId, String eraId, java.util.List<com.heartsphere.memory.model.ChatMessage> messages) {
            if (preferLlm) {
                try {
                    java.util.List<com.heartsphere.memory.model.character.CharacterSceneMemory> memories = 
                        llmExtractor.extractCharacterSceneMemories(characterId, eraId, messages);
                    if (memories != null && !memories.isEmpty()) {
                        return memories;
                    }
                } catch (Exception e) {
                    // LLM提取失败，降级到规则提取
                }
            }
            return ruleExtractor.extractCharacterSceneMemories(characterId, eraId, messages);
        }
    }
}

