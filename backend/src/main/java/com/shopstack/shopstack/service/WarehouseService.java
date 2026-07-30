package com.shopstack.shopstack.service;

import java.util.Optional;

import com.shopstack.shopstack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstack.shopstack.dto.warehouse.AllocateOrderRequest;
import com.shopstack.shopstack.model.Order;
import com.shopstack.shopstack.model.OrderItem;
import com.shopstack.shopstack.model.Warehouse;
import com.shopstack.shopstack.model.WarehouseAllocation;
import com.shopstack.shopstack.model.WarehouseInventory;
import com.shopstack.shopstack.dto.warehouse.CreateWarehouseRequest;
import com.shopstack.shopstack.WarehouseStatus;
import com.shopstack.shopstack.model.Warehouse;
import com.shopstack.shopstack.dto.warehouse.AddInventoryRequest;
import com.shopstack.shopstack.model.Product;
import com.shopstack.shopstack.model.Warehouse;
import com.shopstack.shopstack.model.WarehouseInventory;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final OrderRepository orderRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseInventoryRepository warehouseInventoryRepository;
    private final WarehouseAllocationRepository warehouseAllocationRepository;
    private final ProductRepository productRepository;

    @Transactional
    public String allocateOrder(AllocateOrderRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        for (OrderItem item : order.getItems()) {

            Optional<WarehouseInventory> inventoryOptional =
                    warehouseInventoryRepository.findByWarehouseAndProduct(
                            warehouse,
                            item.getProduct()
                    );

            if (inventoryOptional.isEmpty()) {
                throw new RuntimeException(
                        "Product not found in selected warehouse: "
                                + item.getProduct().getName()
                );
            }

            WarehouseInventory inventory = inventoryOptional.get();

            if (inventory.getAvailableQuantity() < item.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for product: "
                                + item.getProduct().getName()
                );
            }

            inventory.setAvailableQuantity(
                    inventory.getAvailableQuantity() - item.getQuantity()
            );

            inventory.setReservedQuantity(
                    inventory.getReservedQuantity() + item.getQuantity()
            );

            warehouseInventoryRepository.save(inventory);
        }

        WarehouseAllocation allocation = WarehouseAllocation.builder()
                .order(order)
                .warehouse(warehouse)
                .build();

        warehouseAllocationRepository.save(allocation);

        order.setTrackingStatus("ALLOCATED");

        orderRepository.save(order);

        return "Order allocated successfully.";
    }
    @Transactional
    public Warehouse createWarehouse(CreateWarehouseRequest request) {

        if (warehouseRepository.existsByWarehouseCode(request.getWarehouseCode())) {
            throw new RuntimeException("Warehouse code already exists.");
        }

        Warehouse warehouse = Warehouse.builder()
                .warehouseName(request.getWarehouseName())
                .warehouseCode(request.getWarehouseCode())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .managerName(request.getManagerName())
                .contactNumber(request.getContactNumber())
                .status(WarehouseStatus.ACTIVE)
                .build();

        return warehouseRepository.save(warehouse);
    }


    @Transactional
    public WarehouseInventory addInventory(AddInventoryRequest request) {

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found."));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found."));

        if (warehouseInventoryRepository
                .findByWarehouseAndProduct(warehouse, product)
                .isPresent()) {

            throw new RuntimeException("Inventory already exists for this product in this warehouse.");
        }

        WarehouseInventory inventory = WarehouseInventory.builder()
                .warehouse(warehouse)
                .product(product)
                .availableQuantity(request.getAvailableQuantity())
                .reservedQuantity(0)
                .build();

        return warehouseInventoryRepository.save(inventory);
    }
}