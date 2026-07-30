package com.shopstack.shopstack.dto.warehouse;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AllocateOrderRequest {

    @NotNull(message = "Order ID is required")
    private UUID orderId;

    @NotNull(message = "Warehouse ID is required")
    private UUID warehouseId;
}