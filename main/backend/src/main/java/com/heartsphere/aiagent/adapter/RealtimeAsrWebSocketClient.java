package com.heartsphere.aiagent.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aiagent.dto.request.AudioRequest;
import com.heartsphere.aiagent.dto.response.AudioResponse;
import com.heartsphere.aiagent.exception.AIServiceException;
import com.heartsphere.aiagent.util.StreamResponseHandler;
import lombok.extern.slf4j.Slf4j;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 豆包实时语音识别 WebSocket 客户端
 * 
 * 参考文档：https://www.volcengine.com/docs/6561/1594356?lang=zh
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
public class RealtimeAsrWebSocketClient extends WebSocketClient {
    
    private final AudioRequest request;
    private final StreamResponseHandler<AudioResponse> handler;
    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper;
    
    private String sessionId;
    private String connectId;
    private boolean sessionStarted = false;
    private int sequence = 0;
    private Map<String, String> customHeaders = new HashMap<>();
    
    // 事件 ID 常量
    private static final int EVENT_START_CONNECTION = 1;
    private static final int EVENT_START_SESSION = 100;
    private static final int EVENT_FINISH_SESSION = 102;
    private static final int EVENT_TASK_REQUEST = 200;
    
    // 服务端事件 ID
    private static final int EVENT_CONNECTION_STARTED = 50;
    private static final int EVENT_SESSION_STARTED = 150;
    private static final int EVENT_ASR_RESPONSE = 451;
    private static final int EVENT_ASR_ENDED = 459;
    private static final int EVENT_SESSION_FAILED = 153;
    private static final int EVENT_DIALOG_COMMON_ERROR = 599;
    
    public RealtimeAsrWebSocketClient(URI serverUri, AudioRequest request, 
                                     StreamResponseHandler<AudioResponse> handler,
                                     String apiKey, String model) {
        super(serverUri);
        this.request = request;
        this.handler = handler;
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = new ObjectMapper();
        this.sessionId = request.getStreamId() != null ? request.getStreamId() : UUID.randomUUID().toString();
        this.connectId = UUID.randomUUID().toString();
    }
    
    /**
     * 添加自定义请求头
     * 注意：需要在 connect() 之前调用
     */
    public void addCustomHeader(String name, String value) {
        customHeaders.put(name, value);
    }
    
    /**
     * 重写 connect() 方法以设置请求头
     */
    @Override
    public void connect() {
        // 在连接前设置请求头（使用父类的 addHeader 方法）
        for (Map.Entry<String, String> entry : customHeaders.entrySet()) {
            super.addHeader(entry.getKey(), entry.getValue());
        }
        super.connect();
    }
    
    @Override
    public void onOpen(ServerHandshake handshake) {
        log.info("[RealtimeAsrWebSocketClient] WebSocket 连接已建立");
        
        // 发送 StartConnection 事件
        sendStartConnection();
    }
    
    @Override
    public void onMessage(String message) {
        log.warn("[RealtimeAsrWebSocketClient] 收到文本消息（不应该发生）: {}", message);
    }
    
    @Override
    public void onMessage(ByteBuffer buffer) {
        try {
            // 解析二进制协议
            parseBinaryMessage(buffer);
        } catch (Exception e) {
            log.error("[RealtimeAsrWebSocketClient] 解析消息失败", e);
            handler.handle(null, true);
        }
    }
    
    @Override
    public void onClose(int code, String reason, boolean remote) {
        log.info("[RealtimeAsrWebSocketClient] WebSocket 连接已关闭: code={}, reason={}, remote={}", 
            code, reason, remote);
        handler.handle(null, true);
    }
    
    @Override
    public void onError(Exception ex) {
        log.error("[RealtimeAsrWebSocketClient] WebSocket 错误", ex);
        handler.handle(null, true);
    }
    
    /**
     * 发送 StartConnection 事件
     */
    private void sendStartConnection() {
        try {
            // 构建二进制消息
            // Header: Protocol Version (0b0001), Header Size (0b0001), Message Type (0b0001), Serialization (0b0001), Compression (0b0000), Reserved (0x00)
            // Message Type = 0b0001 (Full-client request)
            // Message type specific flags = 0b0100 (携带 event)
            // Event = 1 (StartConnection)
            // Session ID 不需要（Connect 类事件）
            
            byte[] header = new byte[4];
            header[0] = 0x11; // Protocol Version (0b0001) + Header Size (0b0001)
            header[1] = 0x20; // Message Type (0b0001) + Message type specific flags (0b0100 = 携带 event)
            header[2] = 0x10; // Serialization (0b0001 = JSON) + Compression (0b0000 = 无压缩)
            header[3] = 0x00; // Reserved
            
            // Optional: event = 1 (StartConnection)
            byte[] eventBytes = intToBytes(1);
            
            // Payload: 空 JSON {}
            byte[] payload = "{}".getBytes();
            byte[] payloadSize = intToBytes(payload.length);
            
            // 组装完整消息
            ByteBuffer message = ByteBuffer.allocate(header.length + eventBytes.length + payloadSize.length + payload.length);
            message.order(ByteOrder.BIG_ENDIAN);
            message.put(header);
            message.put(eventBytes);
            message.put(payloadSize);
            message.put(payload);
            
            send(message.array());
            log.info("[RealtimeAsrWebSocketClient] 已发送 StartConnection 事件");
            
        } catch (Exception e) {
            log.error("[RealtimeAsrWebSocketClient] 发送 StartConnection 失败", e);
            handler.handle(null, true);
        }
    }
    
    /**
     * 发送 StartSession 事件
     */
    private void sendStartSession() {
        try {
            // 构建 StartSession JSON payload
            // 参考文档：需要包含 asr、dialog、tts 等配置
            String jsonPayload = buildStartSessionPayload();
            byte[] payload = jsonPayload.getBytes("UTF-8");
            
            // Header
            byte[] header = new byte[4];
            header[0] = 0x11; // Protocol Version + Header Size
            header[1] = 0x20; // Message Type (0b0001) + Message type specific flags (0b0100 = 携带 event)
            header[2] = 0x10; // Serialization (JSON) + Compression (无压缩)
            header[3] = 0x00; // Reserved
            
            // Optional: event = 100 (StartSession)
            byte[] eventBytes = intToBytes(EVENT_START_SESSION);
            
            // Session ID
            byte[] sessionIdBytes = sessionId.getBytes("UTF-8");
            byte[] sessionIdSize = intToBytes(sessionIdBytes.length);
            
            // Payload size
            byte[] payloadSize = intToBytes(payload.length);
            
            // 组装消息
            ByteBuffer message = ByteBuffer.allocate(
                header.length + eventBytes.length + sessionIdSize.length + sessionIdBytes.length + 
                payloadSize.length + payload.length);
            message.order(ByteOrder.BIG_ENDIAN);
            message.put(header);
            message.put(eventBytes);
            message.put(sessionIdSize);
            message.put(sessionIdBytes);
            message.put(payloadSize);
            message.put(payload);
            
            send(message.array());
            log.info("[RealtimeAsrWebSocketClient] 已发送 StartSession 事件, sessionId={}", sessionId);
            
        } catch (Exception e) {
            log.error("[RealtimeAsrWebSocketClient] 发送 StartSession 失败", e);
            handler.handle(null, true);
        }
    }
    
    /**
     * 构建 StartSession 的 JSON payload
     */
    private String buildStartSessionPayload() {
        try {
            // 构建 JSON
            StringBuilder json = new StringBuilder();
            json.append("{");
            
            // ASR 配置
            json.append("\"asr\":{");
            json.append("\"audio_info\":{");
            if (request.getContentType() != null && request.getContentType().contains("opus")) {
                json.append("\"format\":\"speech_opus\",");
            } else {
                json.append("\"format\":\"pcm\",");
            }
            json.append("\"sample_rate\":").append(request.getSampleRate() != null ? request.getSampleRate() : 16000).append(",");
            json.append("\"channel\":").append(request.getChannels() != null ? request.getChannels() : 1);
            json.append("}");
            json.append("},");
            
            // Dialog 配置
            json.append("\"dialog\":{");
            json.append("\"extra\":{");
            json.append("\"model\":\"").append(model != null ? model : "O").append("\"");
            json.append("}");
            json.append("}");
            
            json.append("}");
            
            return json.toString();
        } catch (Exception e) {
            log.error("[RealtimeAsrWebSocketClient] 构建 StartSession payload 失败", e);
            return "{\"asr\":{\"audio_info\":{\"format\":\"pcm\",\"sample_rate\":16000,\"channel\":1}},\"dialog\":{\"extra\":{\"model\":\"O\"}}}";
        }
    }
    
    /**
     * 发送音频数据（TaskRequest 事件）
     */
    public void sendAudioChunk(byte[] audioBytes, boolean isLast) {
        try {
            if (!sessionStarted) {
                log.warn("[RealtimeAsrWebSocketClient] 会话未启动，无法发送音频数据");
                return;
            }
            
            // Header: Audio-only request (0b0010)
            byte[] header = new byte[4];
            header[0] = 0x11; // Protocol Version (0b0001) + Header Size (0b0001)
            header[1] = 0x24; // Message Type (0b0010 = Audio-only request) + Message type specific flags (0b0100 = 携带 event)
            header[2] = 0x00; // Serialization (0b0000 = Raw) + Compression (0b0000 = 无压缩)
            header[3] = 0x00; // Reserved
            
            // Optional: event = 200 (TaskRequest)
            byte[] eventBytes = intToBytes(EVENT_TASK_REQUEST);
            
            // Session ID
            byte[] sessionIdBytes = sessionId.getBytes("UTF-8");
            byte[] sessionIdSize = intToBytes(sessionIdBytes.length);
            
            // Sequence (可选，用于标识数据包顺序)
            byte[] sequenceBytes = intToBytes(sequence++);
            
            // Payload size
            byte[] payloadSize = intToBytes(audioBytes.length);
            
            // 组装消息
            ByteBuffer message = ByteBuffer.allocate(
                header.length + eventBytes.length + sessionIdSize.length + sessionIdBytes.length +
                sequenceBytes.length + payloadSize.length + audioBytes.length);
            message.order(ByteOrder.BIG_ENDIAN);
            message.put(header);
            message.put(eventBytes);
            message.put(sessionIdSize);
            message.put(sessionIdBytes);
            message.put(sequenceBytes);
            message.put(payloadSize);
            message.put(audioBytes);
            
            send(message.array());
            log.debug("[RealtimeAsrWebSocketClient] 已发送音频数据块, size={}, isLast={}", audioBytes.length, isLast);
            
        } catch (Exception e) {
            log.error("[RealtimeAsrWebSocketClient] 发送音频数据失败", e);
            handler.handle(null, true);
        }
    }
    
    /**
     * 发送流结束信号（FinishSession 事件）
     */
    public void sendEndOfStream() {
        try {
            if (!sessionStarted) {
                log.warn("[RealtimeAsrWebSocketClient] 会话未启动，无需结束");
                return;
            }
            
            // Header
            byte[] header = new byte[4];
            header[0] = 0x11;
            header[1] = 0x20; // Message Type (0b0001) + Message type specific flags (0b0100 = 携带 event)
            header[2] = 0x10; // Serialization (JSON) + Compression (无压缩)
            header[3] = 0x00;
            
            // Optional: event = 102 (FinishSession)
            byte[] eventBytes = intToBytes(EVENT_FINISH_SESSION);
            
            // Session ID
            byte[] sessionIdBytes = sessionId.getBytes("UTF-8");
            byte[] sessionIdSize = intToBytes(sessionIdBytes.length);
            
            // Payload: 空 JSON {}
            byte[] payload = "{}".getBytes();
            byte[] payloadSize = intToBytes(payload.length);
            
            // 组装消息
            ByteBuffer message = ByteBuffer.allocate(
                header.length + eventBytes.length + sessionIdSize.length + sessionIdBytes.length +
                payloadSize.length + payload.length);
            message.order(ByteOrder.BIG_ENDIAN);
            message.put(header);
            message.put(eventBytes);
            message.put(sessionIdSize);
            message.put(sessionIdBytes);
            message.put(payloadSize);
            message.put(payload);
            
            send(message.array());
            log.info("[RealtimeAsrWebSocketClient] 已发送 FinishSession 事件");
            
        } catch (Exception e) {
            log.error("[RealtimeAsrWebSocketClient] 发送 FinishSession 失败", e);
        }
    }
    
    /**
     * 解析二进制消息
     */
    private void parseBinaryMessage(ByteBuffer buffer) throws Exception {
        buffer.order(ByteOrder.BIG_ENDIAN);
        
        if (buffer.remaining() < 4) {
            log.warn("[RealtimeAsrWebSocketClient] 消息太短，无法解析 header");
            return;
        }
        
        // 读取 header
        byte[] header = new byte[4];
        buffer.get(header);
        
        int protocolVersion = (header[0] >> 4) & 0x0F;
        int headerSize = header[0] & 0x0F;
        int messageType = (header[1] >> 4) & 0x0F;
        int messageTypeFlags = header[1] & 0x0F;
        int serialization = (header[2] >> 4) & 0x0F;
        int compression = header[2] & 0x0F;
        
        log.debug("[RealtimeAsrWebSocketClient] 收到消息: protocolVersion={}, messageType={}, flags={}, serialization={}", 
            protocolVersion, messageType, messageTypeFlags, serialization);
        
        // 解析 optional 字段
        int eventId = 0;
        String sessionIdFromMsg = null;
        
        // 检查是否包含 event
        if ((messageTypeFlags & 0x04) != 0) {
            if (buffer.remaining() < 4) {
                log.warn("[RealtimeAsrWebSocketClient] 消息不完整，缺少 event");
                return;
            }
            eventId = buffer.getInt();
            log.debug("[RealtimeAsrWebSocketClient] Event ID: {}", eventId);
        }
        
        // 检查是否包含 session ID（Session 类事件）
        if (eventId >= 100 && eventId < 200) {
            if (buffer.remaining() < 4) {
                log.warn("[RealtimeAsrWebSocketClient] 消息不完整，缺少 session ID size");
                return;
            }
            int sessionIdSize = buffer.getInt();
            if (sessionIdSize > 0 && buffer.remaining() >= sessionIdSize) {
                byte[] sessionIdBytes = new byte[sessionIdSize];
                buffer.get(sessionIdBytes);
                sessionIdFromMsg = new String(sessionIdBytes, "UTF-8");
                log.debug("[RealtimeAsrWebSocketClient] Session ID: {}", sessionIdFromMsg);
            }
        }
        
        // 读取 payload size
        if (buffer.remaining() < 4) {
            log.warn("[RealtimeAsrWebSocketClient] 消息不完整，缺少 payload size");
            return;
        }
        int payloadSize = buffer.getInt();
        
        if (buffer.remaining() < payloadSize) {
            log.warn("[RealtimeAsrWebSocketClient] 消息不完整，payload 不完整: expected={}, actual={}", 
                payloadSize, buffer.remaining());
            return;
        }
        
        // 读取 payload
        byte[] payload = new byte[payloadSize];
        buffer.get(payload);
        
        // 处理不同的事件
        handleServerEvent(eventId, messageType, serialization, payload);
    }
    
    /**
     * 处理服务端事件
     */
    private void handleServerEvent(int eventId, int messageType, int serialization, byte[] payload) {
        try {
            switch (eventId) {
                case EVENT_CONNECTION_STARTED:
                    log.info("[RealtimeAsrWebSocketClient] 连接已启动，发送 StartSession");
                    sendStartSession();
                    break;
                    
                case EVENT_SESSION_STARTED:
                    log.info("[RealtimeAsrWebSocketClient] 会话已启动");
                    sessionStarted = true;
                    // 如果请求中有初始音频数据，立即发送
                    if (request.getAudioData() != null && !request.getAudioData().isEmpty()) {
                        sendInitialAudio();
                    }
                    break;
                    
                case EVENT_ASR_RESPONSE:
                    // 解析 ASR 识别结果
                    if (serialization == 1) { // JSON
                        parseAsrResponse(payload);
                    }
                    break;
                    
                case EVENT_ASR_ENDED:
                    log.info("[RealtimeAsrWebSocketClient] ASR 识别结束");
                    // 发送最终结果
                    AudioResponse finalResponse = new AudioResponse();
                    finalResponse.setProvider("doubao");
                    finalResponse.setModel(model);
                    finalResponse.setIsPartial(false);
                    finalResponse.setStreamId(sessionId);
                    handler.handle(finalResponse, false);
                    break;
                    
                case EVENT_SESSION_FAILED:
                case EVENT_DIALOG_COMMON_ERROR:
                    // 解析错误信息
                    if (serialization == 1) { // JSON
                        parseErrorResponse(payload);
                    }
                    break;
                    
                default:
                    log.debug("[RealtimeAsrWebSocketClient] 未处理的事件: eventId={}", eventId);
            }
        } catch (Exception e) {
            log.error("[RealtimeAsrWebSocketClient] 处理服务端事件失败: eventId={}", eventId, e);
        }
    }
    
    /**
     * 解析 ASR 响应
     */
    private void parseAsrResponse(byte[] payload) {
        try {
            String jsonStr = new String(payload, "UTF-8");
            JsonNode json = objectMapper.readTree(jsonStr);
            
            if (json.has("results") && json.get("results").isArray()) {
                JsonNode results = json.get("results");
                if (results.size() > 0) {
                    JsonNode firstResult = results.get(0);
                    String text = firstResult.has("text") ? firstResult.get("text").asText() : "";
                    boolean isInterim = firstResult.has("is_interim") ? firstResult.get("is_interim").asBoolean() : false;
                    
                    AudioResponse response = new AudioResponse();
                    response.setProvider("doubao");
                    response.setModel(model);
                    response.setContent(text);
                    response.setIsPartial(isInterim);
                    response.setStreamId(sessionId);
                    
                    log.debug("[RealtimeAsrWebSocketClient] ASR 识别结果: text={}, isPartial={}", text, isInterim);
                    handler.handle(response, false);
                }
            }
        } catch (Exception e) {
            log.error("[RealtimeAsrWebSocketClient] 解析 ASR 响应失败", e);
        }
    }
    
    /**
     * 解析错误响应
     */
    private void parseErrorResponse(byte[] payload) {
        try {
            String jsonStr = new String(payload, "UTF-8");
            JsonNode json = objectMapper.readTree(jsonStr);
            
            String errorMsg = json.has("error") ? json.get("error").asText() : 
                             (json.has("message") ? json.get("message").asText() : "未知错误");
            
            log.error("[RealtimeAsrWebSocketClient] 服务端错误: {}", errorMsg);
            handler.handle(null, true);
        } catch (Exception e) {
            log.error("[RealtimeAsrWebSocketClient] 解析错误响应失败", e);
            handler.handle(null, true);
        }
    }
    
    /**
     * 发送初始音频数据
     */
    private void sendInitialAudio() {
        try {
            String audioDataStr = request.getAudioData();
            if (audioDataStr.startsWith("data:")) {
                int commaIndex = audioDataStr.indexOf(',');
                if (commaIndex > 0) {
                    audioDataStr = audioDataStr.substring(commaIndex + 1);
                }
            }
            
            byte[] audioBytes = Base64.getDecoder().decode(audioDataStr);
            sendAudioChunk(audioBytes, Boolean.TRUE.equals(request.getEndOfStream()));
        } catch (Exception e) {
            log.error("[RealtimeAsrWebSocketClient] 发送初始音频失败", e);
        }
    }
    
    /**
     * 将 int 转换为 4 字节数组（大端序）
     */
    private byte[] intToBytes(int value) {
        ByteBuffer buffer = ByteBuffer.allocate(4);
        buffer.order(ByteOrder.BIG_ENDIAN);
        buffer.putInt(value);
        return buffer.array();
    }
}
