package com.shopstack.shopstack.dto;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorEarningsDTO {
    private UUID vendorId;
    private String vendorName;
    private String status;
    private BigDecimal totalSales;
    private BigDecimal totalCommission;
    private BigDecimal totalPayout;
    private long completedOrders;
    private BigDecimal commissionRate;
}
