package com.heartsphere.memory.dto.hsmem;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 批量写入已提取记忆项到 HSMem 的请求。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HSMemItemsRequest {
    private String user_id;
    private List<HSMemItemInput> items;
}
