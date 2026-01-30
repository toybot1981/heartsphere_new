package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.RemoteServer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 远程服务器仓库
 */
@Repository
public interface RemoteServerRepository extends JpaRepository<RemoteServer, Long> {
    
    /**
     * 查找所有启用的服务器
     */
    List<RemoteServer> findByEnabledTrue();
    
    /**
     * 根据名称查找
     */
    Optional<RemoteServer> findByName(String name);
    
    /**
     * 根据主机和端口查找
     */
    Optional<RemoteServer> findByHostAndPort(String host, Integer port);
}
