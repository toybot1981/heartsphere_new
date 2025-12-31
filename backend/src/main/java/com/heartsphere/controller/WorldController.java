package com.heartsphere.controller;

import com.heartsphere.dto.WorldDTO;
import com.heartsphere.entity.User;
import com.heartsphere.entity.World;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.repository.WorldRepository;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.utils.DTOMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/worlds")
public class WorldController {

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private UserRepository userRepository;

    // 获取当前用户的所有世界
    @GetMapping
    public ResponseEntity<List<WorldDTO>> getAllWorlds() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            // 检查认证信息是否存在
            if (authentication == null || authentication.getPrincipal() == null) {
                java.util.logging.Logger.getLogger(WorldController.class.getName())
                    .warning("getAllWorlds: authentication is null");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            // 检查是否是匿名用户
            if (authentication.getPrincipal() instanceof String && 
                authentication.getPrincipal().equals("anonymousUser")) {
                java.util.logging.Logger.getLogger(WorldController.class.getName())
                    .warning("getAllWorlds: anonymous user");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // 正常模式：返回当前用户自己的世界（不再检查共享模式）
            List<World> userWorlds = worldRepository.findByUserId(userDetails.getId());
            List<WorldDTO> worldDTOs = userWorlds.stream()
                .map(DTOMapper::toWorldDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(worldDTOs);
        } catch (ClassCastException e) {
            // 认证信息类型不匹配
            java.util.logging.Logger.getLogger(WorldController.class.getName())
                .warning("getAllWorlds: ClassCastException - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            // 记录错误日志
            java.util.logging.Logger.getLogger(WorldController.class.getName())
                .severe("getAllWorlds: Exception - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 获取指定ID的世界
    @GetMapping("/{id}")
    public ResponseEntity<WorldDTO> getWorldById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        World world = worldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("World not found with id: " + id));

        // 确保用户只能访问自己的世界
        if (!world.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(DTOMapper.toWorldDTO(world));
    }

    // 创建新的世界
    @PostMapping
    public ResponseEntity<WorldDTO> createWorld(@RequestBody WorldDTO worldDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userDetails.getId()));

        World world = new World();
        world.setName(worldDTO.getName());
        world.setDescription(worldDTO.getDescription());
        world.setUser(user);
        World savedWorld = worldRepository.save(world);
        return ResponseEntity.ok(DTOMapper.toWorldDTO(savedWorld));
    }

    // 更新指定ID的世界
    @PutMapping("/{id}")
    public ResponseEntity<WorldDTO> updateWorld(@PathVariable Long id, @RequestBody WorldDTO worldDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        World world = worldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("World not found with id: " + id));

        // 确保用户只能更新自己的世界
        if (!world.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        world.setName(worldDTO.getName());
        world.setDescription(worldDTO.getDescription());

        World updatedWorld = worldRepository.save(world);
        return ResponseEntity.ok(DTOMapper.toWorldDTO(updatedWorld));
    }

    // 删除指定ID的世界
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorld(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        World world = worldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("World not found with id: " + id));

        // 确保用户只能删除自己的世界
        if (!world.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        // 软删除：标记为已删除
        world.setIsDeleted(true);
        world.setDeletedAt(java.time.LocalDateTime.now());
        worldRepository.save(world);
        return ResponseEntity.noContent().build();
    }
}