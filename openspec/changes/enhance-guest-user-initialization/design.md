# Design: 游客默认场景与角色初始化

## Context

- 游客登录（`refactor-guest-to-individual-users`）已实现：每游客独立 User、独立 Membership（体验会员）、独立 1 万 Token 配额。
- 场景与角色当前对游客为“虚拟”返回：EraController/CharacterController 检测到游客时直接返回 `system_eras`(id=50) 与 `system_characters`(id 315–320) 的 DTO，不写入 `worlds`/`eras`/`characters`。
- 系统预置「日常生活助手」与六角色已存在（`add-daily-life-assistant-scene-characters`、`add-minimalist-resources-daily-life-assistant`），ID 稳定（system_era_id=50，system_character ids 315–320）。

## Goals / Non-Goals

- **Goals**:
  - 游客在库中拥有与正式用户一致的数据形态：1 个 World、1 个 Era、6 个 Character。
  - 默认场景为「日常生活助手」，默认角色为时小光等六人；数据从 system_eras/system_characters 复制到用户表。
  - 体验会员（1 万 Token）继续绑定到该 guest 用户，行为不变。
  - Era/Character 列表 API 对游客改为返回库内数据，前端可继续用现有 worlds/eras/characters 加载流程。
- **Non-Goals**:
  - 不改变体验会员计划或配额数值；不实现游客专属的“只读/不可删”策略（本阶段仅补齐数据）。
  - 不修改 system_eras/system_characters 表结构或内容。

## Decisions

### 0. 访客名称、用户名与再次进入

- **决策**：
  - 访客进入只需输入**一个访客名称**（如请求体 `nickname`）。该名称同时作为用户的 **nickname**，并用于**构成 username**，例如：`guest_<名称的规范化形式>_<唯一后缀>`（如拼音、slug 或截断，加短随机/序号保证唯一），以便用户名可读且唯一。
  - **再次进入**：收到 guest-login 且带名称时，先按「昵称等于该名称且为体验会员的临时用户（username 以 `guest_` 开头）」查找；若找到则直接为该用户生成 token 并返回，**不创建新用户、不再次初始化**；若未找到再走「创建新 guest + 初始化」流程。
  - **在 guest 基础上注册**：注册接口（如 `guest-register`）允许请求体提交新的 **username** 与 **nickname**，在升级为正式用户时**各允许修改一次**，覆盖原 guest 的 username/nickname。
- **理由**：同一人多次以访客进入只需记住一个名称即可回到原账号；注册时给用户一次修正用户名与昵称的机会，符合产品预期。

### 1. 初始化时机与位置

- **决策**：在 `AuthController.guestLogin()` 中，在 `userRepository.save(guestUser)` 与 `membershipService.getOrCreateTrialMembership(guestUser.getId())` 之后，调用统一的「游客初始化」方法（如 `GuestInitializationService.initializeForGuest(guestUser)`），在同一事务或可接受的事务边界内创建 World、Era、Character。
- **理由**：与现有 refactor-guest 流程一致，避免多处入口；便于保证「先有用户与会员，再有场景与角色」。

### 2. World / Era / Character 的创建方式

- **决策**：
  - **World**：为 guest 创建 1 条 `worlds`，例如 name="心域"，description 可与正式用户默认世界一致，user_id=guest.id。
  - **Era**：从 `system_eras` 查出 id=50 的记录，复制 name、description、image_url、style、system_era_id 等必要字段到 `eras` 表，world_id=刚创建的 World.id，user_id=guest.id。
  - **Character**：从 `system_characters` 查出 id 315–320（或按 system_era_id=50 查询），对每条系统角色复制可编辑字段（name、bio、avatar_url、first_message、system_instruction 等）到 `characters` 表，world_id、era_id、user_id 指向该游客的 World、Era、User。
- **理由**：与现有 `InitializationService` 只创建 World 的模式兼容；Era/Character 复制系统预置是已有模式（如向导从预置创建），此处自动化执行。

### 3. 幂等与重复登录、再次进入

- **决策**：
  - **再次进入**：若按名称找到已存在 guest，直接返回其 token，不创建新用户、不调用初始化。
  - **新建 guest 后的幂等**：仅当新建用户后才执行初始化；初始化前检查该用户是否已有 World（或 Era），若已存在则跳过创建，避免同一游客多次初始化产生多套 World/Era/Character。
- **理由**：同一人退出后再以相同名称进入应回到原账号；新建账号时仍保证初始化只执行一次。

### 4. Era/Character API 对游客的语义

- **决策**：移除 EraController/CharacterController 中「当 isGuest 时返回 system_era/system_characters DTO」的分支，改为与正式用户一致：按当前登录用户的 user_id 查询 `eraRepository.findByUser_Id(userId)`、`characterRepository.findByUser_Id(userId)`，返回该用户在库中的 Era/Character。
- **理由**：游客已有库内数据后，列表 API 统一按用户查，前端无需区分游客/正式用户的数据源；ID 为库内 id（era_id、character_id），与现有 DTOMapper 一致（含 eraId 等），前端分组与展示逻辑可复用。

### 5. 响应与前端兼容

- **决策**：guest-login 响应可保留 `presetEraId`/`presetCharacterIds` 以兼容旧前端逻辑（若有）；同时可返回 `worlds: [ { id, name, ... } ]` 供前端直接使用。若前端已完全依赖后续的 getAllWorlds/getAllEras/getAllCharacters，则仅保证这三者在游客下返回库内数据即可。
- **理由**：最小化前端改动，优先后端与数据模型一致。

## Risks / Trade-offs

- **风险**：系统预置 ID（50、315–320）若在迁移或配置中变更，需同步更新初始化逻辑中的常量或配置。
  - **缓解**：将 system_era_id 与 system_character ids 定义为常量或配置项（如配置文件/常量类），便于单点修改。
- ** trade-off**：每个游客多 1 World、1 Era、6 Character 记录，存储与临时用户清理策略需考虑；与「每个游客独立 User+Membership」一致，可纳入同一套「临时用户及关联数据清理」策略（如 refactor-guest 的清理任务）。

## Migration Plan

- 无历史数据迁移：仅影响新产生的游客；已有游客若再次登录仍走同一套 guest-login，若检测到无 World 则执行一次初始化。
- 回滚：若需回滚，可恢复 EraController/CharacterController 中游客分支为「返回 system 预置 DTO」，并停止在 guest-login 中调用游客初始化；已写入的 guest World/Era/Character 可保留或由清理任务删除。

## Open Questions

- 无；预置 ID 与六角色列表以代码/配置单点维护即可。
