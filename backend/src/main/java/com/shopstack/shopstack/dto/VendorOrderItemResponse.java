package com.shopstack.shopstack.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorOrderItemResponse {

    private UUID productId;

    private String productName;

    private Integer quantity;

    private BigDecimal price;

    private BigDecimal total;
}