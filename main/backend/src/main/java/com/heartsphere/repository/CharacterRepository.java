package com.heartsphere.repository;

import com.heartsphere.entity.Character;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {
    @EntityGraph(attributePaths = {"world", "era", "user"})
    @Query("SELECT c FROM Character c WHERE c.user.id = :userId AND c.isDeleted = false")
    List<Character> findByUser_Id(@Param("userId") Long userId);
    
    // 查找所有引用某个用户的角色（包括已删除的），用于强制删除
    @EntityGraph(attributePaths = {"world", "era", "user"})
    @Query("SELECT c FROM Character c WHERE c.user.id = :userId")
    List<Character> findAllByUser_Id(@Param("userId") Long userId);
    
    @EntityGraph(attributePaths = {"world", "era", "user"})
    @Query("SELECT c FROM Character c WHERE c.world.id = :worldId AND c.isDeleted = false")
    List<Character> findByWorld_Id(@Param("worldId") Long worldId);
    
    @EntityGraph(attributePaths = {"world", "era", "user"})
    @Query("SELECT c FROM Character c WHERE c.era.id = :eraId AND c.isDeleted = false")
    List<Character> findByEra_Id(@Param("eraId") Long eraId);
    
    // 回收站：获取已删除的角色
    @EntityGraph(attributePaths = {"world", "era", "user"})
    @Query("SELECT c FROM Character c WHERE c.user.id = :userId AND c.isDeleted = true")
    List<Character> findDeletedByUser_Id(@Param("userId") Long userId);
    
    // 查找所有引用某个world的角色（包括已删除的），用于强制删除
    @EntityGraph(attributePaths = {"world", "era", "user"})
    @Query("SELECT c FROM Character c WHERE c.world.id = :worldId")
    List<Character> findAllByWorld_Id(@Param("worldId") Long worldId);
    
    // 查找所有引用某个era的角色（包括已删除的），用于强制删除
    @EntityGraph(attributePaths = {"world", "era", "user"})
    @Query("SELECT c FROM Character c WHERE c.era.id = :eraId")
    List<Character> findAllByEra_Id(@Param("eraId") Long eraId);
}