package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.TokenQuotaTransaction;
import com.heartsphere.billing.entity.UserTokenQuota;
import com.heartsphere.billing.repository.TokenQuotaTransactionRepository;
import com.heartsphere.billing.repository.UserTokenQuotaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * TokenQuotaService单元测试
 */
@ExtendWith(MockitoExtension.class)
class TokenQuotaServiceTest {

    @Mock
    private UserTokenQuotaRepository quotaRepository;

    @Mock
    private TokenQuotaTransactionRepository transactionRepository;

    @InjectMocks
    private TokenQuotaService tokenQuotaService;

    private Long userId;
    private UserTokenQuota existingQuota;

    @BeforeEach
    void setUp() {
        userId = 1L;
        
        existingQuota = new UserTokenQuota();
        existingQuota.setId(1L);
        existingQuota.setUserId(userId);
        existingQuota.setTextTokenTotal(10000L);
        existingQuota.setTextTokenUsed(0L);
        existingQuota.setTextTokenMonthlyQuota(5000L);
        existingQuota.setTextTokenMonthlyUsed(0L);
        existingQuota.setImageQuotaTotal(100);
        existingQuota.setImageQuotaUsed(0);
        existingQuota.setImageQuotaMonthly(50);
        existingQuota.setImageQuotaMonthlyUsed(0);
        existingQuota.setLastResetDate(LocalDate.now());
    }

    @Test
    void testGetUserQuota_WhenExists() {
        // Given
        when(quotaRepository.findByUserId(userId))
            .thenReturn(Optional.of(existingQuota));

        // When
        UserTokenQuota result = tokenQuotaService.getUserQuota(userId);

        // Then
        assertNotNull(result);
        assertEquals(existingQuota.getId(), result.getId());
        verify(quotaRepository).findByUserId(userId);
    }

    @Test
    void testGetUserQuota_WhenNotExists_ShouldCreate() {
        // Given
        when(quotaRepository.findByUserId(userId))
            .thenReturn(Optional.empty());
        when(quotaRepository.save(any(UserTokenQuota.class)))
            .thenAnswer(invocation -> {
                UserTokenQuota q = invocation.getArgument(0);
                q.setId(1L);
                return q;
            });

        // When
        UserTokenQuota result = tokenQuotaService.getUserQuota(userId);

        // Then
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        verify(quotaRepository).save(any(UserTokenQuota.class));
    }

    @Test
    void testHasEnoughQuota_TextToken_WithEnough() {
        // Given
        when(quotaRepository.findByUserId(userId))
            .thenReturn(Optional.of(existingQuota));

        // When
        boolean result = tokenQuotaService.hasEnoughQuota(userId, "text_token", 3000L);

        // Then
        assertTrue(result);
    }

    @Test
    void testHasEnoughQuota_TextToken_NotEnough() {
        // Given
        when(quotaRepository.findByUserId(userId))
            .thenReturn(Optional.of(existingQuota));

        // When
        boolean result = tokenQuotaService.hasEnoughQuota(userId, "text_token", 20000L);

        // Then
        assertFalse(result);
    }

    @Test
    void testHasEnoughQuota_Image_WithEnough() {
        // Given
        when(quotaRepository.findByUserId(userId))
            .thenReturn(Optional.of(existingQuota));

        // When
        boolean result = tokenQuotaService.hasEnoughQuota(userId, "image", 30L);

        // Then
        assertTrue(result);
    }

    @Test
    void testConsumeQuota_TextToken_Success_UseMonthlyQuota() {
        // Given
        UserTokenQuota lockedQuota = new UserTokenQuota();
        lockedQuota.setId(existingQuota.getId());
        lockedQuota.setUserId(userId);
        lockedQuota.setTextTokenTotal(10000L);
        lockedQuota.setTextTokenUsed(0L);
        lockedQuota.setTextTokenMonthlyQuota(5000L);
        lockedQuota.setTextTokenMonthlyUsed(0L);

        when(quotaRepository.findByUserIdForUpdate(userId))
            .thenReturn(Optional.of(lockedQuota));
        when(quotaRepository.save(any(UserTokenQuota.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(TokenQuotaTransaction.class)))
            .thenAnswer(invocation -> {
                TokenQuotaTransaction t = invocation.getArgument(0);
                t.setId(1L);
                return t;
            });

        // When
        boolean result = tokenQuotaService.consumeQuota(userId, "text_token", 3000L);

        // Then
        assertTrue(result);
        assertEquals(3000L, lockedQuota.getTextTokenMonthlyUsed());
        assertEquals(0L, lockedQuota.getTextTokenUsed());
        verify(quotaRepository).save(any(UserTokenQuota.class));
        verify(transactionRepository).save(any(TokenQuotaTransaction.class));
    }

    @Test
    void testConsumeQuota_TextToken_Success_UseBothQuota() {
        // Given
        UserTokenQuota lockedQuota = new UserTokenQuota();
        lockedQuota.setId(existingQuota.getId());
        lockedQuota.setUserId(userId);
        lockedQuota.setTextTokenTotal(10000L);
        lockedQuota.setTextTokenUsed(0L);
        lockedQuota.setTextTokenMonthlyQuota(2000L);
        lockedQuota.setTextTokenMonthlyUsed(0L);

        when(quotaRepository.findByUserIdForUpdate(userId))
            .thenReturn(Optional.of(lockedQuota));
        when(quotaRepository.save(any(UserTokenQuota.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(TokenQuotaTransaction.class)))
            .thenAnswer(invocation -> {
                TokenQuotaTransaction t = invocation.getArgument(0);
                t.setId(1L);
                return t;
            });

        // When
        boolean result = tokenQuotaService.consumeQuota(userId, "text_token", 3000L);

        // Then
        assertTrue(result);
        assertEquals(2000L, lockedQuota.getTextTokenMonthlyUsed());
        assertEquals(1000L, lockedQuota.getTextTokenUsed());
        verify(quotaRepository).save(any(UserTokenQuota.class));
    }

    @Test
    void testConsumeQuota_TextToken_Insufficient() {
        // Given
        UserTokenQuota lockedQuota = new UserTokenQuota();
        lockedQuota.setId(existingQuota.getId());
        lockedQuota.setUserId(userId);
        lockedQuota.setTextTokenTotal(1000L);
        lockedQuota.setTextTokenUsed(0L);
        lockedQuota.setTextTokenMonthlyQuota(500L);
        lockedQuota.setTextTokenMonthlyUsed(0L);

        when(quotaRepository.findByUserIdForUpdate(userId))
            .thenReturn(Optional.of(lockedQuota));

        // When
        boolean result = tokenQuotaService.consumeQuota(userId, "text_token", 2000L);

        // Then
        assertFalse(result);
        verify(quotaRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void testConsumeQuota_Image_Success() {
        // Given
        UserTokenQuota lockedQuota = new UserTokenQuota();
        lockedQuota.setId(existingQuota.getId());
        lockedQuota.setUserId(userId);
        lockedQuota.setImageQuotaTotal(100);
        lockedQuota.setImageQuotaUsed(0);
        lockedQuota.setImageQuotaMonthly(50);
        lockedQuota.setImageQuotaMonthlyUsed(0);

        when(quotaRepository.findByUserIdForUpdate(userId))
            .thenReturn(Optional.of(lockedQuota));
        when(quotaRepository.save(any(UserTokenQuota.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(TokenQuotaTransaction.class)))
            .thenAnswer(invocation -> {
                TokenQuotaTransaction t = invocation.getArgument(0);
                t.setId(1L);
                return t;
            });

        // When
        boolean result = tokenQuotaService.consumeQuota(userId, "image", 10L);

        // Then
        assertTrue(result);
        assertEquals(10, lockedQuota.getImageQuotaMonthlyUsed());
        assertEquals(0, lockedQuota.getImageQuotaUsed());
        verify(quotaRepository).save(any(UserTokenQuota.class));
    }

    @Test
    void testConsumeQuota_WhenQuotaNotExists_ShouldCreate() {
        // Given
        UserTokenQuota newQuota = new UserTokenQuota();
        newQuota.setId(1L);
        newQuota.setUserId(userId);
        newQuota.setTextTokenMonthlyQuota(1000L);
        newQuota.setTextTokenMonthlyUsed(0L);
        newQuota.setTextTokenTotal(1000L);
        newQuota.setTextTokenUsed(0L);

        when(quotaRepository.findByUserIdForUpdate(userId))
            .thenReturn(Optional.empty())
            .thenReturn(Optional.of(newQuota));
        when(quotaRepository.save(any(UserTokenQuota.class)))
            .thenAnswer(invocation -> {
                UserTokenQuota q = invocation.getArgument(0);
                q.setId(1L);
                q.setTextTokenMonthlyQuota(1000L);
                q.setTextTokenMonthlyUsed(0L);
                q.setTextTokenTotal(1000L);
                q.setTextTokenUsed(0L);
                return q;
            });

        // When
        boolean result = tokenQuotaService.consumeQuota(userId, "text_token", 500L);

        // Then
        // Should create quota and successfully consume
        assertTrue(result);
        verify(quotaRepository, atLeastOnce()).save(any(UserTokenQuota.class));
    }

    @Test
    void testGrantQuota_TextToken() {
        // Given
        when(quotaRepository.findByUserId(userId))
            .thenReturn(Optional.of(existingQuota));
        when(quotaRepository.save(any(UserTokenQuota.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(TokenQuotaTransaction.class)))
            .thenAnswer(invocation -> {
                TokenQuotaTransaction t = invocation.getArgument(0);
                t.setId(1L);
                return t;
            });

        ArgumentCaptor<TokenQuotaTransaction> transactionCaptor = 
            ArgumentCaptor.forClass(TokenQuotaTransaction.class);

        // When
        tokenQuotaService.grantQuota(userId, "text_token", 5000L, "membership", 1L, "会员开通");

        // Then
        assertEquals(15000L, existingQuota.getTextTokenTotal());
        verify(quotaRepository).save(any(UserTokenQuota.class));
        verify(transactionRepository).save(transactionCaptor.capture());
        
        TokenQuotaTransaction transaction = transactionCaptor.getValue();
        assertEquals("grant", transaction.getTransactionType());
        assertEquals("text_token", transaction.getQuotaType());
        assertEquals(5000L, transaction.getAmount());
        assertEquals("membership", transaction.getSource());
        assertEquals(1L, transaction.getReferenceId());
    }

    @Test
    void testGrantQuota_Image() {
        // Given
        when(quotaRepository.findByUserId(userId))
            .thenReturn(Optional.of(existingQuota));
        when(quotaRepository.save(any(UserTokenQuota.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(TokenQuotaTransaction.class)))
            .thenAnswer(invocation -> {
                TokenQuotaTransaction t = invocation.getArgument(0);
                t.setId(1L);
                return t;
            });

        // When
        tokenQuotaService.grantQuota(userId, "image", 50L, "purchase", 2L, "Token包购买");

        // Then
        assertEquals(150, existingQuota.getImageQuotaTotal());
        verify(quotaRepository).save(any(UserTokenQuota.class));
        verify(transactionRepository).save(any(TokenQuotaTransaction.class));
    }

    @Test
    void testGrantQuota_WhenQuotaNotExists_ShouldCreate() {
        // Given
        when(quotaRepository.findByUserId(userId))
            .thenReturn(Optional.empty());
        when(quotaRepository.save(any(UserTokenQuota.class)))
            .thenAnswer(invocation -> {
                UserTokenQuota q = invocation.getArgument(0);
                q.setId(1L);
                return q;
            });
        when(transactionRepository.save(any(TokenQuotaTransaction.class)))
            .thenAnswer(invocation -> {
                TokenQuotaTransaction t = invocation.getArgument(0);
                t.setId(1L);
                return t;
            });

        // When
        tokenQuotaService.grantQuota(userId, "text_token", 10000L, "admin_grant", null, "管理员授予");

        // Then
        verify(quotaRepository, atLeastOnce()).save(any(UserTokenQuota.class));
        verify(transactionRepository).save(any(TokenQuotaTransaction.class));
    }
}

