package com.heartsphere.aistudio.context.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * 对话摘要模型
 * 用于压缩长对话历史，节省 token
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationSummary {

    /**
     * 摘要ID
     */
    private String summaryId;

    /**
     * 会话ID
     */
    private String sessionId;

    /**
     * 用户ID
     */
    private String userId;

    /**
     * 摘要内容
     */
    private String summary;

    /**
     * 摘要覆盖的对话开始时间
     */
    private Instant startTime;

    /**
     * 摘要覆盖的对话结束时间
     */
    private Instant endTime;

    /**
     * 关键点列表
     */
    private List<String> keyPoints;

    /**
     * 原始消息数量
     */
    private Integer originalMessageCount;

    /**
     * 原始 token 总数
     */
    private Long originalTokenCount;

    /**
     * 摘要后的 token 数量
     */
    private Integer summaryTokenCount;

    /**
     * 压缩率 (originalTokenCount / summaryTokenCount)
     */
    public double getCompressionRatio() {
        if (summaryTokenCount == null || summaryTokenCount == 0) {
            return 0;
        }
        return (double) originalTokenCount / summaryTokenCount;
    }

    /**
     * 创建摘要的 Prompt
     */
    public static String createSummaryPrompt(List<ContextMessage> messages) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("请将以下对话历史总结为简洁的摘要，突出重点信息：\n\n");

        for (ContextMessage msg : messages) {
            String role = msg.getMessageType().name();
            prompt.append(String.format("[%s]: %s\n", role, msg.getText()));
        }

        prompt.append("\n请按以下格式返回摘要：\n");
        prompt.append("1. 摘要内容：用简洁的语言总结对话的主要内容\n");
        prompt.append("2. 关键点：列出3-5个关键点（使用bullet points）\n");

        return prompt.toString();
    }

    /**
     * 估算摘要的 token 数量
     */
    public int estimateTokens() {
        int summaryTokens = summary != null ? summary.length() / 3 : 0;
        int keyPointsTokens = keyPoints != null ?
            keyPoints.stream().mapToInt(kp -> kp.length() / 3).sum() : 0;
        return summaryTokens + keyPointsTokens + 10; // +10 为结构开销
    }
}
