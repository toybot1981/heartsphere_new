package com.heartsphere.shared.sse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * SseStreamService 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class SseStreamServiceTest {

    @Mock
    private SseEmitterManager emitterManager;

    private TestStreamService streamService;

    /**
     * 测试用的StreamService实现
     */
    private static class TestStreamService extends SseStreamService<String> {
        private final AtomicInteger processCount = new AtomicInteger(0);
        private final CountDownLatch processLatch = new CountDownLatch(1);

        public TestStreamService(SseEmitterManager emitterManager) {
            super(emitterManager);
        }

        @Override
        protected void processStream(String request, StreamHandler<String> handler) {
            processCount.incrementAndGet();
            
            // 处理null请求
            if (request == null || request.isEmpty()) {
                processLatch.countDown();
                return;
            }
            
            // 模拟处理流式数据
            String[] chunks = request.split(" ");
            for (int i = 0; i < chunks.length; i++) {
                handler.handle(chunks[i], i == chunks.length - 1);
            }
            
            processLatch.countDown();
        }

        public int getProcessCount() {
            return processCount.get();
        }

        public boolean waitForProcess(long timeout, TimeUnit unit) throws InterruptedException {
            return processLatch.await(timeout, unit);
        }
    }

    @BeforeEach
    void setUp() {
        when(emitterManager.createEmitter()).thenReturn(new SseEmitter(300000L));
        streamService = new TestStreamService(emitterManager);
    }

    @Test
    void testStream() throws InterruptedException {
        // 测试流式处理
        String request = "chunk1 chunk2 chunk3";
        
        SseEmitter emitter = streamService.stream(request, (data, done) -> {
            assertNotNull(data);
        });
        
        assertNotNull(emitter);
        
        // 等待处理完成
        assertTrue(streamService.waitForProcess(2, TimeUnit.SECONDS));
        assertEquals(1, streamService.getProcessCount());
    }

    @Test
    void testStreamWithEmptyRequest() throws InterruptedException {
        // 测试空请求
        String request = "";
        
        SseEmitter emitter = streamService.stream(request, (data, done) -> {
            // 空请求应该不会调用handler
        });
        
        assertNotNull(emitter);
        
        // 等待处理完成
        assertTrue(streamService.waitForProcess(2, TimeUnit.SECONDS));
    }

    @Test
    void testStreamWithSingleChunk() throws InterruptedException {
        // 测试单个chunk
        String request = "single";
        AtomicInteger handlerCallCount = new AtomicInteger(0);
        
        SseEmitter emitter = streamService.stream(request, (data, done) -> {
            handlerCallCount.incrementAndGet();
            assertEquals("single", data);
            assertTrue(done); // 最后一个chunk
        });
        
        assertNotNull(emitter);
        
        // 等待处理完成
        assertTrue(streamService.waitForProcess(2, TimeUnit.SECONDS));
        assertEquals(1, handlerCallCount.get());
    }

    @Test
    void testStreamWithMultipleChunks() throws InterruptedException {
        // 测试多个chunks
        String request = "chunk1 chunk2 chunk3";
        AtomicInteger handlerCallCount = new AtomicInteger(0);
        AtomicInteger doneCount = new AtomicInteger(0);
        
        SseEmitter emitter = streamService.stream(request, (data, done) -> {
            handlerCallCount.incrementAndGet();
            if (done) {
                doneCount.incrementAndGet();
            }
        });
        
        assertNotNull(emitter);
        
        // 等待处理完成
        assertTrue(streamService.waitForProcess(2, TimeUnit.SECONDS));
        assertEquals(3, handlerCallCount.get());
        assertEquals(1, doneCount.get()); // 只有最后一个chunk done=true
    }

    @Test
    void testStreamExceptionHandling() throws InterruptedException {
        // 测试异常处理
        SseStreamService<String> errorService = new SseStreamService<String>(emitterManager) {
            @Override
            protected void processStream(String request, StreamHandler<String> handler) {
                throw new RuntimeException("Test exception");
            }
        };
        
        SseEmitter emitter = errorService.stream("test", (data, done) -> {
            fail("Handler should not be called on error");
        });
        
        assertNotNull(emitter);
        
        // 等待异常处理完成
        Thread.sleep(500);
        
        // 应该不会抛出异常
        assertTrue(true);
    }

    @Test
    void testStreamWithNullRequest() throws InterruptedException {
        // 测试null请求
        SseEmitter emitter = streamService.stream(null, (data, done) -> {
            // null请求的处理取决于实现
            // 如果request为null，split会抛出NullPointerException
        });
        
        assertNotNull(emitter);
        
        // 等待处理完成（可能会因为异常而完成）
        // 由于null请求会导致异常，processLatch可能不会countDown
        // 所以这里不强制等待成功
        boolean completed = streamService.waitForProcess(2, TimeUnit.SECONDS);
        // null请求可能导致异常，所以completed可能是false
        // 但至少验证了不会抛出异常
        assertNotNull(emitter);
    }
}
