package com.heartsphere.admin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.heartsphere.admin.entity.SystemCharacter;
import com.heartsphere.admin.entity.SystemEra;
import com.heartsphere.admin.entity.SystemScript;
import com.heartsphere.admin.repository.SystemCharacterRepository;
import com.heartsphere.admin.repository.SystemEraRepository;
import com.heartsphere.admin.repository.SystemScriptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * 预置剧本生成服务
 * 为每个预置场景生成2个预置剧本，每个剧本包含10-15个节点
 */
@Service
public class PresetScriptGeneratorService {

    private static final Logger logger = Logger.getLogger(PresetScriptGeneratorService.class.getName());

    @Autowired
    private SystemEraRepository eraRepository;

    @Autowired
    private SystemCharacterRepository characterRepository;

    @Autowired
    private SystemScriptRepository scriptRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 为所有预置场景生成剧本
     */
    @Transactional
    public int generateScriptsForAllEras() {
        logger.info("========== [PresetScriptGeneratorService] 开始为所有预置场景生成剧本 ==========");
        
        // 删除所有现有剧本
        scriptRepository.deleteAll();
        logger.info("[PresetScriptGeneratorService] 已清空所有现有剧本");
        
        List<SystemEra> eras = eraRepository.findByIsActiveTrueOrderBySortOrderAsc();
        int totalScripts = 0;
        
        for (SystemEra era : eras) {
            List<SystemScript> scripts = generateScriptsForEra(era);
            totalScripts += scripts.size();
            logger.info(String.format("[PresetScriptGeneratorService] 为场景 '%s' 生成了 %d 个剧本", era.getName(), scripts.size()));
        }
        
        logger.info(String.format("========== [PresetScriptGeneratorService] 完成，共生成 %d 个剧本 ==========", totalScripts));
        return totalScripts;
    }

    /**
     * 为单个场景生成2个剧本
     */
    private List<SystemScript> generateScriptsForEra(SystemEra era) {
        List<SystemScript> scripts = new ArrayList<>();
        
        // 获取该场景的所有激活角色
        List<SystemCharacter> allEraCharacters = characterRepository.findBySystemEraId(era.getId());
        List<SystemCharacter> characters = allEraCharacters.stream()
            .filter(c -> c.getIsActive() != null && c.getIsActive())
            .collect(Collectors.toList());
        
        if (characters.isEmpty()) {
            logger.warning(String.format("[PresetScriptGeneratorService] 场景 '%s' 没有角色，跳过", era.getName()));
            return scripts;
        }
        
        // 生成2个剧本
        for (int i = 1; i <= 2; i++) {
            SystemScript script = generateScript(era, characters, i);
            if (script != null) {
                scripts.add(script);
            }
        }
        
        return scripts;
    }

    /**
     * 生成单个剧本（10-15个节点）
     */
    private SystemScript generateScript(SystemEra era, List<SystemCharacter> allCharacters, int scriptIndex) {
        try {
            // 随机选择2-4个角色参与剧本
            int characterCount = Math.min(2 + new Random().nextInt(3), allCharacters.size());
            Collections.shuffle(allCharacters);
            List<SystemCharacter> selectedCharacters = allCharacters.subList(0, characterCount);
            
            // 生成10-15个节点
            int nodeCount = 10 + new Random().nextInt(6); // 10-15个节点
            
            // 创建JSON结构
            ObjectNode scriptJson = objectMapper.createObjectNode();
            scriptJson.put("startNodeId", "start");
            
            ObjectNode nodes = objectMapper.createObjectNode();
            List<String> nodeIds = new ArrayList<>();
            
            // 创建起始节点
            ObjectNode startNode = createNode("start", "开始", 
                String.format("欢迎来到%s！你在这里遇到了%s。", era.getName(), 
                    selectedCharacters.stream().map(SystemCharacter::getName).collect(Collectors.joining("、"))),
                String.format("%s的场景", era.getName()));
            nodes.set("start", startNode);
            nodeIds.add("start");
            
            // 创建中间节点（10-15个）
            String[] nodeTitles = {
                "初次相遇", "深入对话", "探索发现", "情感交流", "共同冒险",
                "面临挑战", "解决问题", "建立信任", "分享秘密", "共同成长",
                "关键时刻", "做出选择", "面对困难", "获得帮助", "达成目标"
            };
            
            String[] nodeTexts = {
                "你与%s展开了深入的对话，了解了更多关于他们的信息。",
                "在%s中，你发现了许多有趣的事物和秘密。",
                "你与%s的关系进一步加深，开始探索他们背后的故事。",
                "在%s的帮助下，你克服了困难，获得了新的体验。",
                "你与%s一起踏上了冒险之旅，共同面对挑战。",
                "在关键时刻，%s展现出了他们的真实性格和价值观。",
                "你与%s分享了彼此的想法和感受，建立了深厚的友谊。",
                "在%s的引导下，你发现了新的可能性和机会。",
                "你与%s一起解决了问题，共同成长和进步。",
                "在%s的陪伴下，你体验了%s的独特魅力。"
            };
            
            for (int i = 1; i < nodeCount; i++) {
                String nodeId = "node_" + i;
                String title = nodeTitles[Math.min(i - 1, nodeTitles.length - 1)];
                
                // 随机选择一个角色来填充文本
                SystemCharacter randomChar = selectedCharacters.get(new Random().nextInt(selectedCharacters.size()));
                String text = String.format(nodeTexts[new Random().nextInt(nodeTexts.length)], 
                    randomChar.getName(), era.getName());
                
                ObjectNode node = createNode(nodeId, title, text, 
                    String.format("%s的%s场景", era.getName(), title));
                
                // 添加选项（连接到其他节点）
                ArrayNode options = objectMapper.createArrayNode();
                if (i < nodeCount - 1) {
                    // 连接到下一个节点
                    ObjectNode option1 = objectMapper.createObjectNode();
                    option1.put("text", "继续探索");
                    option1.put("nextNodeId", "node_" + (i + 1));
                    options.add(option1);
                }
                
                // 随机添加一个分支选项
                if (i < nodeCount - 2 && new Random().nextBoolean()) {
                    int targetNode = i + 2 + new Random().nextInt(Math.min(3, nodeCount - i - 2));
                    ObjectNode option2 = objectMapper.createObjectNode();
                    option2.put("text", "选择另一条路");
                    option2.put("nextNodeId", "node_" + targetNode);
                    options.add(option2);
                }
                
                // 添加结束选项
                if (i > nodeCount / 2) {
                    ObjectNode endOption = objectMapper.createObjectNode();
                    endOption.put("text", "结束故事");
                    endOption.put("nextNodeId", "end");
                    options.add(endOption);
                }
                
                node.set("options", options);
                nodes.set(nodeId, node);
                nodeIds.add(nodeId);
            }
            
            // 创建结束节点
            ObjectNode endNode = createNode("end", "结束", 
                String.format("故事结束了，但%s的冒险还在继续。你与%s的友谊将永远铭记在心。", 
                    era.getName(), selectedCharacters.stream().map(SystemCharacter::getName).collect(Collectors.joining("、"))),
                String.format("%s的结束场景", era.getName()));
            nodes.set("end", endNode);
            
            scriptJson.set("nodes", nodes);
            
            // 设置参与角色
            ArrayNode participatingCharacters = objectMapper.createArrayNode();
            for (SystemCharacter character : selectedCharacters) {
                participatingCharacters.add(character.getId().toString());
            }
            scriptJson.set("participatingCharacters", participatingCharacters);
            
            // 创建剧本实体
            SystemScript script = new SystemScript();
            script.setTitle(String.format("%s - %s", era.getName(), scriptIndex == 1 ? "初遇篇" : "深入篇"));
            script.setDescription(String.format("在%s中与%s的精彩故事，包含%d个互动节点。", 
                era.getName(), selectedCharacters.stream().map(SystemCharacter::getName).collect(Collectors.joining("、")), nodeCount));
            script.setContent(scriptJson.toString());
            script.setSceneCount(nodeCount);
            script.setSystemEra(era);
            script.setCharacterIds(participatingCharacters.toString());
            script.setTags(String.format("%s,故事,冒险,互动", era.getName()));
            script.setIsActive(true);
            script.setSortOrder(scriptIndex);
            
            return scriptRepository.save(script);
            
        } catch (Exception e) {
            logger.severe(String.format("[PresetScriptGeneratorService] 生成剧本失败: %s", e.getMessage()));
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 创建节点对象
     */
    private ObjectNode createNode(String id, String title, String text, String backgroundHint) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("id", id);
        node.put("title", title);
        node.put("text", text);
        node.put("backgroundHint", backgroundHint);
        return node;
    }
}

