package com.shopstack.shopstack.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.shopstack.shopstack.model.OrderItem;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderResponse {

    private UUID id;

    private LocalDateTime orderDate;

    private BigDecimal subtotal;

    private BigDecimal discount;

    private BigDecimal finalAmount;

    private String shippingAddress;

    private String billingAddress;

    private String paymentMethod;

    private String paymentStatus;

    private String trackingStatus;

    private String transactionId;

    private List<OrderItem> items;

    private boolean hasReturnRequest;
}