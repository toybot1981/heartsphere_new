package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.AdminUserDTO;
import com.heartsphere.entity.User;
import com.heartsphere.repository.*;
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
    
    @Autowired
    private CharacterRepository characterRepository;
    
    @Autowired
    private JournalEntryRepository journalEntryRepository;
    
    @Autowired
    private EraRepository eraRepository;
    
    @Autowired
    private ScriptRepository scriptRepository;
    
    @Autowired
    private WorldRepository worldRepository;
    
    @Autowired
    private UserMainStoryRepository userMainStoryRepository;
    
    @Autowired
    private NoteRepository noteRepository;
    
    @Autowired
    private NoteSyncRepository noteSyncRepository;
    
    @Autowired
    private MembershipRepository membershipRepository;
    
    @Autowired
    private PaymentOrderRepository paymentOrderRepository;
    
    @Autowired
    private PointTransactionRepository pointTransactionRepository;

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
     */
    @Transactional
    public void forceDeleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        
        // 获取用户的所有场景（eras），包括已删除的，需要在删除场景之前先删除引用场景的数据
        var userEras = eraRepository.findAllByUser_Id(id);
        
        // 删除所有关联数据（按依赖顺序，先删除引用eras的数据，再删除eras）
        // 1. 对于每个场景，先删除引用该场景的数据
        userEras.forEach(era -> {
            Long eraId = era.getId();
            // 1.1 删除引用该场景的脚本（包括已删除的，因为它们仍然有外键约束）
            scriptRepository.findAllByEra_Id(eraId).forEach(scriptRepository::delete);
            // 1.2 删除引用该场景的用户主线剧情（包括已删除的）
            userMainStoryRepository.findByEraId(eraId).forEach(userMainStoryRepository::delete);
            // 1.3 删除引用该场景的角色（包括已删除的，因为它们仍然有外键约束）
            characterRepository.findAllByEra_Id(eraId).forEach(characterRepository::delete);
            // 1.4 删除引用该场景的日记（包括已删除的，因为它们仍然有外键约束）
            journalEntryRepository.findAllByEra_Id(eraId).forEach(journalEntryRepository::delete);
        });
        
        // 2. 删除不通过场景关联的角色（直接关联用户的角色，包括已删除的）
        characterRepository.findAllByUser_Id(id).forEach(characterRepository::delete);
        
        // 3. 删除不通过场景关联的日记（直接关联用户的日记）
        journalEntryRepository.findByUser_Id(id).forEach(journalEntryRepository::delete);
        
        // 4. 删除场景（现在可以安全删除了，因为所有引用它的数据都已删除）
        userEras.forEach(eraRepository::delete);
        
        // 5. 删除不通过场景关联的脚本（直接关联用户的脚本，如果有的话）
        scriptRepository.findByUser_Id(id).forEach(scriptRepository::delete);
        
        // 6. 删除世界（包括软删除的）
        // 对于每个世界，需要先删除其关联的Eras和Characters
        var worlds = worldRepository.findAllByUserId(id);
        for (var world : worlds) {
            Long worldId = world.getId();
            // 6.1 删除所有引用此World的Characters（包括已删除的）
            characterRepository.findAllByWorld_Id(worldId).forEach(characterRepository::delete);
            // 6.2 删除所有引用此World的JournalEntries（包括已删除的）
            journalEntryRepository.findByWorld_Id(worldId).forEach(journalEntryRepository::delete);
            // 6.3 删除所有引用此World的Scripts（包括已删除的）
            scriptRepository.findAllByWorld_Id(worldId).forEach(scriptRepository::delete);
            // 6.4 获取所有引用此World的Eras（包括已删除的）
            var worldEras = eraRepository.findAllByWorld_Id(worldId);
            // 6.5 对于每个Era，先删除引用它的数据
            for (var era : worldEras) {
                Long eraId = era.getId();
                // 删除引用此Era的Characters
                characterRepository.findAllByEra_Id(eraId).forEach(characterRepository::delete);
                // 删除引用此Era的JournalEntries
                journalEntryRepository.findByEra_Id(eraId).forEach(journalEntryRepository::delete);
                // 删除引用此Era的Scripts
                scriptRepository.findAllByEra_Id(eraId).forEach(scriptRepository::delete);
                // 删除引用此Era的UserMainStories
                userMainStoryRepository.findByEraId(eraId).forEach(userMainStoryRepository::delete);
            }
            // 6.6 删除所有引用此World的Eras
            worldEras.forEach(eraRepository::delete);
            // 6.7 删除World本身
            worldRepository.delete(world);
        }
        
        // 7. 删除用户主线剧情（通过用户ID查找，可能还有遗漏的）
        userMainStoryRepository.findByUserIdAndIsDeletedFalse(id).forEach(userMainStoryRepository::delete);
        
        // 8. 删除笔记
        noteRepository.findByUserId(id).forEach(noteRepository::delete);
        
        // 9. 删除笔记同步记录
        noteSyncRepository.findByUserId(id).forEach(noteSyncRepository::delete);
        
        // 10. 删除会员记录
        membershipRepository.findByUserId(id).ifPresent(membershipRepository::delete);
        
        // 11. 删除支付订单
        paymentOrderRepository.findByUserIdOrderByCreatedAtDesc(id).forEach(paymentOrderRepository::delete);
        
        // 12. 删除积分交易记录
        pointTransactionRepository.findByUserIdOrderByCreatedAtDesc(id).forEach(pointTransactionRepository::delete);
        
        // 最后删除用户
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
        return dto;
    }
}

