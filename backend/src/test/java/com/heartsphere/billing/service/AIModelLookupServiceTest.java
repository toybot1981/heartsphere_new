package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.AIModel;
import com.heartsphere.billing.entity.AIProvider;
import com.heartsphere.billing.repository.AIModelRepository;
import com.heartsphere.billing.repository.AIProviderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * AIModelLookupService单元测试
 */
@ExtendWith(MockitoExtension.class)
class AIModelLookupServiceTest {

    @Mock
    private AIProviderRepository providerRepository;

    @Mock
    private AIModelRepository modelRepository;

    @InjectMocks
    private AIModelLookupService modelLookupService;

    private AIProvider provider;
    private AIModel model;
    private String providerName;
    private String modelCode;

    @BeforeEach
    void setUp() {
        providerName = "dashscope";
        modelCode = "qwen-max";

        provider = new AIProvider();
        provider.setId(1L);
        provider.setName(providerName);
        provider.setDisplayName("阿里云通义千问");
        provider.setEnabled(true);

        model = new AIModel();
        model.setId(1L);
        model.setProviderId(provider.getId());
        model.setModelCode(modelCode);
        model.setModelName("通义千问-Max");
        model.setModelType("text");
        model.setEnabled(true);
    }

    @Test
    void testFindModelId_Success() {
        // Given
        when(providerRepository.findByName(providerName))
            .thenReturn(Optional.of(provider));
        when(modelRepository.findByProviderIdAndModelCode(provider.getId(), modelCode))
            .thenReturn(Optional.of(model));

        // When
        Optional<Long> result = modelLookupService.findModelId(providerName, modelCode);

        // Then
        assertTrue(result.isPresent());
        assertEquals(model.getId(), result.get());
        verify(providerRepository).findByName(providerName);
        verify(modelRepository).findByProviderIdAndModelCode(provider.getId(), modelCode);
    }

    @Test
    void testFindModelId_ProviderNotFound() {
        // Given
        when(providerRepository.findByName(providerName))
            .thenReturn(Optional.empty());

        // When
        Optional<Long> result = modelLookupService.findModelId(providerName, modelCode);

        // Then
        assertFalse(result.isPresent());
        verify(modelRepository, never()).findByProviderIdAndModelCode(any(), any());
    }

    @Test
    void testFindModelId_ModelNotFound() {
        // Given
        when(providerRepository.findByName(providerName))
            .thenReturn(Optional.of(provider));
        when(modelRepository.findByProviderIdAndModelCode(provider.getId(), modelCode))
            .thenReturn(Optional.empty());

        // When
        Optional<Long> result = modelLookupService.findModelId(providerName, modelCode);

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void testFindModelId_NullProvider() {
        // When
        Optional<Long> result = modelLookupService.findModelId(null, modelCode);

        // Then
        assertFalse(result.isPresent());
        verify(providerRepository, never()).findByName(any());
    }

    @Test
    void testFindModelId_NullModelCode() {
        // When
        Optional<Long> result = modelLookupService.findModelId(providerName, null);

        // Then
        assertFalse(result.isPresent());
        verify(providerRepository, never()).findByName(any());
    }

    @Test
    void testFindProviderId_Success() {
        // Given
        when(providerRepository.findByName(providerName))
            .thenReturn(Optional.of(provider));

        // When
        Optional<Long> result = modelLookupService.findProviderId(providerName);

        // Then
        assertTrue(result.isPresent());
        assertEquals(provider.getId(), result.get());
    }

    @Test
    void testFindProviderId_NotFound() {
        // Given
        when(providerRepository.findByName(providerName))
            .thenReturn(Optional.empty());

        // When
        Optional<Long> result = modelLookupService.findProviderId(providerName);

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void testFindOrCreateProvider_WhenExists() {
        // Given
        when(providerRepository.findByName(providerName))
            .thenReturn(Optional.of(provider));

        // When
        AIProvider result = modelLookupService.findOrCreateProvider(providerName, "显示名称");

        // Then
        assertNotNull(result);
        assertEquals(provider.getId(), result.getId());
        verify(providerRepository, never()).save(any());
    }

    @Test
    void testFindOrCreateProvider_WhenNotExists() {
        // Given
        when(providerRepository.findByName(providerName))
            .thenReturn(Optional.empty());
        when(providerRepository.save(any(AIProvider.class)))
            .thenAnswer(invocation -> {
                AIProvider p = invocation.getArgument(0);
                p.setId(2L);
                return p;
            });

        // When
        AIProvider result = modelLookupService.findOrCreateProvider(providerName, "显示名称");

        // Then
        assertNotNull(result);
        assertEquals(providerName, result.getName());
        assertEquals("显示名称", result.getDisplayName());
        assertTrue(result.getEnabled());
        verify(providerRepository).save(any(AIProvider.class));
    }

    @Test
    void testFindOrCreateProvider_DefaultDisplayName() {
        // Given
        when(providerRepository.findByName(providerName))
            .thenReturn(Optional.empty());
        when(providerRepository.save(any(AIProvider.class)))
            .thenAnswer(invocation -> {
                AIProvider p = invocation.getArgument(0);
                p.setId(2L);
                return p;
            });

        // When
        AIProvider result = modelLookupService.findOrCreateProvider(providerName, null);

        // Then
        assertNotNull(result);
        assertEquals(providerName, result.getDisplayName());
    }

    @Test
    void testFindOrCreateModel_WhenExists() {
        // Given
        when(modelRepository.findByProviderIdAndModelCode(provider.getId(), modelCode))
            .thenReturn(Optional.of(model));

        // When
        AIModel result = modelLookupService.findOrCreateModel(provider.getId(), modelCode, "模型名称", "text");

        // Then
        assertNotNull(result);
        assertEquals(model.getId(), result.getId());
        verify(modelRepository, never()).save(any());
    }

    @Test
    void testFindOrCreateModel_WhenNotExists() {
        // Given
        when(modelRepository.findByProviderIdAndModelCode(provider.getId(), modelCode))
            .thenReturn(Optional.empty());
        when(modelRepository.save(any(AIModel.class)))
            .thenAnswer(invocation -> {
                AIModel m = invocation.getArgument(0);
                m.setId(2L);
                return m;
            });

        // When
        AIModel result = modelLookupService.findOrCreateModel(provider.getId(), modelCode, "模型名称", "text");

        // Then
        assertNotNull(result);
        assertEquals(provider.getId(), result.getProviderId());
        assertEquals(modelCode, result.getModelCode());
        assertEquals("模型名称", result.getModelName());
        assertEquals("text", result.getModelType());
        assertTrue(result.getEnabled());
        verify(modelRepository).save(any(AIModel.class));
    }

    @Test
    void testFindOrCreateModel_DefaultModelName() {
        // Given
        when(modelRepository.findByProviderIdAndModelCode(provider.getId(), modelCode))
            .thenReturn(Optional.empty());
        when(modelRepository.save(any(AIModel.class)))
            .thenAnswer(invocation -> {
                AIModel m = invocation.getArgument(0);
                m.setId(2L);
                return m;
            });

        // When
        AIModel result = modelLookupService.findOrCreateModel(provider.getId(), modelCode, null, "text");

        // Then
        assertNotNull(result);
        assertEquals(modelCode, result.getModelName());
    }

    @Test
    void testFindOrCreateModel_DefaultModelType() {
        // Given
        when(modelRepository.findByProviderIdAndModelCode(provider.getId(), modelCode))
            .thenReturn(Optional.empty());
        when(modelRepository.save(any(AIModel.class)))
            .thenAnswer(invocation -> {
                AIModel m = invocation.getArgument(0);
                m.setId(2L);
                return m;
            });

        // When
        AIModel result = modelLookupService.findOrCreateModel(provider.getId(), modelCode, "模型名称", null);

        // Then
        assertNotNull(result);
        assertEquals("text", result.getModelType());
    }
}

