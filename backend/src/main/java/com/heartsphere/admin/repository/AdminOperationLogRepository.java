/**
 * 管理员操作日志仓库
 */
package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.AdminOperationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 管理员操作日志仓库
 */
@Repository
public interface AdminOperationLogRepository extends JpaRepository<AdminOperationLog, Long> {
}




