package com.heartsphere.controller;

import com.heartsphere.dto.UserMainStoryDTO;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.User;
import com.heartsphere.entity.UserMainStory;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.dto.ApiResponse;
import com.heartsphere.repository.UserMainStoryRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.MembershipService;
import com.heartsphere.util.GuestAccessChecker;
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
    private MembershipService membershipService;

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
    public ResponseEntity<?> createMainStory(
            @RequestBody UserMainStoryDTO dto,
            Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 检查是否为游客
        if (GuestAccessChecker.isGuest(membershipService)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                ApiResponse.error(403, GuestAccessChecker.GUEST_ACCESS_DENIED_MESSAGE)
            );
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

        // 从DTO数据创建UserMainStory实体
        UserMainStory mainStory = new UserMainStory();
        mainStory.setUser(user);
        mainStory.setEra(era);
        
        // 使用DTO中的数据创建用户主线剧情
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
        
        mainStory.setIsDeleted(false);
        mainStory.setCreatedAt(LocalDateTime.now());
        mainStory.setUpdatedAt(LocalDateTime.now());

        UserMainStory saved = userMainStoryRepository.save(mainStory);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * 更新主线剧情
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMainStory(
            @PathVariable Long id,
            @RequestBody UserMainStory mainStoryData,
            Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 检查是否为游客
        if (GuestAccessChecker.isGuest(membershipService)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                ApiResponse.error(403, GuestAccessChecker.GUEST_ACCESS_DENIED_MESSAGE)
            );
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
    public ResponseEntity<?> deleteMainStory(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 检查是否为游客
        if (GuestAccessChecker.isGuest(membershipService)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                ApiResponse.error(403, GuestAccessChecker.GUEST_ACCESS_DENIED_MESSAGE)
            );
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

