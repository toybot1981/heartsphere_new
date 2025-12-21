package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SystemScriptDTO;
import com.heartsphere.admin.entity.SystemScript;
import com.heartsphere.admin.repository.SystemScriptRepository;
import com.heartsphere.admin.util.SystemDTOMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * 系统剧本服务
 * 提供SystemScript的查询和批量更新操作
 */
@Service
public class SystemScriptService {

    private static final Logger logger = Logger.getLogger(SystemScriptService.class.getName());

    @Autowired
    private SystemScriptRepository scriptRepository;

    /**
     * 获取所有激活的剧本（按排序）
     */
    public List<SystemScriptDTO> getAllScripts() {
        return scriptRepository.findAllActiveOrdered().stream()
                .map(SystemDTOMapper::toScriptDTO)
                .collect(Collectors.toList());
    }

    /**
     * 根据时代ID获取剧本列表
     */
    public List<SystemScriptDTO> getScriptsByEraId(Long eraId) {
        return scriptRepository.findByEraIdAndIsActiveTrue(eraId).stream()
                .map(SystemDTOMapper::toScriptDTO)
                .collect(Collectors.toList());
    }

    /**
     * 根据ID获取剧本
     */
    public SystemScriptDTO getScriptById(Long id) {
        SystemScript script = scriptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统剧本不存在: " + id));
        return SystemDTOMapper.toScriptDTO(script);
    }

    /**
     * 批量更新所有剧本的节点提示词
     */
    @Transactional
    public int updateAllScriptsWithPrompts() {
        logger.info("========== [SystemScriptService] 开始为所有系统预置剧本添加AI旁白提示词 ==========");
        
        List<SystemScript> scripts = scriptRepository.findAll();
        int updatedCount = 0;
        
        for (SystemScript script : scripts) {
            if (script.getContent() == null || script.getContent().trim().isEmpty()) {
                logger.warning(String.format("[SystemScriptService] 剧本ID %d 内容为空，跳过", script.getId()));
                continue;
            }
            
            try {
                // 解析JSON内容
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode contentJson = mapper.readTree(script.getContent());
                
                if (!contentJson.has("nodes")) {
                    logger.warning(String.format("[SystemScriptService] 剧本ID %d 没有nodes字段，跳过", script.getId()));
                    continue;
                }
                
                com.fasterxml.jackson.databind.node.ObjectNode nodesObj = (com.fasterxml.jackson.databind.node.ObjectNode) contentJson.get("nodes");
                boolean hasChanges = false;
                
                // 遍历所有节点
                java.util.Iterator<String> nodeIds = nodesObj.fieldNames();
                while (nodeIds.hasNext()) {
                    String nodeId = nodeIds.next();
                    com.fasterxml.jackson.databind.node.ObjectNode node = (com.fasterxml.jackson.databind.node.ObjectNode) nodesObj.get(nodeId);
                    
                    // 检查是否已有prompt字段
                    if (node.has("prompt") && node.get("prompt").asText() != null && !node.get("prompt").asText().trim().isEmpty()) {
                        // 已有prompt，跳过
                        continue;
                    }
                    
                    // 生成AI旁白提示词
                    String text = node.has("text") ? node.get("text").asText() : "";
                    String backgroundHint = node.has("backgroundHint") ? node.get("backgroundHint").asText() : "";
                    String title = node.has("title") ? node.get("title").asText() : (node.has("id") ? node.get("id").asText() : nodeId);
                    
                    // 基于text和backgroundHint生成prompt
                    String prompt = generatePromptFromNode(text, backgroundHint, title, script.getTitle(), script.getDescription());
                    
                    // 添加prompt字段
                    node.put("prompt", prompt);
                    hasChanges = true;
                    
                    logger.info(String.format("[SystemScriptService] 为剧本ID %d 的节点 %s 添加了prompt", script.getId(), nodeId));
                }
                
                // 如果有更改，更新数据库
                if (hasChanges) {
                    script.setContent(mapper.writeValueAsString(contentJson));
                    scriptRepository.save(script);
                    updatedCount++;
                    logger.info(String.format("[SystemScriptService] 成功更新剧本ID %d: %s", script.getId(), script.getTitle()));
                }
                
            } catch (Exception e) {
                logger.severe(String.format("[SystemScriptService] 更新剧本ID %d 失败: %s", script.getId(), e.getMessage()));
                e.printStackTrace();
            }
        }
        
        logger.info(String.format("========== [SystemScriptService] 完成，共更新 %d 个剧本 ==========", updatedCount));
        return updatedCount;
    }
    
    /**
     * 根据节点信息生成AI旁白提示词
     */
    private String generatePromptFromNode(String text, String backgroundHint, String nodeTitle, String scriptTitle, String scriptDescription) {
        // 如果text不为空，优先使用text作为prompt的基础
        if (text != null && !text.trim().isEmpty()) {
            // 如果text已经是描述性的，直接使用
            if (text.length() > 20) {
                // 添加背景提示以增强描述
                if (backgroundHint != null && !backgroundHint.trim().isEmpty()) {
                    return String.format("%s。场景：%s", text, backgroundHint);
                }
                return text;
            }
        }
        
        // 如果没有text或text太短，根据节点标题和剧本信息生成
        StringBuilder promptBuilder = new StringBuilder();
        
        if (scriptTitle != null && !scriptTitle.trim().isEmpty()) {
            promptBuilder.append("在").append(scriptTitle).append("的故事中，");
        }
        
        if (nodeTitle != null && !nodeTitle.trim().isEmpty() && !nodeTitle.equals("start") && !nodeTitle.equals("end")) {
            promptBuilder.append("你来到了").append(nodeTitle).append("的场景。");
        }
        
        if (text != null && !text.trim().isEmpty()) {
            promptBuilder.append(text);
        } else {
            promptBuilder.append("描述这个场景中发生的事情，包括环境、氛围和角色的互动。");
        }
        
        if (backgroundHint != null && !backgroundHint.trim().isEmpty()) {
            promptBuilder.append("背景环境：").append(backgroundHint);
        }
        
        return promptBuilder.toString();
    }
}

