package com.heartsphere.heartconnect.dto;

import lombok.Data;

/**
 * 暖心留言DTO
 */
@Data
public class WarmMessageDTO {
    private Long id;
    private Long shareConfigId;
    private Long visitorId;
    private String visitorName;
    private String message;
    private Long createdAt;
}

