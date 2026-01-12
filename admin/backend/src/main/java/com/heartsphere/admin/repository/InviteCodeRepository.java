package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.InviteCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InviteCodeRepository extends JpaRepository<InviteCode, Long> {
    Optional<InviteCode> findByCode(String code);
    List<InviteCode> findByIsUsed(Boolean isUsed);
    List<InviteCode> findByExpiresAtAfter(LocalDateTime dateTime);
    List<InviteCode> findByExpiresAtBefore(LocalDateTime dateTime);
    boolean existsByCode(String code);
}



