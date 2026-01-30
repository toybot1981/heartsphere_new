package com.heartsphere.admin.repository.agentmind;

import com.heartsphere.admin.config.DataSource;
import com.heartsphere.admin.entity.agentmind.AgentIdentity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 智能体身份认知Repository
 * 使用 agent-mind 数据源
 */
@Repository
@DataSource("agent-mind")
public interface AgentIdentityRepository extends JpaRepository<AgentIdentity, Long> {
    
    /**
     * 根据角色ID查找身份认知信息
     */
    Optional<AgentIdentity> findByCharacterId(Long characterId);
    
    /**
     * 根据角色ID列表查找身份认知信息
     */
    List<AgentIdentity> findByCharacterIdIn(List<Long> characterIds);
    
    /**
     * 检查角色是否存在身份认知信息
     */
    boolean existsByCharacterId(Long characterId);
    
    /**
     * 根据自我认知水平范围查找
     */
    @Query("SELECT a FROM AgentIdentity a WHERE a.selfAwarenessLevel >= :minLevel AND a.selfAwarenessLevel <= :maxLevel")
    List<AgentIdentity> findBySelfAwarenessLevelBetween(@Param("minLevel") Integer minLevel, @Param("maxLevel") Integer maxLevel);
}
