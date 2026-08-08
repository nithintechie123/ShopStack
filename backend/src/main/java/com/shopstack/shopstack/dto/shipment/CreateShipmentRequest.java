package com.shopstack.shopstack.dto.shipment;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateShipmentRequest {

    @NotNull
    private UUID orderId;

    @NotBlank
    private String courierName;
}