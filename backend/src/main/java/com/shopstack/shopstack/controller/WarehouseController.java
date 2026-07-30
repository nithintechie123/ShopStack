package com.shopstack.shopstack.controller;

import com.shopstack.shopstack.dto.warehouse.AllocateOrderRequest;
import com.shopstack.shopstack.service.WarehouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.shopstack.shopstack.dto.warehouse.CreateWarehouseRequest;
import com.shopstack.shopstack.model.Warehouse;
import com.shopstack.shopstack.dto.warehouse.AddInventoryRequest;
import com.shopstack.shopstack.model.WarehouseInventory;
import jakarta.validation.Valid;
import java.util.Map;



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
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Warehouse API Working");
    }
}