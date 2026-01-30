package com.heartsphere.ai.mcp.repository;

import com.heartsphere.ai.mcp.entity.McpServerConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface McpServerConfigRepository extends JpaRepository<McpServerConfig, Long> {

    Optional<McpServerConfig> findByName(String name);

    List<McpServerConfig> findByEnabledTrue();

    List<McpServerConfig> findByUserId(Long userId);

    List<McpServerConfig> findByUserIdAndEnabledTrue(Long userId);

    List<McpServerConfig> findByServerType(String serverType);

    List<McpServerConfig> findByConnectionStatus(String connectionStatus);
}
