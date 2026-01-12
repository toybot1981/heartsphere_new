package com.heartsphere.mentis.repository;

import com.heartsphere.mentis.entity.McpServerConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface McpServerConfigRepository extends JpaRepository<McpServerConfig, Long> {

    /**
     * 根据名称查找配置
     */
    Optional<McpServerConfig> findByName(String name);

    /**
     * 查找所有启用的配置
     */
    List<McpServerConfig> findByEnabledTrue();

    /**
     * 根据用户ID查找配置
     */
    List<McpServerConfig> findByUserId(Long userId);

    /**
     * 根据用户ID和启用状态查找配置
     */
    List<McpServerConfig> findByUserIdAndEnabledTrue(Long userId);

    /**
     * 根据服务器类型查找配置
     */
    List<McpServerConfig> findByServerType(String serverType);

    /**
     * 根据连接状态查找配置
     */
    List<McpServerConfig> findByConnectionStatus(String connectionStatus);
}
