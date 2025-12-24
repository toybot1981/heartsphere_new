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

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/journal-entries")
public class JournalEntryController {

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
        
        List<JournalEntryDTO> journalEntryDTOs = journalEntries.stream()
            .map(DTOMapper::toJournalEntryDTO)
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

        JournalEntry journalEntry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("JournalEntry not found with id: " + id));

        // 确保用户只能访问自己的记录
        if (!journalEntry.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(DTOMapper.toJournalEntryDTO(journalEntry));
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
            if (insightObj != null) {
                journalEntry.setInsight(insightObj instanceof String ? (String) insightObj : insightObj.toString());
            }
            
            System.out.println("JournalEntry object created: " + journalEntry);
            
            // 保存journalEntry
            System.out.println("Attempting to save journal entry...");
            JournalEntry savedJournalEntry = journalEntryRepository.save(journalEntry);
            System.out.println("Journal entry saved successfully: " + savedJournalEntry);
            return ResponseEntity.ok(DTOMapper.toJournalEntryDTO(savedJournalEntry));
        } catch (Exception e) {
            System.out.println("Error in createJournalEntry: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // 更新指定ID的记录
    @PutMapping("/{id}")
    public ResponseEntity<JournalEntryDTO> updateJournalEntry(@PathVariable String id, @RequestBody JournalEntryDTO journalEntryDTO) {
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

        // 确保用户只能更新自己的记录
        if (!journalEntry.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        journalEntry.setTitle(journalEntryDTO.getTitle());
        journalEntry.setContent(journalEntryDTO.getContent());
        journalEntry.setTags(journalEntryDTO.getTags());
        journalEntry.setInsight(journalEntryDTO.getInsight());
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
        return ResponseEntity.ok(DTOMapper.toJournalEntryDTO(updatedJournalEntry));
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