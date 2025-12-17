package com.heartsphere.service;

import com.heartsphere.admin.service.SystemConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.Map;
import java.util.Properties;

/**
 * 邮件发送服务
 */
@Slf4j
@Service
public class EmailService {

    private final SystemConfigService systemConfigService;

    private JavaMailSender mailSender;

    public EmailService(SystemConfigService systemConfigService) {
        this.systemConfigService = systemConfigService;
    }

    private static final String EMAIL_HOST_KEY = "email_host";
    private static final String EMAIL_PORT_KEY = "email_port";
    private static final String EMAIL_USERNAME_KEY = "email_username";
    private static final String EMAIL_PASSWORD_KEY = "email_password";
    private static final String EMAIL_FROM_KEY = "email_from";

    // 默认配置（163邮箱）
    private static final String DEFAULT_EMAIL_FROM = "tongyexin@163.com";
    private static final String DEFAULT_EMAIL_HOST = "smtp.163.com";
    private static final int DEFAULT_EMAIL_PORT = 25;

    @PostConstruct
    public void init() {
        updateMailSender();
    }

    /**
     * 更新邮件发送器配置
     */
    public void updateMailSender() {
        JavaMailSenderImpl mailSenderImpl = new JavaMailSenderImpl();
        
        // 从系统配置获取邮件服务器配置
        String host = systemConfigService.getConfigValue(EMAIL_HOST_KEY);
        String portStr = systemConfigService.getConfigValue(EMAIL_PORT_KEY);
        String username = systemConfigService.getConfigValue(EMAIL_USERNAME_KEY);
        String password = systemConfigService.getConfigValue(EMAIL_PASSWORD_KEY);
        String from = systemConfigService.getConfigValue(EMAIL_FROM_KEY);
        
        // 如果没有配置，使用默认值
        if (host == null || host.isEmpty()) {
            host = DEFAULT_EMAIL_HOST;
        }
        if (portStr == null || portStr.isEmpty()) {
            portStr = String.valueOf(DEFAULT_EMAIL_PORT);
        }
        if (username == null || username.isEmpty()) {
            username = DEFAULT_EMAIL_FROM;
        }
        if (from == null || from.isEmpty()) {
            from = DEFAULT_EMAIL_FROM;
        }
        
        // 如果host未配置，根据from邮箱自动检测
        if (host.equals(DEFAULT_EMAIL_HOST) && from != null && !from.isEmpty()) {
            String detectedHost = detectSmtpHost(from);
            if (detectedHost != null) {
                host = detectedHost;
                // 同时检测端口
                int detectedPort = detectSmtpPort(from);
                if (detectedPort > 0) {
                    portStr = String.valueOf(detectedPort);
                }
            }
        }
        
        mailSenderImpl.setHost(host);
        mailSenderImpl.setPort(Integer.parseInt(portStr));
        mailSenderImpl.setUsername(username);
        mailSenderImpl.setPassword(password != null && !password.isEmpty() ? password : "");
        
        // 配置SMTP属性
        Properties props = mailSenderImpl.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        
        // 根据端口配置SSL/TLS
        int port = Integer.parseInt(portStr);
        if (port == 465 || port == 994) {
            // SSL端口
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
            props.put("mail.smtp.socketFactory.port", String.valueOf(port));
        } else {
            // 普通端口，使用STARTTLS
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
        }
        
        props.put("mail.debug", "false");
        
        this.mailSender = mailSenderImpl;
        log.info("邮件发送器配置已更新: host={}, port={}, username={}, from={}", 
                mailSenderImpl.getHost(), mailSenderImpl.getPort(), mailSenderImpl.getUsername(), from);
    }

    /**
     * 根据邮箱地址自动检测SMTP服务器
     */
    private String detectSmtpHost(String email) {
        if (email == null || !email.contains("@")) {
            return null;
        }
        
        String domain = email.substring(email.indexOf("@") + 1).toLowerCase();
        
        if (domain.contains("163.com")) {
            return "smtp.163.com";
        } else if (domain.contains("qq.com")) {
            return "smtp.qq.com";
        } else if (domain.contains("gmail.com")) {
            return "smtp.gmail.com";
        } else if (domain.contains("126.com")) {
            return "smtp.126.com";
        } else if (domain.contains("sina.com")) {
            return "smtp.sina.com";
        } else if (domain.contains("outlook.com") || domain.contains("hotmail.com")) {
            return "smtp-mail.outlook.com";
        }
        
        return null;
    }

    /**
     * 根据邮箱地址自动检测SMTP端口
     */
    private int detectSmtpPort(String email) {
        if (email == null || !email.contains("@")) {
            return -1;
        }
        
        String domain = email.substring(email.indexOf("@") + 1).toLowerCase();
        
        if (domain.contains("163.com") || domain.contains("126.com")) {
            return 25; // 163/126邮箱默认使用25端口
        } else if (domain.contains("qq.com")) {
            return 587; // QQ邮箱使用587端口
        } else if (domain.contains("gmail.com")) {
            return 587; // Gmail使用587端口
        } else if (domain.contains("sina.com")) {
            return 25; // 新浪邮箱使用25端口
        } else if (domain.contains("outlook.com") || domain.contains("hotmail.com")) {
            return 587; // Outlook使用587端口
        }
        
        return -1;
    }

    /**
     * 发送简单文本邮件
     */
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            String from = systemConfigService.getConfigValue(EMAIL_FROM_KEY);
            if (from == null || from.isEmpty()) {
                from = DEFAULT_EMAIL_FROM;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            
            mailSender.send(message);
            log.info("邮件发送成功: to={}, subject={}", to, subject);
        } catch (Exception e) {
            log.error("邮件发送失败: to={}, subject={}, error={}", to, subject, e.getMessage(), e);
            throw new RuntimeException("邮件发送失败: " + e.getMessage(), e);
        }
    }

    /**
     * 发送验证码邮件
     */
    public void sendVerificationCode(String to, String code) {
        String subject = "HeartSphere 注册验证码";
        String text = String.format(
            "您好！\n\n" +
            "您的注册验证码是：%s\n\n" +
            "验证码有效期为10分钟，请勿泄露给他人。\n\n" +
            "如果这不是您的操作，请忽略此邮件。\n\n" +
            "HeartSphere 团队",
            code
        );
        sendSimpleEmail(to, subject, text);
    }

    /**
     * 获取发件人邮箱
     */
    public String getFromEmail() {
        String from = systemConfigService.getConfigValue(EMAIL_FROM_KEY);
        return from != null && !from.isEmpty() ? from : DEFAULT_EMAIL_FROM;
    }

    /**
     * 获取当前邮件服务器配置信息（用于调试）
     */
    public Map<String, Object> getMailConfig() {
        Map<String, Object> config = new java.util.HashMap<>();
        if (mailSender instanceof JavaMailSenderImpl) {
            JavaMailSenderImpl impl = (JavaMailSenderImpl) mailSender;
            config.put("host", impl.getHost());
            config.put("port", impl.getPort());
            config.put("username", impl.getUsername());
            config.put("from", getFromEmail());
        }
        return config;
    }
}
