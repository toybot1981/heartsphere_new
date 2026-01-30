package com.heartsphere.service;

import com.heartsphere.dto.ContactFormDTO;
import com.heartsphere.entity.ContactForm;
import com.heartsphere.repository.ContactFormRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 联系表单服务
 * 处理官网联系表单的业务逻辑
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContactFormService {
    
    private final ContactFormRepository contactFormRepository;
    
    /**
     * 提交联系表单
     * 
     * @param contactFormDTO 联系表单数据
     * @return 提交结果
     */
    @Transactional
    public Map<String, Object> submitContactForm(ContactFormDTO contactFormDTO) {
        log.info("收到联系表单提交: name={}, email={}, phone={}, company={}", 
                contactFormDTO.getName(), contactFormDTO.getEmail(), 
                contactFormDTO.getPhone(), contactFormDTO.getCompany());
        
        try {
            // 创建实体
            ContactForm contactForm = new ContactForm();
            contactForm.setName(contactFormDTO.getName());
            contactForm.setEmail(contactFormDTO.getEmail());
            contactForm.setPhone(contactFormDTO.getPhone());
            contactForm.setCompany(contactFormDTO.getCompany());
            contactForm.setMessage(contactFormDTO.getMessage());
            contactForm.setIsProcessed(false);
            
            // 保存到数据库
            ContactForm saved = contactFormRepository.save(contactForm);
            
            log.info("联系表单提交成功: id={}, email={}", saved.getId(), saved.getEmail());
            
            return Map.of(
                "success", true,
                "message", "提交成功，我们会尽快与您联系",
                "id", saved.getId()
            );
        } catch (Exception e) {
            log.error("提交联系表单失败: email={}, error={}", contactFormDTO.getEmail(), e.getMessage(), e);
            throw new RuntimeException("提交失败，请稍后重试", e);
        }
    }
    
    /**
     * 获取所有联系表单（分页）
     */
    public Page<ContactForm> getAllContactForms(Pageable pageable) {
        return contactFormRepository.findAll(pageable);
    }
    
    /**
     * 获取未处理的联系表单
     */
    public Page<ContactForm> getUnprocessedContactForms(Pageable pageable) {
        return contactFormRepository.findByIsProcessedOrderByCreatedAtDesc(false, pageable);
    }
    
    /**
     * 根据ID获取联系表单
     */
    public ContactForm getContactFormById(Long id) {
        return contactFormRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("联系表单不存在: " + id));
    }
    
    /**
     * 标记联系表单为已处理
     */
    @Transactional
    public ContactForm markAsProcessed(Long id, String processNotes) {
        ContactForm contactForm = getContactFormById(id);
        contactForm.setIsProcessed(true);
        contactForm.setProcessNotes(processNotes);
        return contactFormRepository.save(contactForm);
    }
    
    /**
     * 获取未处理联系表单数量
     */
    public Long getUnprocessedCount() {
        return contactFormRepository.countUnprocessed();
    }
}
