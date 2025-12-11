package com.heartsphere.repository;

import com.heartsphere.entity.Script;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScriptRepository extends JpaRepository<Script, Long> {
    List<Script> findByUser_Id(Long userId);
    List<Script> findByWorld_Id(Long worldId);
    List<Script> findByEra_Id(Long eraId);
}