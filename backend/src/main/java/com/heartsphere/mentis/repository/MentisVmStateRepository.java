package com.heartsphere.mentis.repository;

import com.heartsphere.mentis.entity.MentisVmState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentisVmStateRepository extends JpaRepository<MentisVmState, Long> {

    /**
     * 根据会话ID查找所有状态
     */
    List<MentisVmState> findBySession_IdOrderByCreatedAtDesc(Long sessionId);

    /**
     * 根据会话ID和状态类型查找
     */
    List<MentisVmState> findBySession_IdAndStateTypeOrderByCreatedAtDesc(Long sessionId, String stateType);

    /**
     * 查找最新的状态快照
     */
    @Query("SELECT v FROM MentisVmState v WHERE v.session.id = :sessionId ORDER BY v.createdAt DESC")
    Optional<MentisVmState> findLatestStateBySessionId(@Param("sessionId") Long sessionId);
}
