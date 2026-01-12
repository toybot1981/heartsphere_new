# Phase 3: 数字人教育应用规划 - 详细设计文档

## 1. 数据模型设计

### 1.1 EduCharacter 实体设计

#### 数据库表结构：`edu_characters`

```sql
CREATE TABLE IF NOT EXISTS edu_characters (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name VARCHAR(100) NOT NULL COMMENT '角色名称',
  avatar_url VARCHAR(500) COMMENT '头像URL',
  background_url VARCHAR(500) COMMENT '背景图片URL',
  description TEXT COMMENT '角色描述',
  bio TEXT COMMENT '角色简介（教育背景、特长等）',
  
  -- 教育相关属性
  character_type ENUM('teaching_assistant', 'learning_companion', 'counseling', 'homework_helper', 'subject_explainer') NOT NULL COMMENT '角色类型：教学助手、学习伙伴、心理辅导、作业辅导、学科讲解',
  age_group_suitability JSON COMMENT '适用年龄段：["primary_6_12", "secondary_13_18"] 或单个值',
  subject_tags JSON COMMENT '学科标签：["math", "chinese", "english", "science", "physics", "chemistry", "biology", "history", "geography"]',
  teaching_specialty TEXT COMMENT '教学特长描述',
  difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate' COMMENT '难度等级',
  language_style ENUM('formal', 'casual', 'friendly') DEFAULT 'friendly' COMMENT '语言风格',
  personality_traits JSON COMMENT '性格特质：["patient", "encouraging", "friendly", "strict", "humorous"]',
  
  -- 系统指令和配置（参考主系统 Character）
  first_message TEXT COMMENT '首次对话消息',
  system_instruction TEXT COMMENT '系统指令（用于 AI 对话）',
  voice_name VARCHAR(50) COMMENT '语音名称',
  theme_color VARCHAR(50) COMMENT '主题颜色',
  color_accent VARCHAR(50) COMMENT '强调色',
  
  -- 关联关系
  student_id BIGINT COMMENT '创建者学生ID（如果是学生创建的）',
  teacher_id BIGINT COMMENT '创建者教师ID（如果是教师创建的）',
  
  -- 使用统计（非规范化字段，用于快速查询）
  total_interactions INT DEFAULT 0 COMMENT '总互动次数',
  unique_students INT DEFAULT 0 COMMENT '互动过的学生数量',
  average_rating DECIMAL(3, 2) DEFAULT 0.0 COMMENT '平均评分（1-5星）',
  
  -- 元数据
  is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否已删除',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at DATETIME COMMENT '删除时间',
  
  -- 索引
  INDEX idx_character_type (character_type),
  INDEX idx_age_group (age_group_suitability(255)),
  INDEX idx_subject_tags (subject_tags(255)),
  INDEX idx_student_id (student_id),
  INDEX idx_teacher_id (teacher_id),
  INDEX idx_is_enabled (is_enabled),
  INDEX idx_is_deleted (is_deleted),
  INDEX idx_created_at (created_at),
  FULLTEXT INDEX idx_name_description (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教育版数字人角色表';
```

#### JPA 实体类结构

```java
@Entity
@Table(name = "edu_characters")
public class EduCharacter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;
    
    @Column(name = "background_url", length = 500)
    private String backgroundUrl;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "character_type", nullable = false)
    private CharacterType characterType;
    
    @Column(name = "age_group_suitability", columnDefinition = "JSON")
    @Convert(converter = ListToJsonConverter.class)
    private List<String> ageGroupSuitability;
    
    @Column(name = "subject_tags", columnDefinition = "JSON")
    @Convert(converter = ListToJsonConverter.class)
    private List<String> subjectTags;
    
    @Column(name = "teaching_specialty", columnDefinition = "TEXT")
    private String teachingSpecialty;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level")
    private DifficultyLevel difficultyLevel;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "language_style")
    private LanguageStyle languageStyle;
    
    @Column(name = "personality_traits", columnDefinition = "JSON")
    @Convert(converter = ListToJsonConverter.class)
    private List<String> personalityTraits;
    
    @Column(name = "first_message", columnDefinition = "TEXT")
    private String firstMessage;
    
    @Column(name = "system_instruction", columnDefinition = "TEXT")
    private String systemInstruction;
    
    @Column(name = "voice_name", length = 50)
    private String voiceName;
    
    @Column(name = "theme_color", length = 50)
    private String themeColor;
    
    @Column(name = "color_accent", length = 50)
    private String colorAccent;
    
    @Column(name = "student_id")
    private Long studentId;
    
    @Column(name = "teacher_id")
    private Long teacherId;
    
    @Column(name = "total_interactions")
    private Integer totalInteractions = 0;
    
    @Column(name = "unique_students")
    private Integer uniqueStudents = 0;
    
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;
    
    @Column(name = "is_enabled")
    private Boolean isEnabled = true;
    
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
    
    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // Getters and setters...
}

public enum CharacterType {
    TEACHING_ASSISTANT("teaching_assistant", "教学助手"),
    LEARNING_COMPANION("learning_companion", "学习伙伴"),
    COUNSELING("counseling", "心理辅导"),
    HOMEWORK_HELPER("homework_helper", "作业辅导"),
    SUBJECT_EXPLAINER("subject_explainer", "学科讲解");
    
    // ...
}

public enum DifficultyLevel {
    BEGINNER("beginner", "初级"),
    INTERMEDIATE("intermediate", "中级"),
    ADVANCED("advanced", "高级");
    
    // ...
}

public enum LanguageStyle {
    FORMAL("formal", "正式"),
    CASUAL("casual", "随意"),
    FRIENDLY("friendly", "友好");
    
    // ...
}
```

### 1.2 EduCharacterInteraction 实体设计

#### 数据库表结构：`edu_character_interactions`

```sql
CREATE TABLE IF NOT EXISTS edu_character_interactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  student_id BIGINT NOT NULL COMMENT '学生ID',
  character_id BIGINT NOT NULL COMMENT '数字人角色ID',
  
  -- 互动信息
  interaction_type ENUM('teaching_dialogue', 'homework_help', 'counseling', 'knowledge_explanation', 'practice_exercise') NOT NULL COMMENT '互动类型：教学对话、作业辅导、心理疏导、知识讲解、练习训练',
  conversation_content TEXT COMMENT '对话内容（JSON格式，包含消息列表）',
  learning_topics JSON COMMENT '学习知识点：["topic1", "topic2"]',
  comprehension_level ENUM('not_understood', 'partially_understood', 'well_understood', 'mastered') COMMENT '理解程度',
  
  -- 评价和反馈
  student_rating INT COMMENT '学生评分（1-5星）',
  student_feedback TEXT COMMENT '学生反馈',
  
  -- 时间统计
  start_time DATETIME NOT NULL COMMENT '互动开始时间',
  end_time DATETIME COMMENT '互动结束时间',
  duration_minutes INT COMMENT '互动时长（分钟）',
  
  -- 元数据
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 索引
  INDEX idx_student_id (student_id),
  INDEX idx_character_id (character_id),
  INDEX idx_interaction_type (interaction_type),
  INDEX idx_start_time (start_time),
  INDEX idx_student_character (student_id, character_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教育版数字人互动记录表';
```

## 2. 服务接口设计

### 2.1 DigitalHumanService 接口

```java
public interface DigitalHumanService {
    /**
     * 创建教育数字人角色
     */
    EduCharacter createCharacter(CreateCharacterRequest request);
    
    /**
     * 获取数字人角色列表（支持多条件筛选）
     */
    Page<EduCharacter> getCharacters(CharacterQuery query, Pageable pageable);
    
    /**
     * 根据ID获取数字人角色详情
     */
    EduCharacter getCharacterById(Long id);
    
    /**
     * 为学生推荐数字人角色
     */
    List<CharacterRecommendation> recommendCharacters(Long studentId, RecommendationCriteria criteria);
    
    /**
     * 记录学生与数字人的互动
     */
    EduCharacterInteraction recordInteraction(RecordInteractionRequest request);
    
    /**
     * 获取学生的互动历史
     */
    Page<EduCharacterInteraction> getStudentInteractions(Long studentId, InteractionQuery query, Pageable pageable);
    
    /**
     * 获取数字人的互动统计
     */
    CharacterStatistics getCharacterStatistics(Long characterId);
    
    /**
     * 获取学生的学习进度
     */
    LearningProgress getStudentLearningProgress(Long studentId, ProgressQuery query);
    
    /**
     * 更新数字人角色信息
     */
    EduCharacter updateCharacter(Long id, UpdateCharacterRequest request);
    
    /**
     * 删除数字人角色（软删除）
     */
    void deleteCharacter(Long id);
}
```

### 2.2 推荐算法接口

```java
public interface CharacterRecommendationService {
    /**
     * 基于年龄组推荐
     */
    List<EduCharacter> recommendByAgeGroup(String ageGroup);
    
    /**
     * 基于学科兴趣推荐
     */
    List<EduCharacter> recommendBySubject(List<String> subjects);
    
    /**
     * 基于历史互动推荐
     */
    List<EduCharacter> recommendByHistory(Long studentId);
    
    /**
     * 综合推荐（年龄+学科+历史）
     */
    List<CharacterRecommendation> recommendComprehensive(Long studentId);
}
```

## 3. API 端点设计

### 3.1 数字人角色管理 API

```
POST   /api/edu/characters                    # 创建数字人角色
GET    /api/edu/characters                    # 获取数字人角色列表（支持筛选、分页）
GET    /api/edu/characters/{id}               # 获取数字人角色详情
PUT    /api/edu/characters/{id}               # 更新数字人角色
DELETE /api/edu/characters/{id}               # 删除数字人角色
GET    /api/edu/characters/recommendations    # 获取推荐角色（需要 student_id）
GET    /api/edu/characters/{id}/statistics    # 获取角色统计信息
```

### 3.2 互动记录 API

```
POST   /api/edu/character-interactions        # 记录互动
GET    /api/edu/character-interactions        # 获取互动历史（支持筛选、分页）
GET    /api/edu/character-interactions/{id}   # 获取互动详情
GET    /api/edu/students/{studentId}/interactions  # 获取学生的互动历史
GET    /api/edu/students/{studentId}/learning-progress  # 获取学生学习进度
```

### 3.3 DTO 定义

```java
// 创建角色请求
public class CreateCharacterRequest {
    private String name;
    private String avatarUrl;
    private String description;
    private CharacterType characterType;
    private List<String> ageGroupSuitability;
    private List<String> subjectTags;
    private String teachingSpecialty;
    private DifficultyLevel difficultyLevel;
    private LanguageStyle languageStyle;
    private String systemInstruction;
    // ...
}

// 角色查询条件
public class CharacterQuery {
    private CharacterType characterType;
    private String ageGroup;
    private List<String> subjectTags;
    private DifficultyLevel difficultyLevel;
    private String searchKeyword;
    // ...
}

// 互动记录请求
public class RecordInteractionRequest {
    private Long studentId;
    private Long characterId;
    private InteractionType interactionType;
    private List<Message> conversationContent;
    private List<String> learningTopics;
    private ComprehensionLevel comprehensionLevel;
    private Integer studentRating;
    private String studentFeedback;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    // ...
}

// 角色推荐结果
public class CharacterRecommendation {
    private EduCharacter character;
    private String reason;  // 推荐原因
    private Double relevanceScore;  // 相关性分数
}
```

## 4. 前端组件规划

### 4.1 数字人角色展示组件

- **DigitalCharacterCard**: 角色卡片组件（显示头像、名称、类型、学科标签）
- **DigitalCharacterList**: 角色列表组件（支持筛选、分页）
- **DigitalCharacterDetail**: 角色详情页面（完整信息展示）
- **CharacterFilter**: 角色筛选组件（类型、年龄组、学科）

### 4.2 数字人推荐组件

- **CharacterRecommendationPanel**: 推荐面板（显示推荐角色及原因）
- **RecommendationCarousel**: 推荐轮播（横向滚动展示）
- **QuickStartButton**: 快速开始按钮（点击直接开始对话）

### 4.3 互动历史组件

- **InteractionHistoryList**: 互动历史列表（分组显示）
- **InteractionCard**: 互动记录卡片（显示类型、时长、知识点）
- **InteractionDetailModal**: 互动详情弹窗（查看完整对话内容）
- **InteractionFilter**: 互动筛选组件（按角色、类型、日期）

### 4.4 学习进度组件

- **LearningProgressDashboard**: 学习进度仪表板（总体概览）
- **SubjectProgressChart**: 学科进度图表（按学科展示）
- **TopicProgressList**: 知识点进度列表（详细知识点掌握情况）
- **ActivityTimeline**: 活动时间线（最近学习活动）

## 5. 实现优先级

### Phase 4.1: 核心实体和数据库（高优先级）
1. 创建 EduCharacter 实体和数据库表
2. 创建 EduCharacterInteraction 实体和数据库表
3. 实现基础的 Repository 接口

### Phase 4.2: 基础服务实现（高优先级）
1. 实现 DigitalHumanService 基础 CRUD 操作
2. 实现角色列表查询（支持筛选、分页）
3. 实现角色推荐服务（基于年龄组和学科）

### Phase 4.3: API 端点实现（中优先级）
1. 实现角色管理 API（CRUD）
2. 实现推荐 API
3. 实现互动记录 API

### Phase 4.4: 前端组件实现（中优先级）
1. 实现角色列表和详情页面
2. 实现推荐组件
3. 实现互动历史组件

### Phase 4.5: 高级功能（低优先级）
1. 实现高级推荐算法（基于历史互动）
2. 实现学习进度分析
3. 实现统计分析功能
