package com.heartsphere.capability.repository;

import com.heartsphere.capability.entity.RoleCapabilityProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 角色能力档案 Repository
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Repository
public interface RoleCapabilityProfileRepository extends JpaRepository<RoleCapabilityProfile, Long> {
    
    /**
     * 根据角色ID查询能力档案
     */
    Optional<RoleCapabilityProfile> findByCharacterId(Long characterId);
    
    /**
     * 根据角色ID删除能力档案
     */
    void deleteByCharacterId(Long characterId);
}
