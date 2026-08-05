package com.shopstack.shopstack.service;

import com.shopstack.shopstack.dto.warehouse.WarehouseAnalyticsResponse;
import com.shopstack.shopstack.repository.OrderRepository;
import com.shopstack.shopstack.repository.ShipmentRepository;
import com.shopstack.shopstack.repository.WarehouseInventoryRepository;
import com.shopstack.shopstack.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WarehouseAnalyticsService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseInventoryRepository warehouseInventoryRepository;
    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;

    public WarehouseAnalyticsResponse getAnalytics() {

        return WarehouseAnalyticsResponse.builder()
                .totalWarehouses(warehouseRepository.count())
                .totalInventoryItems(warehouseInventoryRepository.count())
                .totalAvailableStock(
                        warehouseInventoryRepository.getTotalAvailableStock()
                )
                .allocatedOrders(
                        orderRepository.countByTrackingStatus("ALLOCATED")
                )
                .pickedOrders(
                        orderRepository.countByTrackingStatus("PICKED")
                )
                .packedOrders(
                        orderRepository.countByTrackingStatus("PACKED")
                )
                .readyToShipOrders(
                        orderRepository.countByTrackingStatus("READY_TO_SHIP")
                )
                .totalShipments(
                        shipmentRepository.count()
                )
                .build();
    }
}