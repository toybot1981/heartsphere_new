package com.heartsphere.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 联系表单DTO
 * 用于接收公司官网联系表单的提交数据
 */
@Data
public class ContactFormDTO {
    
    @NotBlank(message = "姓名不能为空")
    @Size(max = 50, message = "姓名长度不能超过50个字符")
    private String name;
    
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @Size(max = 100, message = "邮箱长度不能超过100个字符")
    private String email;
    
    @NotBlank(message = "电话不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "电话格式不正确（请输入11位手机号）")
    private String phone;
    
    @Size(max = 100, message = "公司名称长度不能超过100个字符")
    private String company; // 可选字段
    
    @NotBlank(message = "咨询内容不能为空")
    @Size(max = 2000, message = "咨询内容长度不能超过2000个字符")
    private String message;
}
