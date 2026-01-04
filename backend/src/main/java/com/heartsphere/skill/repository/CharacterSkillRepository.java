package com.heartsphere.skill.repository;

import com.heartsphere.skill.entity.CharacterSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 角色技能 Repository
 * 
 * 技能系统独立模块
 * 用于存储角色技能的等级和经验值（游戏化）
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface CharacterSkillRepository extends JpaRepository<CharacterSkill, Long> {
    
    /**
     * 根据角色ID查找所有技能
     */
    List<CharacterSkill> findByCharacterId(Long characterId);
    
    /**
     * 根据角色ID和技能ID查找
     */
    Optional<CharacterSkill> findByCharacterIdAndSkillId(Long characterId, String skillId);
    
    /**
     * 根据技能ID查找所有拥有该技能的角色
     */
    List<CharacterSkill> findBySkillId(String skillId);
    
    /**
     * 检查角色是否拥有该技能
     */
    boolean existsByCharacterIdAndSkillId(Long characterId, String skillId);
    
    /**
     * 根据角色ID和技能ID删除
     */
    @Modifying
    @Transactional
    void deleteByCharacterIdAndSkillId(Long characterId, String skillId);
    
    /**
     * 根据角色ID删除所有技能
     */
    @Modifying
    @Transactional
    void deleteByCharacterId(Long characterId);
    
    /**
     * 根据技能ID删除所有角色技能
     */
    @Modifying
    @Transactional
    void deleteBySkillId(String skillId);
    
    /**
     * 查找角色拥有的技能ID列表
     */
    @Query("SELECT cs.skillId FROM CharacterSkill cs WHERE cs.characterId = :characterId")
    List<String> findSkillIdsByCharacterId(@Param("characterId") Long characterId);
    
    /**
     * 查找角色指定等级的技能
     */
    @Query("SELECT cs FROM CharacterSkill cs WHERE cs.characterId = :characterId AND cs.currentLevel >= :minLevel")
    List<CharacterSkill> findByCharacterIdAndMinLevel(@Param("characterId") Long characterId, @Param("minLevel") Integer minLevel);
    
    /**
     * 增加经验值
     */
    @Modifying
    @Transactional
    @Query("UPDATE CharacterSkill cs SET cs.experience = cs.experience + :exp WHERE cs.characterId = :characterId AND cs.skillId = :skillId")
    void addExperience(@Param("characterId") Long characterId, @Param("skillId") String skillId, @Param("exp") Integer exp);
}
