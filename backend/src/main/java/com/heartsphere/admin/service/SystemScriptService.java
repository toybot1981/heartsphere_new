package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SystemScriptDTO;
import com.heartsphere.admin.entity.SystemScript;
import com.heartsphere.admin.entity.SystemEra;
import com.heartsphere.admin.repository.SystemScriptRepository;
import com.heartsphere.admin.repository.SystemEraRepository;
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

    @Autowired
    private SystemEraRepository eraRepository;

    /**
     * 获取所有剧本（按排序）
     * 管理员可以查看所有剧本，包括非激活的
     */
    public List<SystemScriptDTO> getAllScripts() {
        // 管理员应该能看到所有剧本，包括非激活的
        List<SystemScript> allScripts = scriptRepository.findAll();
        return allScripts.stream()
                .sorted((a, b) -> {
                    // 先按isActive排序（激活的在前）
                    if (a.getIsActive() != null && b.getIsActive() != null) {
                        int activeCompare = Boolean.compare(b.getIsActive(), a.getIsActive());
                        if (activeCompare != 0) return activeCompare;
                    }
                    // 再按sortOrder排序
                    int orderCompare = Integer.compare(
                            a.getSortOrder() != null ? a.getSortOrder() : 0,
                            b.getSortOrder() != null ? b.getSortOrder() : 0
                    );
                    if (orderCompare != 0) return orderCompare;
                    // 最后按ID排序
                    return Long.compare(a.getId(), b.getId());
                })
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
     * 创建系统剧本
     */
    @Transactional
    public SystemScriptDTO createScript(SystemScriptDTO dto) {
        SystemScript script = new SystemScript();
        script.setTitle(dto.getTitle());
        script.setDescription(dto.getDescription());
        script.setContent(dto.getContent());
        script.setSceneCount(dto.getSceneCount() != null ? dto.getSceneCount() : 1);
        script.setCharacterIds(dto.getCharacterIds());
        script.setTags(dto.getTags());
        script.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        script.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        
        // 设置关联的SystemEra
        if (dto.getSystemEraId() != null) {
            SystemEra era = eraRepository.findById(dto.getSystemEraId())
                    .orElseThrow(() -> new RuntimeException("系统场景不存在: " + dto.getSystemEraId()));
            script.setSystemEra(era);
        }
        
        SystemScript saved = scriptRepository.save(script);
        return SystemDTOMapper.toScriptDTO(saved);
    }

    /**
     * 更新系统剧本
     */
    @Transactional
    public SystemScriptDTO updateScript(Long id, SystemScriptDTO dto) {
        SystemScript script = scriptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统剧本不存在: " + id));
        
        script.setTitle(dto.getTitle());
        script.setDescription(dto.getDescription());
        script.setContent(dto.getContent());
        if (dto.getSceneCount() != null) {
            script.setSceneCount(dto.getSceneCount());
        }
        script.setCharacterIds(dto.getCharacterIds());
        script.setTags(dto.getTags());
        if (dto.getIsActive() != null) {
            script.setIsActive(dto.getIsActive());
        }
        if (dto.getSortOrder() != null) {
            script.setSortOrder(dto.getSortOrder());
        }
        
        // 更新关联的SystemEra
        if (dto.getSystemEraId() != null) {
            SystemEra era = eraRepository.findById(dto.getSystemEraId())
                    .orElseThrow(() -> new RuntimeException("系统场景不存在: " + dto.getSystemEraId()));
            script.setSystemEra(era);
        } else {
            script.setSystemEra(null);
        }
        
        SystemScript updated = scriptRepository.save(script);
        return SystemDTOMapper.toScriptDTO(updated);
    }

    /**
     * 删除系统剧本
     */
    @Transactional
    public void deleteScript(Long id) {
        SystemScript script = scriptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统剧本不存在: " + id));
        scriptRepository.delete(script);
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



