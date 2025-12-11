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
    @Query("SELECT c FROM Character c WHERE c.user.id = :userId")
    List<Character> findByUser_Id(@Param("userId") Long userId);
    
    @EntityGraph(attributePaths = {"world", "era", "user"})
    @Query("SELECT c FROM Character c WHERE c.world.id = :worldId")
    List<Character> findByWorld_Id(@Param("worldId") Long worldId);
    
    @EntityGraph(attributePaths = {"world", "era", "user"})
    @Query("SELECT c FROM Character c WHERE c.era.id = :eraId")
    List<Character> findByEra_Id(@Param("eraId") Long eraId);
}