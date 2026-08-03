package com.shopstack.shopstack.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponValidationResponse {

    private boolean valid;
    private String code;
    private String discountType; // "PERCENTAGE" or "FLAT"
    private BigDecimal discountValue;
    private BigDecimal calculatedDiscount;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private String description;
    private LocalDateTime expiryDate;
    private String message;
}
