# API 模块化重构建议

## 📊 当前状况分析

### 文件规模
- **文件路径**: `frontend/services/api.ts`
- **当前行数**: 2,806 行
- **问题**: 文件过大，难以维护，影响开发效率

### 已迁移模块 ✅
以下模块已经迁移到 `services/api/` 目录：
1. ✅ **场景模块** (`api/scene/`) - eraApi
2. ✅ **角色模块** (`api/character/`) - characterApi
3. ✅ **剧本模块** (`api/script/`) - scriptApi, presetScriptApi, systemScriptApi
4. ✅ **主线剧情模块** (`api/mainStory/`) - userMainStoryApi, presetMainStoryApi, systemMainStoryApi
5. ✅ **计费模块** (`api/billing.ts`) - billingApi

### 待迁移模块 ⏳
以下模块仍在主文件中，需要迁移：

| 模块 | 行数估算 | 优先级 | 说明 |
|------|---------|--------|------|
| `adminApi` | ~1,600行 | 🔴 高 | 管理后台API，功能复杂 |
| `authApi` | ~110行 | 🟡 中 | 认证相关，使用频繁 |
| `wechatApi` | ~40行 | 🟢 低 | 微信登录API |
| `userProfileApi` | ~60行 | 🟡 中 | 用户资料API |
| `chronosLetterApi` | ~160行 | 🟢 低 | 时光信函API |
| `worldApi` | ~80行 | 🟡 中 | 世界管理API |
| `journalApi` | ~220行 | 🟡 中 | 日记API |
| `recycleBinApi` | ~100行 | 🟢 低 | 回收站API |
| `membershipApi` | ~50行 | 🟡 中 | 会员API |
| `resourceApi` | ~50行 | 🟢 低 | 资源API |
| `noteSyncApi` | ~135行 | 🟡 中 | 笔记同步API |
| `paymentApi` | ~40行 | 🟡 中 | 支付API |
| `imageApi` | ~85行 | 🟡 中 | 图片API |

---

## 🎯 重构目标

1. **模块化拆分**: 将大文件拆分为多个独立模块
2. **统一导出**: 通过 `index.ts` 统一导出，保持向后兼容
3. **类型安全**: 每个模块包含独立的类型定义
4. **易于维护**: 每个模块职责单一，便于维护和测试
5. **渐进式迁移**: 支持逐步迁移，不影响现有功能

---

## 📁 建议的目录结构

```
frontend/services/api/
├── base/                    # 基础工具（已存在）
│   ├── request.ts          # 请求函数
│   ├── crudFactory.ts      # CRUD工厂
│   ├── tokenStorage.ts     # Token存储
│   └── types.ts            # 基础类型
│
├── admin/                   # 管理后台API（待创建）
│   ├── index.ts            # 统一导出
│   ├── auth.ts             # 管理员认证
│   ├── worlds.ts           # 系统世界管理
│   ├── eras.ts             # 系统场景管理
│   ├── characters.ts       # 系统角色管理
│   ├── scripts.ts          # 系统剧本管理
│   ├── mainStories.ts      # 系统主线剧情管理
│   ├── users.ts            # 用户管理
│   ├── inviteCodes.ts      # 邀请码管理
│   ├── resources.ts        # 资源管理
│   ├── subscriptionPlans.ts # 订阅计划管理
│   ├── emailConfig.ts      # 邮箱配置管理
│   ├── settings.ts         # 系统设置管理
│   └── types.ts            # 类型定义
│
├── auth/                    # 认证API（待创建）
│   ├── index.ts
│   ├── auth.ts             # 登录、注册
│   ├── email.ts            # 邮箱验证
│   └── types.ts
│
├── wechat/                  # 微信API（待创建）
│   ├── index.ts
│   ├── wechat.ts
│   └── types.ts
│
├── user/                    # 用户相关API（待创建）
│   ├── index.ts
│   ├── profile.ts          # 用户资料
│   └── types.ts
│
├── world/                   # 世界管理API（待创建）
│   ├── index.ts
│   ├── world.ts
│   └── types.ts
│
├── journal/                 # 日记API（待创建）
│   ├── index.ts
│   ├── journal.ts
│   └── types.ts
│
├── membership/              # 会员API（待创建）
│   ├── index.ts
│   ├── membership.ts
│   └── types.ts
│
├── payment/                 # 支付API（待创建）
│   ├── index.ts
│   ├── payment.ts
│   └── types.ts
│
├── image/                   # 图片API（待创建）
│   ├── index.ts
│   ├── image.ts
│   └── types.ts
│
├── sync/                    # 同步API（待创建）
│   ├── index.ts
│   ├── noteSync.ts         # 笔记同步
│   └── types.ts
│
├── resource/                # 资源API（待创建）
│   ├── index.ts
│   ├── resource.ts
│   └── types.ts
│
├── recycleBin/              # 回收站API（待创建）
│   ├── index.ts
│   ├── recycleBin.ts
│   └── types.ts
│
├── chronosLetter/          # 时光信函API（待创建）
│   ├── index.ts
│   ├── chronosLetter.ts
│   └── types.ts
│
└── index.ts                 # 统一导出（更新）
```

---

## 🔄 迁移步骤

### 阶段一：基础准备（已完成 ✅）
- [x] 创建 `base/` 目录和基础工具
- [x] 迁移场景、角色、剧本、主线剧情模块
- [x] 创建统一导出文件

### 阶段二：高优先级模块迁移（建议优先）

#### 2.1 迁移 `adminApi`（约1,600行）
**原因**: 代码量最大，功能最复杂

**步骤**:
1. 创建 `api/admin/` 目录
2. 按功能拆分为多个文件：
   - `auth.ts` - 管理员登录
   - `worlds.ts` - 系统世界管理
   - `eras.ts` - 系统场景管理
   - `characters.ts` - 系统角色管理
   - `scripts.ts` - 系统剧本管理
   - `mainStories.ts` - 系统主线剧情管理
   - `users.ts` - 用户管理
   - `inviteCodes.ts` - 邀请码管理
   - `resources.ts` - 资源管理
   - `subscriptionPlans.ts` - 订阅计划管理
   - `emailConfig.ts` - 邮箱配置管理
   - `settings.ts` - 系统设置管理
3. 创建 `types.ts` 定义所有类型
4. 创建 `index.ts` 统一导出
5. 在主文件中替换为重新导出

#### 2.2 迁移 `authApi`（约110行）
**步骤**:
1. 创建 `api/auth/` 目录
2. 创建 `auth.ts` 文件
3. 创建 `email.ts` 文件（邮箱验证相关）
4. 创建 `types.ts` 和 `index.ts`
5. 更新主文件

### 阶段三：中等优先级模块迁移

#### 3.1 迁移 `journalApi`（约220行）
#### 3.2 迁移 `userProfileApi`（约60行）
#### 3.3 迁移 `worldApi`（约80行）
#### 3.4 迁移 `noteSyncApi`（约135行）
#### 3.5 迁移 `imageApi`（约85行）
#### 3.6 迁移 `paymentApi`（约40行）
#### 3.7 迁移 `membershipApi`（约50行）

### 阶段四：低优先级模块迁移

#### 4.1 迁移 `chronosLetterApi`（约160行）
#### 4.2 迁移 `recycleBinApi`（约100行）
#### 4.3 迁移 `resourceApi`（约50行）
#### 4.4 迁移 `wechatApi`（约40行）

### 阶段五：清理和优化

1. 删除主文件中的已迁移代码
2. 更新 `api/index.ts` 统一导出
3. 更新所有引用，使用新的导入路径
4. 添加单元测试
5. 更新文档

---

## 💡 代码示例

### 示例1: 创建 `api/auth/` 模块

#### `api/auth/types.ts`
```typescript
// 认证相关类型定义

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  inviteCode?: string;
  emailVerificationCode?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
  isFirstLogin?: boolean;
  worlds?: Array<{
    id: number;
    name: string;
    description: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationResponse {
  message: string;
}
```

#### `api/auth/auth.ts`
```typescript
// 认证API
import { request } from '../base/request';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  EmailVerificationRequest,
  EmailVerificationResponse,
} from './types';

export const authApi = {
  /**
   * 用户登录
   */
  login: (username: string, password: string): Promise<AuthResponse> => {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  /**
   * 用户注册
   */
  register: (
    username: string,
    email: string,
    password: string,
    nickname?: string,
    inviteCode?: string,
    emailVerificationCode?: string
  ): Promise<AuthResponse> => {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
        nickname: nickname || username,
        inviteCode,
        emailVerificationCode,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: (token: string) => {
    return request<{
      id: number;
      username: string;
      email: string;
      nickname: string;
      avatar: string;
    }>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
```

#### `api/auth/email.ts`
```typescript
// 邮箱验证API
import { request } from '../base/request';
import type {
  EmailVerificationRequest,
  EmailVerificationResponse,
} from './types';

export const emailApi = {
  /**
   * 发送邮箱验证码
   */
  sendVerificationCode: (email: string): Promise<EmailVerificationResponse> => {
    return request<EmailVerificationResponse>('/auth/email/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 验证邮箱验证码
   */
  verifyCode: (
    email: string,
    code: string
  ): Promise<EmailVerificationResponse> => {
    return request<EmailVerificationResponse>('/auth/email/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};

// 配置检查API
export const authConfigApi = {
  /**
   * 检查是否需要邀请码
   */
  isInviteCodeRequired: () => {
    return request<{ inviteCodeRequired: boolean }>(
      '/auth/invite-code-required'
    );
  },

  /**
   * 检查是否需要邮箱验证
   */
  isEmailVerificationRequired: () => {
    return request<{ emailVerificationRequired: boolean }>(
      '/auth/email-verification-required'
    );
  },
};
```

#### `api/auth/index.ts`
```typescript
// 认证模块统一导出
export * from './types';
export { authApi } from './auth';
export { emailApi, authConfigApi } from './email';
```

### 示例2: 更新主文件 `api.ts`

```typescript
// API服务，用于处理与后端的通信
// 注意：此文件正在逐步迁移到模块化结构（services/api/）

// 从新模块导入API（已完成迁移）
export { eraApi } from './api/scene';
export type { SystemEra, UserEra, CreateEraDTO, UpdateEraDTO } from './api/scene/types';

export { characterApi } from './api/character';
export type { SystemCharacter, UserCharacter, CreateCharacterDTO, UpdateCharacterDTO } from './api/character/types';

export { scriptApi, presetScriptApi, systemScriptApi } from './api/script';
export type { UserScript, SystemScript, CreateScriptDTO, UpdateScriptDTO } from './api/script/types';

export { userMainStoryApi, presetMainStoryApi, systemMainStoryApi } from './api/mainStory';
export type { UserMainStory, SystemMainStory, CreateUserMainStoryDTO, UpdateUserMainStoryDTO } from './api/mainStory/types';

export { billingApi } from './api/billing';
export type { 
  AIProvider, 
  AIModel, 
  AIModelPricing, 
  UserTokenQuota, 
  AIUsageRecord, 
  AICostDaily 
} from './api/billing';

// 新迁移的模块
export { authApi, emailApi, authConfigApi } from './api/auth';
export type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  EmailVerificationRequest,
  EmailVerificationResponse 
} from './api/auth/types';

// 导出基础请求函数（向后兼容）
export { request } from './api/base/request';

// 待迁移的模块（临时保留，逐步迁移）
// TODO: 迁移 adminApi
// TODO: 迁移 wechatApi
// TODO: 迁移 userProfileApi
// ... 其他模块

// 临时保留的API（迁移完成后删除）
export const adminApi = {
  // ... 临时保留
};
```

---

## ✅ 迁移检查清单

### 每个模块迁移时：

- [ ] 创建模块目录结构
- [ ] 定义类型文件 `types.ts`
- [ ] 实现API文件
- [ ] 创建 `index.ts` 统一导出
- [ ] 在主文件中添加重新导出
- [ ] 更新所有引用该模块的文件
- [ ] 运行测试确保功能正常
- [ ] 删除主文件中的旧代码
- [ ] 更新文档

### 迁移完成后：

- [ ] 主文件 `api.ts` 仅保留重新导出
- [ ] 所有模块都有独立的类型定义
- [ ] 所有模块都有单元测试
- [ ] 更新 README 说明新的导入方式
- [ ] 代码审查通过

---

## 📈 预期收益

1. **可维护性提升**: 每个模块独立，易于定位和修改
2. **代码可读性**: 文件大小合理，结构清晰
3. **团队协作**: 不同开发者可以并行开发不同模块
4. **类型安全**: 每个模块有独立的类型定义
5. **测试友好**: 可以针对单个模块编写测试
6. **性能优化**: 支持按需导入，减少打包体积

---

## 🚀 开始迁移

建议按照以下顺序开始迁移：

1. **第一步**: 迁移 `authApi`（代码量小，影响面广，作为试点）
2. **第二步**: 迁移 `adminApi`（代码量最大，拆分后效果最明显）
3. **第三步**: 迁移其他中等优先级模块
4. **第四步**: 迁移低优先级模块
5. **第五步**: 清理和优化

---

## 📝 注意事项

1. **向后兼容**: 迁移过程中保持API接口不变
2. **渐进式迁移**: 一次迁移一个模块，确保稳定
3. **充分测试**: 每个模块迁移后都要进行完整测试
4. **文档更新**: 及时更新相关文档
5. **代码审查**: 每个模块迁移后都要进行代码审查

---

## 🔗 相关文件

- `frontend/services/api.ts` - 主文件（待重构）
- `frontend/services/api/base/` - 基础工具
- `frontend/services/api/scene/` - 场景模块（已迁移）
- `frontend/services/api/character/` - 角色模块（已迁移）
- `frontend/services/api/script/` - 剧本模块（已迁移）
- `frontend/services/api/mainStory/` - 主线剧情模块（已迁移）
- `frontend/services/api/billing.ts` - 计费模块（已迁移）

