package com.heartsphere.billing.repository;

import com.heartsphere.billing.entity.AIModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIModelRepository extends JpaRepository<AIModel, Long> {
    /**
     * 根据providerId和modelCode查找模型（返回第一条，避免重复记录问题）
     */
    @Query("SELECT m FROM AIModel m WHERE m.providerId = :providerId AND m.modelCode = :modelCode ORDER BY m.id ASC")
    Optional<AIModel> findByProviderIdAndModelCode(@Param("providerId") Long providerId, @Param("modelCode") String modelCode);
    
    /**
     * 查找所有匹配的模型（用于处理重复记录）
     */
    @Query("SELECT m FROM AIModel m WHERE m.providerId = :providerId AND m.modelCode = :modelCode ORDER BY m.id ASC")
    List<AIModel> findAllByProviderIdAndModelCode(@Param("providerId") Long providerId, @Param("modelCode") String modelCode);
    
    List<AIModel> findByProviderId(Long providerId);
    
    List<AIModel> findByModelType(String modelType);
    
    @Query("SELECT m FROM AIModel m WHERE m.providerId = :providerId AND m.modelCode = :modelCode ORDER BY m.id ASC")
    Optional<AIModel> findByProviderAndModelCode(@Param("providerId") Long providerId, @Param("modelCode") String modelCode);
}

