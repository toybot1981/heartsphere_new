# 测试指南

本文档说明如何运行会员管理和支付功能的测试用例。

## 后端测试

### 运行所有测试

```bash
cd backend
mvn test
```

### 运行特定测试类

```bash
# 会员服务测试
mvn test -Dtest=MembershipServiceTest

# 支付服务测试
mvn test -Dtest=PaymentServiceTest

# 会员控制器测试
mvn test -Dtest=MembershipControllerTest

# 支付控制器测试
mvn test -Dtest=PaymentControllerTest

# 集成测试
mvn test -Dtest=MembershipServiceIntegrationTest
```

### 测试覆盖率

```bash
mvn test jacoco:report
```

报告位置：`backend/target/site/jacoco/index.html`

## 前端测试

### 安装依赖（首次运行）

```bash
cd frontend
npm install
```

### 运行所有测试

```bash
npm test
```

### 运行测试（监视模式）

```bash
npm run test:watch
```

### 生成测试覆盖率报告

```bash
npm run test:coverage
```

## 测试用例说明

### 后端测试

#### 1. MembershipServiceTest
- ✅ 获取用户会员信息（存在/不存在）
- ✅ 创建或获取免费会员
- ✅ 激活会员（月度/年度/连续包年/连续包月）
- ✅ 添加积分
- ✅ 使用积分（成功/失败）
- ✅ 获取所有订阅计划

#### 2. PaymentServiceTest
- ✅ 创建支付订单（微信/支付宝）
- ✅ 查询订单状态
- ✅ 处理支付回调
- ✅ 订单状态验证

#### 3. MembershipControllerTest
- ✅ 获取当前会员信息
- ✅ 获取所有订阅计划
- ✅ 按计费周期筛选计划

#### 4. PaymentControllerTest
- ✅ 创建支付订单
- ✅ 查询订单
- ✅ 支付回调处理

#### 5. MembershipServiceIntegrationTest
- ✅ 数据库操作测试
- ✅ 会员创建和检索
- ✅ 积分管理集成测试

### 前端测试

#### 1. MembershipModal.test.tsx
- ✅ 组件渲染
- ✅ 会员信息显示
- ✅ 计划列表加载
- ✅ 标签页切换
- ✅ 购买流程

#### 2. membershipApi.test.ts
- ✅ 获取会员信息
- ✅ 获取订阅计划
- ✅ 创建支付订单
- ✅ 查询订单状态
- ✅ 错误处理

## 测试数据

测试使用H2内存数据库，每次测试运行时会自动创建和清理数据。

## 注意事项

1. **后端测试**：
   - 使用H2内存数据库，无需配置MySQL
   - 测试配置文件：`application-test.yml`
   - 部分Controller测试需要配置Spring Security（当前已简化）

2. **前端测试**：
   - 需要安装Jest和相关依赖
   - 使用jsdom环境模拟浏览器
   - Mock了API调用

3. **集成测试**：
   - 使用真实的数据库操作
   - 测试数据会在测试后自动清理

## 持续集成

可以在CI/CD流程中运行：

```bash
# 后端
cd backend && mvn clean test

# 前端
cd frontend && npm install && npm test
```


