package com.heartsphere.memory.dto.hsmem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * HSMem 消息DTO
 * 对应 hsmem API 的 Message 格式
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
     * 可以是字符串或包含 text 字段的对象
     */
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
