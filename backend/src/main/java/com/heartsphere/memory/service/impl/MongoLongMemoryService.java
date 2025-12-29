package com.heartsphere.memory.service.impl;

import com.heartsphere.memory.model.FactCategory;
import com.heartsphere.memory.model.MemoryImportance;
import com.heartsphere.memory.model.MemoryType;
import com.heartsphere.memory.model.UserFact;
import com.heartsphere.memory.model.UserMemory;
import com.heartsphere.memory.model.UserPreference;
import com.heartsphere.memory.repository.UserFactRepository;
import com.heartsphere.memory.repository.UserMemoryRepository;
import com.heartsphere.memory.repository.UserPreferenceRepository;
import com.heartsphere.memory.service.LongMemoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * MongoDB长期记忆服务实现
 * 支持温度感系统的情感记忆存储和检索
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MongoLongMemoryService implements LongMemoryService {
    
    private final UserFactRepository userFactRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final UserMemoryRepository userMemoryRepository;
    private final MongoTemplate mongoTemplate;
    
    // ========== 用户事实 ==========
    
    @Override
    public void saveFact(UserFact fact) {
        try {
            if (fact.getCreatedAt() == null) {
                fact.setCreatedAt(Instant.now());
            }
            if (fact.getLastAccessedAt() == null) {
                fact.setLastAccessedAt(Instant.now());
            }
            if (fact.getAccessCount() == null) {
                fact.setAccessCount(0);
            }
            
            userFactRepository.save(fact);
            log.debug("保存用户事实: userId={}, factId={}", fact.getUserId(), fact.getId());
        } catch (Exception e) {
            log.error("保存用户事实失败: userId={}", fact.getUserId(), e);
            throw new RuntimeException("保存用户事实失败", e);
        }
    }
    
    @Override
    public void saveFacts(List<UserFact> facts) {
        try {
            facts.forEach(fact -> {
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
            
            userFactRepository.saveAll(facts);
            log.debug("批量保存用户事实: count={}", facts.size());
        } catch (Exception e) {
            log.error("批量保存用户事实失败", e);
            throw new RuntimeException("批量保存用户事实失败", e);
        }
    }
    
    @Override
    public UserFact getFact(String factId) {
        try {
            return userFactRepository.findById(factId).orElse(null);
        } catch (Exception e) {
            log.error("获取用户事实失败: factId={}", factId, e);
            return null;
        }
    }
    
    @Override
    public List<UserFact> getAllFacts(String userId) {
        try {
            return userFactRepository.findByUserId(userId);
        } catch (Exception e) {
            log.error("获取用户所有事实失败: userId={}", userId, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<UserFact> getFactsByCategory(String userId, FactCategory category) {
        try {
            return userFactRepository.findByUserIdAndCategory(userId, category);
        } catch (Exception e) {
            log.error("获取用户类别事实失败: userId={}, category={}", userId, category, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<UserFact> getImportantFacts(String userId, double minImportance) {
        try {
            return userFactRepository.findByUserIdAndImportanceGreaterThanEqual(userId, minImportance);
        } catch (Exception e) {
            log.error("获取用户重要事实失败: userId={}, minImportance={}", userId, minImportance, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<UserFact> searchFacts(String userId, String query) {
        try {
            // 使用MongoDB文本搜索
            return userFactRepository.searchByUserIdAndText(userId, query);
        } catch (Exception e) {
            log.error("搜索用户事实失败: userId={}, query={}", userId, query, e);
            // 如果文本搜索失败，尝试使用正则表达式
            try {
                Query mongoQuery = new Query();
                mongoQuery.addCriteria(Criteria.where("userId").is(userId)
                    .and("fact").regex(query, "i"));
                return mongoTemplate.find(mongoQuery, UserFact.class);
            } catch (Exception ex) {
                log.error("使用正则表达式搜索失败", ex);
                return Collections.emptyList();
            }
        }
    }
    
    @Override
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
    public void savePreference(UserPreference preference) {
        try {
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
            Optional<UserPreference> existing = userPreferenceRepository
                .findByUserIdAndKey(preference.getUserId(), preference.getKey());
            
            if (existing.isPresent()) {
                UserPreference existingPref = existing.get();
                existingPref.setValue(preference.getValue());
                existingPref.setType(preference.getType());
                existingPref.setConfidence(preference.getConfidence());
                existingPref.setUpdatedAt(Instant.now());
                existingPref.setMetadata(preference.getMetadata());
                userPreferenceRepository.save(existingPref);
                log.debug("更新用户偏好: userId={}, key={}", preference.getUserId(), preference.getKey());
            } else {
                userPreferenceRepository.save(preference);
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
            Optional<UserPreference> preference = userPreferenceRepository.findByUserIdAndKey(userId, key);
            if (preference.isPresent()) {
                UserPreference pref = preference.get();
                pref.recordAccess();
                userPreferenceRepository.save(pref);
                return pref;
            }
            return null;
        } catch (Exception e) {
            log.error("获取用户偏好失败: userId={}, key={}", userId, key, e);
            return null;
        }
    }
    
    @Override
    public List<UserPreference> getAllPreferences(String userId) {
        try {
            return userPreferenceRepository.findByUserId(userId);
        } catch (Exception e) {
            log.error("获取用户所有偏好失败: userId={}", userId, e);
            return Collections.emptyList();
        }
    }
    
    @Override
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
            List<UserMemory> textResults = userMemoryRepository.searchByUserIdAndText(userId, query, pageable);
            
            if (!textResults.isEmpty()) {
                return textResults;
            }
            
            // 如果文本搜索没有结果，使用关键词匹配
            Query mongoQuery = new Query();
            mongoQuery.addCriteria(Criteria.where("userId").is(userId)
                .orOperator(
                    Criteria.where("content").regex(query, "i"),
                    Criteria.where("tags").in(query)
                ));
            mongoQuery.with(pageable);
            
            return mongoTemplate.find(mongoQuery, UserMemory.class);
        } catch (Exception e) {
            log.error("检索相关记忆失败: userId={}, query={}", userId, query, e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<UserMemory> retrieveMemoriesByContext(String userId, Map<String, Object> context, int limit) {
        try {
            Query query = new Query();
            query.addCriteria(Criteria.where("userId").is(userId));
            
            // 根据上下文构建查询条件
            if (context.containsKey("type")) {
                String typeStr = context.get("type").toString();
                try {
                    MemoryType type = MemoryType.valueOf(typeStr);
                    query.addCriteria(Criteria.where("type").is(type));
                } catch (IllegalArgumentException e) {
                    log.warn("无效的记忆类型: {}", typeStr);
                }
            }
            
            if (context.containsKey("importance")) {
                String importanceStr = context.get("importance").toString();
                try {
                    MemoryImportance importance = MemoryImportance.valueOf(importanceStr);
                    query.addCriteria(Criteria.where("importance").is(importance));
                } catch (IllegalArgumentException e) {
                    log.warn("无效的重要性: {}", importanceStr);
                }
            }
            
            // 支持温度感系统的情绪类型检索
            if (context.containsKey("emotionType")) {
                String emotionType = context.get("emotionType").toString();
                query.addCriteria(Criteria.where("metadata.emotionType").is(emotionType));
            }
            
            // 支持其他元数据查询
            if (context.containsKey("metadata")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> metadata = (Map<String, Object>) context.get("metadata");
                metadata.forEach((key, value) -> {
                    query.addCriteria(Criteria.where("metadata." + key).is(value));
                });
            }
            
            // 按重要性和访问次数排序
            query.with(Sort.by("importance").descending()
                .and(Sort.by("accessCount").descending()));
            query.limit(limit);
            
            return mongoTemplate.find(query, UserMemory.class);
        } catch (Exception e) {
            log.error("根据上下文检索记忆失败: userId={}, context={}", userId, context, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * 保存用户记忆（新增方法，用于TemperatureMemoryService）
     */
    public void saveMemory(UserMemory memory) {
        try {
            if (memory.getCreatedAt() == null) {
                memory.setCreatedAt(Instant.now());
            }
            if (memory.getLastAccessedAt() == null) {
                memory.setLastAccessedAt(Instant.now());
            }
            if (memory.getAccessCount() == null) {
                memory.setAccessCount(0);
            }
            
            userMemoryRepository.save(memory);
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
    public void saveMemories(List<UserMemory> memories) {
        try {
            memories.forEach(memory -> {
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
            
            userMemoryRepository.saveAll(memories);
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
            Pageable pageable = PageRequest.of(0, limit);
            if (type != null) {
                return userMemoryRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type, pageable);
            } else {
                // 如果type为null，返回所有记忆（按创建时间降序）
                Query query = new Query();
                query.addCriteria(Criteria.where("userId").is(userId));
                query.with(Sort.by("createdAt").descending());
                query.limit(limit);
                return mongoTemplate.find(query, UserMemory.class);
            }
        } catch (Exception e) {
            log.error("获取用户记忆失败: userId={}, type={}", userId, type, e);
            return Collections.emptyList();
        }
    }
}

