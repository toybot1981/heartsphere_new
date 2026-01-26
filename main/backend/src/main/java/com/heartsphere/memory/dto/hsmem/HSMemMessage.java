package com.heartsphere.memory.dto.hsmem;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * HSMem 消息DTO
 * 对应 hsmem API 的 Message 格式
 * 
 * 注意：HSMem API 要求 content 必须是字典（对象），不能是字符串
 * 
 * @author HeartSphere
 * @date 2026-01-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HSMemMessage {
    
    /**
     * 角色：user 或 assistant
     */
    private String role;
    
    /**
     * 消息内容
     * HSMem API 要求必须是字典（对象），格式为 {"text": "..."}
     * 如果前端传入字符串，需要转换为对象格式
     */
    @JsonProperty("content")
    private Object content;
    
    /**
     * 创建包含文本的消息
     * 
     * @param role 角色
     * @param text 文本内容
     * @return HSMemMessage
     */
    public static HSMemMessage ofText(String role, String text) {
        HSMemMessage message = new HSMemMessage();
        message.setRole(role);
        // hsmem API 接受 content 为字符串或包含 text 的对象
        message.setContent(text);
        return message;
    }
    
    /**
     * 创建包含对象的消息
     * 
     * @param role 角色
     * @param contentMap 内容Map（包含 text 字段）
     * @return HSMemMessage
     */
    public static HSMemMessage ofMap(String role, Map<String, Object> contentMap) {
        HSMemMessage message = new HSMemMessage();
        message.setRole(role);
        message.setContent(contentMap);
        return message;
    }
}
