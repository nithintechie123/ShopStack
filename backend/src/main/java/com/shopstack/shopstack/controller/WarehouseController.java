package com.shopstack.shopstack.controller;

import com.shopstack.shopstack.dto.warehouse.*;
import com.shopstack.shopstack.service.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.shopstack.shopstack.model.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.shopstack.shopstack.model.WarehouseInventory;



@RestController
@RequestMapping("/api/warehouse")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    public ResponseEntity<?> createWarehouse(
            @Valid @RequestBody CreateWarehouseRequest request) {

        try {

            Warehouse warehouse = warehouseService.createWarehouse(request);

            return ResponseEntity.ok(warehouse);

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }


    @PostMapping("/allocate")
    public ResponseEntity<?> allocateOrder(
            @Valid @RequestBody AllocateOrderRequest request) {

        try {

            String message = warehouseService.allocateOrder(request);

            return ResponseEntity.ok(
                    Map.of("message", message)
            );

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/inventory")
    public ResponseEntity<?> addInventory(
            @Valid @RequestBody AddInventoryRequest request) {

        try {

            WarehouseInventory inventory = warehouseService.addInventory(request);

            return ResponseEntity.ok(inventory);

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }


    @PutMapping("/inventory/{inventoryId}")
    public ResponseEntity<?> updateInventory(
            @PathVariable UUID inventoryId,
            @Valid @RequestBody UpdateInventoryRequest request) {

        try {

            WarehouseInventory inventory =
                    warehouseService.updateInventory(inventoryId, request);

            return ResponseEntity.ok(inventory);

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }


    @DeleteMapping("/inventory/{inventoryId}")
    public ResponseEntity<?> deleteInventory(
            @PathVariable UUID inventoryId) {

        try {

            String message = warehouseService.deleteInventory(inventoryId);

            return ResponseEntity.ok(
                    Map.of("message", message)
            );

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }


    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {

        List<Warehouse> warehouses = warehouseService.getAllWarehouses();

        return ResponseEntity.ok(warehouses);
    }

    @GetMapping("/{warehouseId}")
    public ResponseEntity<?> getWarehouseById(@PathVariable UUID warehouseId) {
        try {
            Warehouse warehouse = warehouseService.getWarehouseById(warehouseId);
            return ResponseEntity.ok(warehouse);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/{warehouseId}")
    public ResponseEntity<?> updateWarehouse(
            @PathVariable UUID warehouseId,
            @Valid @RequestBody UpdateWarehouseRequest request) {

        try {

            Warehouse warehouse =
                    warehouseService.updateWarehouse(warehouseId, request);

            return ResponseEntity.ok(warehouse);

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/pick")
    public ResponseEntity<?> pickOrder(@PathVariable UUID orderId) {

        try {

            String message = warehouseService.pickOrder(orderId);

            return ResponseEntity.ok(
                    Map.of("message", message)
            );

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }


    @PutMapping("/orders/{orderId}/pack")
    public ResponseEntity<?> packOrder(@PathVariable UUID orderId) {

        try {

            String message = warehouseService.packOrder(orderId);

            return ResponseEntity.ok(
                    Map.of("message", message)
            );

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/ready")
    public ResponseEntity<?> markReadyForShipment(@PathVariable UUID orderId) {

        try {

            String message = warehouseService.markReadyForShipment(orderId);

            return ResponseEntity.ok(
                    Map.of("message", message)
            );

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{warehouseId}")
    public ResponseEntity<?> deleteWarehouse(@PathVariable UUID warehouseId) {
        try {
            String message = warehouseService.deleteWarehouse(warehouseId);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getWarehouseOrders() {
        try {
            List<Order> orders = warehouseService.getWarehouseOrders();
            return ResponseEntity.ok(orders);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getAllInventories() {
        try {
            List<WarehouseInventory> inventories = warehouseService.getAllInventories();
            return ResponseEntity.ok(inventories);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

}