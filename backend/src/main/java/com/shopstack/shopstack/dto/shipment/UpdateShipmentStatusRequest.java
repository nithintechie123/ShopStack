package com.shopstack.shopstack.dto.shipment;

import com.shopstack.shopstack.model.ShipmentStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class UpdateShipmentStatusRequest {

    @NotNull
    private ShipmentStatus shipmentStatus;


}