package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    Optional<ApiKey> findByApiKey(String apiKey);
    List<ApiKey> findByIsActive(Boolean isActive);
    List<ApiKey> findByUserId(Long userId);
    List<ApiKey> findByExpiresAtAfter(LocalDateTime dateTime);
    List<ApiKey> findByExpiresAtBefore(LocalDateTime dateTime);
    boolean existsByApiKey(String apiKey);
    boolean existsByKeyName(String keyName);
}



