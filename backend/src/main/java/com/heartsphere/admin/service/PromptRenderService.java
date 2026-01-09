package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.PromptRenderResponse;
import com.heartsphere.admin.entity.PromptTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 提示词模板渲染服务
 * 支持：
 * - 变量替换：{{variableName}} 或 {{variableName|defaultValue}}
 * - 条件逻辑：{{#if condition}}...{{/if}} 或 {{#if condition}}...{{else}}...{{/if}}
 * - 循环处理：{{#each items}}...{{/each}}
 * - 循环特殊变量：{{@index}}, {{@first}}, {{@last}}
 */
@Service
public class PromptRenderService {
    
    private static final Logger logger = LoggerFactory.getLogger(PromptRenderService.class);
    
    // 匹配 {{variableName}} 或 {{variableName|defaultValue}} 的正则表达式
    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{([^}|#/]+)(?:\\|([^}]+))?\\}\\}");
    
    // 匹配 {{#if condition}} 的正则表达式
    private static final Pattern IF_START_PATTERN = Pattern.compile("\\{\\{#if\\s+([^}]+)\\}\\}");
    
    // 匹配 {{#each items}} 的正则表达式
    private static final Pattern EACH_START_PATTERN = Pattern.compile("\\{\\{#each\\s+([^}]+)\\}\\}");
    
    
    /**
     * 渲染模板
     */
    public PromptRenderResponse render(PromptTemplate template, Map<String, Object> variables) {
        if (variables == null) {
            variables = new HashMap<>();
        }
        
        String systemPrompt = renderTemplate(template.getSystemPrompt(), variables);
        String userPrompt = renderTemplate(template.getUserPrompt(), variables);
        
        PromptRenderResponse response = new PromptRenderResponse();
        response.setSystemPrompt(systemPrompt);
        response.setUserPrompt(userPrompt);
        response.setUsedVariables(variables);
        
        return response;
    }
    
    /**
     * 渲染单个模板字符串
     * 处理顺序：条件逻辑 -> 循环处理 -> 变量替换
     */
    private String renderTemplate(String template, Map<String, Object> variables) {
        if (template == null || template.isEmpty()) {
            return "";
        }
        
        // 第一步：处理条件逻辑
        String result = processConditionalBlocks(template, variables);
        
        // 第二步：处理循环
        result = processEachBlocks(result, variables);
        
        // 第三步：处理变量替换
        result = processVariables(result, variables);
        
        return result;
    }
    
    /**
     * 处理条件逻辑块 {{#if condition}}...{{/if}}
     */
    private String processConditionalBlocks(String template, Map<String, Object> variables) {
        StringBuilder result = new StringBuilder();
        int pos = 0;
        
        while (pos < template.length()) {
            // 查找 {{#if condition}}
            Matcher ifMatcher = IF_START_PATTERN.matcher(template.substring(pos));
            if (!ifMatcher.find()) {
                // 没有找到更多的if块，添加剩余内容
                result.append(template.substring(pos));
                break;
            }
            
            int ifStart = pos + ifMatcher.start();
            int ifEnd = pos + ifMatcher.end();
            String condition = ifMatcher.group(1).trim();
            
            // 添加if块之前的内容
            result.append(template.substring(pos, ifStart));
            
            // 查找对应的 {{/if}}
            int blockStart = ifEnd;
            int blockEnd = findMatchingEnd(template, blockStart, "if");
            
            if (blockEnd == -1) {
                // 没有找到匹配的结束标签，保留原样
                logger.warn("未找到匹配的 {{/if}} 标签，条件: {}", condition);
                result.append(template.substring(ifStart));
                break;
            }
            
            // 提取if块内容
            String blockContent = template.substring(blockStart, blockEnd);
            
            // 检查是否有 {{else}}
            int elsePos = blockContent.indexOf("{{else}}");
            String trueContent = blockContent;
            String falseContent = "";
            
            if (elsePos != -1) {
                trueContent = blockContent.substring(0, elsePos);
                falseContent = blockContent.substring(elsePos + 8); // "{{else}}" 长度为8
            }
            
            // 评估条件
            boolean conditionResult = evaluateCondition(condition, variables);
            
            // 根据条件结果添加内容
            if (conditionResult) {
                result.append(trueContent);
            } else {
                result.append(falseContent);
            }
            
            // 移动到 {{/if}} 之后
            pos = blockEnd + 6; // "{{/if}}" 长度为6
        }
        
        return result.toString();
    }
    
    /**
     * 处理循环块 {{#each items}}...{{/each}}
     */
    private String processEachBlocks(String template, Map<String, Object> variables) {
        StringBuilder result = new StringBuilder();
        int pos = 0;
        
        while (pos < template.length()) {
            // 查找 {{#each items}}
            Matcher eachMatcher = EACH_START_PATTERN.matcher(template.substring(pos));
            if (!eachMatcher.find()) {
                // 没有找到更多的each块，添加剩余内容
                result.append(template.substring(pos));
                break;
            }
            
            int eachStart = pos + eachMatcher.start();
            int eachEnd = pos + eachMatcher.end();
            String itemsPath = eachMatcher.group(1).trim();
            
            // 添加each块之前的内容
            result.append(template.substring(pos, eachStart));
            
            // 查找对应的 {{/each}}
            int blockStart = eachEnd;
            int blockEnd = findMatchingEnd(template, blockStart, "each");
            
            if (blockEnd == -1) {
                // 没有找到匹配的结束标签，保留原样
                logger.warn("未找到匹配的 {{/each}} 标签，路径: {}", itemsPath);
                result.append(template.substring(eachStart));
                break;
            }
            
            // 提取each块内容
            String blockContent = template.substring(blockStart, blockEnd);
            
            // 获取要循环的数组或列表
            Object items = getValueByPath(itemsPath, variables);
            
            if (items == null) {
                // 如果items为null，跳过循环
                logger.warn("循环变量为null: {}", itemsPath);
            } else if (items instanceof Collection) {
                // 处理集合类型
                Collection<?> collection = (Collection<?>) items;
                int index = 0;
                for (Object item : collection) {
                    Map<String, Object> loopContext = new HashMap<>(variables);
                    loopContext.put("this", item);
                    loopContext.put("@index", index);
                    loopContext.put("@first", index == 0);
                    loopContext.put("@last", index == collection.size() - 1);
                    
                    // 如果item是Map，将其键值对添加到上下文
                    if (item instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> itemMap = (Map<String, Object>) item;
                        loopContext.putAll(itemMap);
                    }
                    
                    result.append(processVariables(blockContent, loopContext));
                    index++;
                }
            } else if (items instanceof Object[]) {
                // 处理数组类型
                Object[] array = (Object[]) items;
                for (int i = 0; i < array.length; i++) {
                    Object item = array[i];
                    Map<String, Object> loopContext = new HashMap<>(variables);
                    loopContext.put("this", item);
                    loopContext.put("@index", i);
                    loopContext.put("@first", i == 0);
                    loopContext.put("@last", i == array.length - 1);
                    
                    if (item instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> itemMap = (Map<String, Object>) item;
                        loopContext.putAll(itemMap);
                    }
                    
                    result.append(processVariables(blockContent, loopContext));
                }
            } else {
                // 不是集合或数组，跳过循环
                logger.warn("循环变量不是集合或数组: {}", itemsPath);
            }
            
            // 移动到 {{/each}} 之后
            pos = blockEnd + 8; // "{{/each}}" 长度为8
        }
        
        return result.toString();
    }
    
    /**
     * 处理变量替换
     */
    private String processVariables(String template, Map<String, Object> variables) {
        StringBuffer result = new StringBuffer();
        Matcher matcher = VARIABLE_PATTERN.matcher(template);
        
        while (matcher.find()) {
            String variableName = matcher.group(1).trim();
            
            // 跳过特殊变量（在循环中处理）
            if (variableName.startsWith("@")) {
                matcher.appendReplacement(result, matcher.group(0));
                continue;
            }
            
            String defaultValue = matcher.group(2); // 可能为null
            
            Object value = getValueByPath(variableName, variables);
            String replacement;
            
            if (value != null) {
                replacement = value.toString();
            } else if (defaultValue != null) {
                replacement = defaultValue.trim();
            } else {
                // 如果变量不存在且没有默认值，保留原样
                replacement = "{{" + variableName + "}}";
                logger.warn("变量未找到且无默认值: {}", variableName);
            }
            
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }
        
        matcher.appendTail(result);
        return result.toString();
    }
    
    /**
     * 查找匹配的结束标签
     */
    private int findMatchingEnd(String template, int startPos, String blockType) {
        int depth = 1;
        int pos = startPos;
        String startTag = "{{#if".equals(blockType) ? "{{#if" : "{{#each";
        String endTag = "{{/if".equals(blockType) ? "{{/if" : "{{/each";
        
        while (pos < template.length()) {
            int nextStart = template.indexOf(startTag, pos);
            int nextEnd = template.indexOf(endTag, pos);
            
            if (nextEnd == -1) {
                return -1; // 没有找到结束标签
            }
            
            if (nextStart != -1 && nextStart < nextEnd) {
                // 找到嵌套的开始标签
                depth++;
                pos = nextStart + startTag.length();
            } else {
                // 找到结束标签
                depth--;
                if (depth == 0) {
                    return nextEnd;
                }
                pos = nextEnd + endTag.length();
            }
        }
        
        return -1; // 没有找到匹配的结束标签
    }
    
    /**
     * 评估条件表达式
     * 支持：
     * - 变量名（检查是否为truthy）
     * - 变量名 == 值
     * - 变量名 != 值
     */
    private boolean evaluateCondition(String condition, Map<String, Object> variables) {
        condition = condition.trim();
        
        // 处理 == 和 != 操作符
        if (condition.contains("==")) {
            String[] parts = condition.split("==", 2);
            if (parts.length == 2) {
                String left = parts[0].trim();
                String right = parts[1].trim().replaceAll("^['\"]|['\"]$", ""); // 移除引号
                Object leftValue = getValueByPath(left, variables);
                return Objects.equals(String.valueOf(leftValue), right);
            }
        } else if (condition.contains("!=")) {
            String[] parts = condition.split("!=", 2);
            if (parts.length == 2) {
                String left = parts[0].trim();
                String right = parts[1].trim().replaceAll("^['\"]|['\"]$", ""); // 移除引号
                Object leftValue = getValueByPath(left, variables);
                return !Objects.equals(String.valueOf(leftValue), right);
            }
        }
        
        // 简单变量检查（truthy/falsy）
        Object value = getValueByPath(condition, variables);
        return isTruthy(value);
    }
    
    /**
     * 判断值是否为truthy
     */
    private boolean isTruthy(Object value) {
        if (value == null) {
            return false;
        }
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        if (value instanceof String) {
            String str = (String) value;
            return !str.isEmpty() && !str.equalsIgnoreCase("false") && !str.equalsIgnoreCase("0");
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue() != 0;
        }
        if (value instanceof Collection) {
            return !((Collection<?>) value).isEmpty();
        }
        if (value instanceof Object[]) {
            return ((Object[]) value).length > 0;
        }
        return true;
    }
    
    /**
     * 根据路径获取值（支持嵌套路径，如 "user.name"）
     */
    private Object getValueByPath(String path, Map<String, Object> variables) {
        if (path == null || path.isEmpty()) {
            return null;
        }
        
        String[] parts = path.split("\\.");
        Object current = variables;
        
        for (String part : parts) {
            if (current == null) {
                return null;
            }
            
            if (current instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> map = (Map<String, Object>) current;
                current = map.get(part);
            } else {
                return null;
            }
        }
        
        return current;
    }
}
