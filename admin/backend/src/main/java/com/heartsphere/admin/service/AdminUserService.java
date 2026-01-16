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
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

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
    
    @PersistenceContext
    private EntityManager entityManager;

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
     * 按照外键依赖顺序删除关联数据，避免外键约束错误
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void forceDeleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("用户不存在: " + id));
        
        // 按照依赖关系顺序删除关联数据
        // 注意：删除顺序很重要，必须先删除子表数据，再删除父表数据
        
        try {
            // 1. 删除最底层的关联数据（没有其他表依赖这些表）
            deleteByUserId("user_favorites", id);
            deleteByUserId("access_history", id);
            deleteByUserId("point_transactions", id);
            deleteByUserId("payment_orders", id);
            deleteByUserId("note_syncs", id);
            deleteByUserId("notes", id);
            deleteByUserId("mailbox_notification_settings", id);
            deleteByUserId("mailbox_messages", id);
            // mailbox_conversations 有两个外键：participant1_id 和 participant2_id
            Query mailboxConversationsQuery = entityManager.createNativeQuery(
                "DELETE FROM mailbox_conversations WHERE participant1_id = :userId OR participant2_id = :userId"
            );
            mailboxConversationsQuery.setParameter("userId", id);
            int mailboxDeletedCount = mailboxConversationsQuery.executeUpdate();
            if (mailboxDeletedCount > 0) {
                System.out.println(String.format("已删除表 mailbox_conversations 中 %d 条用户 %d 的关联数据", mailboxDeletedCount, id));
            }
            deleteByUserId("conversation_logs", id);
            deleteByUserId("user_ai_config", id);
            deleteByUserId("experience_summary", id);
            deleteByUserId("entity_relations", id);
            deleteByUserId("chronos_letters", id);
            
            // 2. 删除引用 eras 的表（必须先删除这些，才能删除 eras）
            // scenario_items 和 scenario_events 引用 eras
            deleteByUserId("scenario_items", id);
            deleteByUserId("scenario_events", id);
            
            // 3. 删除引用 worlds 和 eras 的表（必须先删除这些，才能删除 worlds 和 eras）
            // 注意：必须先删除引用 worlds 的表，再删除 eras，最后删除 worlds
            
            // 3.1 删除引用 worlds 的表（characters, journal_entries, scripts 等）
            // characters 引用 worlds（通过 world_id）
            deleteByUserId("characters", id);
            // journal_entries 可能引用 worlds
            deleteByUserId("journal_entries", id);
            // scripts 可能引用 worlds
            deleteByUserId("scripts", id);
            // user_main_stories 引用 eras
            deleteByUserId("user_main_stories", id);
            
            // 3.2 删除引用 eras 的表（scenario_items, scenario_events 等）
            // 这些表在步骤2中已经删除，但为了确保完整性，再次确认
            
            // 3.3 删除 eras（所有引用它的表都已删除）
            // eras 引用 worlds（通过 world_id），所以必须先删除 eras，再删除 worlds
            deleteByUserId("eras", id);
            
            // 3.4 删除 worlds（所有引用它的表都已删除）
            // 使用原生SQL直接删除，避免JPA的延迟加载问题
            // 注意：必须先删除所有引用 worlds 的表（characters, eras 等），才能删除 worlds
            try {
                // 先检查是否还有引用 worlds 的数据
                Query checkWorldsQuery = entityManager.createNativeQuery(
                    "SELECT COUNT(*) FROM worlds WHERE user_id = :userId"
                );
                checkWorldsQuery.setParameter("userId", id);
                Long worldsCount = ((Number) checkWorldsQuery.getSingleResult()).longValue();
                
                if (worldsCount > 0) {
                    // 删除 worlds 表数据
                    Query worldsQuery = entityManager.createNativeQuery(
                        "DELETE FROM worlds WHERE user_id = :userId"
                    );
                    worldsQuery.setParameter("userId", id);
                    int worldsDeletedCount = worldsQuery.executeUpdate();
                    // 立即刷新，确保删除操作立即生效
                    entityManager.flush();
                    System.out.println(String.format("已删除表 worlds 中 %d 条用户 %d 的关联数据", worldsDeletedCount, id));
                } else {
                    System.out.println(String.format("用户 %d 在 worlds 表中没有数据", id));
                }
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                // 外键约束错误，说明还有表引用 worlds，需要先删除那些表
                System.err.println(String.format("删除表 worlds 失败（外键约束）: %s", e.getMessage()));
                System.err.println("可能还有表引用 worlds，尝试继续删除其他关联数据...");
                // 不抛出异常，继续执行，尝试删除其他数据
            } catch (Exception e) {
                System.err.println(String.format("删除表 worlds 失败: %s", e.getMessage()));
                // 不抛出异常，继续执行，尝试删除其他数据
            }
            
            // 刷新实体管理器，确保所有删除操作都已提交
            entityManager.flush();
            entityManager.clear();
            
            // 6. 删除会员数据
            deleteByUserId("memberships", id);
            
            // 7. 删除 Memory 相关数据
            deleteByUserId("memory_sessions", id);
            
            // 8. 删除 Portal 相关数据（必须先删除 portal_permission，再删除 portal_config）
            deleteByUserId("portal_permission", id);
            deleteByUserId("portal_config", id);
            // portal_teleportation_log 可能也有 user_id，需要删除
            try {
                deleteByUserId("portal_teleportation_log", id);
            } catch (Exception e) {
                // 如果表不存在或字段名不同，跳过
                System.err.println(String.format("删除表 portal_teleportation_log 失败: %s", e.getMessage()));
            }
            
            // 9. 删除 HeartConnect 共享心域相关数据
            deleteByUserId("heartsphere_share_config", id);
            // heartsphere_connection 和 heartsphere_connection_request 可能也有 user_id
            try {
                deleteByUserId("heartsphere_connection", id);
            } catch (Exception e) {
                System.err.println(String.format("删除表 heartsphere_connection 失败: %s", e.getMessage()));
            }
            try {
                deleteByUserId("heartsphere_connection_request", id);
            } catch (Exception e) {
                System.err.println(String.format("删除表 heartsphere_connection_request 失败: %s", e.getMessage()));
            }
            try {
                deleteByUserId("heartsphere_share_scope", id);
            } catch (Exception e) {
                System.err.println(String.format("删除表 heartsphere_share_scope 失败: %s", e.getMessage()));
            }
            
            // 10. 删除邀请码使用记录（注意：这里使用的是 used_by_user_id）
            // 如果表不存在，跳过此操作
            try {
                Query inviteCodeQuery = entityManager.createNativeQuery(
                    "UPDATE invite_codes SET used_by_user_id = NULL WHERE used_by_user_id = :userId"
                );
                inviteCodeQuery.setParameter("userId", id);
                int updatedCount = inviteCodeQuery.executeUpdate();
                if (updatedCount > 0) {
                    System.out.println(String.format("已更新表 invite_codes 中 %d 条用户 %d 的关联数据", updatedCount, id));
                }
            } catch (Exception e) {
                System.err.println(String.format("更新表 invite_codes 失败（表可能不存在）: %s", e.getMessage()));
                // 不抛出异常，继续执行
            }
            
            // 11. 删除 API Key（注意：userId 可能为 null）
            // 如果表不存在，跳过此操作
            try {
                Query apiKeyQuery = entityManager.createNativeQuery(
                    "DELETE FROM api_keys WHERE user_id = :userId"
                );
                apiKeyQuery.setParameter("userId", id);
                int deletedCount = apiKeyQuery.executeUpdate();
                if (deletedCount > 0) {
                    System.out.println(String.format("已删除表 api_keys 中 %d 条用户 %d 的关联数据", deletedCount, id));
                }
            } catch (Exception e) {
                System.err.println(String.format("删除表 api_keys 失败（表可能不存在）: %s", e.getMessage()));
                // 不抛出异常，继续执行
            }
            
            // 12. 最后删除用户本身
            // 再次刷新实体管理器，确保所有删除操作都已提交
            entityManager.flush();
            entityManager.clear();
            
            // 使用原生SQL直接删除用户，避免JPA的延迟加载和缓存问题
            try {
                Query deleteUserQuery = entityManager.createNativeQuery(
                    "DELETE FROM users WHERE id = :userId"
                );
                deleteUserQuery.setParameter("userId", id);
                int deletedCount = deleteUserQuery.executeUpdate();
                entityManager.flush();
                
                if (deletedCount > 0) {
                    System.out.println(String.format("已删除用户 %d", id));
                } else {
                    System.out.println(String.format("用户 %d 不存在或已被删除", id));
                }
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                // 如果还有外键约束，说明还有表引用 users
                System.err.println(String.format("删除用户失败（外键约束）: %s", e.getMessage()));
                throw new RuntimeException("删除用户失败：仍有外键约束。请检查是否所有关联数据都已删除。错误: " + e.getMessage(), e);
            } catch (Exception e) {
                System.err.println(String.format("删除用户失败: %s", e.getMessage()));
                throw new RuntimeException("删除用户失败: " + e.getMessage(), e);
            }
            
        } catch (RuntimeException e) {
            // 重新抛出 RuntimeException，让调用者处理
            throw e;
        } catch (Exception e) {
            System.err.println(String.format("强制删除用户失败: userId=%d, error=%s", id, e.getMessage()));
            e.printStackTrace();
            throw new RuntimeException("强制删除用户失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 根据 user_id 删除指定表中的数据
     * 捕获所有异常，避免单个删除失败导致整个事务回滚
     * 使用原生SQL，确保立即执行
     */
    private void deleteByUserId(String tableName, Long userId) {
        try {
            // 使用原生SQL直接删除，避免JPA的延迟加载和缓存问题
            Query query = entityManager.createNativeQuery(
                String.format("DELETE FROM %s WHERE user_id = :userId", tableName)
            );
            query.setParameter("userId", userId);
            int deletedCount = query.executeUpdate();
            // 立即刷新，确保删除操作立即生效
            entityManager.flush();
            if (deletedCount > 0) {
                System.out.println(String.format("已删除表 %s 中 %d 条用户 %d 的关联数据", tableName, deletedCount, userId));
            }
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // 外键约束错误，记录但继续
            System.err.println(String.format("删除表 %s 中的数据失败（外键约束）: %s", tableName, e.getMessage()));
            // 不抛出异常，继续执行
        } catch (jakarta.persistence.PersistenceException e) {
            // JPA 持久化异常，记录但继续
            System.err.println(String.format("删除表 %s 中的数据失败（持久化异常）: %s", tableName, e.getMessage()));
            // 不抛出异常，继续执行
        } catch (Exception e) {
            // 其他异常（如表不存在），记录但继续
            System.err.println(String.format("删除表 %s 中的数据失败: %s", tableName, e.getMessage()));
            // 不抛出异常，继续执行
        }
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

