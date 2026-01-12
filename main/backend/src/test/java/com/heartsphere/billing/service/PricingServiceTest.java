package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.AIModelPricing;
import com.heartsphere.billing.exception.PricingNotFoundException;
import com.heartsphere.billing.repository.AIModelPricingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * PricingService单元测试
 */
@ExtendWith(MockitoExtension.class)
class PricingServiceTest {

    @Mock
    private AIModelPricingRepository pricingRepository;

    @InjectMocks
    private PricingService pricingService;

    private Long modelId;
    private AIModelPricing inputTokenPricing;
    private AIModelPricing outputTokenPricing;
    private AIModelPricing imagePricing;
    private AIModelPricing audioPricing;
    private AIModelPricing videoPricing;

    @BeforeEach
    void setUp() {
        modelId = 1L;
        LocalDateTime now = LocalDateTime.now();

        // 输入Token资费配置
        inputTokenPricing = new AIModelPricing();
        inputTokenPricing.setId(1L);
        inputTokenPricing.setModelId(modelId);
        inputTokenPricing.setPricingType("input_token");
        inputTokenPricing.setUnitPrice(new BigDecimal("0.002")); // 每千Token 0.002元
        inputTokenPricing.setUnit("per_1k_tokens");
        inputTokenPricing.setMinChargeUnit(BigDecimal.ZERO);
        inputTokenPricing.setEffectiveDate(now.minusDays(1));
        inputTokenPricing.setIsActive(true);

        // 输出Token资费配置
        outputTokenPricing = new AIModelPricing();
        outputTokenPricing.setId(2L);
        outputTokenPricing.setModelId(modelId);
        outputTokenPricing.setPricingType("output_token");
        outputTokenPricing.setUnitPrice(new BigDecimal("0.008")); // 每千Token 0.008元
        outputTokenPricing.setUnit("per_1k_tokens");
        outputTokenPricing.setMinChargeUnit(BigDecimal.ZERO);
        outputTokenPricing.setEffectiveDate(now.minusDays(1));
        outputTokenPricing.setIsActive(true);

        // 图片生成资费配置
        imagePricing = new AIModelPricing();
        imagePricing.setId(3L);
        imagePricing.setModelId(modelId);
        imagePricing.setPricingType("image");
        imagePricing.setUnitPrice(new BigDecimal("0.5")); // 每张图片0.5元
        imagePricing.setUnit("per_image");
        imagePricing.setMinChargeUnit(BigDecimal.ZERO);
        imagePricing.setEffectiveDate(now.minusDays(1));
        imagePricing.setIsActive(true);

        // 音频处理资费配置
        audioPricing = new AIModelPricing();
        audioPricing.setId(4L);
        audioPricing.setModelId(modelId);
        audioPricing.setPricingType("audio_minute");
        audioPricing.setUnitPrice(new BigDecimal("0.1")); // 每分钟0.1元
        audioPricing.setUnit("per_minute");
        audioPricing.setMinChargeUnit(BigDecimal.ZERO);
        audioPricing.setEffectiveDate(now.minusDays(1));
        audioPricing.setIsActive(true);

        // 视频生成资费配置
        videoPricing = new AIModelPricing();
        videoPricing.setId(5L);
        videoPricing.setModelId(modelId);
        videoPricing.setPricingType("video_second");
        videoPricing.setUnitPrice(new BigDecimal("0.02")); // 每秒0.02元
        videoPricing.setUnit("per_second");
        videoPricing.setMinChargeUnit(BigDecimal.ZERO);
        videoPricing.setEffectiveDate(now.minusDays(1));
        videoPricing.setIsActive(true);
    }

    @Test
    void testGetPricing_Success() {
        // Given
        when(pricingRepository.findActivePricing(eq(modelId), eq("input_token"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(inputTokenPricing));

        // When
        AIModelPricing result = pricingService.getPricing(modelId, "input_token");

        // Then
        assertNotNull(result);
        assertEquals(inputTokenPricing.getId(), result.getId());
        assertEquals("input_token", result.getPricingType());
        verify(pricingRepository).findActivePricing(eq(modelId), eq("input_token"), any(LocalDateTime.class));
    }

    @Test
    void testGetPricing_NotFound_ShouldThrowException() {
        // Given
        when(pricingRepository.findActivePricing(eq(modelId), eq("input_token"), any(LocalDateTime.class)))
            .thenReturn(Optional.empty());

        // When & Then
        assertThrows(PricingNotFoundException.class, () -> {
            pricingService.getPricing(modelId, "input_token");
        });
    }

    @Test
    void testCalculateTextGenerationCost_WithInputAndOutput() {
        // Given
        when(pricingRepository.findActivePricing(eq(modelId), eq("input_token"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(inputTokenPricing));
        when(pricingRepository.findActivePricing(eq(modelId), eq("output_token"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(outputTokenPricing));

        // When
        BigDecimal cost = pricingService.calculateTextGenerationCost(modelId, 1000, 2000);

        // Then
        // 输入：1 * 0.002 = 0.002
        // 输出：2 * 0.008 = 0.016
        // 总计：0.018
        assertEquals(0, new BigDecimal("0.018").compareTo(cost));
    }

    @Test
    void testCalculateTextGenerationCost_WithInputOnly() {
        // Given
        when(pricingRepository.findActivePricing(eq(modelId), eq("input_token"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(inputTokenPricing));

        // When
        BigDecimal cost = pricingService.calculateTextGenerationCost(modelId, 1000, null);

        // Then
        // 输入：1 * 0.002 = 0.002
        assertEquals(0, new BigDecimal("0.002").compareTo(cost));
    }

    @Test
    void testCalculateTextGenerationCost_WithOutputOnly() {
        // Given
        when(pricingRepository.findActivePricing(eq(modelId), eq("output_token"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(outputTokenPricing));

        // When
        BigDecimal cost = pricingService.calculateTextGenerationCost(modelId, null, 1000);

        // Then
        // 输出：1 * 0.008 = 0.008
        assertEquals(0, new BigDecimal("0.008").compareTo(cost));
    }

    @Test
    void testCalculateTextGenerationCost_WithMinCharge() {
        // Given
        inputTokenPricing.setMinChargeUnit(new BigDecimal("1")); // 最低计费1千Token
        when(pricingRepository.findActivePricing(eq(modelId), eq("input_token"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(inputTokenPricing));
        when(pricingRepository.findActivePricing(eq(modelId), eq("output_token"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(outputTokenPricing));

        // When
        BigDecimal cost = pricingService.calculateTextGenerationCost(modelId, 500, 500);

        // Then
        // 输入：1 * 0.002 = 0.002 (按最低计费单位)
        // 输出：0.5 * 0.008 = 0.004
        // 总计：0.006
        assertTrue(cost.compareTo(new BigDecimal("0.006")) >= 0);
    }

    @Test
    void testCalculateImageGenerationCost() {
        // Given
        when(pricingRepository.findActivePricing(eq(modelId), eq("image"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(imagePricing));

        // When
        BigDecimal cost = pricingService.calculateImageGenerationCost(modelId, 3);

        // Then
        // 3 * 0.5 = 1.5
        assertEquals(0, new BigDecimal("1.5").compareTo(cost));
    }

    @Test
    void testCalculateImageGenerationCost_ZeroCount() {
        // Given

        // When
        BigDecimal cost = pricingService.calculateImageGenerationCost(modelId, 0);

        // Then
        assertEquals(0, BigDecimal.ZERO.compareTo(cost));
        verify(pricingRepository, never()).findActivePricing(any(), any(), any());
    }

    @Test
    void testCalculateAudioCost() {
        // Given
        when(pricingRepository.findActivePricing(eq(modelId), eq("audio_minute"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(audioPricing));

        // When
        BigDecimal cost = pricingService.calculateAudioCost(modelId, 120); // 120秒 = 2分钟

        // Then
        // 2 * 0.1 = 0.2
        assertEquals(0, new BigDecimal("0.2").compareTo(cost));
    }

    @Test
    void testCalculateAudioCost_RoundUp() {
        // Given
        when(pricingRepository.findActivePricing(eq(modelId), eq("audio_minute"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(audioPricing));

        // When
        BigDecimal cost = pricingService.calculateAudioCost(modelId, 90); // 90秒 = 1.5分钟，向上取整为2分钟

        // Then
        // 2 * 0.1 = 0.2
        assertEquals(0, new BigDecimal("0.2").compareTo(cost));
    }

    @Test
    void testCalculateVideoCost() {
        // Given
        when(pricingRepository.findActivePricing(eq(modelId), eq("video_second"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(videoPricing));

        // When
        BigDecimal cost = pricingService.calculateVideoCost(modelId, 30);

        // Then
        // 30 * 0.02 = 0.6
        assertEquals(0, new BigDecimal("0.6").compareTo(cost));
    }

    @Test
    void testCalculateCost_TextGeneration() {
        // Given
        when(pricingRepository.findActivePricing(eq(modelId), eq("input_token"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(inputTokenPricing));
        when(pricingRepository.findActivePricing(eq(modelId), eq("output_token"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(outputTokenPricing));

        Map<String, Object> usageData = Map.of(
            "inputTokens", 1000,
            "outputTokens", 2000
        );

        // When
        BigDecimal cost = pricingService.calculateCost(modelId, "text_generation", usageData);

        // Then
        assertTrue(cost.compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testCalculateCost_ImageGeneration() {
        // Given
        when(pricingRepository.findActivePricing(eq(modelId), eq("image"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(imagePricing));

        Map<String, Object> usageData = Map.of("imageCount", 2);

        // When
        BigDecimal cost = pricingService.calculateCost(modelId, "image_generation", usageData);

        // Then
        // 2 * 0.5 = 1.0
        assertEquals(0, new BigDecimal("1.0").compareTo(cost));
    }

    @Test
    void testCalculateCost_AudioTTS() {
        // Given
        when(pricingRepository.findActivePricing(eq(modelId), eq("audio_minute"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(audioPricing));

        Map<String, Object> usageData = Map.of("audioDuration", 60);

        // When
        BigDecimal cost = pricingService.calculateCost(modelId, "audio_tts", usageData);

        // Then
        assertTrue(cost.compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testCalculateCost_VideoGeneration() {
        // Given
        when(pricingRepository.findActivePricing(eq(modelId), eq("video_second"), any(LocalDateTime.class)))
            .thenReturn(Optional.of(videoPricing));

        Map<String, Object> usageData = Map.of("videoDuration", 30);

        // When
        BigDecimal cost = pricingService.calculateCost(modelId, "video_generation", usageData);

        // Then
        assertTrue(cost.compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testCalculateCost_UnknownUsageType() {
        // Given
        Map<String, Object> usageData = Map.of();

        // When
        BigDecimal cost = pricingService.calculateCost(modelId, "unknown_type", usageData);

        // Then
        assertEquals(0, BigDecimal.ZERO.compareTo(cost));
    }
}

