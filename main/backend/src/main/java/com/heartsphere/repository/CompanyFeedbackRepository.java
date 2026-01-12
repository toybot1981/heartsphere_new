package com.heartsphere.repository;

import com.heartsphere.entity.CompanyFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 公司官网反馈收集Repository
 */
@Repository
public interface CompanyFeedbackRepository extends JpaRepository<CompanyFeedback, Long> {
}
