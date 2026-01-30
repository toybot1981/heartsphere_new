package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.entity.UserFactEntity;
import com.heartsphere.memory.entity.UserPreferenceEntity;
import com.heartsphere.memory.model.FactCategory;
import com.heartsphere.memory.model.UserFact;
import com.heartsphere.memory.model.UserPreference;
import com.heartsphere.memory.repository.jpa.UserFactRepository;
import com.heartsphere.memory.repository.jpa.UserPreferenceRepository;
import com.heartsphere.memory.service.LongMemoryService;
import com.heartsphere.memory.util.MemoryEntityConverter;
import lombok.extern.slf4j.Slf4j;
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

    public MySQLLongMemoryService(
            UserFactRepository userFactRepository,
            UserPreferenceRepository userPreferenceRepository) {
        this.userFactRepository = userFactRepository;
        this.userPreferenceRepository = userPreferenceRepository;
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
            log.info("保存用户事实: userId={}, factId={}", fact.getUserId(), fact.getId());
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
            log.info("批量保存用户事实: count={}", facts.size());
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
            log.info("删除用户事实: factId={}", factId);
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
                log.info("更新用户偏好: userId={}, key={}", preference.getUserId(), preference.getKey());
            } else {
                userPreferenceRepository.save(entity);
                log.info("保存用户偏好: userId={}, key={}", preference.getUserId(), preference.getKey());
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
            log.info("删除用户偏好: userId={}, key={}", userId, key);
        } catch (Exception e) {
            log.error("删除用户偏好失败: userId={}, key={}", userId, key, e);
        }
    }
}

