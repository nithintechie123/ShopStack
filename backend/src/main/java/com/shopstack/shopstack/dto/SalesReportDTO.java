package com.shopstack.shopstack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class SalesReportDTO {
    private long totalOrders;
    private long totalItemsSold;
    private BigDecimal totalSalesAmount;
    private BigDecimal averageOrderValue;
}
