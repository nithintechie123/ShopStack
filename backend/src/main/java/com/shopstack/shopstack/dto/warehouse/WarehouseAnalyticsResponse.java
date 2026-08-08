package com.shopstack.shopstack.dto.warehouse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseAnalyticsResponse {

    private long totalWarehouses;

    private long totalInventoryItems;

    private long totalAvailableStock;

    private long allocatedOrders;

    private long pickedOrders;

    private long packedOrders;

    private long readyToShipOrders;

    private long totalShipments;
}