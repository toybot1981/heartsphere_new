package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.AdminUserDTO;
import com.heartsphere.entity.User;
import com.heartsphere.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        
        // 删除所有关联数据（按依赖顺序）
        // 1. 删除角色
        characterRepository.findByUser_Id(id).forEach(characterRepository::delete);
        
        // 2. 删除日记
        journalEntryRepository.findByUser_Id(id).forEach(journalEntryRepository::delete);
        
        // 3. 删除场景
        eraRepository.findByUser_Id(id).forEach(eraRepository::delete);
        
        // 4. 删除脚本
        scriptRepository.findByUser_Id(id).forEach(scriptRepository::delete);
        
        // 5. 删除世界
        worldRepository.findByUserId(id).forEach(worldRepository::delete);
        
        // 6. 删除用户主线剧情
        userMainStoryRepository.findByUserIdAndIsDeletedFalse(id).forEach(userMainStoryRepository::delete);
        
        // 7. 删除笔记
        noteRepository.findByUserId(id).forEach(noteRepository::delete);
        
        // 8. 删除笔记同步记录
        noteSyncRepository.findByUserId(id).forEach(noteSyncRepository::delete);
        
        // 9. 删除会员记录
        membershipRepository.findByUserId(id).ifPresent(membershipRepository::delete);
        
        // 10. 删除支付订单
        paymentOrderRepository.findByUserIdOrderByCreatedAtDesc(id).forEach(paymentOrderRepository::delete);
        
        // 11. 删除积分交易记录
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

