package com.heartsphere.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.dto.EraDTO;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.User;
import com.heartsphere.entity.World;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.repository.WorldRepository;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.utils.DTOMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/eras")
public class EraController {

    @Autowired
    private EraRepository eraRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private com.heartsphere.shared.util.ImageUrlUtils imageUrlUtils;

    @Autowired
    private com.heartsphere.service.MembershipService membershipService;

    @Autowired
    private com.heartsphere.repository.SystemEraRepository systemEraRepository;

    // 获取指定世界的所有时代（必须在 /{id} 之前）
    @GetMapping("/world/{worldId}")
    public ResponseEntity<List<EraDTO>> getErasByWorldId(@PathVariable Long worldId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // 检查是否为游客（体验会员）
        if (com.heartsphere.util.GuestAccessChecker.isGuest(membershipService)) {
            // 游客模式：返回硬编码的系统预置场景（ID: 50，日常生活助手）
            java.util.Optional<com.heartsphere.entity.SystemEra> presetEra = systemEraRepository.findById(50L);
            if (presetEra.isPresent() && presetEra.get().getIsActive()) {
                com.heartsphere.entity.SystemEra systemEra = presetEra.get();
                EraDTO eraDTO = new EraDTO();
                eraDTO.setId(systemEra.getId());
                eraDTO.setName(systemEra.getName());
                eraDTO.setDescription(systemEra.getDescription());
                eraDTO.setImageUrl(systemEra.getImageUrl());
                eraDTO.setSystemEraId(systemEra.getId());
                eraDTO.setStyle(systemEra.getStyle() != null ? systemEra.getStyle() : "minimalist");
                // 生成图片多分辨率版本
                if (systemEra.getImageUrl() != null && imageUrlUtils != null) {
                    eraDTO.setImageVariants(imageUrlUtils.generateImageVariants(systemEra.getImageUrl()));
                }
                return ResponseEntity.ok(java.util.Arrays.asList(eraDTO));
            }
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
        
        // 正常模式：直接获取当前用户在指定世界中的时代
        List<Era> eras = eraRepository.findByWorld_IdAndUser_Id(worldId, userDetails.getId());
        List<EraDTO> eraDTOs = eras.stream()
            .map(DTOMapper::toEraDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(eraDTOs);
    }

    // 获取当前用户的所有时代
    @GetMapping
    public ResponseEntity<List<EraDTO>> getAllEras() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // 检查是否为游客（体验会员）
        if (com.heartsphere.util.GuestAccessChecker.isGuest(membershipService)) {
            // 游客模式：返回硬编码的系统预置场景（ID: 50，日常生活助手）
            java.util.Optional<com.heartsphere.entity.SystemEra> presetEra = systemEraRepository.findById(50L);
            if (presetEra.isPresent() && presetEra.get().getIsActive()) {
                // 将 SystemEra 转换为 EraDTO
                com.heartsphere.entity.SystemEra systemEra = presetEra.get();
                EraDTO eraDTO = new EraDTO();
                eraDTO.setId(systemEra.getId());
                eraDTO.setName(systemEra.getName());
                eraDTO.setDescription(systemEra.getDescription());
                eraDTO.setImageUrl(systemEra.getImageUrl());
                eraDTO.setSystemEraId(systemEra.getId());
                eraDTO.setStyle(systemEra.getStyle() != null ? systemEra.getStyle() : "minimalist");
                // 生成图片多分辨率版本
                if (systemEra.getImageUrl() != null && imageUrlUtils != null) {
                    eraDTO.setImageVariants(imageUrlUtils.generateImageVariants(systemEra.getImageUrl()));
                }
                return ResponseEntity.ok(java.util.Arrays.asList(eraDTO));
            }
            // 如果预置场景不存在，返回空列表
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
        
        // 正常模式：返回当前用户的所有场景
        List<Era> eras = eraRepository.findByUser_Id(userDetails.getId());
        List<EraDTO> eraDTOs = eras.stream()
            .map(DTOMapper::toEraDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(eraDTOs);
    }

    // 获取指定ID的时代（必须放在最后，作为通用路径变量）
    @GetMapping("/{id}")
    public ResponseEntity<EraDTO> getEraById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Era era = eraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Era not found with id: " + id));
        
        // 确保关联已加载
        if (era.getWorld() != null) {
            era.getWorld().getId(); // 触发加载
        }
        if (era.getUser() != null) {
            era.getUser().getId(); // 触发加载
        }

        // 确保用户只能访问自己的时代
        if (!era.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(DTOMapper.toEraDTO(era));
    }

    // 创建新时代
    @PostMapping
    public ResponseEntity<?> createEra(@RequestBody EraDTO eraDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // 检查是否为游客（体验会员）
        if (com.heartsphere.util.GuestAccessChecker.isGuest(membershipService)) {
            return ResponseEntity.status(403).body(
                ApiResponse.error(403, com.heartsphere.util.GuestAccessChecker.GUEST_ACCESS_DENIED_MESSAGE)
            );
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userDetails.getId()));

        World world = worldRepository.findById(eraDTO.getWorldId())
                .orElseThrow(() -> new RuntimeException("World not found with id: " + eraDTO.getWorldId()));

        // 确保世界属于当前用户
        if (!world.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        // 检查是否已经存在相同的 systemEraId（防止重复添加预置场景）
        if (eraDTO.getSystemEraId() != null) {
            boolean exists = eraRepository.existsByWorldIdAndSystemEraId(world.getId(), eraDTO.getSystemEraId());
            if (exists) {
                return ResponseEntity.status(400).body(
                    ApiResponse.error("该预置场景已经添加过了，不能重复添加")
                );
            }
        }

        Era era = new Era();
        era.setName(eraDTO.getName());
        era.setDescription(eraDTO.getDescription());
        era.setStartYear(eraDTO.getStartYear());
        era.setEndYear(eraDTO.getEndYear());
        // 将完整URL转换为相对路径存储
        era.setImageUrl(imageUrlUtils.toRelativePath(eraDTO.getImageUrl()));
        era.setSystemEraId(eraDTO.getSystemEraId());
        era.setWorld(world);
        era.setUser(user);

        Era savedEra = eraRepository.save(era);
        return ResponseEntity.ok(ApiResponse.success("场景创建成功", DTOMapper.toEraDTO(savedEra)));
    }

    // 更新指定ID的时代
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEra(@PathVariable Long id, @RequestBody EraDTO eraDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // 检查是否为游客（体验会员）
        if (com.heartsphere.util.GuestAccessChecker.isGuest(membershipService)) {
            return ResponseEntity.status(403).body(
                ApiResponse.error(403, com.heartsphere.util.GuestAccessChecker.GUEST_ACCESS_DENIED_MESSAGE)
            );
        }

        Era era = eraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Era not found with id: " + id));
        
        // 确保关联已加载
        if (era.getWorld() != null) {
            era.getWorld().getId(); // 触发加载
        }
        if (era.getUser() != null) {
            era.getUser().getId(); // 触发加载
        }

        // 确保用户只能更新自己的时代
        if (!era.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        era.setName(eraDTO.getName());
        era.setDescription(eraDTO.getDescription());
        era.setStartYear(eraDTO.getStartYear());
        era.setEndYear(eraDTO.getEndYear());
        // 将完整URL转换为相对路径存储
        era.setImageUrl(imageUrlUtils.toRelativePath(eraDTO.getImageUrl()));
        era.setSystemEraId(eraDTO.getSystemEraId());

        // 如果worldId改变，更新world关联
        if (eraDTO.getWorldId() != null && !eraDTO.getWorldId().equals(era.getWorld().getId())) {
            World world = worldRepository.findById(eraDTO.getWorldId())
                    .orElseThrow(() -> new RuntimeException("World not found with id: " + eraDTO.getWorldId()));
            // 确保新世界属于当前用户
            if (!world.getUser().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).build();
            }
            era.setWorld(world);
        }

        Era updatedEra = eraRepository.save(era);
        return ResponseEntity.ok(DTOMapper.toEraDTO(updatedEra));
    }

    // 删除指定ID的时代
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEra(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // 检查是否为游客（体验会员）
        if (com.heartsphere.util.GuestAccessChecker.isGuest(membershipService)) {
            return ResponseEntity.status(403).body(
                ApiResponse.error(403, com.heartsphere.util.GuestAccessChecker.GUEST_ACCESS_DENIED_MESSAGE)
            );
        }

        Era era = eraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Era not found with id: " + id));

        // 确保用户只能删除自己的时代
        if (!era.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        // 软删除：标记为已删除
        era.setIsDeleted(true);
        era.setDeletedAt(java.time.LocalDateTime.now());
        eraRepository.save(era);
        return ResponseEntity.noContent().build();
    }
}