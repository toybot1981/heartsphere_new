package com.heartsphere.memory.repository.jpa;

import com.heartsphere.memory.entity.CharacterKnowledgeAssetEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 角色知识资产 Repository（JPA）
 * 
 * @author HeartSphere
 * @date 2026-01-24
 */
@Repository
public interface CharacterKnowledgeAssetRepository extends JpaRepository<CharacterKnowledgeAssetEntity, Long> {
    
    /**
     * 根据角色ID获取所有资产（按创建时间倒序）
     */
    List<CharacterKnowledgeAssetEntity> findByCharacterIdOrderByCreatedAtDesc(Long characterId, Pageable pageable);
    
    /**
     * 根据角色ID和资产类型获取资产
     */
    List<CharacterKnowledgeAssetEntity> findByCharacterIdAndAssetTypeOrderByTrustScoreDesc(
        Long characterId, 
        String assetType,
        Pageable pageable
    );
    
    /**
     * 根据角色ID获取已批准的资产（按信任度倒序）
     */
    List<CharacterKnowledgeAssetEntity> findByCharacterIdAndIsApprovedTrueOrderByTrustScoreDesc(
        Long characterId,
        Pageable pageable
    );
    
    /**
     * 根据角色ID获取待审核的资产
     */
    List<CharacterKnowledgeAssetEntity> findByCharacterIdAndIsApprovedFalseOrderByCreatedAtAsc(
        Long characterId,
        Pageable pageable
    );
    
    /**
     * 根据角色ID统计所有资产数量
     */
    long countByCharacterId(Long characterId);
    
    /**
     * 根据角色ID统计已批准的资产数量
     */
    long countByCharacterIdAndIsApprovedTrue(Long characterId);
    
    /**
     * 根据角色ID获取低信任度的资产（需要审核）
     */
    @Query("SELECT a FROM CharacterKnowledgeAssetEntity a " +
           "WHERE a.characterId = :characterId AND a.trustScore < :trustThreshold " +
           "ORDER BY a.trustScore ASC, a.updatedAt DESC")
    List<CharacterKnowledgeAssetEntity> findLowTrustAssets(
        @Param("characterId") Long characterId,
        @Param("trustThreshold") Integer trustThreshold,
        Pageable pageable
    );
    
    /**
     * 根据角色ID获取未使用或长期未使用的资产
     */
    @Query("SELECT a FROM CharacterKnowledgeAssetEntity a " +
           "WHERE a.characterId = :characterId " +
           "AND (a.lastUsedAt IS NULL OR a.lastUsedAt < :beforeDate) " +
           "ORDER BY a.lastUsedAt ASC NULLS FIRST")
    List<CharacterKnowledgeAssetEntity> findUnusedAssets(
        @Param("characterId") Long characterId,
        @Param("beforeDate") LocalDateTime beforeDate,
        Pageable pageable
    );
    
    /**
     * 根据角色ID获取特定类型的已批准资产
     */
    List<CharacterKnowledgeAssetEntity> findByCharacterIdAndAssetTypeAndIsApprovedTrueOrderByTrustScoreDesc(
        Long characterId,
        String assetType
    );
    
    /**
     * 获取平均信任度
     */
    @Query("SELECT AVG(a.trustScore) FROM CharacterKnowledgeAssetEntity a WHERE a.characterId = :characterId AND a.isApproved = true")
    Double getAverageTrustScore(@Param("characterId") Long characterId);
    
    /**
     * 更新资产的最后使用时间
     */
    @Modifying
    @Query("UPDATE CharacterKnowledgeAssetEntity a SET a.lastUsedAt = :now, a.usageCount = a.usageCount + 1 " +
           "WHERE a.id = :assetId")
    void updateLastUsedTime(@Param("assetId") Long assetId, @Param("now") LocalDateTime now);
    
    /**
     * 更新信任度评分
     */
    @Modifying
    @Query("UPDATE CharacterKnowledgeAssetEntity a SET a.trustScore = :trustScore, a.updatedAt = :now " +
           "WHERE a.id = :assetId")
    void updateTrustScore(@Param("assetId") Long assetId, @Param("trustScore") Integer trustScore, @Param("now") LocalDateTime now);
    
    /**
     * 更新正面反馈计数
     */
    @Modifying
    @Query("UPDATE CharacterKnowledgeAssetEntity a SET a.positiveFeedbackCount = a.positiveFeedbackCount + 1 " +
           "WHERE a.id = :assetId")
    void incrementPositiveFeedbackCount(@Param("assetId") Long assetId);
    
    /**
     * 更新负面反馈计数
     */
    @Modifying
    @Query("UPDATE CharacterKnowledgeAssetEntity a SET a.negativeFeedbackCount = a.negativeFeedbackCount + 1 " +
           "WHERE a.id = :assetId")
    void incrementNegativeFeedbackCount(@Param("assetId") Long assetId);
    
    /**
     * 批准资产
     */
    @Modifying
    @Query("UPDATE CharacterKnowledgeAssetEntity a SET a.isApproved = true, a.approvedBy = :approvedBy, a.updatedAt = :now " +
           "WHERE a.id = :assetId")
    void approveAsset(@Param("assetId") Long assetId, @Param("approvedBy") String approvedBy, @Param("now") LocalDateTime now);
    
    /**
     * 根据角色ID和标题获取资产（用于查找重复）
     */
    Optional<CharacterKnowledgeAssetEntity> findByCharacterIdAndTitleAndAssetType(
        Long characterId,
        String title,
        String assetType
    );
    
    /**
     * 衰减长期未使用的资产信任度（自动衰减任务）
     */
    @Modifying
    @Query("UPDATE CharacterKnowledgeAssetEntity a SET a.trustScore = GREATEST(0, a.trustScore - 2) " +
           "WHERE a.lastUsedAt < :beforeDate")
    void decayUnusedAssets(@Param("beforeDate") LocalDateTime beforeDate);
    
    /**
     * 删除低效资产（信任度 < 20 且超过 60 天未使用）
     */
    @Modifying
    @Query("DELETE FROM CharacterKnowledgeAssetEntity a " +
           "WHERE a.trustScore < :trustThreshold AND a.lastUsedAt < :beforeDate")
    int deleteIneffectiveAssets(@Param("trustThreshold") Integer trustThreshold, 
                               @Param("beforeDate") LocalDateTime beforeDate);
}
