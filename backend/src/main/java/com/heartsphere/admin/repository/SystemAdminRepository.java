package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.SystemAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemAdminRepository extends JpaRepository<SystemAdmin, Long> {
    Optional<SystemAdmin> findByUsername(String username);
    Optional<SystemAdmin> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}

