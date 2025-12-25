# HeartSphere 支付模块

独立的支付服务模块，支持支付宝支付功能。

## 特性

- 💰 **支付宝支付** - 完整的支付宝支付集成
- 🔧 **配置管理** - 支付参数通过管理系统配置
- 📦 **独立模块** - 前后端和管理系统完全独立
- 🔒 **安全可靠** - 支持签名验证和回调处理
- 📊 **订单管理** - 完整的订单生命周期管理

## 项目结构

```
payment-service/
├── src/main/java/com/heartsphere/payment/
│   ├── PaymentServiceApplication.java    # 启动类
│   ├── entity/                           # 实体类
│   │   ├── PaymentOrder.java            # 支付订单
│   │   └── PaymentConfig.java          # 支付配置
│   ├── repository/                       # 数据访问层
│   │   ├── PaymentOrderRepository.java
│   │   └── PaymentConfigRepository.java
│   ├── service/                          # 业务服务层
│   │   ├── AlipayService.java           # 支付宝服务
│   │   ├── PaymentOrderService.java     # 订单服务
│   │   └── PaymentConfigService.java   # 配置服务
│   ├── controller/                       # 控制器层
│   │   ├── PaymentController.java       # 客户端支付API
│   │   └── AdminPaymentConfigController.java  # 管理端配置API
│   ├── dto/                              # 数据传输对象
│   │   ├── CreateOrderRequest.java
│   │   ├── PaymentOrderResponse.java
│   │   └── PaymentConfigDTO.java
│   ├── config/                           # 配置类
│   │   └── PaymentConfig.java
│   └── util/                             # 工具类
│       └── AlipayUtil.java
└── src/main/resources/
    ├── application.yml                   # 配置文件
    └── db/migration/                     # 数据库迁移脚本
```

## 快速开始

### 1. 配置数据库

在 `application.yml` 中配置数据库连接：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/heartsphere_payment
    username: root
    password: your_password
```

### 2. 配置支付参数

通过管理系统配置支付宝参数：
- AppID
- 应用私钥
- 支付宝公钥
- 签名类型
- 网关地址

### 3. 创建支付订单

```bash
POST /api/payment/orders
{
  "amount": 99.00,
  "subject": "会员订阅",
  "body": "月度会员订阅",
  "paymentType": "alipay"
}
```

### 4. 查询订单状态

```bash
GET /api/payment/orders/{orderNo}
```

## API 文档

启动服务后，访问 Swagger UI：
- 客户端API: http://localhost:8082/swagger-ui.html
- 管理端API: http://localhost:8082/admin/swagger-ui.html

## 支付流程

1. 客户端调用创建订单接口
2. 服务端生成订单并调用支付宝接口
3. 返回支付二维码或支付链接
4. 用户完成支付
5. 支付宝回调通知服务端
6. 服务端验证签名并更新订单状态
7. 通知业务系统订单完成

## 安全说明

- 所有支付参数通过管理系统配置，不硬编码
- 支持签名验证，防止伪造回调
- 订单状态变更记录完整日志
- 支持订单查询和状态同步

