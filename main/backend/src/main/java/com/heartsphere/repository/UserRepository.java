package com.heartsphere.repository;

import com.heartsphere.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByWechatOpenid(String wechatOpenid);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByWechatOpenid(String wechatOpenid);
    
    /**
     * 根据用户名或邮箱搜索用户（用于管理员搜索）
     */
    Page<User> findByUsernameContainingOrEmailContaining(String username, String email, Pageable pageable);
}