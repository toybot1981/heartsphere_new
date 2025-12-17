# 创作中心功能说明

基于 AIAgent 基础能力创建的完整创作工具集。

## 功能概览

### 1. 视觉创作中心

#### 快速文生图
- **API**: `POST /api/creation/image/generate`
- **功能**: 输入文字描述生成高质量图片
- **参数**:
  - `prompt`: 文字描述
  - `aspectRatio`: 画幅比例 (1:1, 16:9, 9:16, 4:3, 3:4)
  - `referenceImage`: 参考图 URL（可选）
  - `referenceStrength`: 参考图影响力 0-100（可选）
  - `title`: 作品标题
  - `userId`: 用户 ID

#### 参考图控制
- 支持上传参考图片
- 通过滑块（0-100%）精准控制参考图对生成结果的影响力
- 从仅参考灵感到严格遵循结构

#### 高清视频生成
- **API**: `POST /api/creation/video/generate`
- **功能**: 根据文本提示词生成短视频
- **参数**:
  - `prompt`: 文字描述
  - `resolution`: 分辨率 (720p, 1080p)
  - `aspectRatio`: 画幅 (16:9, 9:16)
  - `title`: 作品标题
  - `userId`: 用户 ID

### 2. 音频创作实验室

#### 语音合成 (TTS)
- **API**: `POST /api/creation/audio/tts`
- **功能**: 文本转语音，支持多种音色
- **预设音色**:
  - `warm_female`: 温和女声
  - `deep_male`: 深沉男声
  - `energetic_female`: 有力女声
  - `gentle_male`: 温和男声
  - `professional_female`: 专业女声
- **参数**:
  - `text`: 文本内容
  - `voice`: 音色选择
  - `language`: 语言 (zh, en)
  - `title`: 作品标题
  - `userId`: 用户 ID

#### 风格化语音克隆
- **API**: `POST /api/creation/audio/clone`
- **功能**: 分析参考音频并生成风格指令
- **风格预设**:
  - `cartoon_voice`: 卡通配音
  - `movie_trailer`: 电影预告片
  - `news_broadcast`: 新闻播报
  - `asmr_whisper`: ASMR耳语
- **参数**:
  - `referenceAudio`: 参考音频 URL 或 base64
  - `stylePreset`: 风格预设（可选）
  - `customStyle`: 自定义风格指令（可选）

### 3. 智能辅助工具

#### 提示词优化器
- **API**: `POST /api/creation/assistant/optimize-prompt`
- **功能**: 将简单想法扩展为专业提示词
- **参数**:
  - `simplePrompt`: 简单提示词（如"一只猫"）
  - `style`: 风格 (realistic, anime, cartoon, oil_painting, watercolor)
- **返回**: 优化后的专业提示词，包含光影、材质、风格等细节

#### 批量生产工具
- **API**: `POST /api/creation/assistant/batch-generate`
- **功能**: 批量生成图片
- **参数**:
  - `prompts`: 提示词列表（数组）
  - `aspectRatio`: 画幅比例
- **返回**: 批量生成结果，包含成功/失败统计

### 4. 作品管理

#### 多媒体画廊
- **API**: `GET /api/creation/gallery`
- **功能**: 获取所有作品
- **查询参数**:
  - `type`: 作品类型 (image, video, audio)
  - `userId`: 用户 ID
- **返回**: 作品列表，包含：
  - 作品 ID、标题、提示词
  - 文件 URL、缩略图 URL
  - 元数据（画幅、分辨率、音色等）
  - 创建时间

#### 作品详情
- **API**: `GET /api/creation/gallery/{creationId}`
- **功能**: 获取单个作品详情

#### 删除作品
- **API**: `DELETE /api/creation/gallery/{creationId}`
- **功能**: 删除指定作品

## 已创建的 Agent

系统会自动创建以下 Agent：

1. **image-generation-agent**: 视觉创作中心 - 图片生成
2. **video-generation-agent**: 视觉创作中心 - 视频生成
3. **audio-generation-agent**: 音频创作实验室 - 语音合成
4. **prompt-optimizer-agent**: 智能辅助工具 - 提示词优化

## 已创建的工具

1. **generate_image**: 图片生成工具
2. **generate_video**: 视频生成工具
3. **text_to_speech**: 文本转语音工具
4. **clone_voice**: 语音克隆工具
5. **optimize_prompt**: 提示词优化工具
6. **batch_generate**: 批量生成工具

## 使用示例

### 生成图片
```bash
curl -X POST http://localhost:8082/api/creation/image/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一只可爱的小猫坐在窗台上",
    "aspectRatio": "16:9",
    "title": "窗台上的小猫",
    "userId": "user123"
  }'
```

### 生成视频
```bash
curl -X POST http://localhost:8082/api/creation/video/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一只小狗在草地上奔跑",
    "resolution": "1080p",
    "aspectRatio": "16:9",
    "title": "奔跑的小狗",
    "userId": "user123"
  }'
```

### 文本转语音
```bash
curl -X POST http://localhost:8082/api/creation/audio/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "你好，这是一个语音合成测试",
    "voice": "warm_female",
    "language": "zh",
    "title": "测试语音",
    "userId": "user123"
  }'
```

### 优化提示词
```bash
curl -X POST http://localhost:8082/api/creation/assistant/optimize-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "simplePrompt": "一只猫",
    "style": "anime"
  }'
```

### 查看作品画廊
```bash
curl http://localhost:8082/api/creation/gallery?type=image
```

## 数据库结构

作品数据存储在 `creations` 表中，包含以下字段：
- `id`: 主键
- `creationId`: 唯一标识
- `type`: 作品类型 (image/video/audio)
- `title`: 标题
- `prompt`: 提示词
- `fileUrl`: 文件 URL
- `thumbnailUrl`: 缩略图 URL
- `metadata`: JSON 格式元数据
- `createdAt`: 创建时间
- `userId`: 用户 ID

## 注意事项

1. **API Key 验证**: 确保在 `application.yml` 中配置了正确的 API Key
2. **文件存储**: 当前实现中，音频文件以 base64 格式存储，生产环境建议使用对象存储服务
3. **批量生成**: 批量生成使用线程池，默认最大并发数为 5
4. **异步任务**: 视频生成可能返回 task_id，需要客户端轮询查询结果

## 后续优化建议

1. 实现去水印功能（需要图片处理 API）
2. 实现文件上传功能（参考图、音频文件）
3. 添加用户认证和权限控制
4. 实现作品分享功能
5. 添加作品收藏和标签功能
6. 实现作品搜索功能





