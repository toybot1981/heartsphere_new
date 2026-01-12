package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.EntityRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 实体关系Repository
 */
@Repository
public interface EntityRelationRepository extends JpaRepository<EntityRelation, Long> {
    
    /**
     * 根据源实体查找关系
     */
    @Query("SELECT r FROM EntityRelation r WHERE r.sourceEntityType = :entityType AND r.sourceEntityId = :entityId")
    List<EntityRelation> findBySourceEntity(@Param("entityType") String entityType, @Param("entityId") String entityId);
    
    /**
     * 根据目标实体查找关系
     */
    @Query("SELECT r FROM EntityRelation r WHERE r.targetEntityType = :entityType AND r.targetEntityId = :entityId")
    List<EntityRelation> findByTargetEntity(@Param("entityType") String entityType, @Param("entityId") String entityId);
    
    /**
     * 查找两个实体之间的关系
     */
    @Query("SELECT r FROM EntityRelation r WHERE " +
           "((r.sourceEntityType = :sourceType AND r.sourceEntityId = :sourceId AND r.targetEntityType = :targetType AND r.targetEntityId = :targetId) OR " +
           "(r.sourceEntityType = :targetType AND r.sourceEntityId = :targetId AND r.targetEntityType = :sourceType AND r.targetEntityId = :sourceId))")
    List<EntityRelation> findRelationBetween(
        @Param("sourceType") String sourceType, 
        @Param("sourceId") String sourceId,
        @Param("targetType") String targetType, 
        @Param("targetId") String targetId
    );
    
    /**
     * 根据关系类型查找
     */
    List<EntityRelation> findByRelationType(String relationType);
    
    /**
     * 查找特定类型的关系
     */
    @Query("SELECT r FROM EntityRelation r WHERE " +
           "r.sourceEntityType = :sourceType AND r.sourceEntityId = :sourceId AND " +
           "r.targetEntityType = :targetType AND r.targetEntityId = :targetId AND " +
           "r.relationType = :relationType")
    Optional<EntityRelation> findSpecificRelation(
        @Param("sourceType") String sourceType,
        @Param("sourceId") String sourceId,
        @Param("targetType") String targetType,
        @Param("targetId") String targetId,
        @Param("relationType") String relationType
    );
    
    /**
     * 查找用户创建的所有关系
     */
    List<EntityRelation> findByUser_Id(Long userId);
}
