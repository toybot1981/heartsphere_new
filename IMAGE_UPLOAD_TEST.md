# 图片上传功能测试指南

## 功能说明

在创建时代时，现在支持自动上传图片到服务器。上传后的图片会保存到服务器，并返回一个可访问的URL。

## 测试步骤

### 1. 确保后端服务运行

```bash
cd backend
mvn spring-boot:run
```

后端服务应该在 `http://localhost:8081` 运行。

### 2. 测试图片上传

1. **启动前端应用**
   - 确保前端开发服务器正在运行

2. **登录账号**
   - 使用已有账号登录（如 `tongyexin`）

3. **创建时代**
   - 进入"我的心域"页面
   - 点击"创建时代"按钮
   - 在时代构造器中：
     - 填写时代名称（如："测试时代"）
     - 填写描述
     - **点击上传区域，选择一张图片文件**

4. **观察上传过程**
   - 选择图片后，会立即显示预览（base64）
   - 同时自动开始上传到服务器
   - 上传过程中会显示"正在上传图片到服务器..."
   - 上传成功后，预览URL会从base64变为服务器URL（如：`http://localhost:8081/api/images/era/2025/12/uuid.png`）

5. **保存时代**
   - 点击"创建时代"按钮
   - 如果图片还未上传完成，保存时会自动等待上传完成
   - 保存成功后，时代数据会包含服务器图片URL

### 3. 验证上传结果

#### 检查后端文件系统
```bash
ls -la backend/uploads/images/era/
```

应该能看到按日期组织的图片文件：
```
era/
  2025/
    12/
      uuid.png
```

#### 检查数据库
```sql
SELECT id, name, image_url FROM eras ORDER BY created_at DESC LIMIT 1;
```

`image_url` 字段应该包含类似 `http://localhost:8081/api/images/era/2025/12/uuid.png` 的URL。

#### 检查前端显示
- 创建的时代卡片应该能正常显示图片
- 图片URL应该是服务器URL，而不是base64

## 功能特性

### 自动上传
- 选择图片后自动上传，无需手动触发
- 上传过程中显示状态提示

### 双重保障
- 如果自动上传失败，保存时会再次尝试上传
- 如果上传失败，会使用base64作为后备方案（但会提示用户）

### 错误处理
- 上传失败时显示友好错误提示
- 不会阻塞用户操作

### 支持Base64
- 如果用户直接粘贴base64图片，保存时会自动上传

## 常见问题

### Q: 上传失败怎么办？
A: 检查：
1. 后端服务是否运行
2. 端口是否正确（默认8081）
3. 文件大小是否超过限制（默认10MB）
4. 文件类型是否为图片

### Q: 图片显示不出来？
A: 检查：
1. 图片URL是否正确
2. 后端静态资源配置是否正确
3. 浏览器控制台是否有CORS错误

### Q: 上传很慢？
A: 可能原因：
1. 图片文件太大（建议压缩后再上传）
2. 网络连接问题
3. 服务器性能问题

## 技术细节

### 上传流程
1. 用户选择文件 → 立即显示base64预览
2. 自动调用 `imageApi.uploadImage()` 上传
3. 上传成功后，替换预览URL为服务器URL
4. 保存时代时，使用服务器URL

### API端点
- `POST /api/images/upload` - 上传文件
- `POST /api/images/upload-base64` - 上传base64
- `DELETE /api/images/delete?url=...` - 删除图片

### 存储位置
- 本地存储：`backend/uploads/images/{category}/{year}/{month}/{uuid}.{ext}`
- 访问URL：`http://localhost:8081/api/images/{category}/{year}/{month}/{uuid}.{ext}`

