package com.heartsphere.admin.repository.cmdb;

import com.heartsphere.admin.entity.cmdb.RelationshipType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 关系类型Repository
 */
@Repository
public interface RelationshipTypeRepository extends JpaRepository<RelationshipType, Long> {
    
    Optional<RelationshipType> findByCode(String code);
    
    Optional<RelationshipType> findByName(String name);
}
