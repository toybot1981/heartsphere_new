# HeartSphere Edu API 测试报告

**测试时间**: 2026-01-12 02:20:20
**测试服务**: http://localhost:8084/api/edu

## 测试结果汇总

- ✅ **通过**: 2
- ❌ **失败**: 3
- ⚠️ **跳过**: 0
- 📊 **总计**: 5

## 详细测试结果

- ❌ **获取数字人角色列表（分页）** - HTTP 500 - 获取数字人角色列表失败: No enum constant com.heartsphere.edu.entity.EduCharacter.CharacterType.teaching_assistant
- ❌ **获取角色列表（按类型筛选）** - HTTP 500 - 获取数字人角色列表失败: No enum constant com.heartsphere.edu.entity.EduCharacter.CharacterType.teaching_assistant
- ❌ **获取推荐角色列表** - HTTP 500 - 获取推荐角色失败: No enum constant com.heartsphere.edu.entity.EduCharacter.CharacterType.teaching_assistant
- ✅ **获取学生互动历史** - HTTP 200
- ✅ **获取学生互动历史（便捷端点）** - HTTP 200

## API 端点列表

### 数字人角色 API (EduCharacterController)

1. **GET**  - 获取角色列表（支持分页和筛选）
2. **POST**  - 创建角色
3. **GET**  - 获取角色详情
4. **PUT**  - 更新角色
5. **DELETE**  - 删除角色
6. **GET**  - 获取推荐角色
7. **GET**  - 获取角色统计

### 互动记录 API (EduCharacterInteractionController)

1. **POST**  - 记录互动
2. **GET**  - 获取互动历史（支持筛选和分页）
3. **GET**  - 获取互动详情
4. **GET**  - 获取学生互动历史

## 注意事项

1. 如果 API 返回 401/403 错误，可能需要配置认证
2. 某些测试可能因为依赖关系而跳过
3. 响应数据保存在 `/tmp/test_response_*.json` 文件中

