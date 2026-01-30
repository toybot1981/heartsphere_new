# 游客登录与注册 API 说明

本文档说明游客（访客）模式的登录、再次进入、注册行为及与场景/角色 API 的关系。对应 OpenSpec 变更：`enhance-guest-user-initialization`。

## 1. 游客登录 `POST /api/auth/guest-login`

### 请求

- **Content-Type**: `application/json`
- **Body**: `{ "nickname": "访客名称" }`
  - `nickname` 为必填的**访客名称**，同时作为该用户的**昵称**，并用于**构成用户名**（格式：`guest_<名称规范化>_<8位唯一后缀>`）。

### 行为

1. **再次进入**：若已存在「昵称等于该名称且为体验会员的临时用户（username 以 `guest_` 开头）」则**直接返回该用户的 token**，不创建新用户、不执行初始化；响应中 `data.isFirstLogin` 为 `false`。
2. **新建访客**：若不存在上述用户，则创建新用户（username 由名称构成、nickname=该名称）、创建体验会员（1 万文本 Token）、在库中创建默认 World（心域）、默认 Era（日常生活助手，system_era_id=50）、6 个 Character（时小光等）；响应中 `data.isFirstLogin` 为 `true`。

### 响应示例（成功）

```json
{
  "code": 200,
  "message": "游客登录成功",
  "data": {
    "token": "eyJ...",
    "id": 123,
    "username": "guest_TestGuest_b2150478",
    "email": "guest_TestGuest_b2150478@guest.temp",
    "nickname": "TestGuest",
    "avatar": null,
    "isGuest": true,
    "isFirstLogin": true,
    "membership": { "type": "trial", "planType": "trial", "textTokenQuota": 10000 },
    "worlds": [],
    "presetEraId": 50,
    "presetCharacterIds": [315, 316, 317, 318, 319, 320]
  }
}
```

### 与场景/角色 API 的关系

- 游客登录后，**与正式用户一致**：`GET /api/worlds`、`GET /api/eras`、`GET /api/characters` 返回的是**该用户在数据库中的** World、Era、Character 数据。
- 新建访客会拥有 1 个世界、1 个场景（日常生活助手）、6 个角色；再次进入的访客沿用已有数据。前端无需区分游客/正式用户的数据源，统一按上述接口取数即可。

## 2. 游客注册为正式用户 `POST /api/auth/guest-register`

### 前提

- 当前用户必须为**游客**（体验会员），且已通过 `guest-login` 获得 token；请求时需携带 `Authorization: Bearer <token>`。

### 请求

- **Content-Type**: `application/json`
- **Body**: 与普通注册类似，需包含 `username`、`email`、`password` 等；**允许在注册时提交新的 `username` 和 `nickname`**，各可修改一次，覆盖原游客的用户名与昵称。

### 行为

- 将当前游客账号升级为正式用户：更新 username、email、password、nickname 等，会员类型从 trial 升级为所选计划（如 free）；原有 World/Era/Character 及对话等数据保留。

## 3. 常量与实现位置

- **游客默认场景**：system_era_id = 50（日常生活助手）。
- **游客默认 6 个角色**：system_character ids 315–320（时小光、康小健、学小知、心小暖、心小安、暖小阳）。
- 上述 ID 在代码中由 `GuestInitializationService` 的常量集中管理：`GUEST_DEFAULT_SYSTEM_ERA_ID`、`GUEST_DEFAULT_SYSTEM_CHARACTER_IDS`。

---

**最后更新**: 2026-01-29  
**相关变更**: `openspec/changes/enhance-guest-user-initialization/`
