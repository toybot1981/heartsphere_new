package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.entity.UserFactEntity;
import com.heartsphere.memory.entity.UserMemoryEntity;
import com.heartsphere.memory.entity.UserPreferenceEntity;
import com.heartsphere.memory.model.FactCategory;
import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.UserFact;
import com.heartsphere.memory.model.UserMemory;
import com.heartsphere.memory.model.UserPreference;
import com.heartsphere.memory.repository.jpa.UserFactRepository;
import com.heartsphere.memory.repository.jpa.UserMemoryRepository;
import com.heartsphere.memory.repository.jpa.UserPreferenceRepository;
import com.heartsphere.memory.service.LongMemoryService;
import com.heartsphere.memory.util.MemoryEntityConverter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * MySQL长期记忆服务实现
 * 
 * @author HeartSphere
 * @date 2025-12-31
 */
@Service
@org.springframework.context.annotation.Primary
@Slf4j
public class MySQLLongMemoryService implements LongMemoryService {

    private final UserFactRepository userFactRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final UserMemoryRepository userMemoryRepository;

    public MySQLLongMemoryService(
            UserFactRepository userFactRepository,
            UserPreferenceRepository userPreferenceRepository,
            UserMemoryRepository userMemoryRepository) {
        this.userFactRepository = userFactRepository;
        this.userPreferenceRepository = userPreferenceRepository;
        this.userMemoryRepository = userMemoryRepository;
    }
    
    // ========== 用户事实 ==========
    
    @Override
    @Transactional
    public void saveFact(UserFact fact) {
        try {
            if (fact.getId() == null || fact.getId().isEmpty()) {
                fact.setId(UUID.randomUUID().toString());
            }
            if (fact.getCreatedAt() == null) {
                fact.setCreatedAt(Instant.now());
            }
            if (fact.getLastAccessedAt() == null) {
                fact.setLastAccessedAt(Instant.now());
            }
            if (fact.getAccessCount() == null) {
                fact.setAccessCount(0);
            }
            
            UserFactEntity entity = MemoryEntityConverter.toEntity(fact);
            if (entity == null) {
                throw new RuntimeException("转换用户事实实体失败");
            }
            
            userFactRepository.save(entity);
            log.debug("保存用户事实: userId={}, factId={}", fact.getUserId(), fact.getId());
        } catch (Exception e) {
            log.error("保存用户事实失败: userId={}", fact.getUserId(), e);
            throw new RuntimeException("保存用户事实失败", e);
        }
    }
    
    @Override
    @Transactional
    public void saveFacts(List<UserFact> facts) {
        try {
            facts.forEach(fact -> {
                if (fact.getId() == null || fact.getId().isEmpty()) {
                    fact.setId(UUID.randomUUID().toString());
                }
                if (fact.getCreatedAt() == null) {
                    fact.setCreatedAt(Instant.now());
                }
                if (fact.getLastAccessedAt() == null) {
                    fact.setLastAccessedAt(Instant.now());
                }
                if (fact.getAccessCount() == null) {
                    fact.setAccessCount(0);
                }
            });
            
            List<UserFactEntity> entities = facts.stream()
                .map(MemoryEntityConverter::toEntity)
                .filter(entity -> entity != null)
                .collect(Collectors.toList());
            
            userFactRepository.saveAll(entities);
            log.debug("批量保存用户事实: count={}", facts.size());
        } catch (Exception e) {
            log.error("批量保存用户事实失败", e);
            throw new RuntimeException("批量保存用户事实失败", e);
        }
    }
    
    @Override
    public UserFact getFact(String factId) {
        try {
            Optional<UserFactEntity> entityOpt = userFactRepository.findById(factId);
            if (entityOpt.isEmpty()) {
                return null;
            }
            
            UserFact fact = MemoryEntityConverter.toModel(entityOpt.get());
            if (fact != null) {
                // 更新访问信息
                fact.recordAccess();
                saveFact(fact);
            }
            
            return fact;
        } catch (Exception e) {
            log.error("获取用户事实失败: factId={}", factId, e);
            return null;
        }
    }
    
    @Override
    public List<UserFact> getAllFacts(String userId) {
        try {
            List<UserFactEntity> entities = userFactRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return entities.stream()
                .map(MemoryEntityConverter::toModel)
                .filter(fact -> fact != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("获取用户所有事实失败: userId={}", userId, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<UserFact> getFactsByCategory(String userId, FactCategory category) {
        try {
            List<UserFactEntity> entities = userFactRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(userId, category);
            return entities.stream()
                .map(MemoryEntityConverter::toModel)
                .filter(fact -> fact != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("获取用户类别事实失败: userId={}, category={}", userId, category, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<UserFact> getImportantFacts(String userId, double minImportance) {
        try {
            List<UserFactEntity> entities = userFactRepository.findByUserIdAndMinImportance(userId, minImportance);
            return entities.stream()
                .map(MemoryEntityConverter::toModel)
                .filter(fact -> fact != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("获取用户重要事实失败: userId={}, minImportance={}", userId, minImportance, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<UserFact> searchFacts(String userId, String query) {
        try {
            List<UserFactEntity> entities = userFactRepository.searchFacts(userId, query);
            return entities.stream()
                .map(MemoryEntityConverter::toModel)
                .filter(fact -> fact != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("搜索用户事实失败: userId={}, query={}", userId, query, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    @Transactional
    public void deleteFact(String factId) {
        try {
            userFactRepository.deleteById(factId);
            log.debug("删除用户事实: factId={}", factId);
        } catch (Exception e) {
            log.error("删除用户事实失败: factId={}", factId, e);
        }
    }
    
    // ========== 用户偏好 ==========
    
    @Override
    @Transactional
    public void savePreference(UserPreference preference) {
        try {
            if (preference.getId() == null || preference.getId().isEmpty()) {
                preference.setId(UUID.randomUUID().toString());
            }
            if (preference.getUpdatedAt() == null) {
                preference.setUpdatedAt(Instant.now());
            }
            if (preference.getLastAccessedAt() == null) {
                preference.setLastAccessedAt(Instant.now());
            }
            if (preference.getAccessCount() == null) {
                preference.setAccessCount(0);
            }
            
            // 检查是否已存在，如果存在则更新
            Optional<UserPreferenceEntity> existingOpt = userPreferenceRepository
                .findByUserIdAndKey(preference.getUserId(), preference.getKey());
            
            UserPreferenceEntity entity = MemoryEntityConverter.toEntity(preference);
            if (entity == null) {
                throw new RuntimeException("转换用户偏好实体失败");
            }
            
            if (existingOpt.isPresent()) {
                UserPreferenceEntity existing = existingOpt.get();
                existing.setValue(entity.getValue());
                existing.setType(entity.getType());
                userPreferenceRepository.save(existing);
                log.debug("更新用户偏好: userId={}, key={}", preference.getUserId(), preference.getKey());
            } else {
                userPreferenceRepository.save(entity);
                log.debug("保存用户偏好: userId={}, key={}", preference.getUserId(), preference.getKey());
            }
        } catch (Exception e) {
            log.error("保存用户偏好失败: userId={}, key={}", preference.getUserId(), preference.getKey(), e);
            throw new RuntimeException("保存用户偏好失败", e);
        }
    }
    
    @Override
    public UserPreference getPreference(String userId, String key) {
        try {
            Optional<UserPreferenceEntity> entityOpt = userPreferenceRepository.findByUserIdAndKey(userId, key);
            if (entityOpt.isEmpty()) {
                return null;
            }
            
            UserPreference preference = MemoryEntityConverter.toModel(entityOpt.get());
            if (preference != null) {
                // 更新访问信息
                preference.recordAccess();
                savePreference(preference);
            }
            
            return preference;
        } catch (Exception e) {
            log.error("获取用户偏好失败: userId={}, key={}", userId, key, e);
            return null;
        }
    }
    
    @Override
    public List<UserPreference> getAllPreferences(String userId) {
        try {
            List<UserPreferenceEntity> entities = userPreferenceRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return entities.stream()
                .map(MemoryEntityConverter::toModel)
                .filter(pref -> pref != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("获取用户所有偏好失败: userId={}", userId, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    @Transactional
    public void deletePreference(String userId, String key) {
        try {
            userPreferenceRepository.deleteByUserIdAndKey(userId, key);
            log.debug("删除用户偏好: userId={}, key={}", userId, key);
        } catch (Exception e) {
            log.error("删除用户偏好失败: userId={}, key={}", userId, key, e);
        }
    }
    
    // ========== 记忆检索 ==========
    
    @Override
    public List<UserMemory> retrieveRelevantMemories(String userId, String query, int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit, Sort.by("importance").descending()
                .and(Sort.by("accessCount").descending()));
            
            // 使用文本搜索
            List<UserMemoryEntity> entities = userMemoryRepository.searchByContent(userId, query, pageable);
            
            if (!entities.isEmpty()) {
                return entities.stream()
                    .map(MemoryEntityConverter::toModel)
                    .filter(memory -> memory != null)
                    .collect(Collectors.toList());
            }
            
            // 如果文本搜索没有结果，返回最近的记忆
            pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
            entities = userMemoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return entities.stream()
                .limit(limit)
                .map(MemoryEntityConverter::toModel)
                .filter(memory -> memory != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("检索相关记忆失败: userId={}, query={}", userId, query, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<UserMemory> retrieveMemoriesByContext(String userId, Map<String, Object> context, int limit) {
        try {
            List<UserMemoryEntity> entities;
            
            // 根据上下文构建查询条件
            if (context.containsKey("type")) {
                String typeStr = context.get("type").toString();
                try {
                    MemoryType type = MemoryType.valueOf(typeStr);
                    Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
                    entities = userMemoryRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable);
                } catch (IllegalArgumentException e) {
                    log.warn("无效的记忆类型: {}", typeStr);
                    entities = userMemoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
                }
            } else if (context.containsKey("importance")) {
                String importanceStr = context.get("importance").toString();
                try {
                    MemoryImportance importance = MemoryImportance.valueOf(importanceStr);
                    Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
                    entities = userMemoryRepository.findByUserIdAndImportanceOrderByCreatedAtDesc(userId, importance, pageable);
                } catch (IllegalArgumentException e) {
                    log.warn("无效的重要性: {}", importanceStr);
                    entities = userMemoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
                }
            } else {
                entities = userMemoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
            }
            
            // 限制数量
            return entities.stream()
                .limit(limit)
                .map(MemoryEntityConverter::toModel)
                .filter(memory -> memory != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("根据上下文检索记忆失败: userId={}, context={}", userId, context, e);
            return Collections.emptyList();
        }
    }
    
    // ========== 扩展方法（用于MemoryManager等）==========
    
    /**
     * 保存用户记忆
     */
    @Transactional
    public void saveMemory(UserMemory memory) {
        try {
            if (memory.getId() == null || memory.getId().isEmpty()) {
                memory.setId(UUID.randomUUID().toString());
            }
            if (memory.getCreatedAt() == null) {
                memory.setCreatedAt(Instant.now());
            }
            if (memory.getLastAccessedAt() == null) {
                memory.setLastAccessedAt(Instant.now());
            }
            if (memory.getAccessCount() == null) {
                memory.setAccessCount(0);
            }
            
            UserMemoryEntity entity = MemoryEntityConverter.toEntity(memory);
            if (entity == null) {
                throw new RuntimeException("转换用户记忆实体失败");
            }
            
            userMemoryRepository.save(entity);
            log.debug("保存用户记忆: userId={}, memoryId={}, type={}", 
                memory.getUserId(), memory.getId(), memory.getType());
        } catch (Exception e) {
            log.error("保存用户记忆失败: userId={}", memory.getUserId(), e);
            throw new RuntimeException("保存用户记忆失败", e);
        }
    }
    
    /**
     * 批量保存用户记忆
     */
    @Transactional
    public void saveMemories(List<UserMemory> memories) {
        try {
            memories.forEach(memory -> {
                if (memory.getId() == null || memory.getId().isEmpty()) {
                    memory.setId(UUID.randomUUID().toString());
                }
                if (memory.getCreatedAt() == null) {
                    memory.setCreatedAt(Instant.now());
                }
                if (memory.getLastAccessedAt() == null) {
                    memory.setLastAccessedAt(Instant.now());
                }
                if (memory.getAccessCount() == null) {
                    memory.setAccessCount(0);
                }
            });
            
            List<UserMemoryEntity> entities = memories.stream()
                .map(MemoryEntityConverter::toEntity)
                .filter(entity -> entity != null)
                .collect(Collectors.toList());
            
            userMemoryRepository.saveAll(entities);
            log.debug("批量保存用户记忆: count={}", memories.size());
        } catch (Exception e) {
            log.error("批量保存用户记忆失败", e);
            throw new RuntimeException("批量保存用户记忆失败", e);
        }
    }
    
    /**
     * 根据用户ID和记忆类型获取记忆
     */
    public List<UserMemory> getMemoriesByType(String userId, MemoryType type, int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
            List<UserMemoryEntity> entities;
            
            if (type != null) {
                entities = userMemoryRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable);
            } else {
                entities = userMemoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
            }
            
            return entities.stream()
                .map(MemoryEntityConverter::toModel)
                .filter(memory -> memory != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("获取用户记忆失败: userId={}, type={}", userId, type, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 根据ID获取记忆
     */
    public UserMemory getMemoryById(String memoryId) {
        try {
            Optional<UserMemoryEntity> entityOpt = userMemoryRepository.findById(memoryId);
            if (entityOpt.isEmpty()) {
                return null;
            }
            
            UserMemory memory = MemoryEntityConverter.toModel(entityOpt.get());
            if (memory != null) {
                // 更新访问信息
                memory.setLastAccessedAt(Instant.now());
                memory.setAccessCount((memory.getAccessCount() == null ? 0 : memory.getAccessCount()) + 1);
                userMemoryRepository.updateAccessInfo(memoryId, 
                    java.time.LocalDateTime.now());
            }
            
            return memory;
        } catch (Exception e) {
            log.error("获取记忆失败: memoryId={}", memoryId, e);
            return null;
        }
    }
    
    /**
     * 删除记忆
     */
    @Transactional
    public void deleteMemory(String memoryId) {
        try {
            userMemoryRepository.deleteById(memoryId);
            log.debug("删除记忆成功: memoryId={}", memoryId);
        } catch (Exception e) {
            log.error("删除记忆失败: memoryId={}", memoryId, e);
            throw new RuntimeException("删除记忆失败", e);
        }
    }
}

