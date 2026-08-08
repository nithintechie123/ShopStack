package com.shopstack.shopstack.dto.warehouse;

import com.shopstack.shopstack.model.MovementType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateStockMovementRequest {

    @NotNull
    private UUID warehouseId;

    @NotNull
    private UUID productId;

    @NotNull
    private MovementType movementType;

    @NotNull
    private Integer quantity;

    private String reference;
}