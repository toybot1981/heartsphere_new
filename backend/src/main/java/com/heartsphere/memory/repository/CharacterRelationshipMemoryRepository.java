package com.heartsphere.memory.repository;

import com.heartsphere.memory.model.character.CharacterRelationshipMemory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 角色关系记忆Repository
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Repository
public interface CharacterRelationshipMemoryRepository extends MongoRepository<CharacterRelationshipMemory, String> {
    
    /**
     * 根据角色ID和关联角色ID查找（唯一关系）
     */
    Optional<CharacterRelationshipMemory> findByCharacterIdAndRelatedCharacterId(
        String characterId, String relatedCharacterId);
    
    /**
     * 根据角色ID查找所有关系
     */
    List<CharacterRelationshipMemory> findByCharacterId(String characterId);
    
    /**
     * 根据角色ID和关系类型查找
     */
    List<CharacterRelationshipMemory> findByCharacterIdAndRelationshipType(
        String characterId, CharacterRelationshipMemory.RelationshipType relationshipType);
    
    /**
     * 根据角色ID，按关系强度倒序查找
     */
    List<CharacterRelationshipMemory> findByCharacterIdOrderByStrengthDesc(
        String characterId, Pageable pageable);
    
    /**
     * 根据角色ID分页查找
     */
    Page<CharacterRelationshipMemory> findByCharacterId(String characterId, Pageable pageable);
    
    /**
     * 检查关系是否存在
     */
    boolean existsByCharacterIdAndRelatedCharacterId(String characterId, String relatedCharacterId);
}

