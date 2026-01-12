# Change: Cleanup Mentis Remnants

## Why

Mentis 项目已经独立出来，并迁移到了 `mentis/` 目录下。但是原有项目（`backend/`、`frontend/`、`admin/frontend/`）中仍然存在一些 mentis 相关的代码和配置残留。这些残留内容会导致：

1. 代码重复：同一个功能在多处维护
2. 配置混淆：主应用仍扫描 mentis 相关的包
3. 潜在的运行时错误：主应用可能误加载 mentis 代码
4. 维护成本增加：需要同步更新多个位置

需要彻底清理这些遗留内容，确保 mentis 功能完全独立。

## What Changes

### Backend 清理
- **REMOVED**: `backend/src/main/java/com/heartsphere/mentis/` 整个目录（已在 `mentis/backend/` 中存在）
- **MODIFIED**: `backend/src/main/java/com/heartsphere/HeartSphereApplication.java` - 移除 `com.heartsphere.mentis.repository` 的扫描配置

### Frontend 清理
- **REMOVED**: `frontend/src/components/mentis/` 目录（已在 `mentis/frontend/src/components/` 中存在）
- **REMOVED**: `frontend/src/services/mentis/` 目录（已在 `mentis/frontend/src/services/` 中存在）
- **REMOVED**: `frontend/src/pages/MentisPage.tsx`（已在 `mentis/frontend/src/pages/` 中存在）
- **MODIFIED**: 如果主前端有引用这些文件的路由或导航，需要移除相关引用

### Admin Frontend 清理
- **需要评估**: `admin/frontend/src/components/MentisExperience.tsx` - 如果是管理端的体验功能，需要确认是否应该保留，或者迁移到 mentis 项目
- **MODIFIED**: `admin/frontend/src/AdminScreen.tsx` - 移除或更新 mentis 相关的引用
- **MODIFIED**: `admin/frontend/src/contexts/AdminStateContext.tsx` - 移除 'mentis' 类型（如果不再需要）
- **MODIFIED**: `admin/frontend/src/components/AdminSidebar.tsx` - 移除 mentis 菜单项（如果需要）

### 配置文件清理
- 检查并清理任何 mentis 相关的配置文件或引用

## Impact

### Affected Specs
- `specs/mentis/` (如果存在) - 需要确认 mentis 相关规范是否已经更新

### Affected Code
- **Backend**:
  - `backend/src/main/java/com/heartsphere/HeartSphereApplication.java`
  - `backend/src/main/java/com/heartsphere/mentis/` (整个目录将被删除)

- **Frontend**:
  - `frontend/src/components/mentis/` (整个目录将被删除)
  - `frontend/src/services/mentis/` (整个目录将被删除)
  - `frontend/src/pages/MentisPage.tsx` (将被删除)
  - 需要检查 `frontend/src/` 中是否有对这些文件的引用

- **Admin Frontend**:
  - `admin/frontend/src/components/MentisExperience.tsx` (需要评估)
  - `admin/frontend/src/AdminScreen.tsx`
  - `admin/frontend/src/contexts/AdminStateContext.tsx`
  - `admin/frontend/src/components/AdminSidebar.tsx`

### Breaking Changes
- **BREAKING**: 主应用（backend）将不再包含 mentis 相关的代码
- **BREAKING**: 主前端（frontend）将不再包含 mentis 相关的组件和页面
- **BREAKING**: 如果需要访问 mentis 功能，必须通过独立的 mentis 应用（端口 3002 前端，8082 后端）

### Migration Notes
- 如果主应用有任何功能依赖 mentis 代码，需要改为通过 API 调用独立的 mentis 服务
- 主前端的路由配置需要移除 mentis 相关路由（如果存在）
- Admin 管理端如果需要访问 mentis，应该通过独立的 mentis 应用或 API
