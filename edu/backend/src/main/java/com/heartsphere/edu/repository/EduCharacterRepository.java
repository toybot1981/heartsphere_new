package com.heartsphere.edu.repository;

import com.heartsphere.edu.entity.EduCharacter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 教育版数字人角色仓库接口
 */
@Repository
public interface EduCharacterRepository extends JpaRepository<EduCharacter, Long> {
    
    /**
     * 根据角色类型查找
     */
    Page<EduCharacter> findByCharacterTypeAndIsDeletedFalseAndIsEnabledTrue(
            EduCharacter.CharacterType characterType, 
            Pageable pageable
    );
    
    /**
     * 根据学生ID查找（学生创建的角色）
     */
    Page<EduCharacter> findByStudentIdAndIsDeletedFalse(Long studentId, Pageable pageable);
    
    /**
     * 根据教师ID查找（教师创建的角色）
     */
    Page<EduCharacter> findByTeacherIdAndIsDeletedFalse(Long teacherId, Pageable pageable);
    
    /**
     * 根据名称或描述搜索
     */
    @Query("SELECT c FROM EduCharacter c WHERE " +
           "(c.name LIKE %:keyword% OR c.description LIKE %:keyword%) " +
           "AND c.isDeleted = false AND c.isEnabled = true")
    Page<EduCharacter> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * 查找所有启用的角色（不分页）
     */
    List<EduCharacter> findByIsDeletedFalseAndIsEnabledTrue();
    
    /**
     * 统计角色数量
     */
    long countByIsDeletedFalseAndIsEnabledTrue();
}
