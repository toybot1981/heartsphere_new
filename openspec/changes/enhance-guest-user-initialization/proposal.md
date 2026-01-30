# Change: 完善游客（Guest）用户初始化过程

## 访客进入与身份规则（补充）

- **进入方式**：访客进入只需输入一个**访客名称**（guest name）。该名称同时作为其**昵称**（nickname），并用于**构成其用户名**（username），例如 `guest_<名称>_<唯一后缀>`，以保证用户名唯一且可读。
- **在 guest 基础上注册**：若用户在该访客账号上直接注册为正式用户，**用户名**和**昵称**均允许**修改一次**（注册时填写新用户名、新昵称，覆盖原 guest 的 username/nickname）。
- **退出后再次以访客进入**：用户退出后再次以访客身份进入时，若输入**与上次相同的访客名称**，系统应能识别并**直接进入**该访客账号（即按该名称查找已存在的 guest 用户并返回其 token），不再新建访客账号；仅当输入新名称或查无该名称对应 guest 时才创建新访客。

## Why

当前游客登录已为每个游客创建独立临时用户与体验会员（1 万 Token），但场景与角色并未写入数据库：Era/Character API 对游客仅返回系统预置的 `system_eras`/`system_characters`（ID 50 与 315–320）的只读数据，游客没有自己的 `worlds`、`eras`、`characters` 记录。这带来：

1. **数据结构不一致**：正式用户拥有 World → Era → Character 的库内数据，游客仅依赖内存/API 层“模拟”，升级或迁移时需额外逻辑。
2. **功能与扩展受限**：依赖硬编码的 presetEraId/presetCharacterIds，难以统一支持“游客可编辑/可扩展场景”或与回收站、记忆等按 user/era 隔离的功能。
3. **体验会员未与“可玩内容”绑定**：体验会员（1 万 Token）已存在，但默认可玩场景与角色未在库中落库，不利于统计与策略统一。

因此，需要在创建 guest 用户的同时，在数据库中为其创建默认场景及该场景下的六个角色，并与已有体验会员一起构成完整的游客初始化数据。

## What Changes

### Core Changes

- **ADDED**: 访客进入只需输入**一个访客名称**；该名称作为**昵称**，并用于**构成用户名**（如 `guest_<名称>_<唯一后缀>`），保证唯一且可读。
- **ADDED**: 游客登录时，**若已存在以该名称对应的 guest 用户**（如按昵称或按“由名称构成的用户名”查找），则**直接返回该用户的 token**（再次进入，不新建账号）；**仅当不存在时**才创建新临时用户、体验会员，并在库中创建默认 World、Era、Character。
- **ADDED**: 在该访客账号上**直接注册**为正式用户时，**用户名**和**昵称**均允许**修改一次**（注册接口支持更新 username 与 nickname，覆盖原 guest 值）。
- **ADDED**: 游客登录时，在创建临时用户与体验会员之后，**在数据库中**为该用户创建默认 World、默认 Era（基于系统预置「日常生活助手」system_era_id=50）、以及该场景下的六个角色（基于 system_characters 315–320，如时小光等）。
- **MODIFIED**: 游客的体验会员（1 万 Token）逻辑保持不变，但明确为「该会员绑定到该 guest 用户下」；若当前实现已按用户隔离则无需改代码，仅在规范上明确。
- **MODIFIED**: Era/Character 列表 API 对游客的语义：由「返回系统预置只读数据」改为「返回该游客在库中的 World/Era/Character 数据」（即其初始化得到的 1 个 World、1 个 Era、6 个 Character），以便前端与正式用户共用同一套数据流与转换逻辑。

### Database / Backend

- **ADDED**: 每个游客在 `worlds` 表中拥有 1 条记录（如默认名称「心域」）。
- **ADDED**: 每个游客在 `eras` 表中拥有 1 条记录，关联上述 World 与 `system_era_id = 50`（日常生活助手）。
- **ADDED**: 每个游客在 `characters` 表中拥有 6 条记录，关联上述 World 与 Era，内容由 `system_characters` 315–320 复制而来（时小光、康小健、学小知、心小暖、心小安、暖小阳）。
- **UNCHANGED**: `users`、`memberships`、体验会员计划（1 万 Token）及配额分配逻辑保持现状。

### API / Behavior

- **MODIFIED**: `POST /api/auth/guest-login` 请求体包含**访客名称**（如 `nickname`）。先按该名称查找是否已存在 guest 用户（如：昵称等于该名称且为体验会员的临时用户）；若存在则直接返回该用户的 token（再次进入）；若不存在则创建新用户（用户名由名称构成，如 `guest_<名称>_<唯一后缀>`，昵称=该名称），创建体验会员，调用游客初始化逻辑（创建 World、Era、Character）；可选在响应中返回 `worlds` 列表或保持现有 `presetEraId`/`presetCharacterIds` 以兼容前端。
- **MODIFIED**: `POST /api/auth/guest-register`（或等价「在 guest 基础上注册」接口）：允许将当前 guest 的 **username** 和 **nickname** 各**修改一次**为注册时提交的新值（覆盖原 guest 用户名与昵称）。
- **MODIFIED**: `GET /api/eras`、`GET /api/characters` 等对当前游客用户：改为按 `user_id` 查询并返回该用户在 `eras`/`characters` 表中的数据，不再返回硬编码的系统预置 DTO。
- **UNCHANGED**: `GET /api/worlds` 已按 `user_id` 返回，游客将自然得到其唯一 World，无需改接口。

## Impact

- **Affected specs**: 用户认证（authentication）、游客初始化行为（可落在同一 capability 或单独 guest-initialization）
- **Affected code**:
  - `AuthController.guestLogin()`：请求体接收访客名称；先按名称查找已存在 guest（如昵称=名称且为体验会员），存在则返回其 token，不存在则创建新用户（用户名由名称构成、昵称=名称）、创建会员、调用游客初始化服务（创建 World、Era、Character）。
  - `AuthController.guestRegister()`（或等价注册接口）：允许将当前 guest 的 username 与 nickname 在注册时各修改一次。
  - 新增或扩展服务：如 `GuestInitializationService` 或扩展现有 `InitializationService`，实现「为指定用户创建默认 World + 基于 system_era 50 的 Era + 基于 system_characters 315–320 的 6 个 Character」；以及按昵称/用户名查找已存在 guest 的逻辑（用于再次进入）。
  - `EraController`（如 `getAllEras`、按 world 查询）：游客分支改为 `eraRepository.findByUser_Id(guestId)`，不再返回 system_era 50 的 DTO。
  - `CharacterController`（如 `getAllCharacters`、按 era 查询）：游客分支改为 `characterRepository.findByUser_Id(guestId)`，不再返回 system_characters 315–320 的 DTO。
- **Database**: `worlds`、`eras`、`characters` 表每游客各增加 1、1、6 条记录；需保证事务与幂等（同一游客不重复初始化）。
- **Frontend**: 若当前前端依赖 `presetEraId`/`presetCharacterIds` 或空 `worlds` 再调 getAllEras/getAllCharacters，在改为返回库内数据后应无需改版即可工作（仍为 1 个场景、6 个角色）；若有硬编码 ID 比较，需改为使用返回的 id。

## Design Principles

1. **单一输入、名称即身份**：访客进入只需输入一个名称，该名称同时作为昵称并参与构成用户名，便于记忆与再次进入。
2. **同名称即同一人**：退出后再次以访客进入且输入相同名称时，直接进入原访客账号，不新建账号，数据与配额延续。
3. **注册时可改一次**：在 guest 基础上注册时，用户名与昵称均可修改一次，覆盖原 guest 值。
4. **与正式用户数据结构一致**：游客拥有与正式用户相同的 World/Era/Character 表结构，便于升级、回收站、记忆等统一按 user/era 处理。
5. **初始化一次、幂等**：游客初始化仅在新建 guest 时执行一次；若已存在该用户的 World/Era/Character 则不再重复创建。
6. **体验会员不变**：体验会员（1 万 Token）仍绑定到该 guest 用户，不改变现有配额与计费逻辑。
7. **系统预置只读**：复制自 `system_eras`/`system_characters` 的数据写入用户表后，用户拥有自己的副本，不修改系统预置表。
