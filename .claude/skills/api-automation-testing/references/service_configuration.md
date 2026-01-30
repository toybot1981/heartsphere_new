# 后台服务与 scripts/start 配置

API 测试失败时需要读取**被测后台**的日志，日志路径优先从项目根下 `scripts/start/` 中对应启动脚本解析。

## 服务名与启动脚本

| 服务名 | 启动脚本 | 说明 |
|--------|-----------|------|
| admin-backend | start-admin-backend.sh | 管理后台后端，端口 8085 |
| main-backend | start-main-backend.sh | 主项目后端，端口 8081 |
| edu-backend | start-edu-backend.sh | 教育版后端 |
| company-backend | start-company-backend.sh | 公司站后端，端口 8083 |
| mentis-backend | start-mentis-backend.sh | Mentis 后端 |
| psychology-mentor-backend | start-psychology-mentor-backend.sh | 心理导师后端，端口 8083（与 company-backend 同端口，需在计划中显式指定 backend_service） |

## 典型日志路径

脚本内常用输出重定向格式：`> "$PROJECT_ROOT/<logfile>.log"`。解析后典型路径（相对于项目根）：

- **admin-backend**：`admin-backend.log`
- **main-backend**：可能为 `main/backend-backend.log` 或项目内路径，以脚本为准
- **edu-backend**：`edu-backend.log`
- **company-backend**：`company-backend.log`
- **mentis-backend**：`mentis-backend.log`
- **psychology-mentor-backend**：`psychology-mentor-backend.log`

若无法从脚本解析，可在测试计划中通过 **backend_service** 指定服务名，执行器会使用上述映射；也可在计划中提供 **backend_log_path**（绝对或相对项目根路径）覆盖。端口 8083 对应 company-backend；若测 psychology-mentor，须在计划中显式写 `backend_service: "psychology-mentor-backend"`。

## base_url 与 backend_service 推断

- 若计划中未写 **backend_service**，执行器可根据 **base_url** 端口推断：
  - 8085 → admin-backend
  - 8081 → main-backend
  - 8084 → edu-backend
  - 8083 → company-backend
  - 8082 → mentis-backend
