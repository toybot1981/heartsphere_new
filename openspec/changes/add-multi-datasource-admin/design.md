# Design: Admin项目多数据源支持

## Context

当前HeartSphere项目包含多个子项目：
- admin: 统一管理后台，使用 `heartsphere` 数据库
- main: 主项目，共享使用 `heartsphere` 数据库（与admin相同）
- edu: 教育版项目，使用独立数据库 `heartsphere_edu`
- mentis: Mentis项目，需要使用独立数据库 `heartsphere_mentis`
- company: 公司网站项目，共享使用 `heartsphere` 数据库（与admin相同）

admin作为统一管理后台，需要能够访问admin数据库（也是main和company的数据库）、edu数据库和mentis数据库。

## Goals / Non-Goals

### Goals
- Admin项目支持访问多个数据源
- 保持现有功能不受影响（默认使用admin数据源）
- 支持按需切换到其他项目的数据源
- 提供清晰的数据源配置和切换机制

### Non-Goals
- 分布式事务支持（跨数据源的分布式事务比较复杂，暂不考虑）
- 数据源自动发现（需要明确配置每个数据源）
- 动态添加数据源（配置固定，不支持运行时动态添加）

## Decisions

### Decision 1: 多数据源实现方案
- **What**: 使用Spring的AbstractRoutingDataSource实现动态数据源路由
- **Why**: 
  - Spring原生支持，无需额外依赖
  - 灵活，支持基于线程上下文的数据源切换
  - 成熟稳定，广泛使用
- **Alternatives considered**:
  - 第三方动态数据源库（如druid-spring-boot-starter）：功能更丰富，但增加依赖
  - 多EntityManagerFactory配置：更直接，但配置复杂

### Decision 2: 数据源切换机制
- **What**: 使用自定义注解 @DataSource 和AOP切面实现数据源切换
- **Why**:
  - 代码侵入性小，使用方便
  - 可以基于方法或类级别切换
  - 易于理解和维护
- **Alternatives considered**:
  - 基于配置的数据源切换：不够灵活
  - 基于Service层的显式切换：代码侵入性大

### Decision 3: 数据源命名规范
- **What**: 
  - 主数据源（admin，也是main和company使用的数据源）：`adminDataSource`
  - 其他数据源：`{project}DataSource`（如 `mentisDataSource`、`eduDataSource`）
  - 数据源路由键：使用项目名称（如 "admin"、"mentis"、"edu"）
  - **Note**: main和company项目不需要单独数据源，直接使用admin数据源
- **Why**: 清晰、一致、易于理解，避免不必要的配置复杂度

### Decision 4: 事务管理策略
- **What**: 每个数据源使用独立的TransactionManager，不支持跨数据源事务
- **Why**:
  - 简化实现，避免分布式事务的复杂性
  - 符合大多数实际使用场景
- **Alternatives considered**:
  - JTA分布式事务：实现复杂，性能开销大

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Application                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │         RoutingDataSource (AbstractRouting)      │  │
│  │  - 根据ThreadLocal中的key决定使用哪个数据源        │  │
│  └──────────────────────────────────────────────────┘  │
│              │              │              │            │
│              ▼              ▼              ▼            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Admin DS │  │ Mentis DS│  │  Edu DS  │  ...       │
│  └──────────┘  └──────────┘  └──────────┘            │
│       │              │              │                  │
│       ▼              ▼              ▼                  │
│  ┌────────┐    ┌────────┐    ┌────────┐              │
│  │ heart- │    │ heart- │    │ heart- │              │
│  │ sphere │    │ sphere │    │ sphere │              │
│  │        │    │ mentis │    │  _edu  │              │
│  └────────┘    └────────┘    └────────┘              │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │          DataSourceAspect (AOP)                   │  │
│  │  - 拦截@DataSource注解，设置ThreadLocal key        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. 数据源配置结构

```yaml
spring:
  datasource:
    admin:
      url: jdbc:mysql://localhost:3306/heartsphere?...
      username: root
      password: 123456
      # 注意：main和company项目也使用此数据源，不需要单独配置
    mentis:
      url: jdbc:mysql://localhost:3306/heartsphere_mentis?...
      username: root
      password: 123456
    edu:
      url: jdbc:mysql://localhost:3306/heartsphere_edu?...
      username: root
      password: 123456
```

### 2. 数据源配置类结构

```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.admin")
    public DataSource adminDataSource() { ... }
    
    @Bean
    @ConfigurationProperties("spring.datasource.mentis")
    public DataSource mentisDataSource() { ... }
    
    @Bean
    @ConfigurationProperties("spring.datasource.edu")
    public DataSource eduDataSource() { ... }
    
    // 注意：main和company项目不需要单独数据源，直接使用admin数据源
    
    @Bean
    public DataSource routingDataSource() {
        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put("admin", adminDataSource()); // 也是main和company使用的数据源
        targetDataSources.put("mentis", mentisDataSource());
        targetDataSources.put("edu", eduDataSource());
        
        AbstractRoutingDataSource routingDataSource = new AbstractRoutingDataSource() {
            @Override
            protected Object determineCurrentLookupKey() {
                return DataSourceContextHolder.getDataSourceKey();
            }
        };
        routingDataSource.setTargetDataSources(targetDataSources);
        routingDataSource.setDefaultTargetDataSource(adminDataSource());
        return routingDataSource;
    }
}
```

### 3. 数据源切换注解

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface DataSource {
    String value() default "admin";
}
```

### 4. AOP切面实现

```java
@Aspect
@Component
public class DataSourceAspect {
    
    @Around("@annotation(dataSource)")
    public Object switchDataSource(ProceedingJoinPoint joinPoint, DataSource dataSource) {
        String key = dataSource.value();
        DataSourceContextHolder.setDataSourceKey(key);
        try {
            return joinPoint.proceed();
        } finally {
            DataSourceContextHolder.clearDataSourceKey();
        }
    }
}
```

## Migration Strategy

1. **Phase 1**: 配置多数据源，但不切换现有代码（确保向后兼容）
2. **Phase 2**: 为需要访问其他数据源的功能添加@DataSource注解
3. **Phase 3**: 逐步迁移需要跨数据源访问的功能

## Risks

- **风险1**: 数据源切换不正确，导致访问错误的数据库
  - **缓解**: 使用ThreadLocal确保线程隔离，添加日志记录数据源切换
  
- **风险2**: 事务管理混乱
  - **缓解**: 明确文档说明不支持跨数据源事务，每个数据源使用独立的事务管理器

- **风险3**: 性能影响
  - **缓解**: 使用连接池，合理配置连接池参数

## Testing Strategy

1. 单元测试：测试数据源切换逻辑
2. 集成测试：测试各个数据源的CRUD操作
3. 性能测试：测试连接池配置是否合理
