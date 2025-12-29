package com.heartsphere.memory.repository;

import com.heartsphere.memory.model.participant.ParticipantIdentityMemory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

/**
 * 参与者身份记忆Repository
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
public interface ParticipantIdentityMemoryRepository extends MongoRepository<ParticipantIdentityMemory, String> {
    
    /**
     * 根据参与者ID查找身份记忆
     */
    Optional<ParticipantIdentityMemory> findByParticipantId(String participantId);
    
    /**
     * 根据参与者ID和场景ID查找身份记忆
     */
    Optional<ParticipantIdentityMemory> findByParticipantIdAndSceneId(String participantId, String sceneId);
    
    /**
     * 根据场景ID查找所有身份记忆
     */
    List<ParticipantIdentityMemory> findBySceneId(String sceneId);
}

