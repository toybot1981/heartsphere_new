# Tasks: 完善游客用户初始化（默认场景与角色 + 体验会员）

## 0. 访客名称、再次进入与注册可改一次

- [x] 0.1 访客名称即昵称并参与构成用户名
  - `POST /api/auth/guest-login` 请求体接收**访客名称**（如 `nickname`）；该名称同时作为新 guest 的 **nickname**，并用于**构成 username**（如 `guest_<名称的规范化>_<唯一后缀>`），保证可读且唯一。
  - 名称规范化与唯一后缀规则：可选用拼音/slug/截断 + 短随机或序号，避免与已有 username 冲突。

- [x] 0.2 再次进入：同名称直接进入原账号
  - 在 guest-login 中，收到访客名称后**先查找**是否已存在「昵称等于该名称且为体验会员的临时用户（username 以 `guest_` 开头）」；若存在则**直接为该用户生成 token 并返回**，不创建新用户、不调用初始化。
  - 仅当查无该名称对应 guest 时，才执行「创建新用户 → 创建会员 → 调用游客初始化」。

- [x] 0.3 在 guest 基础上注册：用户名与昵称可改一次
  - 在 `POST /api/auth/guest-register`（或等价接口）中，允许请求体提交新的 **username** 与 **nickname**；在将 guest 升级为正式用户时，**各允许修改一次**，覆盖原 guest 的 username 与 nickname。
  - 校验新 username 与 nickname 符合规则且不与其它用户冲突（排除当前 guest 自身）。

## 1. Backend：游客初始化服务

- [x] 1.1 新增或扩展初始化服务
  - 新增 `GuestInitializationService`（或扩展 `InitializationService`），提供方法：给定 User（guest），创建 1 个 World、1 个 Era（基于 system_era id=50）、6 个 Character（基于 system_characters id 315–320）。
  - 实现前先查该用户是否已有 World；若已有则跳过（幂等）。
  - 将 system_era_id=50 与 6 个 system_character id 定义为常量或配置，便于维护。

- [x] 1.2 实现 World 与 Era 创建
  - 创建 World：name 如「心域」，user_id=guest.id，保存。
  - 查询 system_eras id=50，复制必要字段到 Era，world_id=刚创建的 World.id，user_id=guest.id，system_era_id=50，保存。

- [x] 1.3 实现 6 个 Character 创建
  - 按 system_character ids 315–320（或按 system_era_id=50 查询）获取 SystemCharacter 列表。
  - 对每条复制到 Character 表：world、era、user 指向该 guest 的 World、Era、User；复制 name、bio、avatar_url、first_message、system_instruction、role、gender、age 等字段。
  - 保证 Character.era_id 正确关联刚创建的 Era，以便前端按 eraId 分组。

- [x] 1.4 在 guest-login 中调用初始化（仅新建 guest 时）
  - 在 `AuthController.guestLogin()` 中，**仅当新建了 guest 用户时**，在保存用户并调用 `getOrCreateTrialMembership(guestUser.getId())` 之后，调用游客初始化服务（同一事务或新事务均可，需保证失败时不影响登录与会员创建策略）。
  - 若按名称查找到已存在 guest，则不再创建用户、不调用初始化，直接返回该用户 token。
  - 若初始化抛异常，记录日志并决定是否回滚登录（建议：登录与会员创建成功即返回成功，初始化失败可记录并让后续 API 仍返回空列表或重试逻辑，具体可依产品决定）。

## 2. Backend：Era/Character API 对游客的调整

- [x] 2.1 修改 EraController 游客分支
  - 在 `getAllEras` 及按 world 查询的接口中，当当前用户为游客时，改为使用 `eraRepository.findByUser_Id(userDetails.getId())` 返回该用户在库中的 Era 列表，不再返回 system_era 50 的 DTO。
  - 确保 DTO 映射包含 eraId/worldId 等，与现有 DTOMapper 一致。

- [x] 2.2 修改 CharacterController 游客分支
  - 在 `getAllCharacters` 及按 era 查询的接口中，当当前用户为游客时，改为使用 `characterRepository.findByUser_Id(userDetails.getId())`（或按 era 查该用户的 era）返回该用户在库中的 Character 列表，不再返回 system_characters 315–320 的 DTO。
  - 确保 CharacterDTO 的 eraId 正确，以便前端 `groupCharactersByEraId` 正确分组。

## 3. 体验会员与响应（校验与可选优化）

- [x] 3.1 确认体验会员绑定
  - 确认 `getOrCreateTrialMembership(guestUser.getId())` 已为每个 guest 创建独立会员记录，且体验会员计划为 1 万文本 Token；若已满足则无需改代码，仅在文档/规范中明确。

- [x] 3.2 guest-login 响应（可选）
  - 若需兼容旧前端，保留 `presetEraId`/`presetCharacterIds`；可选在响应中增加 `worlds` 数组（包含刚创建的 1 个 World），便于前端少一次 getAllWorlds 请求。

## 4. 测试与验证

- [x] 4.1 单元/集成测试
  - 测试游客初始化：guest-login 后查询 worlds/eras/characters 表，断言该用户各有 1、1、6 条记录，且 Era 的 system_era_id=50，Character 的 era_id 指向该 Era。
  - 测试幂等：同一用户再次 guest-login（或模拟再次调用初始化），不产生重复 World/Era/Character。
  - 已新增 `AuthControllerGuestTest`：testGuestLoginNewUser_returnsTokenAndInitData、testGuestLoginReEntry_sameNameReturnsSameUser。

- [x] 4.2 接口与前端验证
  - 调用 `GET /api/worlds`、`GET /api/eras`、`GET /api/characters` 以游客 Token 请求，返回 1 个世界、1 个场景、6 个角色，且角色均属于该场景（eraId 一致）。
  - 前端游客流程：登录后进入默认场景、角色列表与对话正常，无需改版即可使用库内数据。

## 5. 文档与常量

- [x] 5.1 将预置 ID 集中管理
  - 在代码或配置中集中定义「游客默认 system_era_id」「游客默认 system_character ids」，并加注释说明与「日常生活助手」及六角色对应关系。

- [x] 5.2 更新 API/开发文档（可选）
  - 说明游客登录后拥有默认 World/Era/Character；Era/Character 列表 API 对游客返回库内数据，与正式用户一致。
  - 已新增 `docs/12-开发指南/API-游客登录与注册.md`，描述 guest-login、guest-register 及与 worlds/eras/characters API 的关系。
