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
            // 搜索功能 - 使用优化后的查询避免N+1问题
            journalEntries = journalEntryRepository.searchByKeywordWithAssociations(userDetails.getId(), search.trim());
        } else if (tag != null && !tag.trim().isEmpty()) {
            // 按标签筛选 - 使用优化后的查询避免N+1问题
            journalEntries = journalEntryRepository.findByTagWithAssociations(userDetails.getId(), tag.trim());
        } else {
            // 获取所有记录 - 使用优化后的查询避免N+1问题
            journalEntries = journalEntryRepository.findByUserIdWithAssociations(userDetails.getId());
        }
        
        logger.info(String.format("[JournalEntryController] getAllJournalEntries - 查询到 %d 条记录", journalEntries.size()));
        List<JournalEntryDTO> journalEntryDTOs = journalEntries.stream()
            .map(entry -> DTOMapper.toJournalEntryDTO(entry))
            .collect(Collectors.toList());
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

        // 使用优化后的查询，一次性加载所有关联实体
        JournalEntry journalEntry = journalEntryRepository.findByIdWithAssociations(id);
        if (journalEntry == null) {
            throw new RuntimeException("JournalEntry not found with id: " + id);
        }

        // 确保用户只能访问自己的记录
        if (!journalEntry.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        logger.fine(String.format("[JournalEntryController] getJournalEntryById - 从数据库加载记录 ID: %s", journalEntry.getId()));
        
        JournalEntryDTO dto = DTOMapper.toJournalEntryDTO(journalEntry);
        
        return ResponseEntity.ok(dto);
    }

    // 创建新记录
    @PostMapping
    public ResponseEntity<JournalEntryDTO> createJournalEntry(@RequestBody Map<String, Object> journalEntryMap) {
        logger.fine("[JournalEntryController] 收到创建日志条目请求");
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
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userDetails.getId()));

            // 创建JournalEntry对象
            JournalEntry journalEntry = new JournalEntry();

            // 检查并设置标题
            Object titleObj = journalEntryMap.get("title");
            if (titleObj instanceof String) {
                journalEntry.setTitle((String) titleObj);
            } else if (titleObj != null) {
                journalEntry.setTitle(titleObj.toString());
            } else {
                throw new IllegalArgumentException("Title cannot be null");
            }

            // 检查并设置内容
            Object contentObj = journalEntryMap.get("content");
            if (contentObj instanceof String) {
                journalEntry.setContent((String) contentObj);
            } else if (contentObj != null) {
                journalEntry.setContent(contentObj.toString());
            } else {
                throw new IllegalArgumentException("Content cannot be null");
            }

            // 处理日期
            Object entryDateObj = journalEntryMap.get("entryDate");
            if (entryDateObj != null) {
                try {
                    String entryDateStr = entryDateObj instanceof String ? (String) entryDateObj : entryDateObj.toString();
                    // 解析ISO格式的日期字符串
                    DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
                    LocalDateTime entryDate = LocalDateTime.parse(entryDateStr, formatter);
                    journalEntry.setEntryDate(entryDate);
                } catch (Exception e) {
                    // 如果日期解析失败，使用当前时间
                    logger.warning("日期解析失败: " + e.getMessage() + ", 使用当前时间");
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
            if (imageUrlObj != null) {
                String imageUrlValue = imageUrlObj instanceof String ? (String) imageUrlObj : imageUrlObj.toString();
                journalEntry.setImageUrl(imageUrlValue);
            } else {
                journalEntry.setImageUrl(null);
            }

            // 处理本我镜像（insight）
            Object insightObj = journalEntryMap.get("insight");
            if (insightObj != null) {
                String insightValue = insightObj instanceof String ? (String) insightObj : insightObj.toString();
                journalEntry.setInsight(insightValue);
            }

            // 保存journalEntry
            JournalEntry savedJournalEntry = journalEntryRepository.save(journalEntry);
            logger.info(String.format("[JournalEntryController] 创建日志成功，ID: %s, 标题: %s", savedJournalEntry.getId(), savedJournalEntry.getTitle()));

            JournalEntryDTO dto = DTOMapper.toJournalEntryDTO(savedJournalEntry);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            logger.severe("创建日志条目失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // 更新指定ID的记录
    @PutMapping("/{id}")
    public ResponseEntity<JournalEntryDTO> updateJournalEntry(@PathVariable String id, @RequestBody JournalEntryDTO journalEntryDTO) {
        logger.fine(String.format("[JournalEntryController] updateJournalEntry - 接收到更新请求, ID: %s", id));
        
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

        logger.fine(String.format("[JournalEntryController] updateJournalEntry - 从数据库加载记录, ID: %s", journalEntry.getId()));

        // 确保用户只能更新自己的记录
        if (!journalEntry.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        journalEntry.setTitle(journalEntryDTO.getTitle());
        journalEntry.setContent(journalEntryDTO.getContent());
        journalEntry.setTags(journalEntryDTO.getTags());
        
        // 更新图片URL
        journalEntry.setImageUrl(journalEntryDTO.getImageUrl());
        
        // 更新insight字段
        // 如果DTO中的insight不为null，则更新（包括空字符串，表示用户想清空）
        // 如果DTO中的insight为null，可能是前端未传递（用户未修改），保留原有值
        String newInsight = journalEntryDTO.getInsight();
        if (newInsight != null) {
            journalEntry.setInsight(newInsight);
        }
        
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

        JournalEntry updatedJournalEntry = journalEntryRepository.save(journalEntry);
        logger.info(String.format("[JournalEntryController] updateJournalEntry - 更新成功, ID: %s", updatedJournalEntry.getId()));
        
        // 从数据库重新加载以验证是否真的保存了
        JournalEntry reloadedEntry = journalEntryRepository.findById(id).orElse(null);
        if (reloadedEntry != null) {
            // 使用重新加载的实体来构建DTO，确保使用数据库中的最新值
            updatedJournalEntry = reloadedEntry;
        } else {
            logger.warning(String.format("[JournalEntryController] updateJournalEntry - 警告：无法从数据库重新加载ID为%s的JournalEntry", id));
        }
        
        JournalEntryDTO dto = DTOMapper.toJournalEntryDTO(updatedJournalEntry);
        logger.fine(String.format("[JournalEntryController] updateJournalEntry - DTO转换完成", 
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