package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.InviteCodeDTO;
import com.heartsphere.admin.dto.GenerateInviteCodeRequest;
import com.heartsphere.admin.entity.InviteCode;
import com.heartsphere.admin.repository.InviteCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.logging.Logger;

@Service
public class InviteCodeService {

    private static final Logger logger = Logger.getLogger(InviteCodeService.class.getName());

    @Autowired
    private InviteCodeRepository inviteCodeRepository;

    /**
     * 生成邀请码
     */
    @Transactional
    public List<InviteCodeDTO> generateInviteCodes(GenerateInviteCodeRequest request, Long adminId) {
        logger.info(String.format("管理员ID: %d 开始生成邀请码，数量: %d, 过期时间: %s", 
                adminId, request.getQuantity(), request.getExpiresAt()));
        
        List<InviteCode> codes = new java.util.ArrayList<>();
        for (int i = 0; i < request.getQuantity(); i++) {
            InviteCode code = new InviteCode();
            // 生成8位随机邀请码（大写字母+数字）
            code.setCode(generateCode());
            code.setExpiresAt(request.getExpiresAt());
            code.setCreatedByAdminId(adminId);
            code.setIsUsed(false);
            codes.add(code);
        }
        
        List<InviteCode> savedCodes = inviteCodeRepository.saveAll(codes);
        logger.info(String.format("成功生成 %d 个邀请码", savedCodes.size()));
        
        return savedCodes.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * 获取所有邀请码
     */
    public List<InviteCodeDTO> getAllInviteCodes() {
        List<InviteCode> codes = inviteCodeRepository.findAll();
        return codes.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * 验证邀请码是否有效
     */
    public InviteCode validateInviteCode(String code) {
        InviteCode inviteCode = inviteCodeRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("邀请码不存在"));
        
        if (inviteCode.getIsUsed()) {
            throw new RuntimeException("邀请码已被使用");
        }
        
        if (inviteCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("邀请码已过期");
        }
        
        return inviteCode;
    }

    /**
     * 使用邀请码（核销）
     */
    @Transactional
    public void useInviteCode(String code, Long userId) {
        logger.info(String.format("用户ID: %d 使用邀请码: %s", userId, code));
        InviteCode inviteCode = validateInviteCode(code);
        inviteCode.setIsUsed(true);
        inviteCode.setUsedByUserId(userId);
        inviteCode.setUsedAt(LocalDateTime.now());
        inviteCodeRepository.save(inviteCode);
        logger.info(String.format("邀请码 %s 已核销", code));
    }

    /**
     * 生成随机邀请码（8位，大写字母+数字）
     */
    private String generateCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 排除容易混淆的字符
        StringBuilder code = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 8; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        // 确保唯一性
        while (inviteCodeRepository.existsByCode(code.toString())) {
            code = new StringBuilder();
            for (int i = 0; i < 8; i++) {
                code.append(chars.charAt(random.nextInt(chars.length())));
            }
        }
        return code.toString();
    }

    /**
     * 转换为DTO
     */
    private InviteCodeDTO toDTO(InviteCode code) {
        InviteCodeDTO dto = new InviteCodeDTO();
        dto.setId(code.getId());
        dto.setCode(code.getCode());
        dto.setIsUsed(code.getIsUsed());
        dto.setUsedByUserId(code.getUsedByUserId());
        dto.setUsedAt(code.getUsedAt());
        dto.setExpiresAt(code.getExpiresAt());
        dto.setCreatedByAdminId(code.getCreatedByAdminId());
        dto.setCreatedAt(code.getCreatedAt());
        dto.setUpdatedAt(code.getUpdatedAt());
        return dto;
    }
}

