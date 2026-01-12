package com.heartsphere.service;

import com.heartsphere.entity.JournalEntry;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.logging.Logger;

/**
 * Notion API 服务
 * 负责与 Notion API 交互，创建和更新页面
 * 参考：https://developers.notion.com/reference
 */
@Service
public class NotionService {

    private static final Logger logger = Logger.getLogger(NotionService.class.getName());
    private static final String NOTION_API_BASE = "https://api.notion.com/v1";
    private static final String NOTION_VERSION = "2022-06-28";

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 创建 Notion 页面
     * @param accessToken Notion access token
     * @param parentId 父页面或数据库 ID
     * @param title 页面标题
     * @param content 页面内容（Markdown 格式）
     * @param properties 页面属性（可选）
     * @return 创建的页面 ID
     */
    public String createPage(String accessToken, String parentId, String title, String content, Map<String, Object> properties) {
        try {
            HttpHeaders headers = createHeaders(accessToken);

            // 构建页面内容（使用 Notion blocks）
            List<Map<String, Object>> blocks = convertContentToBlocks(content);

            // 构建页面属性
            Map<String, Object> pageProperties = new HashMap<>();
            if (properties != null) {
                pageProperties.putAll(properties);
            }

            // 添加标题属性
            Map<String, Object> titleProperty = new HashMap<>();
            titleProperty.put("title", Arrays.asList(
                createRichText(title)
            ));
            pageProperties.put("title", titleProperty);

            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("parent", Map.of("page_id", parentId));
            requestBody.put("properties", pageProperties);
            requestBody.put("children", blocks);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            logger.info("创建 Notion 页面 - parentId: " + parentId + ", title: " + title);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                NOTION_API_BASE + "/pages",
                request,
                Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("id")) {
                String pageId = (String) responseBody.get("id");
                logger.info("Notion 页面创建成功 - pageId: " + pageId);
                return pageId;
            } else {
                logger.severe("创建 Notion 页面失败: " + responseBody);
                throw new RuntimeException("创建 Notion 页面失败: " + responseBody);
            }

        } catch (Exception e) {
            logger.severe("创建 Notion 页面异常: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("创建 Notion 页面失败: " + e.getMessage(), e);
        }
    }

    /**
     * 在数据库中创建页面（推荐方式）
     * @param accessToken Notion access token
     * @param databaseId 数据库 ID
     * @param title 页面标题
     * @param content 页面内容
     * @param properties 页面属性（如日期、标签等）
     * @return 创建的页面 ID
     */
    public String createPageInDatabase(String accessToken, String databaseId, String title, String content, Map<String, Object> properties) {
        try {
            HttpHeaders headers = createHeaders(accessToken);

            // 构建页面内容（使用 Notion blocks）
            List<Map<String, Object>> blocks = convertContentToBlocks(content);

            // 构建页面属性
            Map<String, Object> pageProperties = new HashMap<>();
            if (properties != null) {
                pageProperties.putAll(properties);
            }

            // 添加标题属性
            Map<String, Object> titleProperty = new HashMap<>();
            titleProperty.put("title", Arrays.asList(
                createRichText(title)
            ));
            pageProperties.put("标题", titleProperty); // 使用中文属性名，或根据实际数据库属性名调整

            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("parent", Map.of("database_id", databaseId));
            requestBody.put("properties", pageProperties);
            requestBody.put("children", blocks);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            logger.info("在数据库中创建 Notion 页面 - databaseId: " + databaseId + ", title: " + title);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                NOTION_API_BASE + "/pages",
                request,
                Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("id")) {
                String pageId = (String) responseBody.get("id");
                logger.info("Notion 页面创建成功 - pageId: " + pageId);
                return pageId;
            } else {
                logger.severe("创建 Notion 页面失败: " + responseBody);
                throw new RuntimeException("创建 Notion 页面失败: " + responseBody);
            }

        } catch (Exception e) {
            logger.severe("创建 Notion 页面异常: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("创建 Notion 页面失败: " + e.getMessage(), e);
        }
    }

    /**
     * 将日记条目同步到 Notion
     * @param accessToken Notion access token
     * @param parentId 父页面或数据库 ID（如果使用数据库，需要先调用 createPageInDatabase）
     * @param journalEntry 日记条目
     * @return 创建的页面 ID
     */
    public String syncJournalEntryToNotion(String accessToken, String parentId, JournalEntry journalEntry) {
        try {
            // 构建页面标题
            String title = journalEntry.getTitle() != null ? journalEntry.getTitle() : "未命名日记";

            // 构建页面内容
            StringBuilder content = new StringBuilder();

            // 添加日期信息
            if (journalEntry.getEntryDate() != null) {
                content.append("**日期**: ").append(
                    journalEntry.getEntryDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                ).append("\n\n");
            }

            // 添加标签
            if (journalEntry.getTags() != null && !journalEntry.getTags().trim().isEmpty()) {
                content.append("**标签**: ").append(journalEntry.getTags()).append("\n\n");
            }

            // 添加关联信息
            if (journalEntry.getWorld() != null) {
                content.append("**世界**: ").append(journalEntry.getWorld().getName()).append("\n");
            }
            if (journalEntry.getEra() != null) {
                content.append("**时代**: ").append(journalEntry.getEra().getName()).append("\n");
            }
            if (journalEntry.getCharacter() != null) {
                content.append("**角色**: ").append(journalEntry.getCharacter().getName()).append("\n");
            }

            if (content.length() > 0) {
                content.append("\n---\n\n");
            }

            // 添加日记内容
            if (journalEntry.getContent() != null && !journalEntry.getContent().trim().isEmpty()) {
                content.append(journalEntry.getContent());
            }

            // 构建属性（用于数据库）
            Map<String, Object> properties = new HashMap<>();
            
            // 添加日期属性（如果数据库有日期字段）
            if (journalEntry.getEntryDate() != null) {
                Map<String, Object> dateProperty = new HashMap<>();
                dateProperty.put("date", Map.of(
                    "start", journalEntry.getEntryDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                ));
                properties.put("日期", dateProperty); // 根据实际数据库属性名调整
            }

            // 添加标签属性（如果数据库有多选字段）
            if (journalEntry.getTags() != null && !journalEntry.getTags().trim().isEmpty()) {
                String[] tags = journalEntry.getTags().split(",");
                List<Map<String, Object>> multiSelectOptions = new ArrayList<>();
                for (String tag : tags) {
                    String trimmedTag = tag.trim();
                    if (!trimmedTag.isEmpty()) {
                        multiSelectOptions.add(Map.of("name", trimmedTag));
                    }
                }
                if (!multiSelectOptions.isEmpty()) {
                    Map<String, Object> multiSelectProperty = new HashMap<>();
                    multiSelectProperty.put("multi_select", multiSelectOptions);
                    properties.put("标签", multiSelectProperty); // 根据实际数据库属性名调整
                }
            }

            // 创建页面（尝试使用数据库，如果失败则使用页面）
            try {
                return createPageInDatabase(accessToken, parentId, title, content.toString(), properties);
            } catch (Exception e) {
                logger.warning("使用数据库创建失败，尝试使用页面创建: " + e.getMessage());
                return createPage(accessToken, parentId, title, content.toString(), null);
            }

        } catch (Exception e) {
            logger.severe("同步日记到 Notion 失败: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("同步日记到 Notion 失败: " + e.getMessage(), e);
        }
    }

    /**
     * 创建 HTTP 请求头
     */
    private HttpHeaders createHeaders(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + accessToken);
        headers.set("Notion-Version", NOTION_VERSION);
        return headers;
    }

    /**
     * 将 Markdown 内容转换为 Notion blocks
     */
    private List<Map<String, Object>> convertContentToBlocks(String content) {
        List<Map<String, Object>> blocks = new ArrayList<>();
        
        if (content == null || content.trim().isEmpty()) {
            return blocks;
        }

        // 按行分割内容
        String[] lines = content.split("\n");
        
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) {
                continue;
            }

            Map<String, Object> block = new HashMap<>();
            
            // 处理标题（# 开头）
            if (line.startsWith("# ")) {
                block.put("object", "block");
                block.put("type", "heading_1");
                block.put("heading_1", Map.of(
                    "rich_text", Arrays.asList(createRichText(line.substring(2)))
                ));
            } else if (line.startsWith("## ")) {
                block.put("object", "block");
                block.put("type", "heading_2");
                block.put("heading_2", Map.of(
                    "rich_text", Arrays.asList(createRichText(line.substring(3)))
                ));
            } else if (line.startsWith("### ")) {
                block.put("object", "block");
                block.put("type", "heading_3");
                block.put("heading_3", Map.of(
                    "rich_text", Arrays.asList(createRichText(line.substring(4)))
                ));
            } else if (line.startsWith("**") && line.endsWith("**")) {
                // 粗体文本
                block.put("object", "block");
                block.put("type", "paragraph");
                block.put("paragraph", Map.of(
                    "rich_text", Arrays.asList(createRichText(line.substring(2, line.length() - 2), true, false))
                ));
            } else if (line.startsWith("---")) {
                // 分隔线
                block.put("object", "block");
                block.put("type", "divider");
                block.put("divider", Map.of());
            } else {
                // 普通段落
                block.put("object", "block");
                block.put("type", "paragraph");
                block.put("paragraph", Map.of(
                    "rich_text", Arrays.asList(createRichText(line))
                ));
            }
            
            blocks.add(block);
        }

        return blocks;
    }

    /**
     * 创建富文本对象
     */
    private Map<String, Object> createRichText(String text) {
        return createRichText(text, false, false);
    }

    /**
     * 创建富文本对象（支持粗体和斜体）
     */
    private Map<String, Object> createRichText(String text, boolean bold, boolean italic) {
        Map<String, Object> richText = new HashMap<>();
        richText.put("type", "text");
        richText.put("text", Map.of("content", text));
        
        if (bold || italic) {
            Map<String, Object> annotations = new HashMap<>();
            annotations.put("bold", bold);
            annotations.put("italic", italic);
            richText.put("annotations", annotations);
        }
        
        return richText;
    }

    /**
     * 获取用户的工作区信息
     * @param accessToken Notion access token
     * @return 工作区信息
     */
    public Map<String, Object> getUserWorkspace(String accessToken) {
        try {
            HttpHeaders headers = createHeaders(accessToken);
            HttpEntity<String> request = new HttpEntity<>(headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                NOTION_API_BASE + "/users/me",
                org.springframework.http.HttpMethod.GET,
                request,
                (Class<Map<String, Object>>)(Class<?>)Map.class
            );

            return response.getBody();
        } catch (Exception e) {
            logger.severe("获取 Notion 用户信息失败: " + e.getMessage());
            throw new RuntimeException("获取 Notion 用户信息失败: " + e.getMessage(), e);
        }
    }
}
