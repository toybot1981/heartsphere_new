package com.heartsphere.aiagent.graph.core.node;

import com.heartsphere.aiagent.graph.core.GraphEngine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 对话节点
 * 
 * 用于在Graph中显示对话内容，支持：
 * - 显示对话文本
 * - 指定说话的角色
 * - 支持多角色对话
 * 
 * 配置示例：
 * {
 *   "id": "dialogue_1",
 *   "text": "你好，欢迎来到心域！",
 *   "characterId": "character_123",
 *   "characterName": "角色名称"
 * }
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DialogueNode implements GraphEngine.GraphNode {
    
    /**
     * 节点ID
     */
    private String id;
    
    /**
     * 对话文本内容
     */
    private String text;
    
    /**
     * 角色ID（可选）
     */
    private String characterId;
    
    /**
     * 角色名称（可选，用于显示）
     */
    private String characterName;
    
    /**
     * 对话类型（可选）
     * dialogue - 普通对话
     * narration - 旁白
     * thought - 内心独白
     */
    @Builder.Default
    private DialogueType type = DialogueType.DIALOGUE;
    
    /**
     * 对话类型枚举
     */
    public enum DialogueType {
        DIALOGUE,   // 普通对话
        NARRATION,  // 旁白
        THOUGHT     // 内心独白
    }
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
        log.info("[DialogueNode] 执行对话节点: {}, 角色: {}, 文本: {}", 
            id, characterName != null ? characterName : "未知", 
            text != null && text.length() > 50 ? text.substring(0, 50) + "..." : text);
        
        // 将对话信息存储到状态中
        state.setData("current_dialogue", this);
        state.setData("dialogue_text", text);
        state.setData("dialogue_character_id", characterId);
        state.setData("dialogue_character_name", characterName);
        state.setData("dialogue_type", type.name());
        
        // 记录执行历史（用于前端显示）
        @SuppressWarnings("unchecked")
        java.util.List<DialogueNode> dialogueHistory = 
            (java.util.List<DialogueNode>) state.getData("dialogue_history");
        if (dialogueHistory == null) {
            dialogueHistory = new java.util.ArrayList<>();
            state.setData("dialogue_history", dialogueHistory);
        }
        dialogueHistory.add(this);
        
        log.debug("[DialogueNode] 对话节点执行完成，对话信息已存储到状态中");
        
        return state;
    }
    
    /**
     * 创建简单的对话节点
     */
    public static DialogueNode create(String id, String text) {
        return DialogueNode.builder()
            .id(id)
            .text(text)
            .type(DialogueType.DIALOGUE)
            .build();
    }
    
    /**
     * 创建带角色的对话节点
     */
    public static DialogueNode create(String id, String text, String characterId, String characterName) {
        return DialogueNode.builder()
            .id(id)
            .text(text)
            .characterId(characterId)
            .characterName(characterName)
            .type(DialogueType.DIALOGUE)
            .build();
    }
    
    /**
     * 创建旁白节点
     */
    public static DialogueNode createNarration(String id, String text) {
        return DialogueNode.builder()
            .id(id)
            .text(text)
            .type(DialogueType.NARRATION)
            .build();
    }
    
    /**
     * 创建内心独白节点
     */
    public static DialogueNode createThought(String id, String text) {
        return DialogueNode.builder()
            .id(id)
            .text(text)
            .type(DialogueType.THOUGHT)
            .build();
    }
}
