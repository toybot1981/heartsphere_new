package com.heartsphere.repository;

import com.heartsphere.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, String> {

    // 基础查询
    List<JournalEntry> findByUser_Id(Long userId);
    List<JournalEntry> findByWorld_Id(Long worldId);
    List<JournalEntry> findByEra_Id(Long eraId);
    List<JournalEntry> findByCharacter_Id(Long characterId);

    /**
     * 使用JOIN FETCH优化查询，避免N+1问题
     * 一次性加载所有关联实体（user、world、era、character）
     */
    @Query("SELECT DISTINCT j FROM JournalEntry j " +
           "LEFT JOIN FETCH j.user " +
           "LEFT JOIN FETCH j.world " +
           "LEFT JOIN FETCH j.era " +
           "LEFT JOIN FETCH j.character " +
           "WHERE j.user.id = :userId " +
           "ORDER BY j.entryDate DESC")
    List<JournalEntry> findByUserIdWithAssociations(@Param("userId") Long userId);

    /**
     * 根据ID查询并加载所有关联实体
     */
    @Query("SELECT j FROM JournalEntry j " +
           "LEFT JOIN FETCH j.user " +
           "LEFT JOIN FETCH j.world " +
           "LEFT JOIN FETCH j.era " +
           "LEFT JOIN FETCH j.character " +
           "WHERE j.id = :id")
    JournalEntry findByIdWithAssociations(@Param("id") String id);

    // 搜索功能：按标题、内容、标签搜索
    @Query("SELECT DISTINCT j FROM JournalEntry j " +
           "LEFT JOIN FETCH j.user " +
           "LEFT JOIN FETCH j.world " +
           "LEFT JOIN FETCH j.era " +
           "LEFT JOIN FETCH j.character " +
           "WHERE j.user.id = :userId AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.tags) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY j.entryDate DESC")
    List<JournalEntry> searchByKeywordWithAssociations(@Param("userId") Long userId, @Param("keyword") String keyword);

    // 按标签筛选
    @Query("SELECT DISTINCT j FROM JournalEntry j " +
           "LEFT JOIN FETCH j.user " +
           "LEFT JOIN FETCH j.world " +
           "LEFT JOIN FETCH j.era " +
           "LEFT JOIN FETCH j.character " +
           "WHERE j.user.id = :userId AND " +
           "LOWER(j.tags) LIKE LOWER(CONCAT('%', :tag, '%')) " +
           "ORDER BY j.entryDate DESC")
    List<JournalEntry> findByTagWithAssociations(@Param("userId") Long userId, @Param("tag") String tag);

    /**
     * 按世界ID查询并加载关联
     */
    @Query("SELECT DISTINCT j FROM JournalEntry j " +
           "LEFT JOIN FETCH j.user " +
           "LEFT JOIN FETCH j.world " +
           "LEFT JOIN FETCH j.era " +
           "LEFT JOIN FETCH j.character " +
           "WHERE j.world.id = :worldId " +
           "ORDER BY j.entryDate DESC")
    List<JournalEntry> findByWorldIdWithAssociations(@Param("worldId") Long worldId);

    /**
     * 按时代ID查询并加载关联
     */
    @Query("SELECT DISTINCT j FROM JournalEntry j " +
           "LEFT JOIN FETCH j.user " +
           "LEFT JOIN FETCH j.world " +
           "LEFT JOIN FETCH j.era " +
           "LEFT JOIN FETCH j.character " +
           "WHERE j.era.id = :eraId " +
           "ORDER BY j.entryDate DESC")
    List<JournalEntry> findByEraIdWithAssociations(@Param("eraId") Long eraId);

    /**
     * 按角色ID查询并加载关联
     */
    @Query("SELECT DISTINCT j FROM JournalEntry j " +
           "LEFT JOIN FETCH j.user " +
           "LEFT JOIN FETCH j.world " +
           "LEFT JOIN FETCH j.era " +
           "LEFT JOIN FETCH j.character " +
           "WHERE j.character.id = :characterId " +
           "ORDER BY j.entryDate DESC")
    List<JournalEntry> findByCharacterIdWithAssociations(@Param("characterId") Long characterId);
}
