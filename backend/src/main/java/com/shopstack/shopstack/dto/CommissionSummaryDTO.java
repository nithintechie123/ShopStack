package com.shopstack.shopstack.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommissionSummaryDTO {
    private BigDecimal totalSales;
    private BigDecimal totalCommission;
    private BigDecimal totalPayout;
    private long completedOrders;
}
