package com.heartsphere.capability.service.integration;

import com.heartsphere.capability.entity.RoleCapabilityProfile;
import com.heartsphere.capability.repository.RoleCapabilityProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 角色能力模型服务
 * 管理角色的能力档案
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RoleCapabilityModelService {
    
    private final RoleCapabilityProfileRepository profileRepository;
    
    /**
     * 获取或创建角色能力档案
     */
    @Transactional
    public RoleCapabilityProfile getOrCreateProfile(Long characterId) {
        Optional<RoleCapabilityProfile> profileOpt = profileRepository.findByCharacterId(characterId);
        
        if (profileOpt.isPresent()) {
            return profileOpt.get();
        }
        
        // 创建新的能力档案
        RoleCapabilityProfile profile = RoleCapabilityProfile.builder()
            .characterId(characterId)
            .build();
        
        return profileRepository.save(profile);
    }
    
    /**
     * 获取角色能力档案
     */
    public Optional<RoleCapabilityProfile> getProfile(Long characterId) {
        return profileRepository.findByCharacterId(characterId);
    }
    
    /**
     * 更新能力档案
     */
    @Transactional
    public RoleCapabilityProfile updateProfile(RoleCapabilityProfile profile) {
        return profileRepository.save(profile);
    }
}
