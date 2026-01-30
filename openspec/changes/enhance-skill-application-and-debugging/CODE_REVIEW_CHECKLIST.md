# ✅ 代码审查检查清单

## 代码规范检查

### Java 代码规范

#### 类和命名
- [ ] 类名使用 PascalCase（SkillExecutionRecord）
- [ ] 方法名使用 camelCase（getConversationHistory）
- [ ] 常量使用 UPPER_SNAKE_CASE（SCORE_THRESHOLD）
- [ ] 包名使用全小写（com.heartsphere.ai.skill）
- [ ] 避免缩写（Repository 而非 Repo）

#### 方法设计
- [ ] 方法长度 < 50 行（除特殊场景）
- [ ] 方法参数 < 5 个
- [ ] 避免代码重复（DRY 原则）
- [ ] 单一职责（一个方法只做一件事）
- [ ] 方法名清晰表达功能

#### 类结构
- [ ] 相关字段组织在一起
- [ ] 构造函数在字段之后
- [ ] 公开方法在前，私有方法在后
- [ ] 按逻辑分组排列方法
- [ ] 避免过大的类（> 500 行）

### 代码注释和文档

#### Javadoc 注释
- [ ] 所有公开类都有类级 Javadoc
- [ ] 所有公开方法都有 Javadoc
- [ ] @param 说明所有参数
- [ ] @return 说明返回值
- [ ] @throws 说明异常
- [ ] 复杂逻辑有中文注释

#### 示例
```java
/**
 * 创建技能执行记录
 * 
 * @param dto 技能执行记录 DTO
 * @return 创建的记录对象
 * @throws RuntimeException 如果创建失败
 */
public SkillExecutionRecord createRecord(SkillExecutionRecordDTO dto) {
    // 实现
}
```

### 异常处理

- [ ] 不捕获 Exception（捕获具体异常）
- [ ] 不吞掉异常（至少记录日志）
- [ ] 不使用 System.out.println（使用 Logger）
- [ ] 异常信息清晰有意义
- [ ] 自定义异常继承自适当的基类
- [ ] try-finally 或 try-with-resources 管理资源

#### 检查清单
```java
// ❌ 不好的异常处理
try {
    // code
} catch (Exception e) {
    e.printStackTrace();  // 错误：吞掉异常
}

// ✅ 好的异常处理
try {
    // code
} catch (SpecificException e) {
    log.error("操作失败: {}", e.getMessage(), e);
    throw new BusinessException("描述性错误信息", e);
}
```

### 日志记录

- [ ] 使用 SLF4J 而非 Log4j 直接使用
- [ ] 使用参数化消息（避免字符串拼接）
- [ ] 日志级别使用正确
  - DEBUG：详细的开发信息
  - INFO：重要的业务信息
  - WARN：警告信息
  - ERROR：错误信息
- [ ] 避免过度日志记录（循环内不记录每条）
- [ ] 敏感信息不记录（密码、token）

#### 检查清单
```java
// ❌ 不好的日志
log.info("结果: " + result);  // 字符串拼接

// ✅ 好的日志
log.info("结果: {}", result);  // 参数化
```

---

## 性能检查

### 数据库查询优化

- [ ] 查询使用了适当的索引
- [ ] 避免 N+1 查询问题
- [ ] Join 操作合理
- [ ] 没有全表扫描（除非必要）
- [ ] 分页查询已实现
- [ ] 查询性能 < 200ms

#### 性能测试
```bash
# 测试查询性能
mvn test -Dtest=SkillExecutionRecordRepositoryTest
```

### 对象创建优化

- [ ] 避免不必要的对象创建
- [ ] 使用对象池（如需要）
- [ ] 及时释放大对象
- [ ] 避免大循环内创建对象

### 集合使用

- [ ] 初始化时指定合适的容量
- [ ] 使用 ArrayList 而非 Vector
- [ ] 避免在循环中修改集合
- [ ] 避免频繁的 contains 操作

#### 检查清单
```java
// ❌ 不好的做法
List<Item> items = new ArrayList();  // 未指定容量
for (Item item : items) {
    items.remove(item);  // 循环中修改集合
}

// ✅ 好的做法
List<Item> items = new ArrayList<>(expectedSize);
Iterator<Item> it = items.iterator();
while (it.hasNext()) {
    if (shouldRemove(it.next())) {
        it.remove();
    }
}
```

### 缓存策略

- [ ] 适当的缓存使用
- [ ] 缓存失效机制
- [ ] 避免缓存穿透
- [ ] 避免缓存击穿
- [ ] 避免缓存雪崩

---

## 安全审查

### 数据验证

- [ ] 所有输入都经过验证
- [ ] 验证参数范围和类型
- [ ] 验证数组长度
- [ ] 验证字符串不为空
- [ ] 数据库参数使用 PreparedStatement

#### 检查清单
```java
// ❌ 不好的做法
public void updateRecord(String id, String data) {
    query = "UPDATE table SET col='" + data + "' WHERE id=" + id;  // SQL 注入风险
}

// ✅ 好的做法
public void updateRecord(Long id, String data) {
    // 参数化查询自动防止 SQL 注入
    Optional.ofNullable(data).ifPresent(d -> validate(d));
}
```

### 权限和认证

- [ ] 验证用户权限
- [ ] 检查业务规则
- [ ] 避免权限提升
- [ ] 敏感操作记录审计日志

### 敏感信息处理

- [ ] 密码使用加密存储
- [ ] Token 有过期时间
- [ ] 不在日志中输出敏感信息
- [ ] 不在错误消息中暴露敏感信息

---

## 测试覆盖检查

### 单元测试

- [ ] 覆盖率 > 80%
- [ ] 每个公开方法都有测试
- [ ] 测试正常路径
- [ ] 测试异常路径
- [ ] 边界情况都测试过

#### 测试模板
```java
@Test
@DisplayName("应该在成功时返回结果")
public void testSuccessCase() {
    // Arrange
    String input = "test";
    
    // Act
    Result result = method(input);
    
    // Assert
    assertNotNull(result);
    assertEquals("expected", result.value);
}

@Test
@DisplayName("应该在参数为空时抛出异常")
public void testNullParameter() {
    // Assert
    assertThrows(IllegalArgumentException.class, 
        () -> method(null));
}
```

### 集成测试

- [ ] 关键集成点已测试
- [ ] 数据库操作已测试
- [ ] API 端点已测试
- [ ] 错误场景已测试

### 性能测试

- [ ] 关键方法性能已测试
- [ ] 大数据集已测试
- [ ] 并发场景已测试

---

## 依赖和导入检查

- [ ] 移除未使用的导入
- [ ] 按逻辑和字母顺序组织导入
- [ ] 避免 wildcard 导入（*）
- [ ] 依赖版本已升级到稳定版

#### 检查清单
```java
// ❌ 不好的做法
import java.util.*;
import com.heartsphere.*;

// ✅ 好的做法
import java.util.ArrayList;
import java.util.List;
import com.heartsphere.ai.skill.service.SkillService;
```

---

## 架构和设计模式检查

### 分层架构

- [ ] Entity 层：只有 JPA 映射
- [ ] DTO 层：只有数据转换
- [ ] Repository 层：只有数据访问
- [ ] Service 层：业务逻辑
- [ ] Controller 层：请求处理
- [ ] 避免跨层直接引用

### 设计原则

- [ ] 单一职责原则 (SRP)
- [ ] 开闭原则 (OCP)
- [ ] 里氏替换原则 (LSP)
- [ ] 接口隔离原则 (ISP)
- [ ] 依赖反转原则 (DIP)

### 常见设计模式

- [ ] Builder 模式：用于复杂对象创建
- [ ] Strategy 模式：用于算法选择
- [ ] Factory 模式：用于对象创建
- [ ] Observer 模式：用于事件处理
- [ ] Repository 模式：用于数据访问

---

## 代码审查反馈模板

```
Reviewee: ___
Reviewer: ___
Date: ___

【总体评分】
- ✅ 优秀 / ⚠️ 一般 / ❌ 需改进

【正面反馈】
- ___
- ___

【改进建议】
- [ ] 项目 1：说明
- [ ] 项目 2：说明

【必须修改】
- [ ] 强制项 1：说明
- [ ] 强制项 2：说明

【审查结果】
- ⏳ 待修改 / ✅ 批准
```

---

## 代码审查工具

### Lint 工具配置

```bash
# 运行代码检查
mvn checkstyle:check
mvn spotbugs:check
mvn pmd:check

# 查看覆盖率
mvn jacoco:report
# 报告: target/site/jacoco/index.html
```

### 推荐的 IDE 插件

- **IntelliJ IDEA**: CheckStyle, SpotBugs, PMD
- **Visual Studio Code**: ESLint, Prettier
- **Eclipse**: CheckStyle, PMD

---

## 常见问题和改进建议

### Issue 1：过长的方法
```java
// ❌ 方法太长 (100+ 行)
public void complexMethod() { ... }

// ✅ 拆分成多个小方法
public void mainMethod() {
    step1();
    step2();
    step3();
}

private void step1() { ... }
private void step2() { ... }
private void step3() { ... }
```

### Issue 2：魔法数字
```java
// ❌ 魔法数字
if (score > 60) { ... }

// ✅ 使用常量
if (score > SCORE_THRESHOLD) { ... }
```

### Issue 3：代码重复
```java
// ❌ 代码重复
double result1 = value1 * 0.4 + value2 * 0.35;
double result2 = value3 * 0.4 + value4 * 0.35;

// ✅ 提取方法
private double calculate(double a, double b) {
    return a * 0.4 + b * 0.35;
}
```

---

## 审查清单最终检查

在批准 PR 之前，请确保：

- [ ] 所有代码规范检查通过
- [ ] 所有性能检查通过
- [ ] 所有安全检查通过
- [ ] 所有测试覆盖检查通过
- [ ] 所有依赖检查通过
- [ ] 所有架构检查通过
- [ ] 文档完整和准确
- [ ] 没有遗留的 TODO 注释

**准备批准吗？** ✅ 所有检查都通过了吗？→ 批准 PR！

---

**感谢您的代码审查！** 🙏
