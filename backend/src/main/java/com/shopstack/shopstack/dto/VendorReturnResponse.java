package com.shopstack.shopstack.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VendorReturnResponse {

    private UUID returnId;

    private UUID orderId;

    private String customerName;

    private String productName;

    private String reason;

    private String description;

    private String status;

    private LocalDateTime requestDate;
    
    private String imageUrl;

}