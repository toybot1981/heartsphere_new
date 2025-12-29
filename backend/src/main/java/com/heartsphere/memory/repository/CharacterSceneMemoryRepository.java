package com.heartsphere.memory.repository;

import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.character.CharacterSceneMemory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 角色场景记忆Repository
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Repository
public interface CharacterSceneMemoryRepository extends MongoRepository<CharacterSceneMemory, String> {
    
    /**
     * 根据角色ID和场景ID查找
     */
    List<CharacterSceneMemory> findByCharacterIdAndEraId(String characterId, String eraId);
    
    /**
     * 根据角色ID查找所有场景记忆
     */
    List<CharacterSceneMemory> findByCharacterId(String characterId);
    
    /**
     * 根据角色ID和类型查找
     */
    List<CharacterSceneMemory> findByCharacterIdAndType(String characterId, MemoryType type);
    
    /**
     * 根据角色ID和场景ID，按创建时间倒序查找
     */
    List<CharacterSceneMemory> findByCharacterIdAndEraIdOrderByCreatedAtDesc(
        String characterId, String eraId, Pageable pageable);
    
    /**
     * 查找可继承的场景记忆
     */
    List<CharacterSceneMemory> findByCharacterIdAndInheritableTrue(String characterId);
    
    /**
     * 根据角色ID分页查找
     */
    Page<CharacterSceneMemory> findByCharacterId(String characterId, Pageable pageable);
    
    /**
     * 文本搜索
     */
    @Query("{ 'characterId': ?0, 'eraId': ?1, '$text': { '$search': ?2 } }")
    List<CharacterSceneMemory> searchByCharacterIdAndEraIdAndText(
        String characterId, String eraId, String query, Pageable pageable);
}

