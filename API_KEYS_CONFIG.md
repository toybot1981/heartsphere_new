# 大模型 API Key 配置指南

## 概述

数字生命体交互系统（心域）支持多种大语言模型，包括：
- **Gemini (Google)** - 推荐使用
- **OpenAI (ChatGPT)**
- **通义千问 (Qwen)**
- **豆包 (Doubao)**

## 配置方式

### 方式一：使用交互式配置脚本（推荐）

```bash
chmod +x configure-api-keys.sh
./configure-api-keys.sh
```

脚本会引导您逐步配置各个 API Key。

### 方式二：手动编辑配置文件

```bash
vi /opt/heartsphere/.env
```

在文件中添加或修改以下配置：

```bash
# ==================== 大模型 API Key 配置 ====================
# Gemini (Google) - 推荐使用
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL_NAME=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
GEMINI_VIDEO_MODEL=veo-3.1-fast-generate-preview

# OpenAI (ChatGPT)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL_NAME=gpt-4o
OPENAI_IMAGE_MODEL=dall-e-3

# 通义千问 (Qwen)
QWEN_API_KEY=your-qwen-api-key-here
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL_NAME=qwen-max
QWEN_IMAGE_MODEL=qwen-image-plus
QWEN_VIDEO_MODEL=wanx-video

# 豆包 (Doubao)
DOUBAO_API_KEY=your-doubao-api-key-here
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL_NAME=ep-2024...
DOUBAO_IMAGE_MODEL=doubao-image-v1
DOUBAO_VIDEO_MODEL=doubao-video-v1

# ==================== 路由策略配置 ====================
TEXT_PROVIDER=gemini      # 文本生成首选提供商
IMAGE_PROVIDER=gemini     # 图片生成首选提供商
VIDEO_PROVIDER=gemini     # 视频生成首选提供商
AUDIO_PROVIDER=gemini     # 音频生成首选提供商
ENABLE_FALLBACK=true      # 是否启用自动降级（当首选失败时自动尝试其他提供商）
```

## 获取 API Key

### 1. Gemini (Google)

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录 Google 账号
3. 创建新的 API Key
4. 复制 API Key 到配置文件

### 2. OpenAI (ChatGPT)

1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登录 OpenAI 账号
3. 创建新的 API Key
4. 复制 API Key 到配置文件

### 3. 通义千问 (Qwen)

1. 访问 [阿里云 DashScope](https://dashscope.console.aliyun.com/)
2. 登录阿里云账号
3. 创建 API Key
4. 复制 API Key 到配置文件

### 4. 豆包 (Doubao)

1. 访问 [火山引擎控制台](https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint)
2. 登录火山引擎账号
3. 创建推理接入点，获取 Endpoint ID
4. 创建 API Key
5. 将 Endpoint ID 填入 `DOUBAO_MODEL_NAME`
6. 将 API Key 填入 `DOUBAO_API_KEY`

## 应用配置

配置完成后，需要重新构建前端以应用新的 API Key：

```bash
# 重新构建前端
cd /root/heartsphere_new
./deploy-frontend.sh

# 或者使用更新脚本
./update.sh
# 选择选项 2（仅更新前端）
```

## 验证配置

### 1. 检查环境变量

```bash
# 查看配置（不显示敏感信息）
grep -E "^(GEMINI|OPENAI|QWEN|DOUBAO)_API_KEY=" /opt/heartsphere/.env | sed 's/=.*/=***/'
```

### 2. 检查前端构建

```bash
# 检查前端环境变量文件
cat /root/heartsphere_new/frontend/.env.production | grep VITE_GEMINI_API_KEY
```

### 3. 测试 API 连接

在应用设置中配置 API Key 后，尝试与角色对话，如果成功则说明配置正确。

## 路由策略说明

系统支持为不同的任务类型配置不同的首选提供商：

- **TEXT_PROVIDER**: 文本对话和生成
- **IMAGE_PROVIDER**: 图片生成
- **VIDEO_PROVIDER**: 视频生成
- **AUDIO_PROVIDER**: 语音合成

如果启用了 `ENABLE_FALLBACK=true`，当首选提供商失败时，系统会自动尝试其他已配置的提供商。

## 安全建议

1. **保护 API Key**
   - `.env` 文件权限已设置为 600（仅所有者可读写）
   - 不要将 API Key 提交到代码仓库
   - 定期轮换 API Key

2. **限制 API 使用**
   - 在各大模型平台设置使用限额
   - 监控 API 调用量和费用

3. **使用环境变量**
   - 生产环境建议使用环境变量而非配置文件
   - 可以使用 `export` 命令设置环境变量

## 故障排查

### 问题 1: API Key 配置后仍无法使用

**解决方案：**
1. 确认已重新构建前端：`./deploy-frontend.sh`
2. 检查 `.env.production` 文件是否存在且包含正确的 API Key
3. 清除浏览器缓存并刷新页面
4. 在应用设置中手动输入 API Key

### 问题 2: 某些模型无法使用

**可能原因：**
- API Key 无效或过期
- API Key 没有相应模型的访问权限
- 网络连接问题（某些国内模型可能需要代理）

**解决方案：**
1. 验证 API Key 是否有效
2. 检查模型名称是否正确
3. 查看浏览器控制台错误信息
4. 尝试使用其他提供商

### 问题 3: 自动降级不工作

**解决方案：**
1. 确认 `ENABLE_FALLBACK=true`
2. 确认至少配置了两个不同的 API Key
3. 检查日志查看降级过程

## 配置示例

### 最小配置（仅使用 Gemini）

```bash
GEMINI_API_KEY=your-gemini-key
TEXT_PROVIDER=gemini
IMAGE_PROVIDER=gemini
ENABLE_FALLBACK=false
```

### 完整配置（多提供商 + 自动降级）

```bash
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
QWEN_API_KEY=your-qwen-key
DOUBAO_API_KEY=your-doubao-key

TEXT_PROVIDER=gemini
IMAGE_PROVIDER=gemini
VIDEO_PROVIDER=gemini
AUDIO_PROVIDER=gemini
ENABLE_FALLBACK=true
```

### 国内优化配置（使用国内模型）

```bash
QWEN_API_KEY=your-qwen-key
DOUBAO_API_KEY=your-doubao-key

TEXT_PROVIDER=qwen
IMAGE_PROVIDER=qwen
VIDEO_PROVIDER=doubao
AUDIO_PROVIDER=qwen
ENABLE_FALLBACK=true
```

## 注意事项

1. **API Key 格式**
   - Gemini: 通常以字母开头
   - OpenAI: 以 `sk-` 开头
   - Qwen: 以 `sk-` 开头
   - Doubao: UUID 格式

2. **模型名称**
   - 不同提供商的模型名称格式不同
   - 确保使用正确的模型名称
   - 某些模型可能需要特殊权限

3. **费用控制**
   - 各提供商的定价不同
   - 建议设置使用限额
   - 定期检查 API 使用情况

4. **网络要求**
   - Gemini 和 OpenAI 需要访问国际网络
   - Qwen 和 Doubao 可在国内直接访问
   - 如遇网络问题，考虑使用代理或国内模型








