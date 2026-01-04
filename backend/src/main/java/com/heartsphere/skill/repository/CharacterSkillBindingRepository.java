package com.heartsphere.skill.repository;

import com.heartsphere.skill.entity.CharacterSkillBinding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 角色技能装备 Repository
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface CharacterSkillBindingRepository extends JpaRepository<CharacterSkillBinding, Long> {
    
    /**
     * 根据角色ID查找所有装备的技能
     */
    List<CharacterSkillBinding> findByCharacterId(Long characterId);
    
    /**
     * 根据角色ID查找已启用的技能
     */
    List<CharacterSkillBinding> findByCharacterIdAndIsEnabledTrue(Long characterId);
    
    /**
     * 根据角色ID查找自动触发的技能
     */
    List<CharacterSkillBinding> findByCharacterIdAndAutoTriggerTrue(Long characterId);
    
    /**
     * 根据角色ID和技能ID查找
     */
    Optional<CharacterSkillBinding> findByCharacterIdAndSkillId(Long characterId, String skillId);
    
    /**
     * 检查角色是否已装备该技能
     */
    boolean existsByCharacterIdAndSkillId(Long characterId, String skillId);
    
    /**
     * 根据技能ID查找所有装备该技能的角色
     */
    List<CharacterSkillBinding> findBySkillId(String skillId);
    
    /**
     * 根据角色ID和技能ID删除
     */
    @Modifying
    @Transactional
    void deleteByCharacterIdAndSkillId(Long characterId, String skillId);
    
    /**
     * 根据角色ID删除所有装备
     */
    @Modifying
    @Transactional
    void deleteByCharacterId(Long characterId);
    
    /**
     * 根据技能ID删除所有装备关系
     */
    @Modifying
    @Transactional
    void deleteBySkillId(String skillId);
    
    /**
     * 查找角色已装备的技能ID列表
     */
    @Query("SELECT csb.skillId FROM CharacterSkillBinding csb WHERE csb.characterId = :characterId AND csb.isEnabled = true")
    List<String> findSkillIdsByCharacterId(@Param("characterId") Long characterId);
    
    /**
     * 查找角色已装备且启用的技能（按优先级排序）
     */
    @Query("SELECT csb FROM CharacterSkillBinding csb WHERE csb.characterId = :characterId AND csb.isEnabled = true ORDER BY csb.priority DESC, csb.equippedAt DESC")
    List<CharacterSkillBinding> findEnabledSkillsByCharacterIdOrderByPriority(@Param("characterId") Long characterId);
    
    /**
     * 统计角色装备的技能数量
     */
    @Query("SELECT COUNT(csb) FROM CharacterSkillBinding csb WHERE csb.characterId = :characterId")
    long countByCharacterId(@Param("characterId") Long characterId);
    
    /**
     * 更新技能使用次数和最后使用时间
     */
    @Modifying
    @Transactional
    @Query("UPDATE CharacterSkillBinding csb SET csb.usageCount = csb.usageCount + 1, csb.lastUsedAt = :lastUsedAt WHERE csb.characterId = :characterId AND csb.skillId = :skillId")
    void incrementUsageCount(@Param("characterId") Long characterId, @Param("skillId") String skillId, @Param("lastUsedAt") LocalDateTime lastUsedAt);
}
