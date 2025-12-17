package com.heartsphere.repository;

import com.heartsphere.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    Optional<Membership> findByUserId(Long userId);
    List<Membership> findByStatus(String status);
    List<Membership> findByAutoRenewTrueAndNextRenewalDateLessThan(java.time.LocalDateTime date);
}

