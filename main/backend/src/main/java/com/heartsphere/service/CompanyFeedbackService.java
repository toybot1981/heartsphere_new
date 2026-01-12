package com.heartsphere.service;

import com.heartsphere.dto.CompanyFeedbackDTO;
import com.heartsphere.entity.CompanyFeedback;
import com.heartsphere.repository.CompanyFeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 公司官网反馈收集服务
 * 不需要任何校验，直接保存数据
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyFeedbackService {

    private final CompanyFeedbackRepository feedbackRepository;

    /**
     * 保存反馈数据
     * 
     * @param dto 反馈数据DTO
     * @return 保存后的反馈实体
     */
    @Transactional
    public CompanyFeedback saveFeedback(CompanyFeedbackDTO dto) {
        log.info("收到反馈提交: name={}, email={}, phone={}", dto.getName(), dto.getEmail(), dto.getPhone());
        
        CompanyFeedback feedback = new CompanyFeedback();
        feedback.setName(dto.getName());
        feedback.setEmail(dto.getEmail());
        feedback.setPhone(dto.getPhone());
        feedback.setCompany(dto.getCompany());
        feedback.setMessage(dto.getMessage());
        
        CompanyFeedback saved = feedbackRepository.save(feedback);
        log.info("反馈保存成功: id={}", saved.getId());
        
        return saved;
    }
}
