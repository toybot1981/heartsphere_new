package com.heartsphere.admin.controller;

import com.heartsphere.entity.User;
import com.heartsphere.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController extends BaseAdminController {

    @Autowired
    private UserRepository userRepository;

    /**
     * 获取用户列表（分页）
     */
    @GetMapping
    public ResponseEntity<?> getUsers(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search
    ) {
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> users;
        
        if (search != null && !search.trim().isEmpty()) {
            // 简单搜索：按用户名、邮箱搜索
            users = userRepository.findByUsernameContainingOrEmailContaining(
                search.trim(), pageable
            );
        } else {
            users = userRepository.findAll(pageable);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("users", users.getContent());
        response.put("totalElements", users.getTotalElements());
        response.put("totalPages", users.getTotalPages());
        response.put("currentPage", users.getNumber());
        response.put("pageSize", users.getSize());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取用户详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id
    ) {
        validateAdmin(authHeader);
        
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(user.get());
    }

    /**
     * 启用/禁用用户
     */
    @PutMapping("/{id}/toggle-enabled")
    public ResponseEntity<?> updateUserStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id,
            @RequestBody Map<String, Boolean> request
    ) {
        validateAdmin(authHeader);
        
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        Boolean isEnabled = request.get("isEnabled");
        if (isEnabled != null) {
            user.setIsEnabled(isEnabled);
            userRepository.save(user);
        }
        
        return ResponseEntity.ok(user);
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long id
    ) {
        validateAdmin(authHeader);
        
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

