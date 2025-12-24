package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.AIUsageRecord;
import com.heartsphere.billing.repository.AIUsageRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * UsageRecordService单元测试
 */
@ExtendWith(MockitoExtension.class)
class UsageRecordServiceTest {

    @Mock
    private AIUsageRecordRepository usageRecordRepository;

    @InjectMocks
    private UsageRecordService usageRecordService;

    private Long userId;
    private Long providerId;
    private Long modelId;

    @BeforeEach
    void setUp() {
        userId = 1L;
        providerId = 1L;
        modelId = 1L;
    }

    @Test
    void testRecordUsage() {
        // Given
        ArgumentCaptor<AIUsageRecord> recordCaptor = ArgumentCaptor.forClass(AIUsageRecord.class);
        when(usageRecordRepository.save(any(AIUsageRecord.class)))
            .thenAnswer(invocation -> {
                AIUsageRecord record = invocation.getArgument(0);
                record.setId(1L);
                return record;
            });

        // When
        usageRecordService.recordUsage(
            userId, providerId, modelId, "text_generation",
            100, 200, 300,
            null, null, null,
            new BigDecimal("0.05"), 300L,
            "success", null
        );

        // Then
        verify(usageRecordRepository).save(recordCaptor.capture());
        AIUsageRecord record = recordCaptor.getValue();
        
        assertEquals(userId, record.getUserId());
        assertEquals(providerId, record.getProviderId());
        assertEquals(modelId, record.getModelId());
        assertEquals("text_generation", record.getUsageType());
        assertEquals(100, record.getInputTokens());
        assertEquals(200, record.getOutputTokens());
        assertEquals(300, record.getTotalTokens());
        assertEquals(0, new BigDecimal("0.05").compareTo(record.getCostAmount()));
        assertEquals(300L, record.getTokenConsumed());
        assertEquals("success", record.getStatus());
        assertNotNull(record.getRequestId());
    }

    @Test
    void testRecordTextGeneration_Success() {
        // Given
        when(usageRecordRepository.save(any(AIUsageRecord.class)))
            .thenAnswer(invocation -> {
                AIUsageRecord record = invocation.getArgument(0);
                record.setId(1L);
                return record;
            });

        ArgumentCaptor<AIUsageRecord> recordCaptor = ArgumentCaptor.forClass(AIUsageRecord.class);

        // When
        usageRecordService.recordTextGeneration(
            userId, providerId, modelId,
            100, 200, 300,
            new BigDecimal("0.05"), 300L,
            true, null
        );

        // Then
        verify(usageRecordRepository).save(recordCaptor.capture());
        AIUsageRecord record = recordCaptor.getValue();
        
        assertEquals("text_generation", record.getUsageType());
        assertEquals(100, record.getInputTokens());
        assertEquals(200, record.getOutputTokens());
        assertEquals(300, record.getTotalTokens());
        assertEquals("success", record.getStatus());
    }

    @Test
    void testRecordTextGeneration_Failed() {
        // Given
        when(usageRecordRepository.save(any(AIUsageRecord.class)))
            .thenAnswer(invocation -> {
                AIUsageRecord record = invocation.getArgument(0);
                record.setId(1L);
                return record;
            });

        ArgumentCaptor<AIUsageRecord> recordCaptor = ArgumentCaptor.forClass(AIUsageRecord.class);

        // When
        usageRecordService.recordTextGeneration(
            userId, providerId, modelId,
            100, 0, 100,
            BigDecimal.ZERO, 0L,
            false, "API调用失败"
        );

        // Then
        verify(usageRecordRepository).save(recordCaptor.capture());
        AIUsageRecord record = recordCaptor.getValue();
        
        assertEquals("failed", record.getStatus());
        assertEquals("API调用失败", record.getErrorMessage());
    }

    @Test
    void testRecordImageGeneration() {
        // Given
        when(usageRecordRepository.save(any(AIUsageRecord.class)))
            .thenAnswer(invocation -> {
                AIUsageRecord record = invocation.getArgument(0);
                record.setId(1L);
                return record;
            });

        ArgumentCaptor<AIUsageRecord> recordCaptor = ArgumentCaptor.forClass(AIUsageRecord.class);

        // When
        usageRecordService.recordImageGeneration(
            userId, providerId, modelId,
            3,
            new BigDecimal("1.5"), 3L,
            true, null
        );

        // Then
        verify(usageRecordRepository).save(recordCaptor.capture());
        AIUsageRecord record = recordCaptor.getValue();
        
        assertEquals("image_generation", record.getUsageType());
        assertEquals(3, record.getImageCount());
        assertEquals(0, new BigDecimal("1.5").compareTo(record.getCostAmount()));
        assertEquals(3L, record.getTokenConsumed());
    }

    @Test
    void testRecordAudioProcessing_TTS() {
        // Given
        when(usageRecordRepository.save(any(AIUsageRecord.class)))
            .thenAnswer(invocation -> {
                AIUsageRecord record = invocation.getArgument(0);
                record.setId(1L);
                return record;
            });

        ArgumentCaptor<AIUsageRecord> recordCaptor = ArgumentCaptor.forClass(AIUsageRecord.class);

        // When
        usageRecordService.recordAudioProcessing(
            userId, providerId, modelId, "audio_tts",
            60,
            new BigDecimal("0.1"), 1L,
            true, null
        );

        // Then
        verify(usageRecordRepository).save(recordCaptor.capture());
        AIUsageRecord record = recordCaptor.getValue();
        
        assertEquals("audio_tts", record.getUsageType());
        assertEquals(60, record.getAudioDuration());
    }

    @Test
    void testRecordAudioProcessing_STT() {
        // Given
        when(usageRecordRepository.save(any(AIUsageRecord.class)))
            .thenAnswer(invocation -> {
                AIUsageRecord record = invocation.getArgument(0);
                record.setId(1L);
                return record;
            });

        ArgumentCaptor<AIUsageRecord> recordCaptor = ArgumentCaptor.forClass(AIUsageRecord.class);

        // When
        usageRecordService.recordAudioProcessing(
            userId, providerId, modelId, "audio_stt",
            120,
            new BigDecimal("0.2"), 1L,
            true, null
        );

        // Then
        verify(usageRecordRepository).save(recordCaptor.capture());
        AIUsageRecord record = recordCaptor.getValue();
        
        assertEquals("audio_stt", record.getUsageType());
        assertEquals(120, record.getAudioDuration());
    }

    @Test
    void testRecordVideoGeneration() {
        // Given
        when(usageRecordRepository.save(any(AIUsageRecord.class)))
            .thenAnswer(invocation -> {
                AIUsageRecord record = invocation.getArgument(0);
                record.setId(1L);
                return record;
            });

        ArgumentCaptor<AIUsageRecord> recordCaptor = ArgumentCaptor.forClass(AIUsageRecord.class);

        // When
        usageRecordService.recordVideoGeneration(
            userId, providerId, modelId,
            30,
            new BigDecimal("0.6"), 10L,
            true, null
        );

        // Then
        verify(usageRecordRepository).save(recordCaptor.capture());
        AIUsageRecord record = recordCaptor.getValue();
        
        assertEquals("video_generation", record.getUsageType());
        assertEquals(30, record.getVideoDuration());
        assertEquals(0, new BigDecimal("0.6").compareTo(record.getCostAmount()));
        assertEquals(10L, record.getTokenConsumed());
    }
}

