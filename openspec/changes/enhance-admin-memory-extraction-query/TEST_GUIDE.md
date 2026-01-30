# 记忆提取追溯功能测试指南

## 🚀 服务启动状态

### 当前服务状态

- ✅ **HSMem 服务**: 运行中 (http://localhost:8000)
- ⚠️ **Admin 后端**: 未运行 (需要启动在 8085 端口)
- ✅ **Admin 前端**: 运行中 (http://localhost:3005)

## 📋 测试步骤

### 1. 启动 Admin 后端（如果未运行）

```bash
cd admin/backend
mvn spring-boot:run
```

或者使用 IDE 运行 `AdminApplication.java`

### 2. 确认服务状态

#### HSMem 服务
```bash
curl http://localhost:8000/health
```

预期响应：
```json
{
  "status": "healthy",
  "statistics": {
    "resources_count": 2,
    "items_count": 3,
    "categories_count": 6
  }
}
```

#### 测试新 API 接口
```bash
# 获取所有记忆项
curl http://localhost:8000/api/v1/memory/items

# 按用户ID查询记忆项
curl "http://localhost:8000/api/v1/memory/items?user_id=test_user_001"

# 获取所有资源
curl http://localhost:8000/api/v1/memory/resources

# 获取资源详情（替换 resource_id）
curl http://localhost:8000/api/v1/memory/resources/{resource_id}
```

### 3. 访问 Admin 前端

1. 打开浏览器访问: http://localhost:3005
2. 登录 Admin 后台
3. 导航到 **记忆管理** → **用户记忆管理**

### 4. 测试记忆提取追溯功能

#### 步骤 1: 创建测试数据

如果还没有测试数据，可以使用记忆测试功能创建：

1. 点击 **记忆测试** 标签页
2. 选择 **对话记忆** 子标签
3. 输入测试对话：
   ```
   用户: 我叫张三，是一名产品经理
   助手: 你好张三！
   用户: 我喜欢喝咖啡，每天都要喝一杯
   ```
4. 输入用户ID: `test_user_001`
5. 点击 **测试对话记忆** 按钮

#### 步骤 2: 测试记忆提取追溯

1. 点击 **用户记忆管理** → **记忆提取追溯** 标签页
2. 输入用户ID: `test_user_001`
3. 点击 **查询** 按钮

#### 预期结果

**统计卡片**:
- 资源总数: 显示该用户的资源数量
- 记忆项总数: 显示该用户的记忆项数量
- 分类总数: 显示该用户的分类数量

**资源列表**:
- 显示资源ID、模态类型（conversation/text/document）、创建时间
- 可以点击 **查看详情** 查看原始数据

**记忆项列表**:
- 显示记忆项ID、摘要、类型、分类、重要性、创建时间
- 可以点击 **查看详情** 查看完整信息

**分类列表**:
- 显示分类名称、摘要、记忆项数量、创建时间
- 可以点击 **查看详情** 查看分类信息和包含的记忆项

### 5. 测试详情查看功能

#### 测试资源详情
1. 在资源列表中点击 **查看详情**
2. 验证显示：
   - 资源ID
   - 模态类型
   - 创建时间
   - 原始数据（JSON格式）

#### 测试记忆项详情
1. 在记忆项列表中点击 **查看详情**
2. 验证显示：
   - 记忆项ID
   - 完整内容
   - 摘要
   - 类型
   - 分类
   - 重要性
   - 创建时间
   - 关联的资源ID（如果有）

#### 测试分类详情
1. 在分类列表中点击 **查看详情**
2. 验证显示：
   - 分类名称
   - 摘要
   - 描述
   - 记忆项数量
   - 创建时间
   - 包含的记忆项列表（可点击跳转）

### 6. 测试追溯链功能

验证以下关联关系：

1. **资源 → 记忆项**:
   - 查看记忆项的 `resource_id` 字段
   - 验证该 ID 在资源列表中存在

2. **记忆项 → 分类**:
   - 查看记忆项的 `categories` 字段
   - 验证这些分类在分类列表中存在

3. **分类 → 记忆项**:
   - 在分类详情中查看包含的记忆项
   - 验证这些记忆项在记忆项列表中存在

## ✅ 测试检查清单

### 基础功能
- [ ] 能够输入用户ID并查询
- [ ] 查询结果显示资源列表
- [ ] 查询结果显示记忆项列表
- [ ] 查询结果显示分类列表
- [ ] 统计卡片正确显示数量

### 详情查看
- [ ] 资源详情对话框正常显示
- [ ] 记忆项详情对话框正常显示
- [ ] 分类详情对话框正常显示
- [ ] 详情信息完整准确

### 追溯链
- [ ] 资源ID与记忆项的resource_id对应
- [ ] 记忆项的categories与分类列表对应
- [ ] 分类详情中的记忆项列表正确
- [ ] 可以从分类详情跳转到记忆项详情

### UI/UX
- [ ] 加载状态正常显示
- [ ] 错误提示正常显示
- [ ] 空状态提示正常显示（当没有数据时）
- [ ] 详情对话框信息清晰易读
- [ ] 列表展示格式正确

### 错误处理
- [ ] 无效的用户ID显示友好提示
- [ ] 网络错误显示错误信息
- [ ] API 错误正确处理

## 🐛 常见问题

### 1. 新 API 接口返回 404

**原因**: hsmem 服务可能还在使用旧代码

**解决**: 重启 hsmem 服务
```bash
# 停止服务
pkill -f rest_api_server.py

# 重新启动
cd hsmem
python3 rest_api_server.py
```

### 2. 查询结果为空

**原因**: 该用户没有记忆数据

**解决**: 
1. 使用记忆测试功能创建测试数据
2. 确保使用相同的 user_id

### 3. 前端无法连接 hsmem 服务

**原因**: CORS 配置或服务地址配置问题

**解决**:
1. 检查 hsmem 服务是否运行在 http://localhost:8000
2. 检查前端环境变量 `VITE_HSMEM_BASE_URL`
3. 确认 hsmem 服务的 CORS 配置正确

### 4. Admin 后端未运行

**解决**: 启动 Admin 后端
```bash
cd admin/backend
mvn spring-boot:run
```

## 📊 测试数据示例

### 创建测试数据的 Python 脚本

```python
import asyncio
from hscore import MemoryService

async def create_test_data():
    service = MemoryService(base_path='./api_memory_data')
    
    # 对话 1
    conv1 = {
        'messages': [
            {'role': 'user', 'content': '我叫张三，是一名产品经理'},
            {'role': 'assistant', 'content': '你好张三！'},
            {'role': 'user', 'content': '我喜欢喝咖啡，每天都要喝一杯'}
        ]
    }
    
    result1 = await service.memorize(
        resource_data=conv1,
        modality='conversation',
        user_id='test_user_001'
    )
    
    print(f'对话1: {result1["items_count"]} 个记忆项')
    
    # 对话 2
    conv2 = {
        'messages': [
            {'role': 'user', 'content': '我最近在学习机器学习'},
            {'role': 'assistant', 'content': '很好的方向！'}
        ]
    }
    
    result2 = await service.memorize(
        resource_data=conv2,
        modality='conversation',
        user_id='test_user_001'
    )
    
    print(f'对话2: {result2["items_count"]} 个记忆项')

asyncio.run(create_test_data())
```

## 🎯 测试完成标准

所有功能测试通过后，应该能够：

1. ✅ 成功查询用户的记忆数据
2. ✅ 查看三层架构的完整信息
3. ✅ 通过追溯链在资源、记忆项、分类之间导航
4. ✅ 查看所有详情信息
5. ✅ 理解记忆提取的完整流程

## 📝 测试报告模板

测试完成后，请记录：

- 测试日期: 
- 测试人员: 
- 测试环境: 
- 测试结果: 
- 发现的问题: 
- 建议改进: 
