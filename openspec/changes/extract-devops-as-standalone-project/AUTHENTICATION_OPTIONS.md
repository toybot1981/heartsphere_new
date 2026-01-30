# DevOps 独立项目认证方案分析

## 方案对比

### 方案 1：共享 SystemAdmin 表 + 共享 JWT Secret ⭐ **推荐**

**实现方式**：
- DevOps 项目配置数据源访问 admin 项目的 `system_admin` 表
- 使用与 admin 项目相同的 JWT Secret
- DevOps 项目实现自己的认证逻辑，但查询共享的表

**优点**：
- ✅ **统一管理**：管理员账户在 admin 项目中统一管理，无需同步
- ✅ **单点登录**：管理员登录一次，可以访问 admin 和 DevOps 两个系统
- ✅ **代码独立**：DevOps 项目代码完全独立，不依赖 admin 项目代码
- ✅ **实现简单**：利用现有的多数据源配置经验（admin 项目已有类似实现）
- ✅ **维护成本低**：账户管理集中，减少维护负担

**缺点**：
- ⚠️ **数据库耦合**：需要访问 admin 项目的数据库（但只是读操作，影响较小）
- ⚠️ **JWT Secret 同步**：需要确保两个项目使用相同的 JWT Secret（通过配置管理）

**适用场景**：
- ✅ 推荐用于大多数场景
- ✅ 适合需要统一管理管理员账户的场景
- ✅ 适合需要单点登录的场景

---

### 方案 2：完全独立的认证系统

**实现方式**：
- DevOps 项目有自己的管理员表（如 `devops_admin`）
- DevOps 项目使用独立的 JWT Secret
- DevOps 项目完全独立的认证逻辑

**优点**：
- ✅ **完全独立**：不依赖任何其他项目
- ✅ **数据隔离**：数据库完全隔离

**缺点**：
- ❌ **账户管理分散**：需要在两个地方管理管理员账户
- ❌ **无法单点登录**：管理员需要分别登录两个系统
- ❌ **维护成本高**：账户创建、修改、删除需要在两个地方操作
- ❌ **用户体验差**：需要记住两套账户密码

**适用场景**：
- ❌ 不推荐，除非有特殊的安全隔离要求

---

### 方案 3：通过 API 调用 Admin 认证服务

**实现方式**：
- DevOps 项目通过 HTTP API 调用 admin 项目的认证接口
- DevOps 项目不直接访问数据库

**优点**：
- ✅ **解耦**：不直接访问数据库
- ✅ **统一认证**：认证逻辑集中在 admin 项目

**缺点**：
- ❌ **网络依赖**：需要 admin 项目运行才能认证
- ❌ **性能开销**：每次认证都需要 HTTP 调用
- ❌ **复杂度高**：需要处理网络异常、超时等问题
- ❌ **单点故障**：admin 项目故障会影响 DevOps 认证

**适用场景**：
- ❌ 不推荐，除非是微服务架构且需要完全解耦

---

### 方案 4：SSO 单点登录系统

**实现方式**：
- 实现独立的 SSO 服务
- Admin 和 DevOps 都通过 SSO 服务认证

**优点**：
- ✅ **统一认证**：所有系统统一认证
- ✅ **扩展性好**：可以轻松添加更多系统

**缺点**：
- ❌ **复杂度高**：需要实现完整的 SSO 系统
- ❌ **开发成本高**：需要额外的开发工作
- ❌ **过度设计**：对于当前场景可能过于复杂

**适用场景**：
- ❌ 不推荐，除非未来需要支持更多系统（5+ 个系统）

---

## 推荐方案：方案 1（共享 SystemAdmin 表 + 共享 JWT Secret）

### 推荐理由

1. **符合现有架构**：
   - Admin 项目已经有访问多个数据库的经验（mentis、edu、agent-mind）
   - 可以复用多数据源配置模式
   - 技术实现成熟可靠

2. **用户体验最佳**：
   - 管理员只需登录一次，可以访问所有管理功能
   - 账户统一管理，无需维护多套账户

3. **维护成本最低**：
   - 账户管理集中，减少维护负担
   - 代码实现简单，易于维护

4. **灵活性好**：
   - DevOps 项目代码独立，可以有自己的认证逻辑
   - 未来如果需要独立，可以轻松迁移

### 实现细节

#### 1. 数据库配置

**选项 A：使用独立 schema（推荐）**
```yaml
# devops/backend/src/main/resources/application.yml
spring:
  datasource:
    # DevOps 主数据源（devops schema）
    url: jdbc:mysql://localhost:3306/heartsphere?useUnicode=true&characterEncoding=UTF-8
    username: root
    password: 123456
    
  # 配置多数据源，访问 admin schema 的 system_admin 表
  datasource:
    devops:
      url: jdbc:mysql://localhost:3306/heartsphere?useUnicode=true&characterEncoding=UTF-8
      # 默认使用 admin schema（system_admin 表在 admin schema 中）
    admin:
      url: jdbc:mysql://localhost:3306/heartsphere?useUnicode=true&characterEncoding=UTF-8
      # 访问 admin schema 的 system_admin 表
```

**选项 B：使用独立数据库**
```yaml
# devops/backend/src/main/resources/application.yml
spring:
  datasource:
    # DevOps 主数据源（独立数据库）
    devops:
      url: jdbc:mysql://localhost:3306/devops?useUnicode=true&characterEncoding=UTF-8
    # 辅助数据源（访问 admin 数据库的 system_admin 表）
    admin:
      url: jdbc:mysql://localhost:3306/heartsphere?useUnicode=true&characterEncoding=UTF-8
```

#### 2. JWT Secret 配置

```yaml
# devops/backend/src/main/resources/application.yml
jwt:
  secret: ${JWT_SECRET:your-secret-key-change-in-production}  # 与 admin 项目相同
  expiration: ${JWT_EXPIRATION:86400000}  # 24小时
```

**重要**：通过环境变量或配置中心统一管理 JWT Secret，确保两个项目使用相同的值。

#### 3. 代码实现

```java
// devops/backend/src/main/java/com/heartsphere/devops/entity/SystemAdmin.java
// 与 admin 项目的 SystemAdmin 实体结构相同（但放在 devops 项目中）

// devops/backend/src/main/java/com/heartsphere/devops/repository/SystemAdminRepository.java
@Repository
public interface SystemAdminRepository extends JpaRepository<SystemAdmin, Long> {
    Optional<SystemAdmin> findByUsername(String username);
}

// devops/backend/src/main/java/com/heartsphere/devops/service/DevOpsAuthService.java
@Service
public class DevOpsAuthService {
    @Autowired
    private SystemAdminRepository adminRepository;  // 查询共享的 system_admin 表
    
    @Autowired
    private JwtUtils jwtUtils;  // 使用 shared/backend 中的 JwtUtils
    
    public Map<String, Object> login(String username, String password) {
        // 查询共享的 system_admin 表
        SystemAdmin admin = adminRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("管理员用户名或密码错误"));
        
        // 验证密码、生成 JWT Token（使用共享的 JWT Secret）
        // ...
    }
}
```

### 迁移路径

1. **阶段 1**：实现共享 SystemAdmin 表访问
   - 配置数据源访问 `system_admin` 表
   - 实现 `DevOpsAuthService`

2. **阶段 2**：配置共享 JWT Secret
   - 确保两个项目使用相同的 JWT Secret
   - 测试单点登录功能

3. **阶段 3**：前端集成
   - DevOps 前端支持使用 admin 项目的 Token
   - 实现 Token 传递和验证

### 注意事项

1. **JWT Secret 同步**：
   - 使用环境变量或配置中心统一管理
   - 确保两个项目使用相同的值

2. **数据库权限**：
   - DevOps 项目只需要读取 `system_admin` 表的权限
   - 不需要写入权限（账户管理在 admin 项目）

3. **Token 传递**：
   - 前端可以通过 localStorage 或 Cookie 共享 Token
   - 或通过 URL 参数传递（安全性较低，不推荐）

4. **未来扩展**：
   - 如果未来需要完全独立，可以轻松迁移到独立管理员表
   - 迁移时只需要修改数据源配置和实体类

---

## 总结

**强烈推荐使用方案 1（共享 SystemAdmin 表 + 共享 JWT Secret）**，因为：

1. ✅ 实现简单，复用现有技术栈
2. ✅ 用户体验好，支持单点登录
3. ✅ 维护成本低，账户统一管理
4. ✅ 代码独立，未来可以轻松迁移
5. ✅ 符合当前项目架构和需求
