package com.heartsphere.memory.repository;

import com.heartsphere.memory.model.participant.ParticipantRelationship;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

/**
 * 参与者关系Repository
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
public interface ParticipantRelationshipRepository extends MongoRepository<ParticipantRelationship, String> {
    
    /**
     * 根据参与者ID和关联参与者ID查找关系
     */
    Optional<ParticipantRelationship> findByParticipantIdAndRelatedParticipantId(
        String participantId, String relatedParticipantId);
    
    /**
     * 根据参与者ID查找所有关系
     */
    List<ParticipantRelationship> findByParticipantIdOrderByStrengthDesc(String participantId);
    
    /**
     * 根据关系类型查找关系
     */
    List<ParticipantRelationship> findByParticipantIdAndRelationshipTypeOrderByStrengthDesc(
        String participantId, ParticipantRelationship.RelationshipType relationshipType);
    
    /**
     * 根据场景ID查找所有关系
     */
    List<ParticipantRelationship> findBySceneId(String sceneId);
    
    /**
     * 根据参与者ID和场景ID查找关系
     */
    List<ParticipantRelationship> findByParticipantIdAndSceneIdOrderByStrengthDesc(
        String participantId, String sceneId);
    
    /**
     * 检查关系是否存在
     */
    boolean existsByParticipantIdAndRelatedParticipantId(String participantId, String relatedParticipantId);
}

