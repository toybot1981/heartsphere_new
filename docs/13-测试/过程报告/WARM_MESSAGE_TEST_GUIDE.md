# 暖心留言功能测试指南

## 测试账号
- **tongyexin** / **123456** (共享心域主人)
- **ty1** / **Tyx@1234** (访问者)

## 前置条件

### 1. 启动后端服务
```bash
cd backend
mvn spring-boot:run
# 或者使用已编译的jar
java -jar target/heartsphere-service-0.0.1-SNAPSHOT.jar
```

### 2. 确认前端服务运行
前端服务应该已经在运行（端口3000）

## 测试步骤

### 方法一：使用测试脚本（推荐）

```bash
# 在项目根目录运行
./test-warm-message.sh
```

测试脚本会自动执行以下步骤：
1. 登录两个账号
2. 获取/创建共享配置
3. 发送暖心留言
4. 查询mailbox中的留言
5. 检查未读统计

### 方法二：手动测试

#### 步骤1: tongyexin 创建共享配置
1. 使用 **tongyexin** / **123456** 登录
2. 进入个人主页
3. 点击"心域共享"按钮
4. 创建共享配置（选择"全部共享"和"自由连接"）
5. 记录共享码

#### 步骤2: ty1 访问共享心域并留言
1. 使用 **ty1** / **Tyx@1234** 登录
2. 进入个人主页
3. 点击"打开共享心域"按钮
4. 输入 tongyexin 的共享码，进入共享心域
5. 浏览一下共享心域
6. 点击离开，选择留下暖心留言
7. 输入留言内容，例如："这是一条测试留言，感谢分享！"
8. 提交留言

#### 步骤3: tongyexin 查看留言
1. 使用 **tongyexin** / **123456** 登录
2. 打开"超时空信箱"
3. 在左侧分类中选择"暖心留言"（💌图标）
4. 应该能看到来自 ty1 的留言
5. 点击留言查看详情
6. 可以标记为已读、收藏等

## 验证点

### ✅ 功能验证
- [ ] ty1 可以成功发送暖心留言
- [ ] tongyexin 在mailbox中能看到留言
- [ ] 留言出现在"暖心留言"分类中
- [ ] 留言显示正确的发送者信息（ty1）
- [ ] 留言显示正确的内容
- [ ] 未读统计中包含暖心留言数量

### ✅ UI验证
- [ ] mailbox左侧有"暖心留言"分类按钮
- [ ] 分类按钮有正确的图标（💌）和颜色（粉色渐变）
- [ ] 留言列表显示正常
- [ ] 留言详情显示正常

### ✅ 数据验证
- [ ] 数据库中 `warm_messages` 表有记录
- [ ] 数据库中 `mailbox_messages` 表有对应记录
- [ ] `mailbox_messages.message_category` = 'warm_message'`
- [ ] `mailbox_messages.message_type` = 'warm_message'

## API测试

### 1. 发送暖心留言
```bash
curl -X POST "http://localhost:8081/api/heartconnect/shared/{shareConfigId}/warm-message" \
  -H "Authorization: Bearer {ty1_token}" \
  -H "Content-Type: application/json" \
  -d '{"message":"测试留言"}'
```

### 2. 查看mailbox中的留言
```bash
curl -X GET "http://localhost:8081/api/mailbox/messages?category=warm_message" \
  -H "Authorization: Bearer {tongyexin_token}"
```

### 3. 查看未读统计
```bash
curl -X GET "http://localhost:8081/api/mailbox/messages/unread/count" \
  -H "Authorization: Bearer {tongyexin_token}"
```

## 预期结果

1. **发送留言后**：
   - `warm_messages` 表新增一条记录
   - `mailbox_messages` 表新增一条记录，`message_category` = 'warm_message'
   - tongyexin 的未读消息数增加

2. **查看mailbox后**：
   - 在"暖心留言"分类中能看到留言
   - 留言显示发送者为 ty1
   - 留言内容正确显示

3. **标记已读后**：
   - 未读数量减少
   - 留言状态更新为已读

## 故障排查

### 问题1: 后端服务无法启动
- 检查端口8081是否被占用
- 检查数据库连接配置
- 查看后端日志

### 问题2: 登录失败
- 确认账号密码正确
- 检查数据库中的用户数据
- 查看后端日志中的错误信息

### 问题3: 留言未出现在mailbox中
- 检查 `WarmMessageService` 是否正确创建了mailbox消息
- 检查数据库中的 `mailbox_messages` 表
- 查看后端日志

### 问题4: 前端看不到"暖心留言"分类
- 确认前端代码已更新
- 清除浏览器缓存
- 检查前端控制台是否有错误

## 测试报告模板

```
测试日期: [日期]
测试人员: [姓名]

测试结果:
- 登录功能: ✅/❌
- 创建共享配置: ✅/❌
- 发送暖心留言: ✅/❌
- mailbox显示留言: ✅/❌
- 未读统计: ✅/❌

发现问题:
1. [问题描述]
2. [问题描述]

建议:
1. [建议]
2. [建议]
```
