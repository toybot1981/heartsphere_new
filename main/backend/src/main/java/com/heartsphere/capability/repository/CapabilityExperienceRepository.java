package com.heartsphere.capability.repository;

import com.heartsphere.capability.entity.CapabilityExperience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 能力经验值 Repository
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Repository
public interface CapabilityExperienceRepository extends JpaRepository<CapabilityExperience, Long> {
    
    /**
     * 根据角色ID查询能力经验值
     */
    Optional<CapabilityExperience> findByCharacterId(Long characterId);
    
    /**
     * 根据角色ID删除能力经验值
     */
    void deleteByCharacterId(Long characterId);
}
