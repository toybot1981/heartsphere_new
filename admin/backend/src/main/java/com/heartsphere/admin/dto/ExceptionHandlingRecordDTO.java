package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * 异常处理记录DTO
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExceptionHandlingRecordDTO {
    
    private Long id;
    private String exceptionType;
    private String exceptionContent;
    private Long relatedUserId;
    private Long relatedDataId;
    private String severity; // HIGH/MEDIUM/LOW
    private String status; // PENDING/PROCESSING/RESOLVED
    private Long handlerId;
    private String handlerName;
    private String handleResult;
    private Instant createdAt;
    private Instant updatedAt;
}




