# E-SOUL来信机制说明

## 一、概述

E-SOUL来信是系统自动生成的个性化信件，由AI角色（E-SOUL）根据用户的状态、情绪和互动历史，在特定时机自动发送给用户。

## 二、触发机制

### 2.1 主要触发时机

**用户登录触发**（主要机制）

1. **触发条件**：
   - 用户登录系统
   - 用户离线时间 ≥ 60秒（如果提供了上次登录时间）
   - 用户首次登录（没有上次登录时间）

2. **触发流程**：
   ```
   用户登录 
   → ESoulLetterTriggerListener.handleUserLogin()
   → 检查离线时间（≥60秒）
   → 检查触发条件（用户存在、有可用角色）
   → 触发来信生成（异步执行）
   ```

3. **代码位置**：
   - 监听器：`backend/src/main/java/com/heartsphere/mailbox/listener/ESoulLetterTriggerListener.java`
   - 服务：`backend/src/main/java/com/heartsphere/mailbox/service/ESoulLetterService.java`

### 2.2 触发条件检查

**shouldTriggerLetter()** 方法检查：
- ✅ 用户是否存在
- ✅ 是否有可用角色（Character）
- ⚠️ 可选：最近是否已经收到过来信（避免频繁来信）- **待实现**
- ⚠️ 可选：用户是否启用E-SOUL来信功能 - **待实现**

### 2.3 手动触发

**触发方式**：
- 通过API：`POST /api/mailbox/esoul-letters`
- 调用 `ESoulLetterTriggerListener.triggerLetterManually()`

**使用场景**：
- 测试
- 特殊活动
- 管理员手动触发

## 三、发件人选择机制

### 3.1 选择优先级

1. **优先选择**：最近聊过的角色
   - 从 `AccessHistory` 表查询用户最近的访问记录
   - 按访问时间降序排序
   - 选择最近访问的角色ID

2. **备选方案**：第一个场景的第一个角色
   - 如果用户没有访问历史
   - 从用户的角色列表中获取第一个角色

### 3.2 代码实现

```java
private Long selectSenderCharacter(Long userId) {
    // 优先：最近聊过的角色
    List<AccessHistory> recentHistory = 
        accessHistoryRepository.findByUserIdOrderByAccessTimeDesc(userId);
    
    if (recentHistory != null && !recentHistory.isEmpty()) {
        // 去重，获取最近访问的角色ID
        List<Long> recentCharacterIds = recentHistory.stream()
            .map(ah -> ah.getCharacter().getId())
            .distinct()
            .limit(1)
            .collect(Collectors.toList());
        
        if (!recentCharacterIds.isEmpty()) {
            return recentCharacterIds.get(0);
        }
    }
    
    // 备选：第一个场景的第一个角色
    List<Character> characters = characterRepository.findByUser_Id(userId);
    if (characters != null && !characters.isEmpty()) {
        return characters.get(0).getId();
    }
    
    return null;
}
```

## 四、来信类型确定

### 4.1 来信类型

- **GREETING**（问候）：默认类型
- **CARE**（关怀）：用户情绪负面时
- **SHARE**（分享）：用户情绪正面时
- **REMINDER**（提醒）：特殊提醒场景

### 4.2 类型选择逻辑

1. **如果触发信息指定了类型** → 使用指定类型
2. **根据用户情绪选择**：
   - 负面情绪（sad, anxious, angry, lonely, tired, confused）→ **CARE**
   - 正面情绪（happy, excited, content, hopeful）→ **SHARE**
3. **默认** → **GREETING**

### 4.3 代码实现

```java
private ESoulLetterType determineLetterType(Long userId, ESoulLetterTrigger trigger) {
    // 如果触发类型指定了来信类型，使用指定的类型
    if (trigger.getLetterType() != null) {
        return trigger.getLetterType();
    }
    
    // 根据用户当前情绪选择来信类型
    EmotionRecord currentEmotion = emotionService.getCurrentEmotion(userId);
    
    if (currentEmotion != null) {
        String emotionType = currentEmotion.getEmotionType();
        if (emotionType != null) {
            String lower = emotionType.toLowerCase();
            if (lower.contains("sad") || lower.contains("anxious") || ...) {
                return ESoulLetterType.CARE;
            } else if (lower.contains("happy") || lower.contains("excited") || ...) {
                return ESoulLetterType.SHARE;
            }
        }
    }
    
    // 默认：问候型来信
    return ESoulLetterType.GREETING;
}
```

## 五、信件内容生成

### 5.1 生成流程

```
选择发件人角色
→ 确定来信类型
→ ESoulLetterGenerator.generateLetterContent()
→ 调用AI生成个性化内容
→ 返回标题和正文
```

### 5.2 生成内容

**生成依据**：
- 用户ID
- 角色ID（发件人）
- 来信类型
- 用户的对话历史
- 用户的日记内容
- 角色的性格特点

**生成结果**：
- `title`：信件标题
- `content`：信件正文内容

### 5.3 代码位置

- 生成器：`ESoulLetterGenerator`（具体路径需确认）
- 调用：`ESoulLetterService.triggerLetter()` → `letterGenerator.generateLetterContent()`

## 六、消息创建

### 6.1 消息创建流程

```
生成信件内容
→ 获取角色信息（姓名、头像）
→ 创建 CreateMessageRequest
→ 设置消息类型和分类
→ 调用 messageService.createMessage()
→ 保存到 mailbox_messages 表
```

### 6.2 消息字段映射

| 字段 | 值 |
|------|-----|
| receiverId | 用户ID |
| senderType | SenderType.ESOUL |
| senderId | 角色ID |
| senderName | 角色名称 |
| senderAvatar | 角色头像URL |
| messageType | ESOUL_GREETING / ESOUL_CARE / ESOUL_SHARE / ESOUL_REMINDER |
| messageCategory | MessageCategory.ESOUL_LETTER |
| title | AI生成的信件标题 |
| content | AI生成的信件内容 |

## 七、执行特性

### 7.1 异步执行

- 使用 `@Async` 注解，异步执行
- 不阻塞用户登录流程
- 失败不影响登录

### 7.2 错误处理

- 捕获异常，记录日志
- 不抛出异常，避免影响主流程

## 八、当前限制与待优化

### 8.1 待实现功能

1. **频率控制**：检查最近是否已经收到过来信，避免频繁来信
2. **用户设置**：允许用户启用/禁用E-SOUL来信功能
3. **更多触发时机**：
   - 长时间未登录后回归
   - 特定活动期间
   - 用户完成特定任务后

### 8.2 优化建议

1. **智能频率控制**：
   - 每天最多1-2封信
   - 离线时间越长，触发概率越高

2. **个性化增强**：
   - 更深入的情感分析
   - 结合用户行为数据
   - 多轮对话上下文

3. **内容质量**：
   - A/B测试不同风格
   - 用户反馈优化
   - 内容审核机制

## 九、调用示例

### 9.1 自动触发（登录时）

```java
// 在用户登录成功后调用
esoulLetterTriggerListener.handleUserLogin(userId, lastLoginTime);
```

### 9.2 手动触发

```java
// 通过API
POST /api/mailbox/esoul-letters
Body: {
    "userId": 123,
    "letterType": "GREETING" // 可选
}
```

### 9.3 编程方式触发

```java
ESoulLetterService.ESoulLetterTrigger trigger = 
    new ESoulLetterService.ESoulLetterTrigger();
trigger.setLetterType(ESoulLetterType.CARE);
trigger.setTriggerReason("用户情绪低落");

MailboxMessage message = esoulLetterService.triggerLetter(userId, trigger);
```

## 十、数据库表关系

```
用户登录
  ↓
AccessHistory（访问历史）→ 选择角色
  ↓
Character（角色信息）→ 获取发件人信息
  ↓
EmotionRecord（情绪记录）→ 确定来信类型
  ↓
ESoulLetterGenerator → 生成内容
  ↓
MailboxMessage（消息表）→ 保存信件
```

## 十一、总结

**E-SOUL来信机制的核心**：
1. **触发时机**：用户登录 + 离线时间≥60秒
2. **发件人选择**：优先最近聊过的角色，备选第一个角色
3. **类型确定**：基于用户情绪智能选择
4. **内容生成**：AI生成个性化内容
5. **异步执行**：不阻塞主流程

**设计亮点**：
- ✅ 智能触发（基于离线时间）
- ✅ 个性化选择（基于互动历史）
- ✅ 情绪感知（基于情绪状态）
- ✅ 异步处理（不影响用户体验）
- ✅ 可扩展性（支持手动触发和更多场景）


