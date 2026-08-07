package com.shopstack.shopstack.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorOrderResponse {

    private UUID id;

    private LocalDateTime orderDate;

    private String customerName;

    private String trackingStatus;

    private String paymentStatus;

    private BigDecimal vendorAmount;

    private BigDecimal commissionRate;

    private BigDecimal commissionDeducted;

    private BigDecimal netPayout;

    private String shippingAddress;

    private List<VendorOrderItemResponse> items;
}