package com.heartsphere.memory.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * 敏感信息检测工具
 * 用于检测内容中是否包含用户隐私信息
 * 
 * @author HeartSphere
 * @date 2026-01-24
 */
@Slf4j
@Component
public class SensitiveInfoDetector {
    
    // 敏感词列表
    private static final Set<String> SENSITIVE_KEYWORDS = new HashSet<>(Arrays.asList(
        // 个人标识符
        "电话", "手机", "号码", "phone", "mobile", "tel",
        "邮箱", "email", "电子邮件", "mail",
        "身份证", "id", "passport", "护照",
        "银行卡", "卡号", "account", "账号",
        "账户", "密码", "password", "pwd",
        
        // 位置信息
        "地址", "address", "住址", "家里", "家里",
        "街道", "街区", "小区", "楼盘",
        
        // 金融信息
        "工资", "薪资", "收入", "income",
        "银行", "账户", "转账", "transfer",
        "投资", "股票", "基金",
        
        // 医疗信息
        "疾病", "病", "medical", "doctor",
        "医院", "诊所", "治疗",
        "药物", "medicine", "drug",
        
        // 家庭和关系
        "父亲", "母亲", "妻子", "丈夫", "孩子",
        "儿子", "女儿", "父母", "孩子们",
        "brother", "sister", "family"
    ));
    
    // 第一人称代词模式
    private static final Pattern FIRST_PERSON_PATTERN = Pattern.compile(
        "\\b(我|我的|我们|咱们|我家|我工作|我公司|俺|俺们)\\b",
        Pattern.CASE_INSENSITIVE
    );
    
    // 邮箱模式
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b"
    );
    
    // 手机号模式（中国）
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "\\b1[3-9]\\d{9}\\b|\\b\\d{3,4}[\\s-]?\\d{7,8}\\b"
    );
    
    // 身份证号模式（中国）
    private static final Pattern ID_CARD_PATTERN = Pattern.compile(
        "\\b\\d{17}[0-9X]\\b|\\b\\d{15}\\b"
    );
    
    // 银行卡号模式
    private static final Pattern CARD_PATTERN = Pattern.compile(
        "\\b\\d{13,19}\\b"
    );
    
    /**
     * 检测内容中是否包含敏感信息
     * 
     * @param content 要检测的内容
     * @return true 表示包含敏感信息，false 表示安全
     */
    public boolean hasSensitiveInfo(String content) {
        if (content == null || content.trim().isEmpty()) {
            return false;
        }
        
        String lowerContent = content.toLowerCase();
        
        // 1. 检测敏感关键词
        for (String keyword : SENSITIVE_KEYWORDS) {
            if (lowerContent.contains(keyword)) {
                log.info("检测到敏感关键词: {}", keyword);
                return true;
            }
        }
        
        // 2. 检测邮箱
        if (EMAIL_PATTERN.matcher(content).find()) {
            log.info("检测到邮箱地址");
            return true;
        }
        
        // 3. 检测手机号
        if (PHONE_PATTERN.matcher(content).find()) {
            log.info("检测到电话号码");
            return true;
        }
        
        // 4. 检测身份证号
        if (ID_CARD_PATTERN.matcher(content).find()) {
            log.info("检测到身份证号");
            return true;
        }
        
        // 5. 检测银行卡号（需要一定长度）
        if (CARD_PATTERN.matcher(content).find() && lowerContent.contains("卡")) {
            log.info("检测到银行卡号");
            return true;
        }
        
        // 6. 检测第一人称代词频率
        int firstPersonCount = countFirstPersonPronouns(content);
        if (firstPersonCount > 5) {
            log.info("检测到高频第一人称代词，出现次数: {}", firstPersonCount);
            return true;
        }
        
        return false;
    }
    
    /**
     * 统计第一人称代词出现次数
     */
    private int countFirstPersonPronouns(String content) {
        if (content == null || content.isEmpty()) {
            return 0;
        }
        
        var matcher = FIRST_PERSON_PATTERN.matcher(content);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }
    
    /**
     * 脱敏内容（移除敏感信息）
     * 
     * @param content 原始内容
     * @return 脱敏后的内容
     */
    public String sanitizeContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            return content;
        }
        
        String result = content;
        
        // 替换邮箱
        result = result.replaceAll(EMAIL_PATTERN.pattern(), "[EMAIL_REDACTED]");
        
        // 替换电话
        result = result.replaceAll(PHONE_PATTERN.pattern(), "[PHONE_REDACTED]");
        
        // 替换身份证
        result = result.replaceAll(ID_CARD_PATTERN.pattern(), "[ID_REDACTED]");
        
        // 替换银行卡
        result = result.replaceAll(CARD_PATTERN.pattern(), "[CARD_REDACTED]");
        
        return result;
    }
}
