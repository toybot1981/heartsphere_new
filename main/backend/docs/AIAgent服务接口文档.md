# AIAgent 服务接口文档

**文档版本**: v1.0  
**创建日期**: 2025-12-29  
**适用范围**: 后端业务服务调用

---

## 目录

- [一、概述](#一概述)
- [二、REST API 接口](#二rest-api-接口)
- [三、服务层接口（推荐用于业务服务调用）](#三服务层接口推荐用于业务服务调用)
- [四、DTO 说明](#四dto-说明)
- [五、使用示例](#五使用示例)
- [六、错误处理](#六错误处理)
- [七、注意事项](#七注意事项)

---

## 一、概述

AIAgent 提供了统一的 AI 服务调用接口，支持：
- 文本生成（同步和流式）
- 图片生成
- 文本转语音（TTS）
- 语音转文本（STT）
- 视频生成

**两种调用方式：**
1. **REST API**：通过 HTTP 请求调用（适用于前端或外部系统）
2. **服务层接口**：直接注入 `AIService` 调用（**推荐用于后端业务服务**）

---

## 二、REST API 接口

所有 REST API 接口都在 `/api/ai` 路径下，需要认证（从 Authentication 中获取 userId）。

### 2.1 文本生成（同步）

**接口**: `POST /api/ai/text/generate`

**请求体**:
```json
{
  "prompt": "你好，请介绍一下你自己",
  "provider": "dashscope",
  "model": "qwen-max",
  "systemInstruction": "你是一个友好的助手",
  "temperature": 0.7,
  "maxTokens": 2048,
  "messages": [
    {"role": "user", "content": "你好"},
    {"role": "assistant", "content": "你好！有什么可以帮助你的吗？"}
  ]
}
```

**响应**:
```json
{
  "code": 200,
  "message": "文本生成成功",
  "data": {
    "content": "你好！我是AI助手，很高兴为你服务。",
    "provider": "dashscope",
    "model": "qwen-max",
    "usage": {
      "inputTokens": 15,
      "outputTokens": 45,
      "totalTokens": 60
    },
    "finishReason": "stop"
  },
  "timestamp": "2025-12-29T08:00:00"
}
```

### 2.2 流式文本生成

**接口**: `POST /api/ai/text/generate/stream`

**请求体**: 与同步接口相同，但响应使用 Server-Sent Events (SSE) 格式

**响应格式** (SSE):
```
data: {"content":"生成的","done":false}
data: {"content":"文本","done":false}
data: {"content":"内容","done":true,"usage":{"inputTokens":15,"outputTokens":45,"totalTokens":60}}
```

### 2.3 OpenAPI 兼容接口

**接口**: `POST /api/ai/v1/chat/completions`

**请求体**:
```json
{
  "model": "qwen-max",
  "messages": [
    {"role": "system", "content": "你是一个友好的助手"},
    {"role": "user", "content": "你好"}
  ],
  "temperature": 0.7,
  "max_tokens": 2048,
  "stream": false
}
```

**响应**:
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "qwen-max",
  "choices": [{
    "index": 0,
    "message": {"role": "assistant", "content": "你好！有什么可以帮助你的吗？"},
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 200,
    "total_tokens": 300
  }
}
```

### 2.4 图片生成

**接口**: `POST /api/ai/image/generate`

**请求体**:
```json
{
  "prompt": "一只可爱的小猫",
  "provider": "dashscope",
  "model": "wanx-v1",
  "width": 1024,
  "height": 1024,
  "numberOfImages": 1
}
```

**响应**:
```json
{
  "code": 200,
  "message": "图片生成成功",
  "data": {
    "images": [
      {
        "url": "https://example.com/image.png",
        "base64": "data:image/png;base64,..."
      }
    ],
    "provider": "dashscope",
    "model": "wanx-v1",
    "usage": {
      "imagesGenerated": 1
    }
  }
}
```

### 2.5 文本转语音

**接口**: `POST /api/ai/audio/tts`

**请求体**:
```json
{
  "text": "你好，世界",
  "provider": "openai",
  "model": "tts-1",
  "voice": "alloy",
  "speed": 1.0
}
```

### 2.6 语音转文本

**接口**: `POST /api/ai/audio/stt`

**请求体**:
```json
{
  "audioData": "data:audio/wav;base64,...",
  "provider": "openai",
  "model": "whisper-1",
  "language": "zh-CN"
}
```

### 2.7 视频生成

**接口**: `POST /api/ai/video/generate`

**请求体**:
```json
{
  "prompt": "一只小猫在花园里玩耍",
  "provider": "gemini",
  "model": "veo-2",
  "duration": 5,
  "resolution": "1080p"
}
```

---

## 三、服务层接口（推荐用于业务服务调用）

在业务服务中，**推荐直接注入 `AIService` 进行调用**，而不是通过 REST API。

### 3.1 服务接口定义

```java
package com.heartsphere.aiagent.service;

public interface AIService {
    // 文本生成
    TextGenerationResponse generateText(Long userId, TextGenerationRequest request);
    
    // 流式文本生成
    void generateTextStream(Long userId, TextGenerationRequest request, 
                           StreamResponseHandler<TextGenerationResponse> handler);
    
    // 图片生成
    ImageGenerationResponse generateImage(Long userId, ImageGenerationRequest request);
    
    // 文本转语音
    AudioResponse textToSpeech(Long userId, AudioRequest request);
    
    // 语音转文本
    AudioResponse speechToText(Long userId, AudioRequest request);
    
    // 视频生成
    VideoGenerationResponse generateVideo(Long userId, VideoGenerationRequest request);
    
    // 获取用户AI配置
    UserAIConfig getUserConfig(Long userId);
    
    // 更新用户AI配置
    UserAIConfig updateUserConfig(Long userId, UserAIConfig config);
}
```

### 3.2 依赖注入

```java
@Service
@RequiredArgsConstructor
public class YourBusinessService {
    
    private final AIService aiService;
    
    // 或者使用 @Autowired
    // @Autowired
    // private AIService aiService;
}
```

---

## 四、DTO 说明

### 4.1 TextGenerationRequest（文本生成请求）

```java
public class TextGenerationRequest {
    private String provider;          // 可选：提供商（gemini, openai, dashscope, doubao, bigmodel）
    private String model;             // 可选：模型名称
    private String prompt;            // 必需：提示词
    private String systemInstruction; // 可选：系统指令
    private List<Message> messages;   // 可选：对话历史
    private Double temperature;       // 可选：温度参数（0-1），默认0.7
    private Integer maxTokens;        // 可选：最大输出Token数
    private Boolean stream;           // 可选：是否流式返回，默认false
    private String baseUrl;           // 可选：API基础URL（统一接入模式）
    private String apiKey;            // 可选：API密钥（统一接入模式）
    
    public static class Message {
        private String role;    // user, assistant, system
        private String content;
    }
}
```

### 4.2 TextGenerationResponse（文本生成响应）

```java
public class TextGenerationResponse {
    private String content;           // 生成的文本内容
    private String provider;          // 使用的提供商
    private String model;             // 使用的模型
    private TokenUsage usage;         // Token使用量
    private String finishReason;      // 完成原因（stop, length, etc.）
    
    public static class TokenUsage {
        private Integer inputTokens;   // 输入Token数
        private Integer outputTokens;  // 输出Token数
        private Integer totalTokens;   // 总Token数
    }
}
```

### 4.3 ImageGenerationRequest（图片生成请求）

```java
public class ImageGenerationRequest {
    private String provider;          // 可选：提供商
    private String model;             // 可选：模型名称
    private String prompt;            // 必需：提示词
    private String negativePrompt;    // 可选：负面提示词
    private Integer width;            // 可选：图片宽度，默认1024
    private Integer height;           // 可选：图片高度，默认1024
    private String aspectRatio;       // 可选：宽高比（1:1, 16:9, 9:16等）
    private Integer numberOfImages;   // 可选：生成图片数量，默认1
    private String style;             // 可选：图片风格
    private String baseUrl;           // 可选：API基础URL
    private String apiKey;            // 可选：API密钥
}
```

### 4.4 AudioRequest（音频处理请求）

```java
public class AudioRequest {
    private String provider;          // 可选：提供商
    private String model;             // 可选：模型名称
    private String text;              // TTS：要转换的文本
    private String audioData;         // STT：音频文件数据（Base64编码）
    private String voice;             // TTS：语音类型
    private Double speed;             // TTS：语速（0.25-4.0）
    private Double pitch;             // TTS：音调（-20.0到20.0）
    private String language;          // STT：语言
}
```

### 4.5 VideoGenerationRequest（视频生成请求）

```java
public class VideoGenerationRequest {
    private String provider;          // 可选：提供商
    private String model;             // 可选：模型名称
    private String prompt;            // 必需：提示词
    private Integer duration;         // 可选：视频时长（秒）
    private String resolution;        // 可选：分辨率（720p, 1080p等）
}
```

---

## 五、使用示例

### 5.1 基础文本生成

```java
@Service
@RequiredArgsConstructor
public class YourBusinessService {
    
    private final AIService aiService;
    
    public String generateContent(Long userId, String userPrompt) {
        // 构建请求
        TextGenerationRequest request = new TextGenerationRequest();
        request.setPrompt(userPrompt);
        request.setSystemInstruction("你是一个专业的助手");
        request.setTemperature(0.7);
        request.setMaxTokens(2048);
        
        // 可选：指定提供商和模型
        // request.setProvider("dashscope");
        // request.setModel("qwen-max");
        
        // 调用服务
        TextGenerationResponse response = aiService.generateText(userId, request);
        
        // 获取结果
        return response.getContent();
    }
}
```

### 5.2 带对话历史的文本生成

```java
public String generateWithHistory(Long userId, String userMessage) {
    TextGenerationRequest request = new TextGenerationRequest();
    request.setSystemInstruction("你是一个友好的助手");
    
    // 构建对话历史
    List<TextGenerationRequest.Message> messages = new ArrayList<>();
    
    TextGenerationRequest.Message msg1 = new TextGenerationRequest.Message();
    msg1.setRole("user");
    msg1.setContent("你好");
    messages.add(msg1);
    
    TextGenerationRequest.Message msg2 = new TextGenerationRequest.Message();
    msg2.setRole("assistant");
    msg2.setContent("你好！有什么可以帮助你的吗？");
    messages.add(msg2);
    
    TextGenerationRequest.Message msg3 = new TextGenerationRequest.Message();
    msg3.setRole("user");
    msg3.setContent(userMessage);
    messages.add(msg3);
    
    request.setMessages(messages);
    request.setTemperature(0.7);
    request.setMaxTokens(2048);
    
    TextGenerationResponse response = aiService.generateText(userId, request);
    return response.getContent();
}
```

### 5.3 流式文本生成

```java
public void generateStream(Long userId, String prompt) {
    TextGenerationRequest request = new TextGenerationRequest();
    request.setPrompt(prompt);
    request.setTemperature(0.7);
    request.setMaxTokens(2048);
    
    aiService.generateTextStream(userId, request, (response, done) -> {
        if (response != null && response.getContent() != null) {
            // 处理每个chunk
            System.out.print(response.getContent());
        }
        
        if (done) {
            // 流式响应完成
            if (response != null && response.getUsage() != null) {
                System.out.println("\n使用Token数: " + response.getUsage().getTotalTokens());
            }
        }
    });
}
```

### 5.4 图片生成

```java
public List<String> generateImages(Long userId, String prompt) {
    ImageGenerationRequest request = new ImageGenerationRequest();
    request.setPrompt(prompt);
    request.setWidth(1024);
    request.setHeight(1024);
    request.setNumberOfImages(1);
    
    ImageGenerationResponse response = aiService.generateImage(userId, request);
    
    // 提取图片URL
    return response.getImages().stream()
            .map(ImageGenerationResponse.Image::getUrl)
            .collect(Collectors.toList());
}
```

### 5.5 实际业务示例（情绪分析）

参考 `EmotionService.java` 中的实现：

```java
@Service
@RequiredArgsConstructor
public class EmotionService {
    
    @Autowired
    private AIService aiService;
    
    public EmotionAnalysisResponse analyzeEmotion(EmotionAnalysisRequest request) {
        try {
            // 构建AI提示词
            String prompt = buildEmotionAnalysisPrompt(request);
            
            // 创建AI请求
            TextGenerationRequest aiRequest = new TextGenerationRequest();
            aiRequest.setPrompt(prompt);
            aiRequest.setSystemInstruction("你是一个专业的情绪分析专家");
            aiRequest.setTemperature(0.3); // 较低温度以获得更一致的分析
            aiRequest.setMaxTokens(500);
            
            // 调用AI服务
            TextGenerationResponse aiResponse = aiService.generateText(
                request.getUserId(),
                aiRequest
            );
            
            // 解析AI响应
            return parseAIResponse(aiResponse.getContent(), request);
            
        } catch (Exception e) {
            // AI分析失败，使用基础分析
            return analyzeEmotionBasic(request);
        }
    }
}
```

---

## 六、错误处理

### 6.1 异常类型

- `AIServiceException`: AI服务通用异常
- `UnsupportedModelException`: 不支持的模型异常
- `IllegalArgumentException`: 请求参数错误
- `QuotaInsufficientException`: 配额不足异常（由计费切面抛出）

### 6.2 错误处理示例

```java
public String generateWithErrorHandling(Long userId, String prompt) {
    try {
        TextGenerationRequest request = new TextGenerationRequest();
        request.setPrompt(prompt);
        
        TextGenerationResponse response = aiService.generateText(userId, request);
        return response.getContent();
        
    } catch (IllegalArgumentException e) {
        log.error("请求参数错误: {}", e.getMessage());
        return "请求参数错误，请检查输入";
        
    } catch (QuotaInsufficientException e) {
        log.error("配额不足: {}", e.getMessage());
        return "配额不足，请联系管理员";
        
    } catch (AIServiceException e) {
        log.error("AI服务调用失败: {}", e.getMessage(), e);
        return "AI服务暂时不可用，请稍后重试";
        
    } catch (Exception e) {
        log.error("未知错误: {}", e.getMessage(), e);
        return "服务异常，请稍后重试";
    }
}
```

---

## 七、注意事项

### 7.1 统一接入模式

系统支持**统一接入模式**，如果请求中不指定 `provider` 和 `model`，系统会：
1. 根据用户的配置选择模型
2. 或者根据统一路由策略自动选择模型
3. 从数据库 `ai_model_config` 表获取 API key 和 base URL

**推荐**：在业务服务中，通常不需要指定 `provider` 和 `model`，让系统自动路由即可。

### 7.2 计费和配额

- 所有AI服务调用都会自动进行配额检查和计费
- 通过 `@RequiresTokenQuota` 注解自动拦截（已由 `AIServiceImpl` 实现）
- 配额不足时会抛出 `QuotaInsufficientException`

### 7.3 支持的提供商

当前支持的提供商：
- `gemini`: Google Gemini
- `openai`: OpenAI
- `dashscope`: 阿里云通义千问（qwen）
- `doubao`: 字节跳动豆包
- `bigmodel`: 智谱AI

### 7.4 性能建议

1. **流式生成**：对于长文本生成，推荐使用流式接口，提升用户体验
2. **温度参数**：根据场景选择合适的温度值
   - 创造性任务：0.7-1.0
   - 分析性任务：0.3-0.5
3. **Token限制**：合理设置 `maxTokens`，避免不必要的成本

### 7.5 日志和监控

所有AI服务调用都会记录日志，包括：
- 请求参数（provider, model, temperature等）
- 响应结果（content, usage等）
- 错误信息

---

## 附录：相关类路径

- **服务接口**: `com.heartsphere.aiagent.service.AIService`
- **服务实现**: `com.heartsphere.aiagent.service.AIServiceImpl`
- **请求DTO**: `com.heartsphere.aiagent.dto.request.*`
- **响应DTO**: `com.heartsphere.aiagent.dto.response.*`
- **异常类**: `com.heartsphere.aiagent.exception.*`
- **REST控制器**: `com.heartsphere.aiagent.controller.AIServiceController`

---

**文档维护**: 如有接口变更，请及时更新本文档。




