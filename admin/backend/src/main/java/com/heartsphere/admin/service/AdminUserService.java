package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.AdminUserDTO;
import com.heartsphere.admin.entity.User;
import com.heartsphere.admin.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 管理员用户管理服务
 */
@Service
public class AdminUserService {

    @Autowired
    private UserRepository userRepository;
    //
    // @Autowired
    // private CharacterRepository characterRepository;
    //
    // @Autowired
    // private JournalEntryRepository journalEntryRepository;
    //
    // @Autowired
    // private EraRepository eraRepository;
    //
    // @Autowired
    // private ScriptRepository scriptRepository;
    //
    // @Autowired
    // private WorldRepository worldRepository;
    //
    // @Autowired
    // private UserMainStoryRepository userMainStoryRepository;
    //
    // @Autowired
    // private NoteRepository noteRepository;
    //
    // @Autowired
    // private NoteSyncRepository noteSyncRepository;
    //
    // @Autowired
    // private MembershipRepository membershipRepository;
    //
    // @Autowired
    // private PaymentOrderRepository paymentOrderRepository;
    //
    // @Autowired
    // private PointTransactionRepository pointTransactionRepository;

    /**
     * 获取用户列表（分页、搜索）
     */
    public Page<AdminUserDTO> getUsers(Pageable pageable, String search) {
        Page<User> users;
        
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.findByUsernameContainingOrEmailContaining(
                search.trim(), search.trim(), pageable
            );
        } else {
            users = userRepository.findAll(pageable);
        }
        
        return users.map(this::convertToDTO);
    }

    /**
     * 根据ID获取用户详情
     */
    public AdminUserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        return convertToDTO(user);
    }

    /**
     * 启用/禁用用户
     */
    @Transactional
    public AdminUserDTO updateUserStatus(Long id, Boolean isEnabled) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        user.setIsEnabled(isEnabled);
        user = userRepository.save(user);
        return convertToDTO(user);
    }

    /**
     * 删除用户（级联删除所有关联数据）
     */
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        
        // 尝试直接删除，如果失败则抛出异常
        try {
            userRepository.delete(user);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // 如果有外键约束，抛出异常，让前端提示强制删除
            throw new RuntimeException("无法删除用户：存在外键关联约束。请使用强制删除功能。", e);
        }
    }

    /**
     * 强制删除用户（先清空所有关联数据，再删除用户）
     * 注意：当前实现为简化版本，只删除用户本身，不处理关联数据
     * TODO: 如果需要完整的关联数据删除，需要迁移相关实体和 Repository
     */
    @Transactional
    public void forceDeleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        
        // TODO: 如果需要完整的关联数据删除，需要取消注释以下代码并迁移相关 Repository
        // 当前简化实现：直接删除用户
        // 注意：如果存在外键约束，此操作可能会失败
        userRepository.delete(user);
    }

    /**
     * 更新用户信息
     */
    @Transactional
    public AdminUserDTO updateUser(Long id, AdminUserDTO dto) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        
        if (dto.getNickname() != null) {
            user.setNickname(dto.getNickname());
        }
        if (dto.getAvatar() != null) {
            user.setAvatar(dto.getAvatar());
        }
        
        user = userRepository.save(user);
        return convertToDTO(user);
    }

    /**
     * 批量删除用户
     * @param userIds 用户ID列表
     * @param force 是否强制删除（先清空关联数据再删除）
     * @return 删除结果，包含成功数量和失败的用户ID列表
     */
    public BatchDeleteResult batchDeleteUsers(List<Long> userIds, Boolean force) {
        BatchDeleteResult result = new BatchDeleteResult();
        
        if (userIds == null || userIds.isEmpty()) {
            return result;
        }
        
        for (Long userId : userIds) {
            try {
                // 每个用户的删除在独立事务中执行，避免一个失败影响其他
                deleteUserInNewTransaction(userId, force);
                result.addSuccess(userId);
            } catch (Exception e) {
                // 记录错误但继续删除其他用户
                System.err.println("删除用户失败: userId=" + userId + ", error=" + e.getMessage());
                e.printStackTrace();
                result.addFailure(userId, e.getMessage());
            }
        }
        
        return result;
    }

    /**
     * 批量删除结果
     */
    public static class BatchDeleteResult {
        private int successCount = 0;
        private List<Long> successUserIds = new ArrayList<>();
        private List<Long> failedUserIds = new ArrayList<>();
        private Map<Long, String> failureMessages = new HashMap<>();

        public void addSuccess(Long userId) {
            successCount++;
            successUserIds.add(userId);
        }

        public void addFailure(Long userId, String errorMessage) {
            failedUserIds.add(userId);
            failureMessages.put(userId, errorMessage);
        }

        public int getSuccessCount() {
            return successCount;
        }

        public List<Long> getSuccessUserIds() {
            return successUserIds;
        }

        public List<Long> getFailedUserIds() {
            return failedUserIds;
        }

        public Map<Long, String> getFailureMessages() {
            return failureMessages;
        }

        public boolean hasFailures() {
            return !failedUserIds.isEmpty();
        }
    }

    /**
     * 在独立事务中删除单个用户
     * 使用REQUIRES_NEW确保每个删除操作在独立事务中执行
     * 这样即使某个用户删除失败，也不会影响其他用户的删除
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteUserInNewTransaction(Long userId, Boolean force) {
        if (Boolean.TRUE.equals(force)) {
            forceDeleteUser(userId);
        } else {
            deleteUser(userId);
        }
    }

    /**
     * 转换为DTO
     */
    private AdminUserDTO convertToDTO(User user) {
        AdminUserDTO dto = new AdminUserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setNickname(user.getNickname());
        dto.setAvatar(user.getAvatar());
        dto.setWechatOpenid(user.getWechatOpenid());
        dto.setIsEnabled(user.getIsEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        // 统计信息暂时为 null（需要其他 Repository 支持）
        dto.setJournalCount(null);
        dto.setCharacterCount(null);
        dto.setEraCount(null);
        return dto;
    }
}

