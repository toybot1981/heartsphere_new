package com.heartsphere.aiagent.graph.core.node;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 对话节点配置
 * 
 * 用于从JSON或其他配置源创建DialogueNode
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DialogueNodeConfig {
    
    /**
     * 节点ID
     */
    @JsonProperty("id")
    private String id;
    
    /**
     * 对话文本内容
     */
    @JsonProperty("text")
    private String text;
    
    /**
     * 角色ID（可选）
     */
    @JsonProperty("characterId")
    private String characterId;
    
    /**
     * 角色名称（可选）
     */
    @JsonProperty("characterName")
    private String characterName;
    
    /**
     * 对话类型（可选，默认为dialogue）
     * dialogue - 普通对话
     * narration - 旁白
     * thought - 内心独白
     */
    @JsonProperty("type")
    private String type;
    
    /**
     * 从配置创建DialogueNode
     */
    public DialogueNode toDialogueNode() {
        DialogueNode.DialogueType dialogueType = DialogueNode.DialogueType.DIALOGUE;
        if (type != null) {
            try {
                dialogueType = DialogueNode.DialogueType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                // 使用默认值
            }
        }
        
        return DialogueNode.builder()
            .id(id)
            .text(text)
            .characterId(characterId)
            .characterName(characterName)
            .type(dialogueType)
            .build();
    }
}
