# 支付模块使用说明

## 模块概述

支付模块是一个独立的支付服务模块，目前支持支付宝支付功能。支付配置参数通过管理系统进行配置，客户端通过统一的API接口调用支付功能。

## 模块结构

```
payment/
├── entity/
│   └── PaymentConfig.java          # 支付配置实体
├── repository/
│   └── PaymentConfigRepository.java # 支付配置Repository
├── service/
│   ├── PaymentConfigService.java    # 支付配置服务
│   └── AlipayPaymentService.java    # 支付宝支付服务
└── dto/
    └── PaymentConfigDTO.java        # 支付配置DTO
```

## 功能特性

### 1. 支付配置管理
- 支持通过管理系统配置支付宝支付参数
- 支持沙箱环境和生产环境切换
- 支持启用/禁用支付方式

### 2. 支付方式
- **支付宝扫码支付**：返回二维码URL，用户扫码支付
- **支付宝PC网站支付**：返回支付表单HTML
- **支付宝手机网站支付**：返回支付URL

### 3. 支付流程
1. 客户端调用 `/api/payment/create` 创建支付订单
2. 系统根据支付类型调用相应的支付服务
3. 返回支付二维码URL或支付表单
4. 用户完成支付后，支付宝回调 `/api/payment/callback/alipay`
5. 系统验证回调并更新订单状态，激活会员

## API接口

### 客户端接口

#### 1. 创建支付订单
```
POST /api/payment/create
Authorization: Bearer {token}

Request Body:
{
  "planId": 1,
  "paymentType": "alipay"
}

Response:
{
  "orderNo": "HS1234567890ABCDEF",
  "amount": 99.00,
  "paymentType": "alipay",
  "status": "pending",
  "qrCodeUrl": "https://qr.alipay.com/xxx",
  "paymentUrl": null,
  "expiresAt": "2025-12-23T10:30:00"
}
```

#### 2. 查询订单状态
```
GET /api/payment/order/{orderNo}
Authorization: Bearer {token}

Response:
{
  "orderNo": "HS1234567890ABCDEF",
  "amount": 99.00,
  "paymentType": "alipay",
  "status": "paid",
  "qrCodeUrl": "https://qr.alipay.com/xxx",
  "paymentUrl": null,
  "expiresAt": "2025-12-23T10:30:00",
  "paidAt": "2025-12-23T10:25:00"
}
```

### 管理员接口

#### 1. 获取所有支付配置
```
GET /api/admin/payment/config
Authorization: Bearer {admin_token}

Response:
[
  {
    "id": 1,
    "paymentType": "alipay",
    "appId": "2021001234567890",
    "gatewayUrl": "https://openapi.alipay.com/gateway.do",
    "signType": "RSA2",
    "charset": "UTF-8",
    "format": "JSON",
    "notifyUrl": "https://your-domain.com/api/payment/callback/alipay",
    "returnUrl": "https://your-domain.com/payment/return",
    "isEnabled": true,
    "isSandbox": false,
    "description": "支付宝支付配置"
  }
]
```

#### 2. 创建或更新支付配置
```
POST /api/admin/payment/config
Authorization: Bearer {admin_token}

Request Body:
{
  "paymentType": "alipay",
  "appId": "2021001234567890",
  "merchantPrivateKey": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----",
  "alipayPublicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  "gatewayUrl": "https://openapi.alipay.com/gateway.do",
  "signType": "RSA2",
  "charset": "UTF-8",
  "format": "JSON",
  "notifyUrl": "https://your-domain.com/api/payment/callback/alipay",
  "returnUrl": "https://your-domain.com/payment/return",
  "isEnabled": true,
  "isSandbox": false,
  "description": "支付宝支付配置"
}
```

#### 3. 更新支付配置
```
PUT /api/admin/payment/config/{id}
Authorization: Bearer {admin_token}

Request Body: (同创建接口，所有字段可选)
```

#### 4. 启用/禁用支付配置
```
PUT /api/admin/payment/config/{id}/toggle
Authorization: Bearer {admin_token}
```

#### 5. 删除支付配置
```
DELETE /api/admin/payment/config/{id}
Authorization: Bearer {admin_token}
```

## 配置说明

### 支付宝配置参数

1. **appId**: 支付宝应用AppID
2. **merchantPrivateKey**: 商户私钥（RSA2格式）
3. **alipayPublicKey**: 支付宝公钥（用于验签）
4. **gatewayUrl**: 网关地址
   - 生产环境：`https://openapi.alipay.com/gateway.do`
   - 沙箱环境：`https://openapi.alipaydev.com/gateway.do`
5. **notifyUrl**: 异步通知地址（支付完成后支付宝会调用此地址）
6. **returnUrl**: 同步返回地址（支付完成后用户跳转的地址）
7. **isSandbox**: 是否沙箱环境（测试环境）

### 获取支付宝密钥

1. 登录支付宝开放平台：https://open.alipay.com
2. 创建应用并获取AppID
3. 配置应用公钥，获取支付宝公钥
4. 下载密钥生成工具，生成商户私钥

## 数据库迁移

执行以下SQL创建支付配置表：

```sql
-- 见 backend/src/main/resources/db/migration/create_payment_configs_table.sql
```

## 注意事项

1. **安全性**：私钥和公钥等敏感信息存储在数据库中，建议对数据库进行加密
2. **回调验证**：支付回调必须验证签名，确保回调来自支付宝
3. **幂等性**：支付回调可能重复调用，需要保证幂等性处理
4. **订单过期**：订单有30分钟过期时间，过期后需要重新创建订单
5. **沙箱环境**：测试时使用沙箱环境，生产环境需要切换到正式网关

## 扩展

### 微信支付支持

已支持PC端微信扫码支付（Native支付）：

1. ✅ 已添加微信支付SDK依赖
2. ✅ 已创建 `WechatPaymentService` 类
3. ✅ 已在 `PaymentService` 中集成微信支付服务
4. ✅ 已更新 `PaymentConfig` 实体，添加微信支付相关字段

**注意**：微信支付SDK的完整集成需要：
- 实现完整的签名和验签逻辑
- 实现回调数据的AES-256-GCM解密
- 使用微信支付官方SDK（wechatpay-java）

当前为简化实现，生产环境需要完善相关功能。

## 支付开通引导

系统提供了支付开通引导接口，帮助管理员了解如何开通支付宝和微信支付：

- `GET /api/payment/guide/alipay` - 获取支付宝开通引导
- `GET /api/payment/guide/wechat` - 获取微信支付开通引导
- `GET /api/payment/guide` - 获取所有支付方式的开通引导

详细的开通步骤请参考：`PAYMENT_GUIDE.md`

