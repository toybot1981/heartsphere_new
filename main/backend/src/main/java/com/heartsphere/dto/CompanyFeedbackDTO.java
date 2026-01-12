package com.heartsphere.dto;

import lombok.Data;

/**
 * 公司官网反馈收集DTO
 * 不需要任何校验，直接接收页面提交的数据
 */
@Data
public class CompanyFeedbackDTO {
    private String name;
    private String email;
    private String phone;
    private String company;
    private String message;
}
