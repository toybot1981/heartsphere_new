package com.heartsphere.controller;

import com.heartsphere.dto.UserMainStoryDTO;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.User;
import com.heartsphere.entity.UserMainStory;
import com.heartsphere.admin.entity.SystemMainStory;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.UserMainStoryRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.admin.repository.SystemMainStoryRepository;
import com.heartsphere.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 用户主线剧情控制器
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/user-main-stories")
public class UserMainStoryController {

    private static final Logger logger = LoggerFactory.getLogger(UserMainStoryController.class);

    @Autowired
    private UserMainStoryRepository userMainStoryRepository;

    @Autowired
    private EraRepository eraRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemMainStoryRepository systemMainStoryRepository;

    /**
     * 获取当前用户的所有主线剧情
     */
    @GetMapping
    public ResponseEntity<List<UserMainStory>> getAllUserMainStories(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        List<UserMainStory> mainStories = userMainStoryRepository.findByUserIdAndIsDeletedFalse(userId);
        return ResponseEntity.ok(mainStories);
    }

    /**
     * 根据场景ID获取当前用户的主线剧情
     */
    @GetMapping("/era/{eraId}")
    public ResponseEntity<UserMainStory> getMainStoryByEraId(
            @PathVariable Long eraId,
            Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        Optional<UserMainStory> mainStory = userMainStoryRepository.findByUserIdAndEraIdAndIsDeletedFalse(userId, eraId);
        if (mainStory.isPresent()) {
            return ResponseEntity.ok(mainStory.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 根据ID获取主线剧情（需要验证所有权）
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserMainStory> getMainStoryById(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        Optional<UserMainStory> mainStory = userMainStoryRepository.findById(id);
        if (mainStory.isPresent() && mainStory.get().getUser().getId().equals(userId) && 
            !mainStory.get().getIsDeleted()) {
            return ResponseEntity.ok(mainStory.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 创建主线剧情
     */
    @PostMapping
    public ResponseEntity<UserMainStory> createMainStory(
            @RequestBody UserMainStoryDTO dto,
            Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        // 验证eraId是否存在
        if (dto.getEraId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        
        // 检查该场景是否已有主线剧情
        Optional<UserMainStory> existing = userMainStoryRepository.findByUserIdAndEraIdAndIsDeletedFalse(
            userId, dto.getEraId());
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // 获取用户和场景
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("用户不存在"));
        Era era = eraRepository.findById(dto.getEraId())
            .orElseThrow(() -> new RuntimeException("场景不存在: " + dto.getEraId()));

        // ========== 初始化过程入库记录 ==========
        logger.info("========== [用户主线剧情创建] 初始化过程入库记录 ==========");
        logger.info("用户ID: {}, 场景ID: {}, 系统预置主线剧情ID: {}", userId, dto.getEraId(), dto.getSystemMainStoryId());
        logger.info("接收到的DTO数据: eraId={}, systemMainStoryId={}, name={}", 
            dto.getEraId(), dto.getSystemMainStoryId(), dto.getName());

        // 从系统预置数据库查询完整数据
        SystemMainStory systemMainStory = null;
        if (dto.getSystemMainStoryId() != null) {
            systemMainStory = systemMainStoryRepository.findById(dto.getSystemMainStoryId())
                .orElseThrow(() -> new RuntimeException("系统预置主线剧情不存在: " + dto.getSystemMainStoryId()));
            
            logger.info("从系统预置数据库查询到的主线剧情: id={}, name={}, age={}, bio={}", 
                systemMainStory.getId(), systemMainStory.getName(), 
                systemMainStory.getAge(), 
                systemMainStory.getBio() != null ? (systemMainStory.getBio().length() > 50 ? systemMainStory.getBio().substring(0, 50) + "..." : systemMainStory.getBio()) : "null");
        }

        // 从系统预置数据创建UserMainStory实体（优先使用预置数据，DTO中的字段作为覆盖）
        UserMainStory mainStory = new UserMainStory();
        mainStory.setUser(user);
        mainStory.setEra(era);
        
        // 如果提供了系统预置主线剧情ID，从预置数据库获取完整数据
        if (systemMainStory != null) {
            // 使用系统预置的完整数据
            mainStory.setName(dto.getName() != null ? dto.getName() : systemMainStory.getName()); // 允许前端自定义名称
            mainStory.setAge(systemMainStory.getAge());
            mainStory.setRole(systemMainStory.getRole() != null ? systemMainStory.getRole() : "叙事者");
            mainStory.setBio(systemMainStory.getBio());
            mainStory.setAvatarUrl(systemMainStory.getAvatarUrl());
            mainStory.setBackgroundUrl(systemMainStory.getBackgroundUrl());
            mainStory.setThemeColor(systemMainStory.getThemeColor());
            mainStory.setColorAccent(systemMainStory.getColorAccent());
            mainStory.setFirstMessage(systemMainStory.getFirstMessage());
            mainStory.setSystemInstruction(systemMainStory.getSystemInstruction());
            mainStory.setVoiceName(systemMainStory.getVoiceName());
            mainStory.setTags(systemMainStory.getTags());
            mainStory.setSpeechStyle(systemMainStory.getSpeechStyle());
            mainStory.setCatchphrases(systemMainStory.getCatchphrases());
            mainStory.setSecrets(systemMainStory.getSecrets());
            mainStory.setMotivations(systemMainStory.getMotivations());
            
            logger.info("使用系统预置数据创建: name={}, age={}, role={}, bio={}", 
                mainStory.getName(), mainStory.getAge(), mainStory.getRole(),
                mainStory.getBio() != null ? (mainStory.getBio().length() > 50 ? mainStory.getBio().substring(0, 50) + "..." : mainStory.getBio()) : "null");
        } else {
            // 如果没有提供系统预置主线剧情ID，使用DTO中的数据（兼容旧逻辑）
            mainStory.setName(dto.getName());
            mainStory.setAge(dto.getAge());
            mainStory.setRole(dto.getRole() != null ? dto.getRole() : "叙事者");
            mainStory.setBio(dto.getBio());
            mainStory.setAvatarUrl(dto.getAvatarUrl());
            mainStory.setBackgroundUrl(dto.getBackgroundUrl());
            mainStory.setThemeColor(dto.getThemeColor());
            mainStory.setColorAccent(dto.getColorAccent());
            mainStory.setFirstMessage(dto.getFirstMessage());
            mainStory.setSystemInstruction(dto.getSystemInstruction());
            mainStory.setVoiceName(dto.getVoiceName());
            mainStory.setTags(dto.getTags());
            mainStory.setSpeechStyle(dto.getSpeechStyle());
            mainStory.setCatchphrases(dto.getCatchphrases());
            mainStory.setSecrets(dto.getSecrets());
            mainStory.setMotivations(dto.getMotivations());
            
            logger.info("使用DTO数据创建（兼容模式）: name={}, age={}, role={}, bio={}", 
                mainStory.getName(), mainStory.getAge(), mainStory.getRole(),
                mainStory.getBio() != null ? (mainStory.getBio().length() > 50 ? mainStory.getBio().substring(0, 50) + "..." : mainStory.getBio()) : "null");
        }
        
        mainStory.setIsDeleted(false);
        mainStory.setCreatedAt(LocalDateTime.now());
        mainStory.setUpdatedAt(LocalDateTime.now());

        logger.info("字段赋值详情: age={}, bio={}, avatarUrl={}, backgroundUrl={}, themeColor={}, colorAccent={}", 
            mainStory.getAge(), 
            mainStory.getBio() != null ? (mainStory.getBio().length() > 50 ? mainStory.getBio().substring(0, 50) + "..." : mainStory.getBio()) : "null",
            mainStory.getAvatarUrl(), mainStory.getBackgroundUrl(), 
            mainStory.getThemeColor(), mainStory.getColorAccent());
        logger.info("其他字段: firstMessage={}, systemInstruction={}, voiceName={}, tags={}", 
            mainStory.getFirstMessage() != null ? (mainStory.getFirstMessage().length() > 50 ? mainStory.getFirstMessage().substring(0, 50) + "..." : mainStory.getFirstMessage()) : "null",
            mainStory.getSystemInstruction() != null ? (mainStory.getSystemInstruction().length() > 50 ? mainStory.getSystemInstruction().substring(0, 50) + "..." : mainStory.getSystemInstruction()) : "null",
            mainStory.getVoiceName(), mainStory.getTags());
        logger.info("扩展字段: speechStyle={}, catchphrases={}, secrets={}, motivations={}", 
            mainStory.getSpeechStyle() != null ? (mainStory.getSpeechStyle().length() > 50 ? mainStory.getSpeechStyle().substring(0, 50) + "..." : mainStory.getSpeechStyle()) : "null",
            mainStory.getCatchphrases(), mainStory.getSecrets() != null ? (mainStory.getSecrets().length() > 50 ? mainStory.getSecrets().substring(0, 50) + "..." : mainStory.getSecrets()) : "null",
            mainStory.getMotivations() != null ? (mainStory.getMotivations().length() > 50 ? mainStory.getMotivations().substring(0, 50) + "..." : mainStory.getMotivations()) : "null");
        logger.info("========== [用户主线剧情创建] 入库记录完成 ==========");

        UserMainStory saved = userMainStoryRepository.save(mainStory);
        
        // 记录保存后的数据
        logger.info("========== [用户主线剧情创建] 保存后数据验证 ==========");
        logger.info("保存成功，ID: {}, name: {}, age: {}, bio: {}", 
            saved.getId(), saved.getName(), saved.getAge(), 
            saved.getBio() != null ? (saved.getBio().length() > 50 ? saved.getBio().substring(0, 50) + "..." : saved.getBio()) : "null");
        logger.info("========== [用户主线剧情创建] 数据验证完成 ==========");
        
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * 更新主线剧情
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserMainStory> updateMainStory(
            @PathVariable Long id,
            @RequestBody UserMainStory mainStoryData,
            Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        Optional<UserMainStory> existing = userMainStoryRepository.findById(id);
        if (!existing.isPresent() || !existing.get().getUser().getId().equals(userId) || 
            existing.get().getIsDeleted()) {
            return ResponseEntity.notFound().build();
        }

        UserMainStory mainStory = existing.get();
        
        // 更新字段
        if (mainStoryData.getName() != null) mainStory.setName(mainStoryData.getName());
        if (mainStoryData.getAge() != null) mainStory.setAge(mainStoryData.getAge());
        if (mainStoryData.getRole() != null) mainStory.setRole(mainStoryData.getRole());
        if (mainStoryData.getBio() != null) mainStory.setBio(mainStoryData.getBio());
        if (mainStoryData.getAvatarUrl() != null) mainStory.setAvatarUrl(mainStoryData.getAvatarUrl());
        if (mainStoryData.getBackgroundUrl() != null) mainStory.setBackgroundUrl(mainStoryData.getBackgroundUrl());
        if (mainStoryData.getThemeColor() != null) mainStory.setThemeColor(mainStoryData.getThemeColor());
        if (mainStoryData.getColorAccent() != null) mainStory.setColorAccent(mainStoryData.getColorAccent());
        if (mainStoryData.getFirstMessage() != null) mainStory.setFirstMessage(mainStoryData.getFirstMessage());
        if (mainStoryData.getSystemInstruction() != null) mainStory.setSystemInstruction(mainStoryData.getSystemInstruction());
        if (mainStoryData.getVoiceName() != null) mainStory.setVoiceName(mainStoryData.getVoiceName());
        if (mainStoryData.getTags() != null) mainStory.setTags(mainStoryData.getTags());
        if (mainStoryData.getSpeechStyle() != null) mainStory.setSpeechStyle(mainStoryData.getSpeechStyle());
        if (mainStoryData.getCatchphrases() != null) mainStory.setCatchphrases(mainStoryData.getCatchphrases());
        if (mainStoryData.getSecrets() != null) mainStory.setSecrets(mainStoryData.getSecrets());
        if (mainStoryData.getMotivations() != null) mainStory.setMotivations(mainStoryData.getMotivations());

        UserMainStory updated = userMainStoryRepository.save(mainStory);
        return ResponseEntity.ok(updated);
    }

    /**
     * 删除主线剧情（软删除）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMainStory(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        Optional<UserMainStory> mainStory = userMainStoryRepository.findById(id);
        if (!mainStory.isPresent() || !mainStory.get().getUser().getId().equals(userId) || 
            mainStory.get().getIsDeleted()) {
            return ResponseEntity.notFound().build();
        }

        UserMainStory story = mainStory.get();
        story.setIsDeleted(true);
        story.setDeletedAt(java.time.LocalDateTime.now());
        userMainStoryRepository.save(story);
        
        return ResponseEntity.noContent().build();
    }
}

