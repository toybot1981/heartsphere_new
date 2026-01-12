package com.heartsphere.company.service;

import com.heartsphere.company.dto.ContactFormDTO;
import com.heartsphere.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * 公司官网服务
 * 处理公司官网相关的业务逻辑，如联系表单提交
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyService {

    // TODO: 如果需要邮件功能，可以注入 EmailService
    // private final EmailService emailService;

    /**
     * 提交联系表单
     * 
     * @param contactForm 联系表单数据
     * @return 提交结果
     */
    @Transactional
    public Map<String, Object> submitContactForm(ContactFormDTO contactForm) {
        log.info("收到联系表单提交: name={}, email={}, phone={}, company={}", 
                contactForm.getName(), contactForm.getEmail(), contactForm.getPhone(), contactForm.getCompany());
        
        try {
            // 验证数据（DTO的验证注解会在Controller层自动验证）
            validateContactForm(contactForm);
            
            // 记录表单数据（可以后续扩展为存储到数据库）
            logContactForm(contactForm);
            
            // 发送通知邮件（如果配置了邮件服务）
            sendNotificationEmail(contactForm);
            
            log.info("联系表单提交成功: email={}", contactForm.getEmail());
            
            return Map.of(
                "success", true,
                "message", "提交成功，我们会尽快与您联系"
            );
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("提交联系表单失败: email={}, error={}", contactForm.getEmail(), e.getMessage(), e);
            throw new BusinessException("提交失败，请稍后重试");
        }
    }

    /**
     * 验证联系表单数据
     */
    private void validateContactForm(ContactFormDTO contactForm) {
        if (contactForm.getName() == null || contactForm.getName().trim().isEmpty()) {
            throw new BusinessException("姓名不能为空");
        }
        
        if (contactForm.getEmail() == null || contactForm.getEmail().trim().isEmpty()) {
            throw new BusinessException("邮箱不能为空");
        }
        
        // 邮箱格式验证（DTO注解会处理，这里再确认一次）
        if (!contactForm.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new BusinessException("邮箱格式不正确");
        }
        
        if (contactForm.getPhone() == null || contactForm.getPhone().trim().isEmpty()) {
            throw new BusinessException("电话不能为空");
        }
        
        // 电话格式验证（DTO注解会处理，这里再确认一次）
        if (!contactForm.getPhone().matches("^1[3-9]\\d{9}$")) {
            throw new BusinessException("电话格式不正确（请输入11位手机号）");
        }
        
        if (contactForm.getMessage() == null || contactForm.getMessage().trim().isEmpty()) {
            throw new BusinessException("咨询内容不能为空");
        }
    }

    /**
     * 记录表单数据到日志
     * 后续可以扩展为存储到数据库
     */
    private void logContactForm(ContactFormDTO contactForm) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        log.info("========== 联系表单提交记录 ==========");
        log.info("提交时间: {}", timestamp);
        log.info("姓名: {}", contactForm.getName());
        log.info("邮箱: {}", contactForm.getEmail());
        log.info("电话: {}", contactForm.getPhone());
        log.info("公司: {}", contactForm.getCompany() != null ? contactForm.getCompany() : "未填写");
        log.info("咨询内容: {}", contactForm.getMessage());
        log.info("=====================================");
        
        // TODO: 后续可以扩展为存储到数据库表
        // ContactFormEntity entity = new ContactFormEntity();
        // entity.setName(contactForm.getName());
        // entity.setEmail(contactForm.getEmail());
        // entity.setPhone(contactForm.getPhone());
        // entity.setCompany(contactForm.getCompany());
        // entity.setMessage(contactForm.getMessage());
        // entity.setCreatedAt(LocalDateTime.now());
        // contactFormRepository.save(entity);
    }

    /**
     * 发送通知邮件
     * 如果有配置邮件服务，发送通知邮件给管理员
     * TODO: 实现邮件发送功能或注入 EmailService
     */
    private void sendNotificationEmail(ContactFormDTO contactForm) {
        try {
            // 构建邮件内容
            String subject = "【正心智能官网】收到新的联系表单提交";
            String content = buildEmailContent(contactForm);
            
            // TODO: 实现邮件发送功能
            // 选项 1: 注入 EmailService（需要配置邮件服务）
            // 选项 2: 使用外部邮件服务 API
            // 选项 3: 暂时只记录日志，后续实现
            
            log.info("联系表单提交（邮件功能待实现）: subject={}, content length={}", subject, content.length());
            log.debug("邮件内容: {}", content);
        } catch (Exception e) {
            // 邮件发送失败不影响表单提交，只记录日志
            log.warn("发送通知邮件失败，但表单已记录: error={}", e.getMessage());
        }
    }

    /**
     * 构建邮件内容
     */
    private String buildEmailContent(ContactFormDTO contactForm) {
        StringBuilder content = new StringBuilder();
        content.append("收到新的联系表单提交：\n\n");
        content.append("提交时间：").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n");
        content.append("姓名：").append(contactForm.getName()).append("\n");
        content.append("邮箱：").append(contactForm.getEmail()).append("\n");
        content.append("电话：").append(contactForm.getPhone()).append("\n");
        if (contactForm.getCompany() != null && !contactForm.getCompany().trim().isEmpty()) {
            content.append("公司：").append(contactForm.getCompany()).append("\n");
        }
        content.append("咨询内容：\n").append(contactForm.getMessage()).append("\n");
        return content.toString();
    }
}
