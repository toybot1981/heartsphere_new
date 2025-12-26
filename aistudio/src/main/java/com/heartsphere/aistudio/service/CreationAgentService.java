package com.heartsphere.aistudio.service;

import com.heartsphere.aistudio.model.AgentDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * 创作 Agent 服务
 * 自动创建各种创作相关的 Agent
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreationAgentService {
    
    private final AgentService agentService;
    
    /**
     * 初始化所有创作相关的 Agent
     */
    public void initializeCreationAgents() {
        createImageGenerationAgent();
        createVideoGenerationAgent();
        createAudioGenerationAgent();
        createPromptOptimizerAgent();
        log.info("已初始化所有创作 Agent");
    }
    
    /**
     * 创建图片生成 Agent
     */
    private void createImageGenerationAgent() {
        AgentDefinition definition = new AgentDefinition();
        definition.setId("image-generation-agent");
        definition.setName("视觉创作中心 - 图片生成");
        definition.setDescription("专业的图片生成 Agent，支持文生图和图生图，多种画幅比例");
        definition.setType(AgentDefinition.AgentType.MULTIMODAL);
        definition.setProvider("alibaba");
        definition.setModel("qwen-max");
        definition.setSystemPrompt("你是一个专业的图片生成助手，能够根据用户描述生成高质量的图片。");
        
        // 配置工具
        AgentDefinition.ToolDefinition tool = new AgentDefinition.ToolDefinition();
        tool.setName("generate_image");
        tool.setDescription("生成高质量图片");
        definition.setTools(Arrays.asList(tool));
        
        try {
            agentService.registerAgent(definition);
            log.info("已创建图片生成 Agent");
        } catch (Exception e) {
            log.error("创建图片生成 Agent 失败", e);
        }
    }
    
    /**
     * 创建视频生成 Agent
     */
    private void createVideoGenerationAgent() {
        AgentDefinition definition = new AgentDefinition();
        definition.setId("video-generation-agent");
        definition.setName("视觉创作中心 - 视频生成");
        definition.setDescription("专业的视频生成 Agent，支持文生视频，多种分辨率和画幅");
        definition.setType(AgentDefinition.AgentType.MULTIMODAL);
        definition.setProvider("alibaba");
        definition.setModel("qwen-max");
        definition.setSystemPrompt("你是一个专业的视频生成助手，能够根据用户描述生成高质量的视频。");
        
        AgentDefinition.ToolDefinition tool = new AgentDefinition.ToolDefinition();
        tool.setName("generate_video");
        tool.setDescription("生成高清视频");
        definition.setTools(Arrays.asList(tool));
        
        try {
            agentService.registerAgent(definition);
            log.info("已创建视频生成 Agent");
        } catch (Exception e) {
            log.error("创建视频生成 Agent 失败", e);
        }
    }
    
    /**
     * 创建音频生成 Agent
     */
    private void createAudioGenerationAgent() {
        AgentDefinition definition = new AgentDefinition();
        definition.setId("audio-generation-agent");
        definition.setName("音频创作实验室 - 语音合成");
        definition.setDescription("专业的语音合成 Agent，支持多种音色和语言");
        definition.setType(AgentDefinition.AgentType.AUDIO);
        definition.setProvider("alibaba");
        definition.setModel("qwen-max");
        definition.setSystemPrompt("你是一个专业的语音合成助手，能够将文本转换为自然流畅的语音。");
        
        AgentDefinition.ToolDefinition tool = new AgentDefinition.ToolDefinition();
        tool.setName("text_to_speech");
        tool.setDescription("文本转语音");
        definition.setTools(Arrays.asList(tool));
        
        try {
            agentService.registerAgent(definition);
            log.info("已创建音频生成 Agent");
        } catch (Exception e) {
            log.error("创建音频生成 Agent 失败", e);
        }
    }
    
    /**
     * 创建提示词优化 Agent
     */
    private void createPromptOptimizerAgent() {
        AgentDefinition definition = new AgentDefinition();
        definition.setId("prompt-optimizer-agent");
        definition.setName("智能辅助工具 - 提示词优化");
        definition.setDescription("智能提示词优化 Agent，将简单想法扩展为专业提示词");
        definition.setType(AgentDefinition.AgentType.TEXT);
        definition.setProvider("alibaba");
        definition.setModel("qwen-max");
        definition.setSystemPrompt("你是一个专业的提示词优化专家，能够将用户的简单想法扩展为包含细节、风格、光影等信息的专业绘画提示词。");
        
        AgentDefinition.ToolDefinition tool = new AgentDefinition.ToolDefinition();
        tool.setName("optimize_prompt");
        tool.setDescription("优化提示词");
        definition.setTools(Arrays.asList(tool));
        
        try {
            agentService.registerAgent(definition);
            log.info("已创建提示词优化 Agent");
        } catch (Exception e) {
            log.error("创建提示词优化 Agent 失败", e);
        }
    }
}








