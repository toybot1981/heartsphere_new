package com.heartsphere.controller;

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

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/eras")
public class EraController {

    @Autowired
    private EraRepository eraRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorldRepository worldRepository;

    // 获取当前用户的所有时代
    @GetMapping
    public ResponseEntity<List<EraDTO>> getAllEras() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Era> eras = eraRepository.findByUser_Id(userDetails.getId());
        List<EraDTO> eraDTOs = eras.stream()
            .map(DTOMapper::toEraDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(eraDTOs);
    }

    // 获取指定ID的时代
    @GetMapping("/{id}")
    public ResponseEntity<EraDTO> getEraById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
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

    // 获取指定世界的所有时代
    @GetMapping("/world/{worldId}")
    public ResponseEntity<List<EraDTO>> getErasByWorldId(@PathVariable Long worldId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        // 直接获取当前用户在指定世界中的时代
        List<Era> eras = eraRepository.findByWorld_IdAndUser_Id(worldId, userDetails.getId());
        List<EraDTO> eraDTOs = eras.stream()
            .map(DTOMapper::toEraDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(eraDTOs);
    }

    // 创建新时代
    @PostMapping
    public ResponseEntity<EraDTO> createEra(@RequestBody EraDTO eraDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userDetails.getId()));

        World world = worldRepository.findById(eraDTO.getWorldId())
                .orElseThrow(() -> new RuntimeException("World not found with id: " + eraDTO.getWorldId()));

        // 确保世界属于当前用户
        if (!world.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        Era era = new Era();
        era.setName(eraDTO.getName());
        era.setDescription(eraDTO.getDescription());
        era.setStartYear(eraDTO.getStartYear());
        era.setEndYear(eraDTO.getEndYear());
        era.setImageUrl(eraDTO.getImageUrl());
        era.setWorld(world);
        era.setUser(user);

        Era savedEra = eraRepository.save(era);
        return ResponseEntity.ok(DTOMapper.toEraDTO(savedEra));
    }

    // 更新指定ID的时代
    @PutMapping("/{id}")
    public ResponseEntity<EraDTO> updateEra(@PathVariable Long id, @RequestBody EraDTO eraDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
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

        // 确保用户只能更新自己的时代
        if (!era.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        era.setName(eraDTO.getName());
        era.setDescription(eraDTO.getDescription());
        era.setStartYear(eraDTO.getStartYear());
        era.setEndYear(eraDTO.getEndYear());
        era.setImageUrl(eraDTO.getImageUrl());

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
    public ResponseEntity<Void> deleteEra(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Era era = eraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Era not found with id: " + id));

        // 确保用户只能删除自己的时代
        if (!era.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        eraRepository.delete(era);
        return ResponseEntity.noContent().build();
    }
}