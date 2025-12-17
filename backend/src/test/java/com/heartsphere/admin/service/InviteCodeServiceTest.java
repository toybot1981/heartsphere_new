package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.GenerateInviteCodeRequest;
import com.heartsphere.admin.entity.InviteCode;
import com.heartsphere.admin.repository.InviteCodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class InviteCodeServiceTest {

    @Autowired
    private InviteCodeService inviteCodeService;

    @Autowired
    private InviteCodeRepository inviteCodeRepository;

    @BeforeEach
    public void setUp() {
        inviteCodeRepository.deleteAll();
    }

    @Test
    public void testGenerateInviteCodes() {
        GenerateInviteCodeRequest request = new GenerateInviteCodeRequest();
        request.setQuantity(10);
        request.setExpiresAt(LocalDateTime.now().plusDays(30));

        List<com.heartsphere.admin.dto.InviteCodeDTO> codes = inviteCodeService.generateInviteCodes(request, 1L);

        assertEquals(10, codes.size());
        assertTrue(codes.stream().allMatch(c -> c.getCode() != null && c.getCode().length() == 8));
        assertTrue(codes.stream().allMatch(c -> !c.getIsUsed()));
        assertTrue(codes.stream().allMatch(c -> c.getCreatedByAdminId() == 1L));
    }

    @Test
    public void testGenerateInviteCodesUniqueness() {
        GenerateInviteCodeRequest request = new GenerateInviteCodeRequest();
        request.setQuantity(100);
        request.setExpiresAt(LocalDateTime.now().plusDays(30));

        List<com.heartsphere.admin.dto.InviteCodeDTO> codes = inviteCodeService.generateInviteCodes(request, 1L);

        // 验证所有邀请码都是唯一的
        long uniqueCount = codes.stream().map(com.heartsphere.admin.dto.InviteCodeDTO::getCode).distinct().count();
        assertEquals(100, uniqueCount);
    }

    @Test
    public void testGetAllInviteCodes() {
        // 生成一些邀请码
        GenerateInviteCodeRequest request = new GenerateInviteCodeRequest();
        request.setQuantity(5);
        request.setExpiresAt(LocalDateTime.now().plusDays(30));
        inviteCodeService.generateInviteCodes(request, 1L);

        List<com.heartsphere.admin.dto.InviteCodeDTO> allCodes = inviteCodeService.getAllInviteCodes();
        assertEquals(5, allCodes.size());
    }

    @Test
    public void testValidateInviteCode() {
        // 创建一个有效的邀请码
        InviteCode code = new InviteCode();
        code.setCode("TEST1234");
        code.setIsUsed(false);
        code.setExpiresAt(LocalDateTime.now().plusDays(30));
        inviteCodeRepository.save(code);

        InviteCode validated = inviteCodeService.validateInviteCode("TEST1234");
        assertNotNull(validated);
        assertEquals("TEST1234", validated.getCode());
    }

    @Test
    public void testValidateInviteCodeNotFound() {
        assertThrows(RuntimeException.class, () -> {
            inviteCodeService.validateInviteCode("INVALID");
        });
    }

    @Test
    public void testValidateInviteCodeAlreadyUsed() {
        InviteCode code = new InviteCode();
        code.setCode("USED1234");
        code.setIsUsed(true);
        code.setExpiresAt(LocalDateTime.now().plusDays(30));
        inviteCodeRepository.save(code);

        assertThrows(RuntimeException.class, () -> {
            inviteCodeService.validateInviteCode("USED1234");
        });
    }

    @Test
    public void testValidateInviteCodeExpired() {
        InviteCode code = new InviteCode();
        code.setCode("EXPIRED1");
        code.setIsUsed(false);
        code.setExpiresAt(LocalDateTime.now().minusDays(1));
        inviteCodeRepository.save(code);

        assertThrows(RuntimeException.class, () -> {
            inviteCodeService.validateInviteCode("EXPIRED1");
        });
    }

    @Test
    public void testUseInviteCode() {
        // 创建一个有效的邀请码
        InviteCode code = new InviteCode();
        code.setCode("USE12345");
        code.setIsUsed(false);
        code.setExpiresAt(LocalDateTime.now().plusDays(30));
        inviteCodeRepository.save(code);

        inviteCodeService.useInviteCode("USE12345", 100L);

        InviteCode usedCode = inviteCodeRepository.findByCode("USE12345").orElseThrow();
        assertTrue(usedCode.getIsUsed());
        assertEquals(100L, usedCode.getUsedByUserId());
        assertNotNull(usedCode.getUsedAt());
    }
}



