package com.heartsphere.controller;

import com.heartsphere.dto.JournalEntryDTO;
import com.heartsphere.entity.JournalEntry;
import com.heartsphere.entity.User;
import com.heartsphere.entity.World;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.Character;
import com.heartsphere.repository.JournalEntryRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.repository.WorldRepository;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.utils.DTOMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import java.util.List;
import java.util.stream.Collectors;
import java.util.logging.Logger;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/journal-entries")
public class JournalEntryController {

    private static final Logger logger = Logger.getLogger(JournalEntryController.class.getName());

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private EraRepository eraRepository;

    @Autowired
    private CharacterRepository characterRepository;

    // 获取当前用户的所有记录（支持搜索和标签筛选）
    @GetMapping
    public ResponseEntity<List<JournalEntryDTO>> getAllJournalEntries(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tag) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        
        // 检查 principal 是否是 UserDetailsImpl 类型
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        List<JournalEntry> journalEntries;
        if (search != null && !search.trim().isEmpty()) {
            // 搜索功能
            journalEntries = journalEntryRepository.searchByKeyword(userDetails.getId(), search.trim());
        } else if (tag != null && !tag.trim().isEmpty()) {
            // 按标签筛选
            journalEntries = journalEntryRepository.findByTag(userDetails.getId(), tag.trim());
        } else {
            // 获取所有记录
            journalEntries = journalEntryRepository.findByUser_Id(userDetails.getId());
        }
        
        logger.info(String.format("[JournalEntryController] getAllJournalEntries - 查询到 %d 条记录", journalEntries.size()));
        List<JournalEntryDTO> journalEntryDTOs = journalEntries.stream()
            .map(entry -> {
                logger.info(String.format("[JournalEntryController] getAllJournalEntries - 处理记录 ID: %s, Insight: %s", 
                    entry.getId(),
                    entry.getInsight() != null ? (entry.getInsight().length() > 50 ? entry.getInsight().substring(0, 50) + "..." : entry.getInsight()) : "null"));
                return DTOMapper.toJournalEntryDTO(entry);
            })
            .collect(Collectors.toList());
        logger.info(String.format("[JournalEntryController] getAllJournalEntries - 返回 %d 条DTO记录", journalEntryDTOs.size()));
        return ResponseEntity.ok(journalEntryDTOs);
    }

    // 获取指定ID的记录
    @GetMapping("/{id}")
    public ResponseEntity<JournalEntryDTO> getJournalEntryById(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        
        // 检查 principal 是否是 UserDetailsImpl 类型
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        JournalEntry journalEntry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("JournalEntry not found with id: " + id));

        // 确保用户只能访问自己的记录
        if (!journalEntry.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        logger.info(String.format("[JournalEntryController] getJournalEntryById - 从数据库加载记录 ID: %s, Insight: %s", 
            journalEntry.getId(),
            journalEntry.getInsight() != null ? (journalEntry.getInsight().length() > 50 ? journalEntry.getInsight().substring(0, 50) + "..." : journalEntry.getInsight()) : "null"));
        
        JournalEntryDTO dto = DTOMapper.toJournalEntryDTO(journalEntry);
        logger.info(String.format("[JournalEntryController] getJournalEntryById - DTO转换完成, Insight: %s", 
            dto.getInsight() != null ? (dto.getInsight().length() > 50 ? dto.getInsight().substring(0, 50) + "..." : dto.getInsight()) : "null"));
        
        return ResponseEntity.ok(dto);
    }

    // 创建新记录
    @PostMapping
    public ResponseEntity<JournalEntryDTO> createJournalEntry(@RequestBody Map<String, Object> journalEntryMap) {
        System.out.println("Received createJournalEntry request with map: " + journalEntryMap);
        logger.info("========== [JournalEntryController] createJournalEntry - 收到请求 ==========");
        logger.info(String.format("[JournalEntryController] createJournalEntry - 请求参数Map包含的键: %s", journalEntryMap.keySet()));
        Object rawImageUrl = journalEntryMap.get("imageUrl");
        logger.info(String.format("[JournalEntryController] createJournalEntry - 原始imageUrl值: %s (类型: %s, 是否为null: %s)", 
            rawImageUrl != null ? rawImageUrl.toString() : "null", 
            rawImageUrl != null ? rawImageUrl.getClass().getName() : "null",
            rawImageUrl == null ? "true" : "false"));
        if (rawImageUrl != null) {
            String imageUrlStr = rawImageUrl.toString();
            logger.info(String.format("[JournalEntryController] createJournalEntry - imageUrl完整值: %s (长度: %d)", 
                imageUrlStr, imageUrlStr.length()));
        }
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(401).build();
            }
            
            // 检查 principal 是否是 UserDetailsImpl 类型
            if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401).build();
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            System.out.println("User authenticated: " + userDetails.getUsername());

            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userDetails.getId()));
            System.out.println("User found: " + user.getUsername());

            // 创建JournalEntry对象
            JournalEntry journalEntry = new JournalEntry();
            
            // 检查并设置标题
            Object titleObj = journalEntryMap.get("title");
            System.out.println("Title object: " + titleObj + ", type: " + (titleObj != null ? titleObj.getClass().getName() : "null"));
            if (titleObj instanceof String) {
                journalEntry.setTitle((String) titleObj);
            } else if (titleObj != null) {
                journalEntry.setTitle(titleObj.toString());
            } else {
                throw new IllegalArgumentException("Title cannot be null");
            }
            
            // 检查并设置内容
            Object contentObj = journalEntryMap.get("content");
            System.out.println("Content object: " + (contentObj != null ? "exists" : "null") + ", type: " + (contentObj != null ? contentObj.getClass().getName() : "null"));
            if (contentObj instanceof String) {
                journalEntry.setContent((String) contentObj);
            } else if (contentObj != null) {
                journalEntry.setContent(contentObj.toString());
            } else {
                throw new IllegalArgumentException("Content cannot be null");
            }
            
            // 处理日期
            Object entryDateObj = journalEntryMap.get("entryDate");
            System.out.println("EntryDate object: " + entryDateObj + ", type: " + (entryDateObj != null ? entryDateObj.getClass().getName() : "null"));
            if (entryDateObj != null) {
                try {
                    String entryDateStr = entryDateObj instanceof String ? (String) entryDateObj : entryDateObj.toString();
                    // 解析ISO格式的日期字符串
                    DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
                    LocalDateTime entryDate = LocalDateTime.parse(entryDateStr, formatter);
                    journalEntry.setEntryDate(entryDate);
                    System.out.println("Parsed entry date: " + entryDate);
                } catch (Exception e) {
                    // 如果日期解析失败，使用当前时间
                    System.out.println("Date parsing failed: " + e.getMessage());
                    journalEntry.setEntryDate(LocalDateTime.now());
                }
            } else {
                // 如果没有提供日期，使用当前时间
                journalEntry.setEntryDate(LocalDateTime.now());
            }
            
            journalEntry.setUser(user);
            
            // 处理关联的世界、时代、角色
            if (journalEntryMap.containsKey("worldId") && journalEntryMap.get("worldId") != null) {
                Long worldId = Long.valueOf(journalEntryMap.get("worldId").toString());
                World world = worldRepository.findById(worldId)
                    .orElseThrow(() -> new RuntimeException("World not found with id: " + worldId));
                if (!world.getUser().getId().equals(userDetails.getId())) {
                    return ResponseEntity.status(403).build();
                }
                journalEntry.setWorld(world);
            }
            
            if (journalEntryMap.containsKey("eraId") && journalEntryMap.get("eraId") != null) {
                Long eraId = Long.valueOf(journalEntryMap.get("eraId").toString());
                Era era = eraRepository.findById(eraId)
                    .orElseThrow(() -> new RuntimeException("Era not found with id: " + eraId));
                if (!era.getUser().getId().equals(userDetails.getId())) {
                    return ResponseEntity.status(403).build();
                }
                journalEntry.setEra(era);
            }
            
            if (journalEntryMap.containsKey("characterId") && journalEntryMap.get("characterId") != null) {
                Long characterId = Long.valueOf(journalEntryMap.get("characterId").toString());
                Character character = characterRepository.findById(characterId)
                    .orElseThrow(() -> new RuntimeException("Character not found with id: " + characterId));
                if (!character.getUser().getId().equals(userDetails.getId())) {
                    return ResponseEntity.status(403).build();
                }
                journalEntry.setCharacter(character);
            }
            
            // 处理标签
            Object tagsObj = journalEntryMap.get("tags");
            if (tagsObj != null) {
                journalEntry.setTags(tagsObj instanceof String ? (String) tagsObj : tagsObj.toString());
            }
            
            // 处理图片URL
            Object imageUrlObj = journalEntryMap.get("imageUrl");
            logger.info(String.format("[JournalEntryController] createJournalEntry - 接收到imageUrl字段: %s (类型: %s)", 
                imageUrlObj != null ? "存在" : "null",
                imageUrlObj != null ? imageUrlObj.getClass().getName() : "null"));
            if (imageUrlObj != null) {
                String imageUrlValue = imageUrlObj instanceof String ? (String) imageUrlObj : imageUrlObj.toString();
                logger.info(String.format("[JournalEntryController] createJournalEntry - 准备设置imageUrl: %s (长度: %d)", 
                    imageUrlValue, imageUrlValue.length()));
                journalEntry.setImageUrl(imageUrlValue);
                // 验证设置是否成功
                String verifyValue = journalEntry.getImageUrl();
                logger.info(String.format("[JournalEntryController] createJournalEntry - imageUrl已设置到journalEntry对象: %s (长度: %d, 设置成功: %s)", 
                    verifyValue != null ? verifyValue : "null",
                    verifyValue != null ? verifyValue.length() : 0,
                    verifyValue != null && verifyValue.equals(imageUrlValue) ? "是" : "否"));
            } else {
                logger.info("[JournalEntryController] createJournalEntry - imageUrl字段为null，不设置");
                journalEntry.setImageUrl(null); // 显式设置为null
            }
            
            // 处理本我镜像（insight）
            Object insightObj = journalEntryMap.get("insight");
            logger.info(String.format("[JournalEntryController] createJournalEntry - 接收到insight字段: %s (类型: %s)", 
                insightObj != null ? "存在" : "null",
                insightObj != null ? insightObj.getClass().getName() : "null"));
            if (insightObj != null) {
                String insightValue = insightObj instanceof String ? (String) insightObj : insightObj.toString();
                journalEntry.setInsight(insightValue);
                logger.info(String.format("[JournalEntryController] createJournalEntry - 设置insight值: %s (长度: %d)", 
                    insightValue.length() > 100 ? insightValue.substring(0, 100) + "..." : insightValue,
                    insightValue.length()));
            } else {
                logger.info("[JournalEntryController] createJournalEntry - insight字段为null，不设置");
            }
            
            // 在保存前再次验证所有字段
            logger.info("========== [JournalEntryController] createJournalEntry - 保存前验证 ==========");
            logger.info(String.format("[JournalEntryController] createJournalEntry - JournalEntry对象状态: ID=%s, Title=%s", 
                journalEntry.getId(),
                journalEntry.getTitle()));
            logger.info(String.format("[JournalEntryController] createJournalEntry - ImageUrl状态: 值=%s, 是否为null=%s, 是否为空字符串=%s, 长度=%d", 
                journalEntry.getImageUrl() != null ? journalEntry.getImageUrl() : "null",
                journalEntry.getImageUrl() == null ? "true" : "false",
                journalEntry.getImageUrl() != null && journalEntry.getImageUrl().isEmpty() ? "true" : "false",
                journalEntry.getImageUrl() != null ? journalEntry.getImageUrl().length() : 0));
            logger.info(String.format("[JournalEntryController] createJournalEntry - Insight: %s", 
                journalEntry.getInsight() != null ? (journalEntry.getInsight().length() > 50 ? journalEntry.getInsight().substring(0, 50) + "..." : journalEntry.getInsight()) : "null"));
            logger.info("================================================================");
            
            // 保存journalEntry
            logger.info("[JournalEntryController] createJournalEntry - 开始保存JournalEntry到数据库...");
            JournalEntry savedJournalEntry = journalEntryRepository.save(journalEntry);
            
            // 保存后立即验证
            logger.info("========== [JournalEntryController] createJournalEntry - 保存后验证 ==========");
            logger.info(String.format("[JournalEntryController] createJournalEntry - 保存后的JournalEntry对象: ID=%s", savedJournalEntry.getId()));
            logger.info(String.format("[JournalEntryController] createJournalEntry - 保存后的ImageUrl: 值=%s, 是否为null=%s, 长度=%d", 
                savedJournalEntry.getImageUrl() != null ? savedJournalEntry.getImageUrl() : "null",
                savedJournalEntry.getImageUrl() == null ? "true" : "false",
                savedJournalEntry.getImageUrl() != null ? savedJournalEntry.getImageUrl().length() : 0));
            logger.info(String.format("[JournalEntryController] createJournalEntry - Insight: %s", 
                savedJournalEntry.getInsight() != null ? (savedJournalEntry.getInsight().length() > 50 ? savedJournalEntry.getInsight().substring(0, 50) + "..." : savedJournalEntry.getInsight()) : "null"));
            
            // 从数据库重新加载以验证
            JournalEntry reloadedEntry = journalEntryRepository.findById(savedJournalEntry.getId()).orElse(null);
            if (reloadedEntry != null) {
                logger.info(String.format("[JournalEntryController] createJournalEntry - 从数据库重新加载的记录: ID=%s", reloadedEntry.getId()));
                logger.info(String.format("[JournalEntryController] createJournalEntry - 数据库中的ImageUrl: 值=%s, 是否为null=%s, 长度=%d", 
                    reloadedEntry.getImageUrl() != null ? reloadedEntry.getImageUrl() : "null",
                    reloadedEntry.getImageUrl() == null ? "true" : "false",
                    reloadedEntry.getImageUrl() != null ? reloadedEntry.getImageUrl().length() : 0));
            } else {
                logger.warning("[JournalEntryController] createJournalEntry - 无法从数据库重新加载记录");
            }
            logger.info("================================================================");
            
            JournalEntryDTO dto = DTOMapper.toJournalEntryDTO(savedJournalEntry);
            logger.info(String.format("[JournalEntryController] createJournalEntry - DTO转换完成, Insight: %s", 
                dto.getInsight() != null ? (dto.getInsight().length() > 50 ? dto.getInsight().substring(0, 50) + "..." : dto.getInsight()) : "null"));
            
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.out.println("Error in createJournalEntry: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // 更新指定ID的记录
    @PutMapping("/{id}")
    public ResponseEntity<JournalEntryDTO> updateJournalEntry(@PathVariable String id, @RequestBody JournalEntryDTO journalEntryDTO) {
        logger.info(String.format("[JournalEntryController] updateJournalEntry - 接收到更新请求, ID: %s", id));
        logger.info(String.format("[JournalEntryController] updateJournalEntry - 请求体JSON中的insight字段: %s", 
            journalEntryDTO.getInsight() != null 
                ? (journalEntryDTO.getInsight().length() > 100 
                    ? journalEntryDTO.getInsight().substring(0, 100) + "..." 
                    : journalEntryDTO.getInsight()) + " (长度: " + journalEntryDTO.getInsight().length() + ")"
                : "null或不存在"));
        logger.info(String.format("[JournalEntryController] updateJournalEntry - DTO对象字段详情: title=%s, content长度=%d, insight=%s", 
            journalEntryDTO.getTitle(),
            journalEntryDTO.getContent() != null ? journalEntryDTO.getContent().length() : 0,
            journalEntryDTO.getInsight() != null ? "存在(长度:" + journalEntryDTO.getInsight().length() + ")" : "null"));
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        
        // 检查 principal 是否是 UserDetailsImpl 类型
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        JournalEntry journalEntry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("JournalEntry not found with id: " + id));

        logger.info(String.format("[JournalEntryController] updateJournalEntry - 从数据库加载的JournalEntry, ID: %s, 当前insight: %s", 
            journalEntry.getId(),
            journalEntry.getInsight() != null ? (journalEntry.getInsight().length() > 50 ? journalEntry.getInsight().substring(0, 50) + "..." : journalEntry.getInsight()) : "null"));

        // 确保用户只能更新自己的记录
        if (!journalEntry.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        journalEntry.setTitle(journalEntryDTO.getTitle());
        journalEntry.setContent(journalEntryDTO.getContent());
        journalEntry.setTags(journalEntryDTO.getTags());
        
        // 更新图片URL
        String newImageUrl = journalEntryDTO.getImageUrl();
        logger.info(String.format("[JournalEntryController] updateJournalEntry - DTO中的imageUrl: 值=%s, 是否为null=%s, 长度=%d", 
            newImageUrl != null ? newImageUrl : "null",
            newImageUrl == null ? "true" : "false",
            newImageUrl != null ? newImageUrl.length() : 0));
        journalEntry.setImageUrl(newImageUrl);
        logger.info(String.format("[JournalEntryController] updateJournalEntry - imageUrl已设置到journalEntry对象: 值=%s", 
            journalEntry.getImageUrl() != null ? journalEntry.getImageUrl() : "null"));
        
        // 更新insight字段
        // 重要：只有当DTO中的insight字段明确存在（不为null）时才更新
        // 如果DTO中的insight为null，可能是前端未传递该字段（用户未修改），应该保留原有值
        // 注意：这里需要区分"未传递字段"（保留原值）和"传递null"（清空值）
        // 由于JSON序列化时undefined会被省略，如果前端传递了null，DTO中会是null
        // 如果前端未传递字段，DTO中也会是null（Jackson默认行为）
        // 为了安全，我们只在DTO明确包含insight字段且不为null时才更新
        // 但实际上，如果前端想清空insight，应该传递空字符串""而不是null
        String newInsight = journalEntryDTO.getInsight();
        logger.info(String.format("[JournalEntryController] updateJournalEntry - DTO中的insight: %s", 
            newInsight != null ? (newInsight.length() > 50 ? newInsight.substring(0, 50) + "..." : newInsight) + " (长度: " + newInsight.length() + ")" : "null"));
        
        // 如果DTO中的insight不为null，则更新（包括空字符串，表示用户想清空）
        // 如果DTO中的insight为null，可能是前端未传递（用户未修改），保留原有值
        if (newInsight != null) {
            logger.info(String.format("[JournalEntryController] updateJournalEntry - 更新insight, 新值: %s (长度: %s)", 
                newInsight.length() > 50 ? newInsight.substring(0, 50) + "..." : newInsight,
                String.valueOf(newInsight.length())));
            journalEntry.setInsight(newInsight);
        } else {
            logger.info(String.format("[JournalEntryController] updateJournalEntry - DTO中insight为null，保留原有值: %s", 
                journalEntry.getInsight() != null ? (journalEntry.getInsight().length() > 50 ? journalEntry.getInsight().substring(0, 50) + "..." : journalEntry.getInsight()) : "null"));
            // 不更新insight，保留原有值
        }
        
        logger.info(String.format("[JournalEntryController] updateJournalEntry - insight已设置到JournalEntry对象, 当前值: %s", 
            journalEntry.getInsight() != null ? (journalEntry.getInsight().length() > 50 ? journalEntry.getInsight().substring(0, 50) + "..." : journalEntry.getInsight()) : "null"));
        
        journalEntry.setEntryDate(journalEntryDTO.getEntryDate());

        // 更新关联的世界、时代、角色
        if (journalEntryDTO.getWorldId() != null) {
            World world = worldRepository.findById(journalEntryDTO.getWorldId())
                .orElseThrow(() -> new RuntimeException("World not found with id: " + journalEntryDTO.getWorldId()));
            if (!world.getUser().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).build();
            }
            journalEntry.setWorld(world);
        } else {
            journalEntry.setWorld(null);
        }

        if (journalEntryDTO.getEraId() != null) {
            Era era = eraRepository.findById(journalEntryDTO.getEraId())
                .orElseThrow(() -> new RuntimeException("Era not found with id: " + journalEntryDTO.getEraId()));
            if (!era.getUser().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).build();
            }
            journalEntry.setEra(era);
        } else {
            journalEntry.setEra(null);
        }

        if (journalEntryDTO.getCharacterId() != null) {
            Character character = characterRepository.findById(journalEntryDTO.getCharacterId())
                .orElseThrow(() -> new RuntimeException("Character not found with id: " + journalEntryDTO.getCharacterId()));
            if (!character.getUser().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).build();
            }
            journalEntry.setCharacter(character);
        } else {
            journalEntry.setCharacter(null);
        }

        logger.info("[JournalEntryController] updateJournalEntry - 开始保存更新后的JournalEntry到数据库...");
        logger.info(String.format("[JournalEntryController] updateJournalEntry - 保存前的JournalEntry对象状态: insight=%s (长度: %s)", 
            journalEntry.getInsight() != null ? (journalEntry.getInsight().length() > 50 ? journalEntry.getInsight().substring(0, 50) + "..." : journalEntry.getInsight()) : "null",
            journalEntry.getInsight() != null ? String.valueOf(journalEntry.getInsight().length()) : "0"));
        logger.info(String.format("[JournalEntryController] updateJournalEntry - 保存前的ImageUrl: 值=%s, 是否为null=%s, 长度=%d", 
            journalEntry.getImageUrl() != null ? journalEntry.getImageUrl() : "null",
            journalEntry.getImageUrl() == null ? "true" : "false",
            journalEntry.getImageUrl() != null ? journalEntry.getImageUrl().length() : 0));
        
        JournalEntry updatedJournalEntry = journalEntryRepository.save(journalEntry);
        logger.info(String.format("[JournalEntryController] updateJournalEntry - JournalEntry.save()返回的对象: ID=%s, Insight=%s (长度: %s)", 
            updatedJournalEntry.getId(),
            updatedJournalEntry.getInsight() != null ? (updatedJournalEntry.getInsight().length() > 50 ? updatedJournalEntry.getInsight().substring(0, 50) + "..." : updatedJournalEntry.getInsight()) : "null",
            updatedJournalEntry.getInsight() != null ? String.valueOf(updatedJournalEntry.getInsight().length()) : "0"));
        logger.info(String.format("[JournalEntryController] updateJournalEntry - 保存后的ImageUrl: 值=%s, 是否为null=%s, 长度=%d", 
            updatedJournalEntry.getImageUrl() != null ? updatedJournalEntry.getImageUrl() : "null",
            updatedJournalEntry.getImageUrl() == null ? "true" : "false",
            updatedJournalEntry.getImageUrl() != null ? updatedJournalEntry.getImageUrl().length() : 0));
        
        // 从数据库重新加载以验证是否真的保存了
        JournalEntry reloadedEntry = journalEntryRepository.findById(id).orElse(null);
        if (reloadedEntry != null) {
            logger.info(String.format("[JournalEntryController] updateJournalEntry - 从数据库重新加载后的JournalEntry: ID=%s, Insight=%s (长度: %s)", 
                reloadedEntry.getId(),
                reloadedEntry.getInsight() != null ? (reloadedEntry.getInsight().length() > 50 ? reloadedEntry.getInsight().substring(0, 50) + "..." : reloadedEntry.getInsight()) : "null",
                reloadedEntry.getInsight() != null ? String.valueOf(reloadedEntry.getInsight().length()) : "0"));
            // 使用重新加载的实体来构建DTO，确保使用数据库中的最新值
            updatedJournalEntry = reloadedEntry;
        } else {
            logger.warning(String.format("[JournalEntryController] updateJournalEntry - 警告：无法从数据库重新加载ID为%s的JournalEntry", id));
        }
        
        JournalEntryDTO dto = DTOMapper.toJournalEntryDTO(updatedJournalEntry);
        logger.info(String.format("[JournalEntryController] updateJournalEntry - DTO转换完成, Insight: %s", 
            dto.getInsight() != null ? (dto.getInsight().length() > 50 ? dto.getInsight().substring(0, 50) + "..." : dto.getInsight()) : "null"));
        
        return ResponseEntity.ok(dto);
    }

    // 删除指定ID的记录
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJournalEntry(@PathVariable String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        
        // 检查 principal 是否是 UserDetailsImpl 类型
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        JournalEntry journalEntry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("JournalEntry not found with id: " + id));

        // 确保用户只能删除自己的记录
        if (!journalEntry.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        journalEntryRepository.delete(journalEntry);
        return ResponseEntity.noContent().build();
    }
}