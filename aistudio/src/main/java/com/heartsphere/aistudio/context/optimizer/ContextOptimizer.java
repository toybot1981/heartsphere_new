package com.heartsphere.aistudio.context.optimizer;

import com.heartsphere.aistudio.context.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 上下文优化器
 * 负责压缩和优化上下文以适应 token 限制
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ContextOptimizer {

    private final ChatModel chatModel;

    /**
     * 优化上下文
     *
     * @param messages    原始消息列表
     * @param maxTokens   最大 token 数量
     * @param strategy    优化策略
     * @return 优化后的上下文
     */
    public OptimizedContext optimize(List<ContextMessage> messages,
                                    long maxTokens,
                                    OptimizationStrategy strategy) {
        if (messages == null || messages.isEmpty()) {
            return OptimizedContext.builder()
                .strategy(strategy)
                .build();
        }

        long originalTokens = estimateTokens(messages);

        // 如果未超过限制，直接返回
        if (originalTokens <= maxTokens) {
            return OptimizedContext.builder()
                .messages(messages)
                .strategy(strategy)
                .originalMessageCount(messages.size())
                .optimizedMessageCount(messages.size())
                .originalTokenCount(originalTokens)
                .optimizedTokenCount(originalTokens)
                .build();
        }

        // 根据策略优化
        return switch (strategy) {
            case ROLLING_WINDOW -> rollingWindow(messages, maxTokens);
            case SUMMARIZATION -> summarizationBased(messages, maxTokens);
            case SEMANTIC_SELECTION -> semanticSelection(messages, maxTokens);
            case IMPORTANCE_BASED -> importanceBased(messages, maxTokens);
            case HYBRID -> hybrid(messages, maxTokens);
        };
    }

    /**
     * 滚动窗口策略
     * 保留最近 N 条消息
     */
    private OptimizedContext rollingWindow(List<ContextMessage> messages, long maxTokens) {
        List<ContextMessage> optimized = new ArrayList<>();
        long currentTokens = 0;

        // 从后向前添加消息，直到达到 token 限制
        for (int i = messages.size() - 1; i >= 0; i--) {
            ContextMessage msg = messages.get(i);
            long msgTokens = msg.estimateTokens();

            if (currentTokens + msgTokens > maxTokens) {
                break;
            }

            optimized.add(0, msg);
            currentTokens += msgTokens;
        }

        return OptimizedContext.builder()
            .messages(optimized)
            .strategy(OptimizationStrategy.ROLLING_WINDOW)
            .originalMessageCount(messages.size())
            .optimizedMessageCount(optimized.size())
            .originalTokenCount(estimateTokens(messages))
            .optimizedTokenCount(currentTokens)
            .droppedMessageCount(messages.size() - optimized.size())
            .build();
    }

    /**
     * 摘要策略
     * 将旧消息压缩为摘要，保留最近消息
     */
    private OptimizedContext summarizationBased(List<ContextMessage> messages, long maxTokens) {
        long recentTokenBudget = (long) (maxTokens * 0.4); // 40% 用于最近消息
        long summaryTokenBudget = (long) (maxTokens * 0.6); // 60% 用于摘要

        // 1. 从后向前获取最近消息
        List<ContextMessage> recentMessages = new ArrayList<>();
        long recentTokens = 0;

        for (int i = messages.size() - 1; i >= 0; i--) {
            ContextMessage msg = messages.get(i);
            long msgTokens = msg.estimateTokens();

            if (recentTokens + msgTokens > recentTokenBudget) {
                break;
            }

            recentMessages.add(0, msg);
            recentTokens += msgTokens;
        }

        // 2. 剩余的消息用于生成摘要
        int summaryIndex = messages.size() - recentMessages.size();
        if (summaryIndex > 0) {
            List<ContextMessage> toSummarize = messages.subList(0, summaryIndex);

            // 生成摘要
            ConversationSummary summary = generateSummary(toSummarize);

            // 将摘要作为系统消息插入
            ContextMessage summaryMessage = ContextMessage.builder()
                .messageType(org.springframework.ai.chat.messages.MessageType.SYSTEM)
                .content("[对话历史摘要]\n" + summary.getSummary())
                .importance(1.0)
                .build();

            List<ContextMessage> finalMessages = new ArrayList<>();
            finalMessages.add(summaryMessage);
            finalMessages.addAll(recentMessages);

            return OptimizedContext.builder()
                .messages(finalMessages)
                .strategy(OptimizationStrategy.SUMMARIZATION)
                .originalMessageCount(messages.size())
                .optimizedMessageCount(finalMessages.size())
                .originalTokenCount(estimateTokens(messages))
                .optimizedTokenCount(recentTokens + summary.estimateTokens())
                .summaries(List.of(summary))
                .droppedMessageCount(toSummarize.size())
                .build();
        }

        // 没有需要摘要的消息，返回最近消息
        return OptimizedContext.builder()
            .messages(recentMessages)
            .strategy(OptimizationStrategy.SUMMARIZATION)
            .originalMessageCount(messages.size())
            .optimizedMessageCount(recentMessages.size())
            .originalTokenCount(estimateTokens(messages))
            .optimizedTokenCount(recentTokens)
            .build();
    }

    /**
     * 语义选择策略
     * 选择与当前查询最相关的消息（简化版，实际需要向量搜索）
     */
    private OptimizedContext semanticSelection(List<ContextMessage> messages, long maxTokens) {
        // TODO: 实现真正的语义搜索，这里先用重要性排序模拟

        // 按重要性降序排序
        List<ContextMessage> sorted = messages.stream()
            .sorted(Comparator.comparing(ContextMessage::getImportance).reversed())
            .collect(Collectors.toList());

        // 选择最重要的消息
        List<ContextMessage> selected = new ArrayList<>();
        long currentTokens = 0;

        for (ContextMessage msg : sorted) {
            long msgTokens = msg.estimateTokens();

            if (currentTokens + msgTokens > maxTokens) {
                break;
            }

            selected.add(msg);
            currentTokens += msgTokens;
        }

        // 按原始顺序排序
        selected.sort(Comparator.comparing(ContextMessage::getTimestamp));

        return OptimizedContext.builder()
            .messages(selected)
            .strategy(OptimizationStrategy.SEMANTIC_SELECTION)
            .originalMessageCount(messages.size())
            .optimizedMessageCount(selected.size())
            .originalTokenCount(estimateTokens(messages))
            .optimizedTokenCount(currentTokens)
            .droppedMessageCount(messages.size() - selected.size())
            .build();
    }

    /**
     * 重要性策略
     * 基于消息重要性评分选择
     */
    private OptimizedContext importanceBased(List<ContextMessage> messages, long maxTokens) {
        List<ContextMessage> selected = new ArrayList<>();
        long currentTokens = 0;

        // 按重要性分组
        Map<Double, List<ContextMessage>> byImportance = messages.stream()
            .collect(Collectors.groupingBy(msg ->
                Math.floor(msg.getImportance() * 10) / 10  // 分组到0.1精度
            ));

        // 从高到低选择
        List<Double> importanceLevels = byImportance.keySet().stream()
            .sorted(Comparator.reverseOrder())
            .collect(Collectors.toList());

        for (Double level : importanceLevels) {
            List<ContextMessage> levelMessages = byImportance.get(level);

            for (ContextMessage msg : levelMessages) {
                long msgTokens = msg.estimateTokens();

                if (currentTokens + msgTokens > maxTokens) {
                    break;
                }

                selected.add(msg);
                currentTokens += msgTokens;
            }
        }

        // 按原始顺序排序
        selected.sort(Comparator.comparing(ContextMessage::getTimestamp));

        return OptimizedContext.builder()
            .messages(selected)
            .strategy(OptimizationStrategy.IMPORTANCE_BASED)
            .originalMessageCount(messages.size())
            .optimizedMessageCount(selected.size())
            .originalTokenCount(estimateTokens(messages))
            .optimizedTokenCount(currentTokens)
            .droppedMessageCount(messages.size() - selected.size())
            .build();
    }

    /**
     * 混合策略
     * 结合摘要、最近消息和重要性
     */
    private OptimizedContext hybrid(List<ContextMessage> messages, long maxTokens) {
        // 预算分配：30%摘要，50%最近消息，20%重要消息
        long summaryBudget = (long) (maxTokens * 0.3);
        long recentBudget = (long) (maxTokens * 0.5);
        long importantBudget = (long) (maxTokens * 0.2);

        List<ContextMessage> finalMessages = new ArrayList<>();
        long totalTokens = 0;

        // 1. 获取最近消息
        List<ContextMessage> recentMessages = new ArrayList<>();
        long recentTokens = 0;

        for (int i = messages.size() - 1; i >= 0; i--) {
            ContextMessage msg = messages.get(i);
            long msgTokens = msg.estimateTokens();

            if (recentTokens + msgTokens > recentBudget) {
                break;
            }

            recentMessages.add(0, msg);
            recentTokens += msgTokens;
        }

        // 2. 如果还有旧消息，生成摘要
        int summaryIndex = messages.size() - recentMessages.size();
        if (summaryIndex > 0) {
            List<ContextMessage> toSummarize = messages.subList(0, summaryIndex);
            ConversationSummary summary = generateSummary(toSummarize);

            if (summary.estimateTokens() <= summaryBudget) {
                ContextMessage summaryMessage = ContextMessage.builder()
                    .messageType(org.springframework.ai.chat.messages.MessageType.SYSTEM)
                    .content("[对话历史摘要]\n" + summary.getSummary())
                    .importance(1.0)
                    .build();

                finalMessages.add(summaryMessage);
                totalTokens += summary.estimateTokens();
            }
        }

        // 3. 添加最近消息
        finalMessages.addAll(recentMessages);
        totalTokens += recentTokens;

        return OptimizedContext.builder()
            .messages(finalMessages)
            .strategy(OptimizationStrategy.HYBRID)
            .originalMessageCount(messages.size())
            .optimizedMessageCount(finalMessages.size())
            .originalTokenCount(estimateTokens(messages))
            .optimizedTokenCount(totalTokens)
            .droppedMessageCount(summaryIndex)
            .build();
    }

    /**
     * 生成对话摘要
     */
    private ConversationSummary generateSummary(List<ContextMessage> messages) {
        try {
            String prompt = ConversationSummary.createSummaryPrompt(messages);
            Prompt aiPrompt = new Prompt(prompt);

            String response = chatModel.call(aiPrompt).getResult().getOutput().getContent();

            // 解析响应（简化版，实际需要更复杂的解析）
            return ConversationSummary.builder()
                .summaryId(UUID.randomUUID().toString())
                .summary(response)
                .startTime(messages.get(0).getTimestamp())
                .endTime(messages.get(messages.size() - 1).getTimestamp())
                .originalMessageCount(messages.size())
                .originalTokenCount(estimateTokens(messages))
                .keyPoints(extractKeyPoints(response))
                .build();

        } catch (Exception e) {
            log.error("Failed to generate summary", e);
            // 返回简单摘要
            return ConversationSummary.builder()
                .summaryId(UUID.randomUUID().toString())
                .summary("（摘要生成失败）包含 " + messages.size() + " 条历史消息")
                .originalMessageCount(messages.size())
                .originalTokenCount(estimateTokens(messages))
                .keyPoints(List.of())
                .build();
        }
    }

    /**
     * 从摘要文本中提取关键点
     */
    private List<String> extractKeyPoints(String summaryText) {
        // 简化实现，实际应该用更好的解析
        return Arrays.stream(summaryText.split("\n"))
            .filter(line -> line.trim().startsWith("-") || line.trim().startsWith("•"))
            .map(line -> line.trim().substring(1).trim())
            .limit(5)
            .collect(Collectors.toList());
    }

    /**
     * 估算消息列表的总 token 数量
     */
    private long estimateTokens(List<ContextMessage> messages) {
        return messages.stream()
            .mapToLong(ContextMessage::estimateTokens)
            .sum();
    }
}
