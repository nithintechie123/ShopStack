package com.shopstack.shopstack.dto.warehouse;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddInventoryRequest {

    @NotNull(message = "Warehouse ID is required")
    private UUID warehouseId;

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Available quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer availableQuantity;
}