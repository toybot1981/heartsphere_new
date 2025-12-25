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
            
            logger.info(String.format("[JournalEntryController] createJournalEntry - JournalEntry对象创建完成, ID: %s, Title: %s, Insight: %s", 
                journalEntry.getId(),
                journalEntry.getTitle(),
                journalEntry.getInsight() != null ? (journalEntry.getInsight().length() > 50 ? journalEntry.getInsight().substring(0, 50) + "..." : journalEntry.getInsight()) : "null"));
            
            // 保存journalEntry
            logger.info("[JournalEntryController] createJournalEntry - 开始保存JournalEntry到数据库...");
            JournalEntry savedJournalEntry = journalEntryRepository.save(journalEntry);
            logger.info(String.format("[JournalEntryController] createJournalEntry - JournalEntry保存成功, ID: %s, Insight: %s", 
                savedJournalEntry.getId(),
                savedJournalEntry.getInsight() != null ? (savedJournalEntry.getInsight().length() > 50 ? savedJournalEntry.getInsight().substring(0, 50) + "..." : savedJournalEntry.getInsight()) : "null"));
            
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
        logger.info(String.format("[JournalEntryController] updateJournalEntry - DTO中的insight: %s (类型: %s, 长度: %s)", 
            journalEntryDTO.getInsight() != null ? "存在" : "null",
            journalEntryDTO.getInsight() != null ? journalEntryDTO.getInsight().getClass().getName() : "null",
            journalEntryDTO.getInsight() != null ? String.valueOf(journalEntryDTO.getInsight().length()) : "0"));
        
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
        
        // 更新insight字段
        String newInsight = journalEntryDTO.getInsight();
        logger.info(String.format("[JournalEntryController] updateJournalEntry - 准备更新insight, 新值: %s (长度: %s)", 
            newInsight != null ? (newInsight.length() > 50 ? newInsight.substring(0, 50) + "..." : newInsight) : "null",
            newInsight != null ? String.valueOf(newInsight.length()) : "0"));
        journalEntry.setInsight(newInsight);
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
        JournalEntry updatedJournalEntry = journalEntryRepository.save(journalEntry);
        logger.info(String.format("[JournalEntryController] updateJournalEntry - JournalEntry保存成功, ID: %s, Insight: %s", 
            updatedJournalEntry.getId(),
            updatedJournalEntry.getInsight() != null ? (updatedJournalEntry.getInsight().length() > 50 ? updatedJournalEntry.getInsight().substring(0, 50) + "..." : updatedJournalEntry.getInsight()) : "null"));
        
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